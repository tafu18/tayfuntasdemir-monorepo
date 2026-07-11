import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '../posts/entities/Post.entity';
import { PostView } from '../posts/entities/PostView.entity';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Post, PostView]),
  ],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}

