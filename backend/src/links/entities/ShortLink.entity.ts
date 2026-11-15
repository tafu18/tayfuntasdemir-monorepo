import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('short_links')
export class ShortLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 32, unique: true })
  kod: string;

  @Column({ type: 'text' })
  hedefUrl: string;

  @Column({ type: 'varchar', length: 80, nullable: true })
  baslik: string | null;

  @Index('IDX_short_links_ownerId')
  @Column({ type: 'varchar', length: 64, nullable: true })
  ownerId: string | null;

  @Index('IDX_short_links_ownerEmail')
  @Column({ type: 'varchar', length: 160, nullable: true })
  ownerEmail: string | null;

  @Column({ type: 'boolean', default: true })
  aktif: boolean;

  @Column({ type: 'int', default: 0 })
  tiklanma: number;

  @Column({ type: 'datetime', nullable: true })
  sonTiklanma: Date | null;

  @Column({ type: 'datetime', nullable: true })
  sonKullanma: Date | null;

  @CreateDateColumn()
  olusturulma: Date;
}
