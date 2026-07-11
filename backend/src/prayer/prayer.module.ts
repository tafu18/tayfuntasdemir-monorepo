import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Region } from './entities/Region.entity';
import { City } from './entities/City.entity';
import { PrayerTime } from './entities/PrayerTime.entity';
import { PrayerService } from './prayer.service';
import { PrayerController } from './prayer.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Region, City, PrayerTime])],
  providers: [PrayerService],
  controllers: [PrayerController],
  exports: [PrayerService],
})
export class PrayerModule { }
