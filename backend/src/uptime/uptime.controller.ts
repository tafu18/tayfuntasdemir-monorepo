import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { UptimeService, UptimeActor } from './uptime.service';

export class CreateMonitorDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty({ message: 'Monitör adı boş olamaz' })
  @IsString()
  @MaxLength(80)
  name: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty({ message: 'URL boş olamaz' })
  @IsUrl(
    { require_protocol: true, protocols: ['http', 'https'] },
    { message: 'Geçerli bir http veya https URL giriniz' },
  )
  url: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' && value.trim() ? value.trim() : undefined))
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz' })
  alertEmail?: string;
}

export class UpdateMonitorDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  name?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true, protocols: ['http', 'https'] })
  url?: string;

  @IsOptional()
  @IsEmail()
  alertEmail?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@Controller('uptime')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class UptimeController {
  constructor(
    private readonly uptimeService: UptimeService,
    private readonly jwtService: JwtService,
  ) {}

  private async resolveActor(req: Request): Promise<UptimeActor> {
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
        // ignore invalid token
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
        // ignore invalid session token
      }
    }

    return { isAdmin, ownerId, ownerEmail };
  }

  @Post('monitors')
  async create(@Body() dto: CreateMonitorDto, @Req() req: Request) {
    const actor = await this.resolveActor(req);
    return this.uptimeService.createMonitor({
      name: dto.name,
      url: dto.url,
      alertEmail: dto.alertEmail,
      ownerId: actor.ownerId,
      ownerEmail: actor.ownerEmail,
    });
  }

  @Get('monitors')
  async list(@Req() req: Request) {
    const actor = await this.resolveActor(req);
    return this.uptimeService.findAllMonitors(actor);
  }

  @Post('monitors/:id/check')
  async checkNow(@Param('id') id: string, @Req() req: Request) {
    const actor = await this.resolveActor(req);
    return this.uptimeService.triggerCheck(id, actor);
  }

  @Patch('monitors/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateMonitorDto, @Req() req: Request) {
    const actor = await this.resolveActor(req);
    return this.uptimeService.updateMonitor(id, dto, actor);
  }

  @Delete('monitors/:id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    const actor = await this.resolveActor(req);
    await this.uptimeService.deleteMonitor(id, actor);
    return { deleted: true };
  }
}
