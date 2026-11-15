import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('uptime_checks')
export class UptimeCheck {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('IDX_uptime_checks_monitorId')
  @Column({ type: 'varchar', length: 36 })
  monitorId: string;

  @Column({ type: 'varchar', length: 16 })
  status: string;

  @Column({ type: 'int', nullable: true })
  statusCode: number | null;

  @Column({ type: 'int', default: 0 })
  responseTimeMs: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  error: string | null;

  @CreateDateColumn()
  checkedAt: Date;
}
