import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  email_verified_at: Date;

  @Column()
  password: string;

  @Column({ nullable: true })
  remember_token: string;

  @Column({ nullable: true })
  male_name: string;

  @Column({ nullable: true })
  female_name: string;

  @Column({ type: 'enum', enum: ['admin', 'gift'], default: 'gift' })
  type: 'admin' | 'gift';

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
