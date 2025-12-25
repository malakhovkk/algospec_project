import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Получаем разрешенные origins из переменных окружения
  const allowedOrigins = configService.get<string>('ALLOWED_ORIGINS', 'http://localhost:3000,http://localhost:3001');
  const origins = allowedOrigins.split(',').map(origin => origin.trim());
  
  // Добавляем localhost для разработки, если не указан
  if (process.env.NODE_ENV !== 'production') {
    if (!origins.includes('http://localhost:3000')) {
      origins.push('http://localhost:3000');
    }
    if (!origins.includes('http://localhost:3001')) {
      origins.push('http://localhost:3001');
    }
  }
  
  // Enable CORS for React frontend
  app.enableCors({
    // origin: (origin, callback) => {
    //   // Логируем все запросы для отладки
    //   console.log(`[CORS] Request from origin: ${origin || 'no origin'}`);
    //   console.log(`[CORS] Allowed origins: ${origins.join(', ')}`);
      
    //   // Разрешаем запросы без origin (например, мобильные приложения, Postman)
    //   if (!origin) {
    //     console.log(`[CORS] Allowing request without origin`);
    //     return callback(null, true);
    //   }
      
    //   // Проверяем точное совпадение
    //   if (origins.includes(origin)) {
    //     console.log(`[CORS] Origin ${origin} is allowed`);
    //     return callback(null, true);
    //   }
      
    //   // Проверяем совпадение без учета протокола (http vs https)
    //   const originWithoutProtocol = origin.replace(/^https?:\/\//, '');
    //   const matchingOrigin = origins.find(allowed => {
    //     const allowedWithoutProtocol = allowed.replace(/^https?:\/\//, '');
    //     return allowedWithoutProtocol === originWithoutProtocol;
    //   });
      
    //   if (matchingOrigin) {
    //     console.log(`[CORS] Origin ${origin} matched ${matchingOrigin} (protocol difference)`);
    //     return callback(null, true);
    //   }
      
    //   // Логируем отклоненные origins
    //   console.error(`[CORS] ❌ Origin ${origin} is NOT allowed`);
    //   console.error(`[CORS] Allowed origins: ${origins.join(', ')}`);
    //   console.error(`[CORS] Origin without protocol: ${originWithoutProtocol}`);
      
    //   callback(new Error(`Not allowed by CORS. Origin: ${origin}, Allowed: ${origins.join(', ')}`));
    // },
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  const port = configService.get<number>('PORT', 3001);
  await app.listen(port);
  console.log(`Backend server running on port ${port}`);
  console.log(`Allowed CORS origins: ${origins.join(', ')}`);
}
bootstrap();

