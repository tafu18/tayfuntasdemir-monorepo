import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { TestSheetsService } from './test-sheets.service';
import { TestSheet } from './entities/TestSheet.entity';

@Controller('test-sheets')
export class TestSheetsController {
  constructor(private readonly testSheetsService: TestSheetsService) {}

  @Get()
  async getActiveSheets(): Promise<TestSheet[]> {
    return this.testSheetsService.findAllActive();
  }

  @Get('all')
  async getAllSheets(): Promise<TestSheet[]> {
    return this.testSheetsService.findAll();
  }

  @Post()
  async create(@Body() body: Partial<TestSheet>): Promise<TestSheet> {
    return this.testSheetsService.create(body);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: Partial<TestSheet>,
  ): Promise<TestSheet | null> {
    return this.testSheetsService.update(+id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.testSheetsService.delete(+id);
    return { success: true };
  }
}
