import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface SendMailOptions {
  to?: string;
  subject: string;
  html: string;
  fromName?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {}

  private createTransporter(): nodemailer.Transporter {
    const host = this.configService.get<string>('MAIL_HOST', 'smtp-relay.brevo.com');
    const port = this.configService.get<number>('MAIL_PORT', 587);
    const user = this.configService.get<string>('MAIL_USERNAME', '');
    const pass = this.configService.get<string>('MAIL_PASSWORD', '');

    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  async sendMail(options: SendMailOptions): Promise<boolean> {
    const defaultFrom = this.configService.get<string>('MAIL_FROM', 'noreply@tayfuntasdemir.com.tr');
    const defaultTo = this.configService.get<string>('MAIL_REPORT_TO', 'akademiktayfuntasdemir@gmail.com');

    const fromName = options.fromName || 'Tayfun Taşdemir Web Site';
    const to = options.to || defaultTo;
    const from = `"${fromName}" <${defaultFrom}>`;

    try {
      const transporter = this.createTransporter();
      await transporter.sendMail({
        from,
        to,
        subject: options.subject,
        html: options.html,
      });
      this.logger.log(`E-posta başarıyla gönderildi -> To: ${to} | Konu: ${options.subject}`);
      return true;
    } catch (error) {
      this.logger.error(`E-posta gönderilirken hata oluştu -> To: ${to}`, error);
      return false;
    }
  }
}
