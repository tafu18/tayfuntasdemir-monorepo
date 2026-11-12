import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/Post.entity';
import { PostView } from './entities/PostView.entity';

/** Türkçe karakterleri koruyarak URL-dostu slug üretir (ör. "Şifre Güvenliği" -> "sifre-guvenligi"). */
export function slugify(text: string): string {
  const map: Record<string, string> = { ç: 'c', ğ: 'g', ı: 'i', i: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u' };
  return text
    .toLocaleLowerCase('tr-TR')
    .replace(/[çğıiöşüâîû]/g, (c) => map[c] ?? c)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(PostView)
    private postViewRepository: Repository<PostView>,
  ) { }

  async findAll(page = 1, limit = 9, status?: 'draft' | 'published'): Promise<{ data: Post[]; total: number; page: number; lastPage: number }> {
    const query = this.postRepository.createQueryBuilder('post')
      .orderBy('post.created_at', 'DESC');

    if (status) {
      query.where('post.status = :status', { status });
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOneBySlug(slug: string): Promise<{ post: Post; related: Post[]; mostRead: Post[] }> {
    // Taslaklar herkese açık URL'den görüntülenemez/indekslenemez
    const post = await this.postRepository.findOne({ where: { slug, status: 'published' } });
    if (!post) {
      throw new NotFoundException('Yazı bulunamadı.');
    }

    // Views are now tracked separately via trackView method

    const related = await this.postRepository.createQueryBuilder('post')
      .where('post.id != :id AND post.status = :status', { id: post.id, status: 'published' })
      .orderBy('RAND()')
      .take(5)
      .getMany();

    const mostRead = await this.postRepository.find({
      where: { status: 'published' },
      order: { views: 'DESC' },
      take: 5,
    });

    return { post, related, mostRead };
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.postRepository.findOne({ where: { id }, relations: { postViews: true } });
    if (!post) {
      throw new NotFoundException('Yazı bulunamadı.');
    }
    return post;
  }

  async getTrackingList(): Promise<{ posts: Post[]; totalViews: number }> {
    const posts = await this.postRepository.find({
      where: { status: 'published' },
      order: { views: 'DESC' },
    });
    const totalViews = posts.reduce((sum, p) => sum + p.views, 0);
    return { posts, totalViews };
  }

  async trackView(slug: string, city: string, country: string): Promise<void> {
    const post = await this.postRepository.findOne({ where: { slug } });
    if (post && post.status === 'published') {
      post.views += 1;
      await this.postRepository.save(post);

      const postView = this.postViewRepository.create({ 
        post_id: post.id 
        // If your PostView entity supports city/country, you can save them here.
      });
      await this.postViewRepository.save(postView);
    }
  }

  async create(data: any): Promise<Post> {
    const slug = await this.uniqueSlug(slugify(data.slug || data.title));

    const post = this.postRepository.create({
      ...data,
      slug,
    }) as any;
    return this.postRepository.save(post) as Promise<Post>;
  }

  async update(id: number, data: any): Promise<Post> {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException('Yazı bulunamadı.');
    }

    // Slug, başlık değişse bile korunur: yayınlanmış URL'ler değişirse indekslenmiş
    // linkler 404 olur. Slug yalnızca açıkça gönderilirse güncellenir.
    if (data.slug && slugify(data.slug) !== post.slug) {
      data.slug = await this.uniqueSlug(slugify(data.slug), post.id);
    } else {
      delete data.slug;
    }

    Object.assign(post, data);
    return this.postRepository.save(post) as Promise<Post>;
  }

  private async uniqueSlug(base: string, excludeId?: number): Promise<string> {
    const root = base || 'yazi';
    let candidate = root;
    for (let i = 2; ; i++) {
      const existing = await this.postRepository.findOne({ where: { slug: candidate } });
      if (!existing || existing.id === excludeId) return candidate;
      candidate = `${root}-${i}`;
    }
  }

  async remove(id: number): Promise<void> {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException('Yazı bulunamadı.');
    }
    await this.postRepository.remove(post);
  }

  async getViewsToday(postId: number): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.postViewRepository.createQueryBuilder('pv')
      .where('pv.post_id = :postId AND pv.viewed_at >= :today', { postId, today })
      .getCount();
  }

  async getStats(): Promise<any> {
    const totalPosts = await this.postRepository.count();
    const publishedPosts = await this.postRepository.count({ where: { status: 'published' } });
    const draftPosts = await this.postRepository.count({ where: { status: 'draft' } });

    const totalViewsResult = await this.postRepository.createQueryBuilder('post')
      .select('SUM(post.views)', 'sum')
      .getRawOne();

    const totalViews = parseInt(totalViewsResult?.sum || '0', 10);

    return {
      totalPosts,
      publishedPosts,
      draftPosts,
      totalViews,
    };
  }

  async getHomeData(): Promise<any> {
    const lastThreePosts = await this.postRepository.find({
      where: { status: 'published' },
      order: { created_at: 'DESC' },
      take: 4,
    });

    const mostReadPosts = await this.postRepository.find({
      where: { status: 'published' },
      order: { views: 'DESC' },
      take: 9,
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayViewsRaw = await this.postViewRepository.createQueryBuilder('pv')
      .select('pv.post_id', 'post_id')
      .addSelect('COUNT(pv.id)', 'today_views_count')
      .where('pv.viewed_at >= :today', { today })
      .groupBy('pv.post_id')
      .orderBy('today_views_count', 'DESC')
      .limit(10)
      .getRawMany();

    const mostReadPostsToday: any[] = [];
    for (const raw of todayViewsRaw) {
      const post = await this.postRepository.findOne({ where: { id: raw.post_id, status: 'published' } });
      if (post) {
        mostReadPostsToday.push({
          ...post,
          today_views_count: parseInt(raw.today_views_count, 10),
        });
      }
    }

    return {
      lastThreePosts,
      mostRead: mostReadPosts,
      mostReadPostsToday,
    };
  }
}
