import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Delete,
  Param,
  Res,
  Req,
  NotFoundException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';
import { LinksService, LinkActor } from './links.service';
import { ShortLink } from './entities/ShortLink.entity';

export class CreateLinkDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty({ message: 'URL boş olamaz' })
  @IsUrl(
    { require_protocol: true, protocols: ['http', 'https'] },
    { message: 'Geçerli bir http veya https URL giriniz' },
  )
  originalUrl: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Matches(/^[a-zA-Z0-9_-]{3,20}$/, {
    message: 'Kısa kod 3-20 karakter arası harf, rakam, - veya _ içermelidir',
  })
  shortCode?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(80, { message: 'Başlık en fazla 80 karakter olabilir' })
  title?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Geçersiz son kullanma tarihi' })
  expiresAt?: string;
}

export class UpdateLinkDto {
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsUrl(
    { require_protocol: true, protocols: ['http', 'https'] },
    { message: 'Geçerli bir http veya https URL giriniz' },
  )
  originalUrl?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(80, { message: 'Başlık en fazla 80 karakter olabilir' })
  title?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString({}, { message: 'Geçersiz son kullanma tarihi' })
  expiresAt?: string | null;
}

export class RequestEmailDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz' })
  email: string;
}

export class VerifyEmailDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz' })
  email: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(6, 6, { message: 'Doğrulama kodu 6 haneli olmalıdır' })
  code: string;
}

export interface LinkResponseDto {
  id: string;
  shortCode: string;
  originalUrl: string;
  title: string | null;
  isActive: boolean;
  clicks: number;
  lastClickedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
}

function serializeLink(link: ShortLink): LinkResponseDto {
  return {
    id: link.id,
    shortCode: link.kod,
    originalUrl: link.hedefUrl,
    title: link.baslik ?? null,
    isActive: link.aktif ?? true,
    clicks: link.tiklanma,
    lastClickedAt: link.sonTiklanma ?? null,
    expiresAt: link.sonKullanma ?? null,
    createdAt: link.olusturulma,
  };
}

@Controller('links')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class LinksController {
  constructor(
    private readonly linksService: LinksService,
    private readonly jwtService: JwtService,
  ) {}

  private async resolveActor(req: Request): Promise<LinkActor> {
    const rawOwnerId = req.headers['x-owner-id'];
    const ownerId =
      typeof rawOwnerId === 'string' && rawOwnerId.trim().length > 0
        ? rawOwnerId.trim().slice(0, 64)
        : undefined;

    let isAdmin = false;
    const authHeader = req.headers.authorization;
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      try {
        const payload = await this.jwtService.verifyAsync<{ sub?: string; type?: string }>(
          authHeader.slice(7),
        );
        if (payload?.sub && payload.type !== 'link_owner') {
          isAdmin = true;
        }
      } catch {
        // invalid or expired admin token -> treat as non-admin
      }
    }

    let ownerEmail: string | undefined;
    const sessionHeader = req.headers['x-link-session'];
    if (typeof sessionHeader === 'string' && sessionHeader.trim()) {
      try {
        const payload = await this.jwtService.verifyAsync<{ type?: string; email?: string }>(
          sessionHeader.trim(),
        );
        if (payload?.type === 'link_owner' && payload.email) {
          ownerEmail = payload.email;
        }
      } catch {
        // invalid or expired link session token
      }
    }

    return { isAdmin, ownerId, ownerEmail };
  }

  @Post('email/request')
  async requestEmail(@Body() dto: RequestEmailDto) {
    return this.linksService.requestEmailVerification(dto.email);
  }

  @Post('email/verify')
  async verifyEmail(@Body() dto: VerifyEmailDto, @Req() req: Request) {
    const actor = await this.resolveActor(req);
    return this.linksService.verifyEmailCode(dto.email, dto.code, actor.ownerId);
  }

  @Post()
  async create(@Body() dto: CreateLinkDto, @Req() req: Request): Promise<LinkResponseDto> {
    const actor = await this.resolveActor(req);
    const link = await this.linksService.create({
      hedefUrl: dto.originalUrl,
      customCode: dto.shortCode,
      baslik: dto.title,
      sonKullanma: dto.expiresAt ? new Date(dto.expiresAt) : null,
      ownerId: actor.ownerId,
      ownerEmail: actor.ownerEmail,
    });
    return serializeLink(link);
  }

  @Get()
  async findAll(@Req() req: Request): Promise<LinkResponseDto[]> {
    const actor = await this.resolveActor(req);
    const links = await this.linksService.findAllForActor(actor);
    return links.map(serializeLink);
  }

  @Get(':shortCode')
  async findOne(@Param('shortCode') shortCode: string): Promise<LinkResponseDto> {
    const link = await this.linksService.findOneByCode(shortCode);
    if (!link) {
      throw new NotFoundException('Link bulunamadı');
    }
    return serializeLink(link);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateLinkDto,
    @Req() req: Request,
  ): Promise<LinkResponseDto> {
    const actor = await this.resolveActor(req);
    const link = await this.linksService.update(
      id,
      {
        hedefUrl: dto.originalUrl,
        baslik: dto.title,
        aktif: dto.isActive,
        sonKullanma:
          dto.expiresAt === undefined
            ? undefined
            : dto.expiresAt === null
              ? null
              : new Date(dto.expiresAt),
      },
      actor,
    );
    return serializeLink(link);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request): Promise<{ deleted: boolean }> {
    const actor = await this.resolveActor(req);
    await this.linksService.remove(id, actor);
    return { deleted: true };
  }
}

@Controller('r')
export class RedirectController {
  constructor(private readonly linksService: LinksService) {}

  @Get(':kod')
  async redirect(@Param('kod') kod: string, @Res() res: Response): Promise<void> {
    const result = await this.linksService.resolveClick(kod);
    if (result.status === 'not_found') {
      res.status(404).json({ message: 'Link bulunamadı' });
      return;
    }
    if (result.status === 'inactive') {
      res.status(410).json({ message: 'Bu kısa link devre dışı bırakılmış' });
      return;
    }
    if (result.status === 'expired') {
      res.status(410).json({ message: 'Bu kısa linkin süresi dolmuş' });
      return;
    }
    res.redirect(302, result.link.hedefUrl);
  }
}
