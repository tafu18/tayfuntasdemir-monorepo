import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactMessage } from './entities/ContactMessage.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactMessage)
    private readonly contactRepository: Repository<ContactMessage>,
    private readonly mailService: MailService,
  ) { }

  async create(data: any): Promise<ContactMessage> {
    const msg = this.contactRepository.create(data) as any;
    const savedMsg = await this.contactRepository.save(msg) as ContactMessage;

    // Mail bildirimini akademiktayfuntasdemir@gmail.com adresine ilet
    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 24px; background-color: #f8fafc; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #4f46e5; margin: 0; font-size: 22px;">📩 Yeni İletişim Formu Mesajı</h2>
        </div>
        <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #cbd5e1;">
          <p style="margin: 8px 0; color: #334155;"><strong>Gönderen Adı:</strong> ${savedMsg.name}</p>
          <p style="margin: 8px 0; color: #334155;"><strong>E-posta:</strong> <a href="mailto:${savedMsg.email}" style="color: #4f46e5;">${savedMsg.email}</a></p>
          <p style="margin: 8px 0; color: #334155;"><strong>Telefon:</strong> ${savedMsg.phone || '-'}</p>
          <p style="margin: 8px 0; color: #334155;"><strong>Konu:</strong> ${data.subject || 'Genel İletişim'}</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
          <p style="margin-bottom: 8px; color: #475569; font-weight: bold;">Mesaj:</p>
          <div style="background-color: #f1f5f9; padding: 14px; border-radius: 6px; color: #1e293b; white-space: pre-wrap; font-size: 14px; line-height: 1.6;">
            ${savedMsg.message}
          </div>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #94a3b8; font-size: 12px;">
          Tarih: ${new Date().toLocaleString('tr-TR')}
        </div>
      </div>
    `;

    await this.mailService.sendMail({
      to: 'akademiktayfuntasdemir@gmail.com',
      fromName: 'İletişim Bildirimi',
      subject: `📩 Yeni İletişim Mesajı: ${data.subject || savedMsg.name}`,
      html,
    });

    return savedMsg;
  }

  async findAll(page = 1, limit = 15): Promise<{ data: ContactMessage[]; total: number; page: number; lastPage: number }> {
    const [data, total] = await this.contactRepository.findAndCount({
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<ContactMessage> {
    const msg = await this.contactRepository.findOne({ where: { id } });
    if (!msg) {
      throw new NotFoundException('Mesaj bulunamadı.');
    }
    return msg;
  }

  async toggleStatus(id: number): Promise<ContactMessage> {
    const msg = await this.findOne(id);
    msg.status = !msg.status;
    return this.contactRepository.save(msg);
  }
}
