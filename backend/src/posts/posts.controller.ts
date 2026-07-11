import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  async getPublished(
    @Query('page') page = 1,
    @Query('limit') limit = 9,
  ) {
    return this.postsService.findAll(Number(page), Number(limit), 'published');
  }

  @Get('tracking')
  async getTracking() {
    return this.postsService.getTrackingList();
  }

  @Get('slug/:slug')
  async getBySlug(@Param('slug') slug: string) {
    return this.postsService.findOneBySlug(slug);
  }

  // Admin routes
  @UseGuards(JwtAuthGuard)
  @Get('admin/list')
  async getAdminList(
    @Query('page') page = 1,
    @Query('limit') limit = 15,
  ) {
    const result = await this.postsService.findAll(Number(page), Number(limit));
    const items = await Promise.all(
      result.data.map(async (post) => {
        const viewsToday = await this.postsService.getViewsToday(post.id);
        return {
          ...post,
          viewsToday,
        };
      })
    );
    return {
      ...result,
      data: items,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/stats')
  async getStats() {
    return this.postsService.getStats();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() body: any) {
    return this.postsService.create(body);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.postsService.update(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.remove(id);
  }
}
