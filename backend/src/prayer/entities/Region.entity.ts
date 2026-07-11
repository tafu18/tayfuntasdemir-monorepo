import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { City } from './City.entity';

@Entity('regions')
export class Region {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @OneToMany(() => City, (city) => city.region)
  cities: City[];
}
