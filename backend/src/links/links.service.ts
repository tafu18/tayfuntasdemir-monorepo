import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ShortLink } from './entities/ShortLink.entity';
import { MailService } from '../mail/mail.service';

export interface LinkActor {
  isAdmin: boolean;
  ownerId?: string;
  ownerEmail?: string;
}

export interface CreateShortLinkInput {
  hedefUrl: string;
  customCode?: string;
  baslik?: string;
  sonKullanma?: Date | null;
  ownerId?: string;
  ownerEmail?: string;
}

export interface UpdateShortLinkInput {
  hedefUrl?: string;
  baslik?: string | null;
  aktif?: boolean;
  sonKullanma?: Date | null;
}

export type ClickResolveResult =
  | { status: 'ok'; link: ShortLink }
  | { status: 'not_found' }
  | { status: 'inactive' }
  | { status: 'expired' };

@Injectable()
export class LinksService implements OnModuleInit {
  private readonly logger = new Logger(LinksService.name);
  private readonly pendingCodes = new Map<string, { code: string; expiresAt: number }>();

  constructor(
    @InjectRepository(ShortLink)
    private readonly repository: Repository<ShortLink>,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.repository.query(`
      CREATE TABLE IF NOT EXISTS \`short_links\` (
        \`id\` varchar(36) NOT NULL,
        \`kod\` varchar(32) NOT NULL,
        \`hedefUrl\` text NOT NULL,
        \`baslik\` varchar(80) NULL,
        \`ownerId\` varchar(64) NULL,
        \`ownerEmail\` varchar(160) NULL,
        \`aktif\` tinyint NOT NULL DEFAULT 1,
        \`tiklanma\` int NOT NULL DEFAULT 0,
        \`sonTiklanma\` datetime NULL,
        \`sonKullanma\` datetime NULL,
        \`olusturulma\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        UNIQUE INDEX \`IDX_short_links_kod\` (\`kod\`),
        INDEX \`IDX_short_links_ownerId\` (\`ownerId\`),
        INDEX \`IDX_short_links_ownerEmail\` (\`ownerEmail\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await this.ensureColumnExists('ownerId', 'varchar(64) NULL');
    await this.ensureColumnExists('ownerEmail', 'varchar(160) NULL');
  }

  private async ensureColumnExists(column: string, definition: string): Promise<void> {
    const rows = (await this.repository.query(
      `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'short_links' AND COLUMN_NAME = ?`,
      [column],
    )) as { cnt: string | number }[];

    if (Number(rows?.[0]?.cnt ?? 0) === 0) {
      await this.repository.query(
        `ALTER TABLE \`short_links\` ADD COLUMN \`${column}\` ${definition}`,
      );
    }
  }

  async create(input: CreateShortLinkInput): Promise<ShortLink> {
    if (input.customCode) {
      const existing = await this.repository.findOne({ where: { kod: input.customCode } });
      if (existing) {
        throw new ConflictException('Bu kısa kod zaten kullanılıyor');
      }
      const entity = this.repository.create({
        kod: input.customCode,
        hedefUrl: input.hedefUrl,
        baslik: input.baslik || null,
        ownerId: input.ownerId || null,
        ownerEmail: input.ownerEmail || null,
        aktif: true,
        sonKullanma: input.sonKullanma ?? null,
      });
      return this.repository.save(entity);
    }

    for (let attempt = 0; attempt < 5; attempt++) {
      const kod = this.generateRandomCode();
      const existing = await this.repository.findOne({ where: { kod } });
      if (!existing) {
        const entity = this.repository.create({
          kod,
          hedefUrl: input.hedefUrl,
          baslik: input.baslik || null,
          ownerId: input.ownerId || null,
          ownerEmail: input.ownerEmail || null,
          aktif: true,
          sonKullanma: input.sonKullanma ?? null,
        });
        return this.repository.save(entity);
      }
    }

    throw new ConflictException('Benzersiz kısa kod üretilemedi, tekrar deneyin');
  }

  async findAllForActor(actor: LinkActor): Promise<ShortLink[]> {
    if (actor.isAdmin) {
      return this.repository.find({ order: { olusturulma: 'DESC' } });
    }

    if (actor.ownerEmail && actor.ownerId) {
      return this.repository.find({
        where: [{ ownerEmail: actor.ownerEmail }, { ownerId: actor.ownerId }],
        order: { olusturulma: 'DESC' },
      });
    }

    if (actor.ownerEmail) {
      return this.repository.find({
        where: { ownerEmail: actor.ownerEmail },
        order: { olusturulma: 'DESC' },
      });
    }

    if (actor.ownerId) {
      return this.repository.find({
        where: { ownerId: actor.ownerId },
        order: { olusturulma: 'DESC' },
      });
    }

    return [];
  }

  async findOneByCode(kod: string): Promise<ShortLink | null> {
    return this.repository.findOne({ where: { kod } });
  }

  private assertCanManage(link: ShortLink, actor: LinkActor): void {
    if (actor.isAdmin) return;
    if (actor.ownerEmail && link.ownerEmail === actor.ownerEmail) return;
    if (actor.ownerId && link.ownerId === actor.ownerId) return;
    throw new ForbiddenException('Bu link üzerinde işlem yetkiniz yok');
  }

  async update(
    idOrCode: string,
    input: UpdateShortLinkInput,
    actor: LinkActor = { isAdmin: true },
  ): Promise<ShortLink> {
    const link =
      (await this.repository.findOne({ where: { id: idOrCode } })) ||
      (await this.repository.findOne({ where: { kod: idOrCode } }));

    if (!link) {
      throw new NotFoundException('Link bulunamadı');
    }

    this.assertCanManage(link, actor);

    if (input.hedefUrl !== undefined) link.hedefUrl = input.hedefUrl;
    if (input.baslik !== undefined) link.baslik = input.baslik;
    if (input.aktif !== undefined) link.aktif = input.aktif;
    if (input.sonKullanma !== undefined) link.sonKullanma = input.sonKullanma;

    return this.repository.save(link);
  }

  async remove(idOrCode: string, actor: LinkActor = { isAdmin: true }): Promise<void> {
    const link =
      (await this.repository.findOne({ where: { id: idOrCode } })) ||
      (await this.repository.findOne({ where: { kod: idOrCode } }));

    if (!link) {
      throw new NotFoundException('Link bulunamadı');
    }

    this.assertCanManage(link, actor);
    await this.repository.delete({ id: link.id });
  }

  async requestEmailVerification(email: string): Promise<{ sent: boolean; devCode?: string }> {
    const normalized = email.trim().toLowerCase();
    const code = String(Math.floor(100000 + Math.random() * 900000));
    this.pendingCodes.set(normalized, {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    const sent = await this.mailService.sendMail({
      to: normalized,
      subject: 'KısaLink Doğrulama Kodunuz',
      fromName: 'KısaLink',
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e4e4e7;border-radius:12px;">
          <h2 style="margin:0 0 12px;color:#18181b;">KısaLink E-posta Doğrulama</h2>
          <p style="margin:0 0 16px;color:#52525b;">Linklerinizi tüm cihazlarınızdan yönetmek için doğrulama kodunuz:</p>
          <div style="font-size:28px;font-weight:700;letter-spacing:6px;background:#f4f4f5;padding:16px;text-align:center;border-radius:8px;color:#18181b;">
            ${code}
          </div>
          <p style="margin:16px 0 0;font-size:12px;color:#71717a;">Bu kod 10 dakika geçerlidir.</p>
        </div>
      `,
    });

    if (!sent) {
      this.logger.warn(`SMTP gönderimi başarısız; doğrulama kodu (${normalized}): ${code}`);
      if (process.env.NODE_ENV !== 'production') {
        return { sent: true, devCode: code };
      }
    }

    return { sent: true };
  }

  async verifyEmailCode(
    email: string,
    code: string,
    ownerId?: string,
  ): Promise<{ token: string; email: string; linkedCount: number }> {
    const normalized = email.trim().toLowerCase();
    const record = this.pendingCodes.get(normalized);

    if (!record || record.expiresAt < Date.now() || record.code !== code.trim()) {
      throw new BadRequestException('Doğrulama kodu geçersiz veya süresi dolmuş');
    }

    this.pendingCodes.delete(normalized);

    let linkedCount = 0;
    if (ownerId) {
      const updateResult = await this.repository
        .createQueryBuilder()
        .update(ShortLink)
        .set({ ownerEmail: normalized })
        .where('ownerId = :ownerId AND (ownerEmail IS NULL OR ownerEmail = :email)', {
          ownerId,
          email: normalized,
        })
        .execute();
      linkedCount = updateResult.affected || 0;

      // Also bind Webhook endpoints and Uptime monitors belonging to this ownerId
      try {
        await this.repository.manager.query(
          `UPDATE \`webhook_endpoints\` SET \`ownerEmail\` = ? WHERE \`ownerId\` = ? AND (\`ownerEmail\` IS NULL OR \`ownerEmail\` = ?)`,
          [normalized, ownerId, normalized],
        );
        await this.repository.manager.query(
          `UPDATE \`uptime_monitors\` SET \`ownerEmail\` = ? WHERE \`ownerId\` = ? AND (\`ownerEmail\` IS NULL OR \`ownerEmail\` = ?)`,
          [normalized, ownerId, normalized],
        );
      } catch {
        // ignore if tables are not yet initialized
      }
    }

    const token = await this.jwtService.signAsync(
      { type: 'link_owner', email: normalized },
      { expiresIn: '30d' },
    );

    return { token, email: normalized, linkedCount };
  }

  async resolveClick(kod: string): Promise<ClickResolveResult> {
    const link = await this.repository.findOne({ where: { kod } });
    if (!link) {
      return { status: 'not_found' };
    }
    if (!link.aktif) {
      return { status: 'inactive' };
    }
    if (link.sonKullanma && new Date(link.sonKullanma).getTime() <= Date.now()) {
      return { status: 'expired' };
    }

    link.tiklanma += 1;
    link.sonTiklanma = new Date();
    const saved = await this.repository.save(link);
    return { status: 'ok', link: saved };
  }

  private generateRandomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
