import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShortLink } from './entities/ShortLink.entity';
import { LinksController, RedirectController } from './links.controller';
import { LinksService } from './links.service';

@Module({
  imports: [TypeOrmModule.forFeature([ShortLink])],
  controllers: [LinksController, RedirectController],
  providers: [LinksService],
})
export class LinksModule {}
