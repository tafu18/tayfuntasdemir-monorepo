import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactMessage } from '../database/entities/ContactMessage.entity';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactMessage)
    private readonly contactRepository: Repository<ContactMessage>,
  ) {}

  async create(data: any): Promise<ContactMessage> {
    const msg = this.contactRepository.create(data) as any;
    return this.contactRepository.save(msg) as Promise<ContactMessage>;
  }

  async findAll(page = 1, limit = 15): Promise<{ data: ContactMessage[]; total: number; page: number; lastPage: number }> {
    const [data, total] = await this.contactRepository.findAndCount({
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<ContactMessage> {
    const msg = await this.contactRepository.findOne({ where: { id } });
    if (!msg) {
      throw new NotFoundException('Mesaj bulunamadı.');
    }
    return msg;
  }

  async toggleStatus(id: number): Promise<ContactMessage> {
    const msg = await this.findOne(id);
    msg.status = !msg.status;
    return this.contactRepository.save(msg);
  }
}
