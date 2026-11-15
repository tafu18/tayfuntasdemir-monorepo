import {
  All,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { WebhooksService, WebhookActor } from './webhooks.service';

export class CreateWebhookDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  name?: string;
}

export class UpdateWebhookDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(599)
  responseStatus?: number;

  @IsOptional()
  @IsString()
  responseBody?: string | null;
}

@Controller('webhooks')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class WebhooksController {
  constructor(
    private readonly webhooksService: WebhooksService,
    private readonly jwtService: JwtService,
  ) {}

  private async resolveActor(req: Request): Promise<WebhookActor> {
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

    return { isAdmin, ownerId };
  }

  @Post('endpoints')
  async createEndpoint(@Body() dto: CreateWebhookDto, @Req() req: Request) {
    const actor = await this.resolveActor(req);
    return this.webhooksService.createEndpoint(dto.name, actor.ownerId);
  }

  @Get('endpoints')
  async listEndpoints(@Req() req: Request) {
    const actor = await this.resolveActor(req);
    return this.webhooksService.findAllEndpoints(actor);
  }

  @Patch('endpoints/:id')
  async updateEndpoint(
    @Param('id') id: string,
    @Body() dto: UpdateWebhookDto,
    @Req() req: Request,
  ) {
    const actor = await this.resolveActor(req);
    return this.webhooksService.updateEndpoint(id, dto, actor);
  }

  @Delete('endpoints/:id')
  async deleteEndpoint(@Param('id') id: string, @Req() req: Request) {
    const actor = await this.resolveActor(req);
    await this.webhooksService.deleteEndpoint(id, actor);
    return { deleted: true };
  }

  @Get('endpoints/:id/requests')
  async listRequests(@Param('id') id: string, @Req() req: Request) {
    const actor = await this.resolveActor(req);
    return this.webhooksService.listRequests(id, actor);
  }

  @Delete('endpoints/:id/requests')
  async clearRequests(@Param('id') id: string, @Req() req: Request) {
    const actor = await this.resolveActor(req);
    await this.webhooksService.clearRequests(id, actor);
    return { cleared: true };
  }
}

@Controller('hook')
export class HookCaptureController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @All(':token')
  async captureRoot(
    @Param('token') token: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.handleCapture(token, req, res);
  }

  @All(':token/*')
  async captureSubpath(
    @Param('token') token: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.handleCapture(token, req, res);
  }

  private async handleCapture(token: string, req: Request, res: Response) {
    const forwarded = req.headers['x-forwarded-for'];
    const ip =
      typeof forwarded === 'string'
        ? forwarded.split(',')[0].trim()
        : req.ip || req.socket?.remoteAddress || null;

    const result = await this.webhooksService.captureRequest(token, {
      method: req.method,
      path: req.originalUrl || req.url,
      headers: req.headers as Record<string, unknown>,
      query: req.query as Record<string, unknown>,
      body: req.body,
      ip,
    });

    try {
      const parsed = JSON.parse(result.body);
      res.status(result.status).json(parsed);
    } catch {
      res.status(result.status).send(result.body);
    }
  }
}
