import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Делаем ConfigModule глобальным
      envFilePath: ['.env', '../.env'], // Путь к .env файлу (проверяем и в корне проекта)
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'algospec.db',
      entities: [User],
      synchronize: true, // В продакшене использовать миграции
      logging: false,
    }),
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}

