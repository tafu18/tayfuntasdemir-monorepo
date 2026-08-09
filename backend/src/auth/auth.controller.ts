import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: any) {
    return this.authService.register(body);
  }

  @Post('login')
  async login(@Body() body: any) {
    return this.authService.login(body);
  }

  @Post('sso')
  async ssoLogin(@Body() body: { secretKey: string; email?: string }) {
    return this.authService.ssoLogin(body.secretKey, body.email);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: any) {
    const user = await this.authService.findUserById(req.user.userId);
    if (!user) {
      return { error: 'Kullanıcı bulunamadı.' };
    }
    const { password, ...result } = user;
    return result;
  }
}
