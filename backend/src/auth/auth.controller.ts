import { Controller, Post, Body, Get, Put, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { VerifyCodeDto, ResendCodeDto } from './dto/verify-code.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    const updatedUser = await this.authService.updateProfile(req.user.id, updateProfileDto);
    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      emailVerified: updatedUser.emailVerified,
      requiresEmailVerification: updatedUser.requiresEmailVerification || false,
      newEmail: updatedUser.newEmail || null,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-new-email')
  async verifyNewEmail(@Request() req, @Body() body: { code: string }) {
    return this.authService.verifyNewEmail(req.user.id, body.code);
  }

  @Post('verify-code')
  async verifyCode(@Body() verifyCodeDto: VerifyCodeDto) {
    return this.authService.verifyCode(verifyCodeDto.email, verifyCodeDto.code);
  }

  @Post('resend-code')
  async resendCode(@Body() resendCodeDto: ResendCodeDto) {
    await this.authService.resendVerificationCode(resendCodeDto.email);
    return { message: 'Код подтверждения отправлен на ваш email' };
  }
}

