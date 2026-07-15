import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Post } from '../posts/entities/Post.entity';
import { PostView } from '../posts/entities/PostView.entity';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,

    @InjectRepository(PostView)
    private readonly postViewRepository: Repository<PostView>,

    private readonly configService: ConfigService,
  ) {}

  /**
   * Türkiye saati (UTC+3) 23:59'da çalışır.
   */
  @Cron('59 23 * * *', { timeZone: 'Europe/Istanbul' })
  async sendDailyPostViewReport(): Promise<void> {
    this.logger.log('Günlük post görüntülenme raporu cron tetiklendi...');

    try {
      // Bugünkü tarihin başlangıcı ve sonu (TR saatiyle)
      const nowTr = new Date(
        new Date().toLocaleString('en-US', { timeZone: 'Europe/Istanbul' }),
      );
      const todayStart = new Date(nowTr);
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(nowTr);
      todayEnd.setHours(23, 59, 59, 999);

      // Yayınlanmış tüm yazıları postViews ile çek
      const posts = await this.postRepository.find({
        where: { status: 'published' },
        relations: { postViews: true },
        order: { created_at: 'DESC' },
      });

      // Her yazının bugünkü okunma sayısını hesapla
      const postsWithTodayViews = posts.map((post) => {
        const viewsToday = post.postViews
          ? post.postViews.filter((pv) => {
              const viewedAt = new Date(pv.viewed_at);
              return viewedAt >= todayStart && viewedAt <= todayEnd;
            }).length
          : 0;
        return { ...post, views_today: viewsToday };
      });

      // Bugünkü toplam okunma
      const totalViewsToday = postsWithTodayViews.reduce(
        (sum, p) => sum + p.views_today,
        0,
      );

      // Tüm zamanların toplam okunma sayısı
      const totalViewsAllTime = posts.reduce(
        (sum, p) => sum + (p.views || 0),
        0,
      );

      // Sadece bugün en az 1 kez okunan yazıları filtrele (raporu kısa tut)
      const activeToday = postsWithTodayViews.filter((p) => p.views_today > 0);

      // E-posta HTML'ini oluştur
      const emailHtml = this.buildEmailHtml(
        postsWithTodayViews,
        activeToday,
        totalViewsToday,
        totalViewsAllTime,
        nowTr,
      );

      // Mail gönder
      await this.sendMail(emailHtml, nowTr);

      this.logger.log(
        `Günlük rapor başarıyla gönderildi. Bugün okunma: ${totalViewsToday}, Toplam: ${totalViewsAllTime}`,
      );
    } catch (error) {
      this.logger.error('Günlük rapor gönderiminde hata oluştu:', error);
    }
  }

  private buildEmailHtml(
    allPosts: (Post & { views_today: number })[],
    activeToday: (Post & { views_today: number })[],
    totalViewsToday: number,
    totalViewsAllTime: number,
    date: Date,
  ): string {
    const dateStr = date.toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const postRows = allPosts
      .map(
        (p) => `
        <tr>
          <td><a href="https://tayfuntasdemir.com.tr/post/${p.slug}" style="color:#154667;text-decoration:none;">${p.title}</a></td>
          <td style="text-align:center;font-weight:${p.views_today > 0 ? 'bold' : 'normal'};color:${p.views_today > 0 ? '#154667' : '#999'};">
            ${p.views_today > 0 ? `🔥 ${p.views_today}` : '—'}
          </td>
          <td style="text-align:center;color:#666;">${p.views || 0}</td>
        </tr>`,
      )
      .join('');

    return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Günlük Görüntülenme Raporu</title>
</head>
<body style="font-family:'Arial',sans-serif;margin:0;padding:20px;background-color:#f9f9f9;color:#333;">
  <div style="max-width:640px;margin:0 auto;background:#fff;padding:32px;border-radius:10px;box-shadow:0 4px 12px rgba(0,0,0,0.06);border:1px solid #eee;">

    <h1 style="text-align:center;color:#154667;font-size:24px;margin-bottom:4px;">📊 Günlük Site Raporu</h1>
    <p style="text-align:center;color:#888;font-size:14px;margin-top:0;margin-bottom:28px;">${dateStr}</p>

    <!-- Özet Kartlar -->
    <div style="display:flex;gap:12px;margin-bottom:28px;">
      <div style="flex:1;background:#f0f7ff;border-radius:10px;padding:18px;text-align:center;border:1px solid #cde3f8;">
        <div style="font-size:28px;font-weight:bold;color:#154667;">${totalViewsToday}</div>
        <div style="font-size:12px;color:#666;margin-top:4px;">Bugünkü Okunma</div>
      </div>
      <div style="flex:1;background:#f0fff4;border-radius:10px;padding:18px;text-align:center;border:1px solid #b2dfca;">
        <div style="font-size:28px;font-weight:bold;color:#1a7a42;">${totalViewsAllTime}</div>
        <div style="font-size:12px;color:#666;margin-top:4px;">Tüm Zamanlar Toplamı</div>
      </div>
      <div style="flex:1;background:#fffbf0;border-radius:10px;padding:18px;text-align:center;border:1px solid #fad47a;">
        <div style="font-size:28px;font-weight:bold;color:#a07800;">${activeToday.length}</div>
        <div style="font-size:12px;color:#666;margin-top:4px;">Bugün Okunan Yazı</div>
      </div>
    </div>

    <!-- Post Tablosu -->
    <h2 style="color:#222;font-size:18px;margin-bottom:14px;border-bottom:2px solid #f0f0f0;padding-bottom:8px;">📝 Post Görüntülenme Raporu</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <thead>
        <tr style="background:#154667;color:#fff;">
          <th style="padding:11px 14px;text-align:left;border-radius:6px 0 0 6px;">Post Başlığı</th>
          <th style="padding:11px 14px;text-align:center;white-space:nowrap;">Bugün</th>
          <th style="padding:11px 14px;text-align:center;white-space:nowrap;border-radius:0 6px 6px 0;">Toplam</th>
        </tr>
      </thead>
      <tbody>
        ${postRows}
        <tr style="background:#f4f4f4;font-weight:bold;">
          <td style="padding:12px 14px;">📌 Toplam Bugünkü Görüntülenme</td>
          <td style="padding:12px 14px;text-align:center;color:#154667;">${totalViewsToday}</td>
          <td style="padding:12px 14px;text-align:center;">—</td>
        </tr>
        <tr style="background:#f4f4f4;font-weight:bold;">
          <td style="padding:12px 14px;">🏆 Tüm Zamanların Toplam Görüntülenmesi</td>
          <td style="padding:12px 14px;text-align:center;">—</td>
          <td style="padding:12px 14px;text-align:center;color:#1a7a42;">${totalViewsAllTime}</td>
        </tr>
      </tbody>
    </table>

    <p style="margin-top:32px;font-size:12px;color:#aaa;text-align:center;">
      Bu rapor <strong>tayfuntasdemir.com.tr</strong> NestJS backend tarafından otomatik olarak oluşturulmuştur.
    </p>
  </div>
</body>
</html>`;
  }

  private async sendMail(html: string, date: Date): Promise<void> {
    const host = this.configService.get<string>('MAIL_HOST', 'smtp-relay.brevo.com');
    const port = this.configService.get<number>('MAIL_PORT', 587);
    const user = this.configService.get<string>('MAIL_USERNAME', '');
    const pass = this.configService.get<string>('MAIL_PASSWORD', '');
    const from = this.configService.get<string>('MAIL_FROM', 'noreply@tayfuntasdemir.com.tr');
    const to = this.configService.get<string>('MAIL_REPORT_TO', 'info@tayfuntasdemir.com.tr');

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: false,
      auth: { user, pass },
    });

    const dateStr = date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    await transporter.sendMail({
      from: `"tayfuntasdemir.com.tr Raporu" <${from}>`,
      to,
      subject: `📊 Günlük Görüntülenme Raporu - ${dateStr}`,
      html,
    });
  }
}
