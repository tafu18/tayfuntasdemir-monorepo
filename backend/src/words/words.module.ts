import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/Category.entity';
import { Word } from './entities/Word.entity';
import { WordsService } from './words.service';
import { WordsController } from './words.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Word])],
  providers: [WordsService],
  controllers: [WordsController],
  exports: [WordsService],
})
export class WordsModule implements OnModuleInit {
  constructor(private readonly wordsService: WordsService) { }

  async onModuleInit() {
    await this.wordsService.seedDemoWords();
  }
}
