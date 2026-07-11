import { Controller, Post, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ReportService } from './report.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('report')
@UseGuards(JwtAuthGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  /**
   * POST /api/report/send-daily
   * Admin panelinden manuel olarak günlük raporu tetikler.
   */
  @Post('send-daily')
  @HttpCode(HttpStatus.OK)
  async sendDailyReport() {
    await this.reportService.sendDailyPostViewReport();
    return { success: true, message: 'Günlük rapor başarıyla gönderildi.' };
  }
}
