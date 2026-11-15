import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('uptime_monitors')
export class UptimeMonitor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 80 })
  name: string;

  @Column({ type: 'text' })
  url: string;

  @Index('IDX_uptime_monitors_ownerId')
  @Column({ type: 'varchar', length: 64, nullable: true })
  ownerId: string | null;

  @Index('IDX_uptime_monitors_ownerEmail')
  @Column({ type: 'varchar', length: 160, nullable: true })
  ownerEmail: string | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  alertEmail: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 16, default: 'pending' })
  lastStatus: string;

  @Column({ type: 'int', nullable: true })
  lastStatusCode: number | null;

  @Column({ type: 'int', nullable: true })
  lastResponseTimeMs: number | null;

  @Column({ type: 'int', nullable: true })
  sslDaysRemaining: number | null;

  @Column({ type: 'datetime', nullable: true })
  sslValidTo: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  lastError: string | null;

  @Column({ type: 'datetime', nullable: true })
  lastCheckedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
