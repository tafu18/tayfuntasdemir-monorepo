import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Category } from '../database/entities/Category.entity';
import { Word } from '../database/entities/Word.entity';

@Injectable()
export class WordsService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Word)
    private readonly wordRepository: Repository<Word>,
  ) {}

  async getCategories(): Promise<Category[]> {
    return this.categoryRepository.find({ order: { name: 'ASC' } });
  }

  async createCategory(data: any): Promise<Category> {
    const slug = data.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const cat = this.categoryRepository.create({ ...data, slug }) as any;
    return this.categoryRepository.save(cat) as Promise<Category>;
  }

  async getWords(
    page = 1,
    limit = 20,
    categoryId?: string,
    letter?: string,
    sort: 'asc' | 'desc' = 'asc',
    shuffle = false,
  ): Promise<{ data: Word[]; total: number; page: number; lastPage: number }> {
    const query = this.wordRepository.createQueryBuilder('word')
      .leftJoinAndSelect('word.category', 'category');

    if (categoryId && categoryId !== 'all' && categoryId !== 'Tümü') {
      query.andWhere('word.category_id = :categoryId', { categoryId: Number(categoryId) });
    }

    if (letter) {
      query.andWhere('word.title LIKE :letter', { letter: `${letter}%` });
    }

    if (shuffle) {
      query.orderBy('RAND()');
    } else {
      query.orderBy('word.title', sort.toUpperCase() as 'ASC' | 'DESC');
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

  async createWord(data: any): Promise<Word> {
    const slug = data.title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const word = this.wordRepository.create({ ...data, slug }) as any;
    return this.wordRepository.save(word) as Promise<Word>;
  }

  async updateWord(id: number, data: any): Promise<Word> {
    const word = await this.wordRepository.findOne({ where: { id } });
    if (!word) {
      throw new NotFoundException('Kelime bulunamadı.');
    }
    if (data.title) {
      data.slug = data.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }
    Object.assign(word, data);
    return this.wordRepository.save(word) as Promise<Word>;
  }

  async deleteWord(id: number): Promise<void> {
    const word = await this.wordRepository.findOne({ where: { id } });
    if (!word) {
      throw new NotFoundException('Kelime bulunamadı.');
    }
    await this.wordRepository.remove(word);
  }

  async seedDemoWords(): Promise<void> {
    const catCount = await this.categoryRepository.count();
    if (catCount === 0) {
      const tech = await this.createCategory({ name: 'Teknoloji' });
      const phil = await this.createCategory({ name: 'Felsefe' });

      await this.createWord({
        category_id: tech.id,
        title: 'Algoritma',
        description: 'Belli bir problemi çözmek veya bir amaca ulaşmak için tasarlanan yol.',
      });

      await this.createWord({
        category_id: tech.id,
        title: 'Yapay Zeka',
        description: 'Bilgisayarın veya bilgisayar kontrolündeki bir robotun çeşitli faaliyetleri zeki canlılara benzer şekilde yerine getirme yeteneği.',
      });

      await this.createWord({
        category_id: phil.id,
        title: 'Epistemoloji',
        description: 'Bilgi felsefesi. Bilginin doğasını, kapsamını ve kaynağını inceler.',
      });

      console.log('Seed: Sözlük kategorileri ve kelimeleri oluşturuldu.');
    }
  }
}
