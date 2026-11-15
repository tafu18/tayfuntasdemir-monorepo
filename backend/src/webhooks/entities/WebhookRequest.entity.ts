import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('webhook_requests')
export class WebhookRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('IDX_webhook_requests_endpointId')
  @Column({ type: 'varchar', length: 36 })
  endpointId: string;

  @Column({ type: 'varchar', length: 12 })
  method: string;

  @Column({ type: 'varchar', length: 255 })
  path: string;

  @Column({ type: 'text' })
  headers: string;

  @Column({ type: 'text' })
  query: string;

  @Column({ type: 'longtext', nullable: true })
  body: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  ip: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
