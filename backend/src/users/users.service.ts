import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(email: string, password: string, name?: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({
      email,
      password: hashedPassword,
      name,
      emailVerified: false,
    });
    return this.usersRepository.save(user);
  }

  async findOne(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.findOne(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async update(id: number, updateData: { email?: string; name?: string; password?: string; emailVerified?: boolean }): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new Error('Пользователь не найден');
    }

    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await this.findOne(updateData.email);
      if (existingUser) {
        throw new Error('Пользователь с таким email уже существует');
      }
      user.email = updateData.email;
    }

    if (updateData.name !== undefined) {
      user.name = updateData.name;
    }

    if (updateData.password) {
      user.password = await bcrypt.hash(updateData.password, 10);
    }

    if (updateData.emailVerified !== undefined) {
      user.emailVerified = updateData.emailVerified;
    }

    return this.usersRepository.save(user);
  }

  async setVerificationCode(email: string, code: string): Promise<void> {
    const user = await this.findOne(email);
    if (!user) {
      throw new Error('Пользователь не найден');
    }
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // Код действителен 10 минут
    user.verificationCode = code;
    user.verificationCodeExpires = expiresAt;
    await this.usersRepository.save(user);
  }

  async verifyEmail(email: string, code: string): Promise<boolean> {
    const user = await this.findOne(email);
    if (!user) {
      return false;
    }
    if (user.verificationCode !== code) {
      return false;
    }
    if (user.verificationCodeExpires && new Date() > user.verificationCodeExpires) {
      return false;
    }
    user.emailVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    await this.usersRepository.save(user);
    return true;
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}

