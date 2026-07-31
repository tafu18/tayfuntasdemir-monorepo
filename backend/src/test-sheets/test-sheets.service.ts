import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestSheet } from './entities/TestSheet.entity';

@Injectable()
export class TestSheetsService {
  constructor(
    @InjectRepository(TestSheet)
    private readonly testSheetRepository: Repository<TestSheet>,
  ) {}

  async findAllActive(): Promise<TestSheet[]> {
    return this.testSheetRepository.find({
      where: { isActive: true },
      order: { id: 'DESC' },
    });
  }

  async findAll(): Promise<TestSheet[]> {
    return this.testSheetRepository.find({
      order: { id: 'DESC' },
    });
  }

  async create(data: Partial<TestSheet>): Promise<TestSheet> {
    const sheet = this.testSheetRepository.create(data);
    return this.testSheetRepository.save(sheet);
  }

  async update(id: number, data: Partial<TestSheet>): Promise<TestSheet | null> {
    await this.testSheetRepository.update(id, data);
    return this.testSheetRepository.findOne({ where: { id } });
  }

  async delete(id: number): Promise<void> {
    await this.testSheetRepository.delete(id);
  }
}
