import * as tls from 'tls';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { UptimeMonitor } from './entities/UptimeMonitor.entity';
import { UptimeCheck } from './entities/UptimeCheck.entity';
import { MailService } from '../mail/mail.service';

export interface UptimeActor {
  isAdmin: boolean;
  ownerId?: string;
}

@Injectable()
export class UptimeService implements OnModuleInit {
  private readonly logger = new Logger(UptimeService.name);

  constructor(
    @InjectRepository(UptimeMonitor)
    private readonly monitorRepo: Repository<UptimeMonitor>,
    @InjectRepository(UptimeCheck)
    private readonly checkRepo: Repository<UptimeCheck>,
    private readonly mailService: MailService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.monitorRepo.query(`
      CREATE TABLE IF NOT EXISTS \`uptime_monitors\` (
        \`id\` varchar(36) NOT NULL,
        \`name\` varchar(80) NOT NULL,
        \`url\` text NOT NULL,
        \`ownerId\` varchar(64) NULL,
        \`alertEmail\` varchar(160) NULL,
        \`isActive\` tinyint NOT NULL DEFAULT 1,
        \`lastStatus\` varchar(16) NOT NULL DEFAULT 'pending',
        \`lastStatusCode\` int NULL,
        \`lastResponseTimeMs\` int NULL,
        \`sslDaysRemaining\` int NULL,
        \`sslValidTo\` datetime NULL,
        \`lastError\` varchar(255) NULL,
        \`lastCheckedAt\` datetime NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        INDEX \`IDX_uptime_monitors_ownerId\` (\`ownerId\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await this.checkRepo.query(`
      CREATE TABLE IF NOT EXISTS \`uptime_checks\` (
        \`id\` varchar(36) NOT NULL,
        \`monitorId\` varchar(36) NOT NULL,
        \`status\` varchar(16) NOT NULL,
        \`statusCode\` int NULL,
        \`responseTimeMs\` int NOT NULL DEFAULT 0,
        \`error\` varchar(255) NULL,
        \`checkedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        INDEX \`IDX_uptime_checks_monitorId\` (\`monitorId\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  private assertCanManage(monitor: UptimeMonitor, actor: UptimeActor): void {
    if (actor.isAdmin) return;
    if (actor.ownerId && monitor.ownerId === actor.ownerId) return;
    throw new ForbiddenException('Bu monitör üzerinde işlem yetkiniz yok');
  }

  async createMonitor(input: {
    name: string;
    url: string;
    alertEmail?: string;
    ownerId?: string;
  }) {
    const entity = this.monitorRepo.create({
      name: input.name.trim(),
      url: input.url.trim(),
      alertEmail: input.alertEmail?.trim().toLowerCase() || null,
      ownerId: input.ownerId || null,
      isActive: true,
      lastStatus: 'pending',
    });
    const saved = await this.monitorRepo.save(entity);
    const checked = await this.checkMonitor(saved.id);
    return checked;
  }

  async findAllMonitors(actor: UptimeActor) {
    const monitors = actor.isAdmin
      ? await this.monitorRepo.find({ order: { createdAt: 'DESC' } })
      : actor.ownerId
        ? await this.monitorRepo.find({
            where: { ownerId: actor.ownerId },
            order: { createdAt: 'DESC' },
          })
        : [];

    const withHistory = await Promise.all(
      monitors.map(async (m) => {
        const recentChecks = await this.checkRepo.find({
          where: { monitorId: m.id },
          order: { checkedAt: 'DESC' },
          take: 20,
        });
        return {
          ...m,
          recentChecks: recentChecks.reverse(),
        };
      }),
    );

    return withHistory;
  }

  async updateMonitor(
    id: string,
    data: { name?: string; url?: string; alertEmail?: string | null; isActive?: boolean },
    actor: UptimeActor,
  ) {
    const monitor = await this.monitorRepo.findOne({ where: { id } });
    if (!monitor) throw new NotFoundException('Monitör bulunamadı');
    this.assertCanManage(monitor, actor);

    if (data.name !== undefined) monitor.name = data.name.trim();
    if (data.url !== undefined) monitor.url = data.url.trim();
    if (data.alertEmail !== undefined) {
      monitor.alertEmail = data.alertEmail ? data.alertEmail.trim().toLowerCase() : null;
    }
    if (data.isActive !== undefined) monitor.isActive = data.isActive;

    return this.monitorRepo.save(monitor);
  }

  async deleteMonitor(id: string, actor: UptimeActor): Promise<void> {
    const monitor = await this.monitorRepo.findOne({ where: { id } });
    if (!monitor) throw new NotFoundException('Monitör bulunamadı');
    this.assertCanManage(monitor, actor);

    await this.checkRepo.delete({ monitorId: monitor.id });
    await this.monitorRepo.delete({ id: monitor.id });
  }

  async triggerCheck(id: string, actor: UptimeActor) {
    const monitor = await this.monitorRepo.findOne({ where: { id } });
    if (!monitor) throw new NotFoundException('Monitör bulunamadı');
    this.assertCanManage(monitor, actor);

    return this.checkMonitor(monitor.id);
  }

  @Cron('*/5 * * * *')
  async runScheduledChecks(): Promise<void> {
    const activeMonitors = await this.monitorRepo.find({ where: { isActive: true } });
    if (activeMonitors.length === 0) return;

    this.logger.log(`Zamanlanmış uptime kontrolü başladı (${activeMonitors.length} monitör)`);
    await Promise.allSettled(activeMonitors.map((m) => this.checkMonitor(m.id)));
  }

  private getSslExpiry(targetUrl: string): Promise<{ validTo: Date; daysRemaining: number } | null> {
    return new Promise((resolve) => {
      try {
        const parsed = new URL(targetUrl);
        if (parsed.protocol !== 'https:') {
          resolve(null);
          return;
        }
        const port = parsed.port ? Number(parsed.port) : 443;
        const socket = tls.connect(
          {
            host: parsed.hostname,
            port,
            servername: parsed.hostname,
            rejectUnauthorized: false,
            timeout: 5000,
          },
          () => {
            const cert = socket.getPeerCertificate();
            socket.end();
            if (cert?.valid_to) {
              const validTo = new Date(cert.valid_to);
              const daysRemaining = Math.floor(
                (validTo.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
              );
              resolve({ validTo, daysRemaining });
            } else {
              resolve(null);
            }
          },
        );
        socket.on('error', () => {
          socket.destroy();
          resolve(null);
        });
        socket.on('timeout', () => {
          socket.destroy();
          resolve(null);
        });
      } catch {
        resolve(null);
      }
    });
  }

  async checkMonitor(id: string) {
    const monitor = await this.monitorRepo.findOne({ where: { id } });
    if (!monitor) throw new NotFoundException('Monitör bulunamadı');

    const prevStatus = monitor.lastStatus;
    const start = Date.now();
    let status: 'up' | 'down' = 'down';
    let statusCode: number | null = null;
    let errorMsg: string | null = null;

    try {
      const res = await fetch(monitor.url, {
        method: 'GET',
        redirect: 'follow',
        signal: AbortSignal.timeout(10000),
      });
      statusCode = res.status;
      status = res.status >= 200 && res.status < 400 ? 'up' : 'down';
      if (status === 'down') {
        errorMsg = `HTTP ${res.status}`;
      }
    } catch (err) {
      status = 'down';
      errorMsg = err instanceof Error ? err.message.slice(0, 250) : 'Bağlantı hatası';
    }

    const responseTimeMs = Math.max(1, Date.now() - start);
    const sslInfo = await this.getSslExpiry(monitor.url);

    monitor.lastStatus = status;
    monitor.lastStatusCode = statusCode;
    monitor.lastResponseTimeMs = responseTimeMs;
    monitor.lastError = errorMsg;
    monitor.lastCheckedAt = new Date();
    if (sslInfo) {
      monitor.sslValidTo = sslInfo.validTo;
      monitor.sslDaysRemaining = sslInfo.daysRemaining;
    }

    await this.monitorRepo.save(monitor);

    const check = this.checkRepo.create({
      monitorId: monitor.id,
      status,
      statusCode,
      responseTimeMs,
      error: errorMsg,
    });
    await this.checkRepo.save(check);

    // Prune checks beyond latest 50
    const stale = await this.checkRepo.find({
      where: { monitorId: monitor.id },
      order: { checkedAt: 'DESC' },
      skip: 50,
      take: 500,
      select: { id: true },
    });
    if (stale.length > 0) {
      await this.checkRepo.delete(stale.map((c) => c.id));
    }

    if (monitor.alertEmail && prevStatus !== 'pending' && prevStatus !== status) {
      const isDown = status === 'down';
      await this.mailService.sendMail({
        to: monitor.alertEmail,
        fromName: 'Uptime Monitörü',
        subject: isDown
          ? `[KESİNTİ] ${monitor.name} yanıt vermiyor`
          : `[DÜZELDİ] ${monitor.name} tekrar erişilebilir`,
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:24px;border:1px solid #e4e4e7;border-radius:12px;">
            <h2 style="margin:0 0 12px;color:${isDown ? '#dc2626' : '#16a34a'};">
              ${isDown ? 'Servis Kesintisi Algılandı' : 'Servis Tekrar Aktif'}
            </h2>
            <p style="margin:0 0 8px;"><strong>Monitör:</strong> ${monitor.name}</p>
            <p style="margin:0 0 8px;"><strong>URL:</strong> ${monitor.url}</p>
            <p style="margin:0 0 8px;"><strong>Durum:</strong> ${status.toUpperCase()} (${errorMsg || `HTTP ${statusCode}`})</p>
            <p style="margin:0;"><strong>Yanıt Süresi:</strong> ${responseTimeMs} ms</p>
          </div>
        `,
      });
    }

    const recentChecks = await this.checkRepo.find({
      where: { monitorId: monitor.id },
      order: { checkedAt: 'DESC' },
      take: 20,
    });

    return {
      ...monitor,
      recentChecks: recentChecks.reverse(),
    };
  }
}
