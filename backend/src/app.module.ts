import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './database/entities/User.entity';
import { Post } from './database/entities/Post.entity';
import { PostView } from './database/entities/PostView.entity';
import { Category } from './database/entities/Category.entity';
import { Word } from './database/entities/Word.entity';
import { MonthlyPayment } from './database/entities/MonthlyPayment.entity';
import { Region } from './database/entities/Region.entity';
import { City } from './database/entities/City.entity';
import { PrayerTime } from './database/entities/PrayerTime.entity';
import { ContactMessage } from './database/entities/ContactMessage.entity';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { ContactModule } from './contact/contact.module';
import { LoansModule } from './loans/loans.module';
import { PrayerModule } from './prayer/prayer.module';
import { WordsModule } from './words/words.module';
import { GamesModule } from './games/games.module';

@Module({
  imports: [
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
        database: configService.get<string>('DB_DATABASE', 'vaktihuzur'),
        entities: [
          User,
          Post,
          PostView,
          Category,
          Word,
          MonthlyPayment,
          Region,
          City,
          PrayerTime,
          ContactMessage,
        ],
        synchronize: true, // Geliştirme ortamı için true. Canlı ortamda migration tercih edilir.
      }),
    }),
    AuthModule,
    PostsModule,
    ContactModule,
    LoansModule,
    PrayerModule,
    WordsModule,
    GamesModule,
  ],
})
export class AppModule {}
