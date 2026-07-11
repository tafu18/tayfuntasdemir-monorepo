import { Controller, Get, Post, Put, Delete, Query, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { WordsService } from './words.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('words')
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  @Get('categories')
  async getCategories() {
    return this.wordsService.getCategories();
  }

  @Get()
  async getWords(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('category_id') categoryId?: string,
    @Query('letter') letter?: string,
    @Query('sort') sort: 'asc' | 'desc' = 'asc',
    @Query('shuffle') shuffle?: string,
  ) {
    return this.wordsService.getWords(
      Number(page),
      Number(limit),
      categoryId,
      letter,
      sort,
      shuffle === 'true',
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('categories')
  async createCategory(@Body() body: any) {
    return this.wordsService.createCategory(body);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createWord(@Body() body: any) {
    return this.wordsService.createWord(body);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateWord(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.wordsService.updateWord(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteWord(@Param('id', ParseIntPipe) id: number) {
    return this.wordsService.deleteWord(id);
  }
}
