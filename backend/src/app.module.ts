import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './auth/entities/User.entity';
import { Post } from './posts/entities/Post.entity';
import { PostView } from './posts/entities/PostView.entity';
import { Category } from './words/entities/Category.entity';
import { Word } from './words/entities/Word.entity';
import { Region } from './prayer/entities/Region.entity';
import { City } from './prayer/entities/City.entity';
import { PrayerTime } from './prayer/entities/PrayerTime.entity';
import { ContactMessage } from './contact/entities/ContactMessage.entity';
import { TestSheet } from './test-sheets/entities/TestSheet.entity';
import { ShortLink } from './links/entities/ShortLink.entity';
import { WebhookEndpoint } from './webhooks/entities/WebhookEndpoint.entity';
import { WebhookRequest } from './webhooks/entities/WebhookRequest.entity';
import { UptimeMonitor } from './uptime/entities/UptimeMonitor.entity';
import { UptimeCheck } from './uptime/entities/UptimeCheck.entity';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { ContactModule } from './contact/contact.module';
import { PrayerModule } from './prayer/prayer.module';
import { WordsModule } from './words/words.module';
import { GamesModule } from './games/games.module';
import { ReportModule } from './report/report.module';
import { MailModule } from './mail/mail.module';
import { TestSheetsModule } from './test-sheets/test-sheets.module';
import { LinksModule } from './links/links.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { UptimeModule } from './uptime/uptime.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    MailModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get<string>('DB_USERNAME', 'root'),
        password: configService.get<string>('DB_PASSWORD', ''),
        database: configService.get<string>('DB_DATABASE', 'blog'),
        entities: [
          User,
          Post,
          PostView,
          Category,
          Word,
          Region,
          City,
          PrayerTime,
          ContactMessage,
          TestSheet,
          ShortLink,
          WebhookEndpoint,
          WebhookRequest,
          UptimeMonitor,
          UptimeCheck,
        ],
        // Varsayılan false (canlı ortam). Boş bir local DB'de tabloları oluşturmak için DB_SYNCHRONIZE=true verin.
        synchronize: configService.get<string>('DB_SYNCHRONIZE') === 'true',
      }),
    }),
    AuthModule,
    PostsModule,
    ContactModule,
    PrayerModule,
    WordsModule,
    GamesModule,
    ReportModule,
    TestSheetsModule,
    LinksModule,
    WebhooksModule,
    UptimeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

