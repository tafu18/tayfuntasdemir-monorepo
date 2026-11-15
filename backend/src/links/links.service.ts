import { Injectable, ConflictException, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShortLink } from './entities/ShortLink.entity';

export interface CreateShortLinkInput {
  hedefUrl: string;
  customCode?: string;
  baslik?: string;
  sonKullanma?: Date | null;
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
  constructor(
    @InjectRepository(ShortLink)
    private readonly repository: Repository<ShortLink>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.repository.query(`
      CREATE TABLE IF NOT EXISTS \`short_links\` (
        \`id\` varchar(36) NOT NULL,
        \`kod\` varchar(32) NOT NULL,
        \`hedefUrl\` text NOT NULL,
        \`baslik\` varchar(80) NULL,
        \`aktif\` tinyint NOT NULL DEFAULT 1,
        \`tiklanma\` int NOT NULL DEFAULT 0,
        \`sonTiklanma\` datetime NULL,
        \`sonKullanma\` datetime NULL,
        \`olusturulma\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        UNIQUE INDEX \`IDX_short_links_kod\` (\`kod\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
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
          aktif: true,
          sonKullanma: input.sonKullanma ?? null,
        });
        return this.repository.save(entity);
      }
    }

    throw new ConflictException('Benzersiz kısa kod üretilemedi, tekrar deneyin');
  }

  async findAll(): Promise<ShortLink[]> {
    return this.repository.find({
      order: { olusturulma: 'DESC' },
    });
  }

  async findOneByCode(kod: string): Promise<ShortLink | null> {
    return this.repository.findOne({ where: { kod } });
  }

  async update(idOrCode: string, input: UpdateShortLinkInput): Promise<ShortLink> {
    const link =
      (await this.repository.findOne({ where: { id: idOrCode } })) ||
      (await this.repository.findOne({ where: { kod: idOrCode } }));

    if (!link) {
      throw new NotFoundException('Link bulunamadı');
    }

    if (input.hedefUrl !== undefined) link.hedefUrl = input.hedefUrl;
    if (input.baslik !== undefined) link.baslik = input.baslik;
    if (input.aktif !== undefined) link.aktif = input.aktif;
    if (input.sonKullanma !== undefined) link.sonKullanma = input.sonKullanma;

    return this.repository.save(link);
  }

  async remove(idOrCode: string): Promise<void> {
    const result = await this.repository.delete({ id: idOrCode });
    if (result.affected && result.affected > 0) {
      return;
    }
    const byCode = await this.repository.delete({ kod: idOrCode });
    if (!byCode.affected || byCode.affected === 0) {
      throw new NotFoundException('Link bulunamadı');
    }
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
