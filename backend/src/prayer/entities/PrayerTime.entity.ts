import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { City } from './City.entity';

@Entity('prayer_times')
@Unique(['city_id', 'date'])
export class PrayerTime {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  city_id: string;

  @ManyToOne(() => City, (city) => city.prayerTimes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'city_id' })
  city: City;

  @Column({ type: 'date' })
  date: string; // YYYY-MM-DD

  @Column({ type: 'time' })
  imsak: string;

  @Column({ type: 'time' })
  gunes: string;

  @Column({ type: 'time' })
  ogle: string;

  @Column({ type: 'time' })
  ikindi: string;

  @Column({ type: 'time' })
  aksam: string;

  @Column({ type: 'time' })
  yatsi: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
