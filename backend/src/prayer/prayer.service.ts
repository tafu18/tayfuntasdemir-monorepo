import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Region } from '../database/entities/Region.entity';
import { City } from '../database/entities/City.entity';
import { PrayerTime } from '../database/entities/PrayerTime.entity';

@Injectable()
export class PrayerService {
  private readonly logger = new Logger(PrayerService.name);

  constructor(
    @InjectRepository(Region)
    private readonly regionRepository: Repository<Region>,
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
    @InjectRepository(PrayerTime)
    private readonly prayerTimeRepository: Repository<PrayerTime>,
  ) {}

  async getRegions(): Promise<Region[]> {
    return this.regionRepository.find({ order: { name: 'ASC' } });
  }

  async getCities(regionId: string): Promise<City[]> {
    return this.cityRepository.find({
      where: { region_id: regionId },
      order: { name: 'ASC' },
    });
  }

  async getDaily(cityId: string, dateStr: string): Promise<any> {
    const pt = await this.prayerTimeRepository.findOne({
      where: { city_id: cityId, date: dateStr },
    });

    if (!pt) {
      return { error: 'Bu tarih için vakit bulunamadı.' };
    }

    const city = await this.cityRepository.findOne({
      where: { id: cityId },
      relations: { region: true },
    });

    if (!city) {
      return { error: 'İlçe bulunamadı.' };
    }

    return {
      city: city.name,
      region: city.region.name,
      date: dateStr,
      latitude: city.latitude,
      longitude: city.longitude,
      timings: {
        imsak: pt.imsak,
        gunes: pt.gunes,
        ogle: pt.ogle,
        ikindi: pt.ikindi,
        aksam: pt.aksam,
        yatsi: pt.yatsi,
      },
    };
  }

  async getMonthly(cityId: string, year: number, month: number): Promise<any> {
    const monthStr = month < 10 ? `0${month}` : `${month}`;
    const startPattern = `${year}-${monthStr}-01`;
    const endPattern = `${year}-${monthStr}-31`;

    const prayerTimes = await this.prayerTimeRepository.createQueryBuilder('pt')
      .where('pt.city_id = :cityId AND pt.date BETWEEN :start AND :end', {
        cityId,
        start: startPattern,
        end: endPattern,
      })
      .orderBy('pt.date', 'ASC')
      .getMany();

    if (prayerTimes.length === 0) {
      return { error: 'Bu ay için vakit bulunamadı.' };
    }

    const city = await this.cityRepository.findOne({
      where: { id: cityId },
      relations: { region: true },
    });

    if (!city) {
      return { error: 'İlçe bulunamadı.' };
    }

    const data = prayerTimes.map((pt) => ({
      date: pt.date,
      imsak: pt.imsak,
      gunes: pt.gunes,
      ogle: pt.ogle,
      ikindi: pt.ikindi,
      aksam: pt.aksam,
      yatsi: pt.yatsi,
    }));

    return {
      city: city.name,
      region: city.region.name,
      year,
      month,
      total_days: prayerTimes.length,
      latitude: city.latitude,
      longitude: city.longitude,
      data,
    };
  }

