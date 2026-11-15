import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Delete,
  Param,
  Res,
  NotFoundException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import type { Response } from 'express';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
} from 'class-validator';
import { LinksService } from './links.service';
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
  constructor(private readonly linksService: LinksService) {}

  @Post()
  async create(@Body() dto: CreateLinkDto): Promise<LinkResponseDto> {
    const link = await this.linksService.create({
      hedefUrl: dto.originalUrl,
      customCode: dto.shortCode,
      baslik: dto.title,
      sonKullanma: dto.expiresAt ? new Date(dto.expiresAt) : null,
    });
    return serializeLink(link);
  }

  @Get()
  async findAll(): Promise<LinkResponseDto[]> {
    const links = await this.linksService.findAll();
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
  async update(@Param('id') id: string, @Body() dto: UpdateLinkDto): Promise<LinkResponseDto> {
    const link = await this.linksService.update(id, {
      hedefUrl: dto.originalUrl,
      baslik: dto.title,
      aktif: dto.isActive,
      sonKullanma:
        dto.expiresAt === undefined
          ? undefined
          : dto.expiresAt === null
            ? null
            : new Date(dto.expiresAt),
    });
    return serializeLink(link);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ deleted: boolean }> {
    await this.linksService.remove(id);
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
