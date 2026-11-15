import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UptimeMonitor } from './entities/UptimeMonitor.entity';
import { UptimeCheck } from './entities/UptimeCheck.entity';
import { UptimeService } from './uptime.service';
import { UptimeController } from './uptime.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([UptimeMonitor, UptimeCheck]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'supersecretjwtkey123!'),
      }),
    }),
  ],
  controllers: [UptimeController],
  providers: [UptimeService],
})
export class UptimeModule {}
