import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebhookEndpoint } from './entities/WebhookEndpoint.entity';
import { WebhookRequest } from './entities/WebhookRequest.entity';

export interface WebhookActor {
  isAdmin: boolean;
  ownerId?: string;
  ownerEmail?: string;
}

@Injectable()
export class WebhooksService implements OnModuleInit {
  constructor(
    @InjectRepository(WebhookEndpoint)
    private readonly endpointRepo: Repository<WebhookEndpoint>,
    @InjectRepository(WebhookRequest)
    private readonly requestRepo: Repository<WebhookRequest>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.endpointRepo.query(`
      CREATE TABLE IF NOT EXISTS \`webhook_endpoints\` (
        \`id\` varchar(36) NOT NULL,
        \`token\` varchar(32) NOT NULL,
        \`name\` varchar(80) NULL,
        \`ownerId\` varchar(64) NULL,
        \`ownerEmail\` varchar(160) NULL,
        \`responseStatus\` int NOT NULL DEFAULT 200,
        \`responseBody\` text NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        UNIQUE INDEX \`IDX_webhook_endpoints_token\` (\`token\`),
        INDEX \`IDX_webhook_endpoints_ownerId\` (\`ownerId\`),
        INDEX \`IDX_webhook_endpoints_ownerEmail\` (\`ownerEmail\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await this.requestRepo.query(`
      CREATE TABLE IF NOT EXISTS \`webhook_requests\` (
        \`id\` varchar(36) NOT NULL,
        \`endpointId\` varchar(36) NOT NULL,
        \`method\` varchar(12) NOT NULL,
        \`path\` varchar(255) NOT NULL,
        \`headers\` text NOT NULL,
        \`query\` text NOT NULL,
        \`body\` longtext NULL,
        \`ip\` varchar(64) NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        INDEX \`IDX_webhook_requests_endpointId\` (\`endpointId\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    const cols = (await this.endpointRepo.query(
      `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'webhook_endpoints' AND COLUMN_NAME = 'ownerEmail'`,
    )) as { cnt: string | number }[];
    if (Number(cols?.[0]?.cnt ?? 0) === 0) {
      await this.endpointRepo.query(
        `ALTER TABLE \`webhook_endpoints\` ADD COLUMN \`ownerEmail\` varchar(160) NULL`,
      );
    }
  }

  private generateToken(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let out = '';
    for (let i = 0; i < 12; i++) {
      out += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return out;
  }

  private assertCanManage(endpoint: WebhookEndpoint, actor: WebhookActor): void {
    if (actor.isAdmin) return;
    if (actor.ownerEmail && endpoint.ownerEmail === actor.ownerEmail) return;
    if (actor.ownerId && endpoint.ownerId === actor.ownerId) return;
    throw new ForbiddenException('Bu webhook üzerinde işlem yetkiniz yok');
  }

  async createEndpoint(
    name: string | undefined,
    ownerId?: string,
    ownerEmail?: string,
  ): Promise<WebhookEndpoint> {
    const token = this.generateToken();
    const entity = this.endpointRepo.create({
      token,
      name: name?.trim() || `Webhook #${token.slice(0, 4)}`,
      ownerId: ownerId || null,
      ownerEmail: ownerEmail || null,
      responseStatus: 200,
      responseBody: JSON.stringify({ ok: true, captured: true }),
    });
    return this.endpointRepo.save(entity);
  }

  async findAllEndpoints(actor: WebhookActor): Promise<WebhookEndpoint[]> {
    if (actor.isAdmin) {
      return this.endpointRepo.find({ order: { createdAt: 'DESC' } });
    }
    if (actor.ownerEmail && actor.ownerId) {
      return this.endpointRepo.find({
        where: [{ ownerEmail: actor.ownerEmail }, { ownerId: actor.ownerId }],
        order: { createdAt: 'DESC' },
      });
    }
    if (actor.ownerEmail) {
      return this.endpointRepo.find({
        where: { ownerEmail: actor.ownerEmail },
        order: { createdAt: 'DESC' },
      });
    }
    if (!actor.ownerId) return [];
    return this.endpointRepo.find({
      where: { ownerId: actor.ownerId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateEndpoint(
    id: string,
    data: { name?: string; responseStatus?: number; responseBody?: string | null },
    actor: WebhookActor,
  ): Promise<WebhookEndpoint> {
    const endpoint = await this.endpointRepo.findOne({ where: { id } });
    if (!endpoint) throw new NotFoundException('Webhook bulunamadı');
    this.assertCanManage(endpoint, actor);

    if (data.name !== undefined) endpoint.name = data.name.trim() || null;
    if (data.responseStatus !== undefined) endpoint.responseStatus = data.responseStatus;
    if (data.responseBody !== undefined) endpoint.responseBody = data.responseBody;
    return this.endpointRepo.save(endpoint);
  }

  async deleteEndpoint(id: string, actor: WebhookActor): Promise<void> {
    const endpoint = await this.endpointRepo.findOne({ where: { id } });
    if (!endpoint) throw new NotFoundException('Webhook bulunamadı');
    this.assertCanManage(endpoint, actor);

    await this.requestRepo.delete({ endpointId: endpoint.id });
    await this.endpointRepo.delete({ id: endpoint.id });
  }

  async listRequests(endpointId: string, actor: WebhookActor): Promise<WebhookRequest[]> {
    const endpoint = await this.endpointRepo.findOne({ where: { id: endpointId } });
    if (!endpoint) throw new NotFoundException('Webhook bulunamadı');
    this.assertCanManage(endpoint, actor);

    return this.requestRepo.find({
      where: { endpointId: endpoint.id },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async clearRequests(endpointId: string, actor: WebhookActor): Promise<void> {
    const endpoint = await this.endpointRepo.findOne({ where: { id: endpointId } });
    if (!endpoint) throw new NotFoundException('Webhook bulunamadı');
    this.assertCanManage(endpoint, actor);

    await this.requestRepo.delete({ endpointId: endpoint.id });
  }

  async captureRequest(
    token: string,
    payload: {
      method: string;
      path: string;
      headers: Record<string, unknown>;
      query: Record<string, unknown>;
      body: unknown;
      ip: string | null;
    },
  ): Promise<{ status: number; body: string }> {
    const endpoint = await this.endpointRepo.findOne({ where: { token } });
    if (!endpoint) {
      throw new NotFoundException('Webhook endpoint bulunamadı');
    }

    const serializedBody =
      payload.body === undefined || payload.body === null
        ? null
        : typeof payload.body === 'string'
          ? payload.body
          : JSON.stringify(payload.body, null, 2);

    const record = this.requestRepo.create({
      endpointId: endpoint.id,
      method: payload.method.toUpperCase().slice(0, 12),
      path: payload.path.slice(0, 255),
      headers: JSON.stringify(payload.headers, null, 2),
      query: JSON.stringify(payload.query, null, 2),
      body: serializedBody,
      ip: payload.ip?.slice(0, 64) || null,
    });

    await this.requestRepo.save(record);

    // Keep only the latest 100 requests per endpoint
    const stale = await this.requestRepo.find({
      where: { endpointId: endpoint.id },
      order: { createdAt: 'DESC' },
      skip: 100,
      take: 500,
      select: { id: true },
    });
    if (stale.length > 0) {
      await this.requestRepo.delete(stale.map((r) => r.id));
    }

    return {
      status: endpoint.responseStatus || 200,
      body: endpoint.responseBody || JSON.stringify({ ok: true, captured: true }),
    };
  }
}
