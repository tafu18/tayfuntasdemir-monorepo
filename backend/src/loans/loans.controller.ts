import { Controller, Get, Post, Body, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { LoansService } from './loans.service';

@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Get('panel')
  async getPanel() {
    return this.loansService.getPanelData();
  }

  @Post('save')
  async savePayment(@Body() body: any) {
    // Şifre doğrulaması frontend üzerinden veya API üzerinden yapılabilir.
    // Laravel'de panel auth ayrı bir POST endpointi olarak tanımlanmış.
    return this.loansService.savePayment(body);
  }

  @Post('auth')
  @HttpCode(HttpStatus.OK)
  async authenticate(@Body('password') password?: string) {
    if (!password) {
      throw new UnauthorizedException('Şifre gereklidir.');
    }
    const isCorrect = this.loansService.verifyPassword(password);
    return {
      status: isCorrect ? 'success' : 'fail',
    };
  }
}
