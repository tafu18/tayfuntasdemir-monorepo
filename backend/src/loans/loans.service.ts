import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MonthlyPayment } from '../database/entities/MonthlyPayment.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LoansService {
  private totalLoanGram: number;

  constructor(
    @InjectRepository(MonthlyPayment)
    private readonly paymentRepository: Repository<MonthlyPayment>,
    private readonly configService: ConfigService,
  ) {
    this.totalLoanGram = Number(this.configService.get<string>('TOTAL_LOAN_GRAM', '360')); // Varsayılan 360 gram
  }

  async savePayment(data: any): Promise<{ status: string; totals: any }> {
    let payment: MonthlyPayment | null = await this.paymentRepository.findOne({ where: { month_year: data.month_year } });
    if (payment) {
      Object.assign(payment, data);
    } else {
      payment = this.paymentRepository.create(data) as any;
    }
    await this.paymentRepository.save(payment as MonthlyPayment);

    return this.getTotals();
  }

  async getTotals() {
    const payments = await this.paymentRepository.find();
    const totalPaidTL = payments.reduce((sum, p) => sum + Number(p.paid_tl), 0);
    const totalPaidGram = payments.reduce((sum, p) => sum + Number(p.paid_gram), 0);
    const remainingLoan = this.totalLoanGram - totalPaidGram;

    return {
      status: 'success',
      totals: {
        tl: totalPaidTL.toFixed(2),
        gram: totalPaidGram.toFixed(4),
        remaining: remainingLoan.toFixed(4),
        total_loan: this.totalLoanGram,
      },
    };
  }

  async getPanelData(): Promise<any> {
    const payments = await this.paymentRepository.find();
    const paymentsMap = new Map(payments.map(p => [p.month_year, p]));

    // 2025-07 ile 2030-12 arası ayları oluştur
    const startYear = 2025;
    const startMonth = 7;
    const endYear = 2030;
    const endMonth = 12;

    const months: any[] = [];
    let currentYear = startYear;
    let currentMonth = startMonth;

    const turkishMonths = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];

    while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
      const monthStr = currentMonth < 10 ? `0${currentMonth}` : `${currentMonth}`;
      const key = `${currentYear}-${monthStr}`;
      const display = `${turkishMonths[currentMonth - 1]} ${currentYear}`;

      months.push({
        month_year: key,
        display,
        payment: paymentsMap.get(key) || null,
      });

      currentMonth++;
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
      }
    }

    const totalPaidTL = payments.reduce((sum, p) => sum + Number(p.paid_tl), 0);
    const totalPaidGram = payments.reduce((sum, p) => sum + Number(p.paid_gram), 0);
    const remainingLoan = this.totalLoanGram - totalPaidGram;

    // Yıllık Toplamlar
    const yearTotals: { [key: number]: { paid_tl: number; paid_gram: number } } = {};
    for (const payment of payments) {
      const year = parseInt(payment.month_year.split('-')[0], 10);
      if (!yearTotals[year]) {
        yearTotals[year] = { paid_tl: 0, paid_gram: 0 };
      }
      yearTotals[year].paid_tl += Number(payment.paid_tl);
      yearTotals[year].paid_gram += Number(payment.paid_gram);
    }

    return {
      months,
      totalPaidTL,
      totalPaidGram,
      remainingLoan,
      totalLoanGram: this.totalLoanGram,
      yearTotals,
    };
  }

  verifyPassword(password: string): boolean {
    const correctPassword = this.configService.get<string>('BORC_PASSWORD', 'borc1234');
    return password === correctPassword;
  }
}
