import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Region } from './Region.entity';
import { PrayerTime } from './PrayerTime.entity';

@Entity('cities')
export class City {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  region_id: string;

  @ManyToOne(() => Region, (region) => region.cities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'region_id' })
  region: Region;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  longitude: number;

  @OneToMany(() => PrayerTime, (prayerTime) => prayerTime.city)
  prayerTimes: PrayerTime[];
}
