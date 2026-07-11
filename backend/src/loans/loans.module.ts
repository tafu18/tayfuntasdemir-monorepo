import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonthlyPayment } from '../database/entities/MonthlyPayment.entity';
import { LoansService } from './loans.service';
import { LoansController } from './loans.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MonthlyPayment])],
  providers: [LoansService],
  controllers: [LoansController],
  exports: [LoansService],
})
export class LoansModule {}
