import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WebhookEndpoint } from './entities/WebhookEndpoint.entity';
import { WebhookRequest } from './entities/WebhookRequest.entity';
import { WebhooksService } from './webhooks.service';
import { WebhooksController, HookCaptureController } from './webhooks.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([WebhookEndpoint, WebhookRequest]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'supersecretjwtkey123!'),
      }),
    }),
  ],
  controllers: [WebhooksController, HookCaptureController],
  providers: [WebhooksService],
})
export class WebhooksModule {}
