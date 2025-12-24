import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }
    return user;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user.emailVerified) {
      throw new UnauthorizedException('Email не подтвержден. Пожалуйста, подтвердите ваш email.');
    }
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    // Проверяем существование пользователя
    const existingUser = await this.usersService.findOne(registerDto.email);
    if (existingUser) {
      // Если email уже подтвержден, запрещаем регистрацию
      if (existingUser.emailVerified) {
        throw new ConflictException('Пользователь с таким email уже существует');
      }
      // Если email не подтвержден, удаляем старую запись и разрешаем новую регистрацию
      await this.usersService.remove(existingUser.id);
    }

    const user = await this.usersService.create(
      registerDto.email,
      registerDto.password,
      registerDto.name,
    );

    // Генерируем код верификации
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    await this.usersService.setVerificationCode(user.email, verificationCode);

    // Отправляем код на email (код всегда выводится в консоль EmailService)
    await this.emailService.sendVerificationCode(user.email, verificationCode);

    return {
      message: 'Код подтверждения отправлен на ваш email',
      email: user.email,
      requiresVerification: true,
    };
  }

  async resendVerificationCode(email: string): Promise<void> {
    const user = await this.usersService.findOne(email);
    if (!user) {
      throw new BadRequestException('Пользователь не найден');
    }
    if (user.emailVerified) {
      throw new BadRequestException('Email уже подтвержден');
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    await this.usersService.setVerificationCode(user.email, verificationCode);

    // Отправляем код на email (код всегда выводится в консоль EmailService)
    await this.emailService.sendVerificationCode(user.email, verificationCode);
  }

  async verifyCode(email: string, code: string) {
    const isValid = await this.usersService.verifyEmail(email, code);
    if (!isValid) {
      throw new BadRequestException('Неверный или истекший код подтверждения');
    }

    const user = await this.usersService.findOne(email);
    if (!user) {
      throw new BadRequestException('Пользователь не найден');
    }

    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
      },
    };
  }

  async validateToken(payload: any) {
    return await this.usersService.findById(payload.sub);
  }

  async updateProfile(userId: number, updateData: { email?: string; name?: string; password?: string }): Promise<any> {
    const currentUser = await this.usersService.findById(userId);
    if (!currentUser) {
      throw new BadRequestException('Пользователь не найден');
    }

    // Если email изменился, нужно отправить код подтверждения
    const emailChanged = updateData.email && updateData.email !== currentUser.email;
    
    if (emailChanged) {
      // Проверяем, не занят ли новый email
      const existingUser = await this.usersService.findOne(updateData.email);
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('Пользователь с таким email уже существует');
      }

      // Генерируем код верификации для нового email
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Обновляем пользователя с новым email, но помечаем как неподтвержденный
      const updateDataWithVerification = {
        ...updateData,
        emailVerified: false, // Новый email не подтвержден
      };
      
      const updatedUser = await this.usersService.update(userId, updateDataWithVerification);
      
      // Устанавливаем код верификации для нового email
      await this.usersService.setVerificationCode(updateData.email, verificationCode);
      
      // Отправляем код на новый email
      await this.emailService.sendVerificationCode(updateData.email, verificationCode);
      
      const { password: _, ...result } = updatedUser;
      return {
        ...result,
        requiresEmailVerification: true,
        newEmail: updateData.email,
      };
    } else {
      // Если email не изменился, просто обновляем данные
      const user = await this.usersService.update(userId, updateData);
      const { password: _, ...result } = user;
      return result;
    }
  }

  async verifyNewEmail(userId: number, code: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new BadRequestException('Пользователь не найден');
    }

    // Проверяем код для текущего email пользователя (который может быть неподтвержденным)
    const isValid = await this.usersService.verifyEmail(user.email, code);
    if (!isValid) {
      throw new BadRequestException('Неверный или истекший код подтверждения');
    }

    // Обновляем пользователя - email теперь подтвержден
    const updatedUser = await this.usersService.update(userId, { emailVerified: true });
    const { password: _, ...result } = updatedUser;

    const payload = { email: updatedUser.email, sub: updatedUser.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: result,
    };
  }
}