  async getLivePrayerTimes(region: string, city: string): Promise<any> {
    const today = new Date().toISOString().split('T')[0];
    
    // We can fetch from vaktiapp API directly
    const url = `https://vaktiapp.com/api/timesFromPlace?country=Turkey&region=${encodeURIComponent(region)}&city=${encodeURIComponent(city)}&date=${today}&days=1&timezoneOffset=180&calculationMethod=Turkey`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`External API status: ${response.status}`);
      }
      const data = await response.json();
      
      if (!data?.times?.[today]) {
        throw new Error('Times not found in API response');
      }

      const prayerTimes = data.times[today]; // Array of times [imsak, gunes, ogle, ikindi, aksam, yatsi]
      const prayers = ['İmsak', 'Güneş', 'Öğle', 'İkindi', 'Akşam', 'Yatsı'];
      
      const allTimesFormatted = {};
      prayers.forEach((name, idx) => {
        allTimesFormatted[name] = prayerTimes[idx];
      });

      // Calculate remaining time
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentSeconds = now.getSeconds();
      const nowInSeconds = currentHours * 3600 + currentMinutes * 60 + currentSeconds;

      let nextPrayerName: string | null = null;
      let remainingTime = 0;

      for (let i = 0; i < prayers.length; i++) {
        const [h, m] = prayerTimes[i].split(':').map(Number);
        const prayerInSeconds = h * 3600 + m * 60;
        
        if (nowInSeconds < prayerInSeconds) {
          nextPrayerName = prayers[i];
          remainingTime = prayerInSeconds - nowInSeconds;
          break;
        }
      }

      if (!nextPrayerName) {
        nextPrayerName = 'İmsak';
        const [h, m] = prayerTimes[0].split(':').map(Number);
        const imsakNextDayInSeconds = 24 * 3600 + h * 3600 + m * 60;
        remainingTime = imsakNextDayInSeconds - nowInSeconds;
      }

      const hours = String(Math.floor(remainingTime / 3600)).padStart(2, '0');
      const minutes = String(Math.floor((remainingTime % 3600) / 60)).padStart(2, '0');
      const seconds = String(remainingTime % 60).padStart(2, '0');
      const formattedRemainingTime = `${hours}:${minutes}:${seconds}`;

      return {
        next_prayer_name: nextPrayerName,
        remaining_time: formattedRemainingTime,
        all_times: allTimesFormatted,
      };
    } catch (e) {
      this.logger.error(`Error getting live times: ${e.message}`);
      return { error: 'Namaz vakitleri alınamadı.', details: e.message };
    }
  }

  async fetchExternalRegions(): Promise<any[]> {
    try {
      const response = await fetch('https://vaktiapp.com/api/regions?country=Turkey');
      if (!response.ok) return [];
      return await response.json();
    } catch {
      return [];
    }
  }

  async fetchExternalCities(region: string): Promise<any[]> {
    try {
      const response = await fetch(`https://vaktiapp.com/api/cities?country=Turkey&region=${encodeURIComponent(region)}`);
      if (!response.ok) return [];
      return await response.json();
    } catch {
      return [];
    }
  }

  async syncLocations(apiUrl = 'https://vaktihuzur.com.tr/api/regions-with-cities'): Promise<any> {
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Sync URL returns status: ${response.status}`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('API returned invalid data format');
      }

      let regionCount = 0;
      let cityCount = 0;

      for (const reg of data) {
        let region = await this.regionRepository.findOne({ where: { id: reg.id } });
        if (!region) {
          region = this.regionRepository.create({ id: reg.id, name: reg.name });
          await this.regionRepository.save(region);
        }
        regionCount++;

        if (Array.isArray(reg.cities)) {
          for (const cit of reg.cities) {
            let city = await this.cityRepository.findOne({ where: { id: cit.id } });
            if (!city) {
              city = this.cityRepository.create({
                id: cit.id,
                name: cit.name,
                region_id: region.id,
              });
              await this.cityRepository.save(city);
            }
            cityCount++;
          }
        }
      }

      return { success: true, regions: regionCount, cities: cityCount };
    } catch (err) {
      this.logger.error(`Location sync error: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  async fetchAndSaveAladhanTimes(year = 2029): Promise<any> {
    const cities = await this.cityRepository.find({ relations: { region: true } });
    if (cities.length === 0) {
      return { error: 'Veritabanında ilçe bulunamadı.' };
    }

    let savedCount = 0;
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    for (const city of cities) {
      const cleanCity = this.convertToEnglish(city.name);
      const cleanRegion = this.convertToEnglish(city.region.name);

      for (const month of months) {
        const url = `https://api.aladhan.com/v1/calendarByCity/${year}/${month}?city=${cleanCity}&state=${cleanRegion}&country=Turkey&method=13`;
        try {
          const response = await fetch(url);
          if (!response.ok) continue;
          const resJson = await response.json();
          if (!resJson?.data || !Array.isArray(resJson.data)) continue;

          for (const dayData of resJson.data) {
            const dateStr = dayData.date.gregorian.date; // DD-MM-YYYY
            const parts = dateStr.split('-');
            const dbDate = `${parts[2]}-${parts[1]}-${parts[0]}`; // YYYY-MM-DD
            const timings = dayData.timings;

            let pt = await this.prayerTimeRepository.findOne({
              where: { city_id: city.id, date: dbDate },
            });

            const dataToSave = {
              city_id: city.id,
              date: dbDate,
              imsak: timings.Fajr.substring(0, 5),
              gunes: timings.Sunrise.substring(0, 5),
              ogle: timings.Dhuhr.substring(0, 5),
              ikindi: timings.Asr.substring(0, 5),
              aksam: timings.Maghrib.substring(0, 5),
              yatsi: timings.Isha.substring(0, 5),
            };

            if (pt) {
              Object.assign(pt, dataToSave);
            } else {
              pt = this.prayerTimeRepository.create(dataToSave);
            }
            await this.prayerTimeRepository.save(pt);
            savedCount++;
          }
        } catch (e) {
          this.logger.error(`Error saving AlAdhan times for ${city.name}: ${e.message}`);
        }
      }
    }

    return { success: true, savedCount };
  }

  async getStats(): Promise<any> {
    const regionsCount = await this.regionRepository.count();
    const citiesCount = await this.cityRepository.count();
    const timesCount = await this.prayerTimeRepository.count();

    return {
      regions_count: regionsCount,
      cities_count: citiesCount,
      times_count: timesCount,
    };
  }

  private convertToEnglish(text: string): string {
    const replace = {
      ı: 'i', İ: 'I',
      ş: 's', Ş: 'S',
      ğ: 'g', Ğ: 'G',
      ç: 'c', Ç: 'C',
      ö: 'o', Ö: 'O',
      ü: 'u', Ü: 'U',
    };
    return text.replace(/[ıİşŞğĞçÇöÖüÜ]/g, (char) => replace[char] || char);
  }
}
