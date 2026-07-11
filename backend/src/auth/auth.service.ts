import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/User.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) { }

  async register(data: any): Promise<User> {
    const existing = await this.userRepository.findOne({ where: { email: data.email } });
    if (existing) {
      throw new ConflictException('Bu e-posta adresi zaten kullanımda.');
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = this.userRepository.create({
      ...data,
      password: hashedPassword,
    }) as any;
    return this.userRepository.save(user) as Promise<User>;
  }

  async login(data: any): Promise<{ access_token: string; user: any }> {
    const user = await this.userRepository.findOne({ where: { email: data.email } });
    if (!user) {
      throw new UnauthorizedException('E-posta veya şifre hatalı.');
    }
    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('E-posta veya şifre hatalı.');
    }
    const payload = { email: user.email, sub: user.id, type: user.type };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.type,
        male_name: user.male_name,
        female_name: user.female_name,
      },
    };
  }

  async findUserById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async seedAdmin(): Promise<void> {
    const adminEmail = 'admin@tayfuntasdemir.com.tr';
    const existing = await this.userRepository.findOne({ where: { email: adminEmail } });
    if (!existing) {
      // Varsayılan admin kullanıcısı oluştur
      await this.register({
        name: 'Tayfun Taşdemir',
        email: adminEmail,
        password: '243818Tt.',
        type: 'admin',
      });
      console.log(`Seed: Varsayılan admin kullanıcısı oluşturuldu (${adminEmail})`);
    } else {
      // Şifreyi ve türü güncelle
      const hashedPassword = await bcrypt.hash('243818Tt.', 10);
      existing.password = hashedPassword;
      existing.type = 'admin';
      await this.userRepository.save(existing);
      console.log(`Seed: Mevcut admin kullanıcısının şifresi güncellendi (${adminEmail})`);
    }
  }
}
