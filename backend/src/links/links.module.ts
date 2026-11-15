import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ShortLink } from './entities/ShortLink.entity';
import { LinksController, RedirectController } from './links.controller';
import { LinksService } from './links.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShortLink]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'supersecretjwtkey123!'),
        signOptions: { expiresIn: '30d' },
      }),
    }),
  ],
  controllers: [LinksController, RedirectController],
  providers: [LinksService],
})
export class LinksModule {}
