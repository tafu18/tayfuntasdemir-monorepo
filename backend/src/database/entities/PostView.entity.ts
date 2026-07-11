import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Post } from './Post.entity';

@Entity('post_views')
export class PostView {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  post_id: number;

  @ManyToOne(() => Post, (post) => post.postViews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @CreateDateColumn({ type: 'timestamp' })
  viewed_at: Date;
}
