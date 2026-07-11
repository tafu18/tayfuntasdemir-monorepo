import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { PrayerService } from './prayer.service';

@Controller('prayer')
export class PrayerController {
  constructor(private readonly prayerService: PrayerService) {}

  @Get('regions')
  async getRegions() {
    return this.prayerService.getRegions();
  }

  @Get('cities')
  async getCities(@Query('region_id') regionId: string) {
    return this.prayerService.getCities(regionId);
  }

  @Get('daily')
  async getDaily(
    @Query('city_id') cityId: string,
    @Query('date') date: string,
  ) {
    return this.prayerService.getDaily(cityId, date);
  }

  @Get('monthly')
  async getMonthly(
    @Query('city_id') cityId: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.prayerService.getMonthly(cityId, Number(year), Number(month));
  }

  @Get('live')
  async getLiveTimes(
    @Query('region') region: string,
    @Query('city') city: string,
  ) {
    return this.prayerService.getLivePrayerTimes(region, city);
  }

  // YENİ METOTLAR: Live listesinden il/ilçeleri çekmek için
  @Get('external/regions')
  async getExternalRegions() {
    return this.prayerService.fetchExternalRegions();
  }

  @Get('external/cities')
  async getExternalCities(@Query('region') region: string) {
    return this.prayerService.fetchExternalCities(region);
  }

  @Post('sync-locations')
  async syncLocations(@Body('url') url?: string) {
    return this.prayerService.syncLocations(url);
  }

  @Post('sync-times')
  async syncTimes(@Body('year') year?: number) {
    return this.prayerService.fetchAndSaveAladhanTimes(year ? Number(year) : undefined);
  }

  @Get('stats')
  async getStats() {
    return this.prayerService.getStats();
  }
}
