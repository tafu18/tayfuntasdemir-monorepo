import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestSheet } from './entities/TestSheet.entity';
import { TestSheetsService } from './test-sheets.service';
import { TestSheetsController } from './test-sheets.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TestSheet])],
  providers: [TestSheetsService],
  controllers: [TestSheetsController],
  exports: [TestSheetsService],
})
export class TestSheetsModule {}
