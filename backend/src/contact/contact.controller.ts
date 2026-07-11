import { Controller, Post, Get, Put, Body, Query, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ContactService } from './contact.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async submitForm(@Body() body: any) {
    return this.contactService.create(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/list')
  async getMessages(
    @Query('page') page = 1,
    @Query('limit') limit = 15,
  ) {
    return this.contactService.findAll(Number(page), Number(limit));
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/:id')
  async getMessage(@Param('id', ParseIntPipe) id: number) {
    return this.contactService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('admin/:id/toggle-status')
  async toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return this.contactService.toggleStatus(id);
  }
}
