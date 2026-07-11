import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('monthly_payments')
export class MonthlyPayment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  month_year: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  salary: number;

  @Column({ type: 'decimal', precision: 12, scale: 4 })
  gram_price: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  paid_tl: number;

  @Column({ type: 'decimal', precision: 12, scale: 4 })
  paid_gram: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
