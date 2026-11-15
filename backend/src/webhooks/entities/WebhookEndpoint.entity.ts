import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('webhook_endpoints')
export class WebhookEndpoint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 32, unique: true })
  token: string;

  @Column({ type: 'varchar', length: 80, nullable: true })
  name: string | null;

  @Index('IDX_webhook_endpoints_ownerId')
  @Column({ type: 'varchar', length: 64, nullable: true })
  ownerId: string | null;

  @Index('IDX_webhook_endpoints_ownerEmail')
  @Column({ type: 'varchar', length: 160, nullable: true })
  ownerEmail: string | null;

  @Column({ type: 'int', default: 200 })
  responseStatus: number;

  @Column({ type: 'text', nullable: true })
  responseBody: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
