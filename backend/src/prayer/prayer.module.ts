import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Region } from '../database/entities/Region.entity';
import { City } from '../database/entities/City.entity';
import { PrayerTime } from '../database/entities/PrayerTime.entity';
import { PrayerService } from './prayer.service';
import { PrayerController } from './prayer.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Region, City, PrayerTime])],
  providers: [PrayerService],
  controllers: [PrayerController],
  exports: [PrayerService],
})
export class PrayerModule {}
