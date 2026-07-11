import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/User.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

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
    const count = await this.userRepository.count();
    if (count === 0) {
      // Varsayılan admin kullanıcısı oluştur
      await this.register({
        name: 'Tayfun Taşdemir',
        email: 'tayfun@vaktihuzur.com',
        password: 'adminpassword123',
        type: 'admin',
      });
      console.log('Seed: Varsayılan admin kullanıcısı oluşturuldu (tayfun@vaktihuzur.com / adminpassword123)');
    }
  }
}
