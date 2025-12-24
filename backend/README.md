# AlgoSpec Backend API

Backend приложение на NestJS для аутентификации пользователей.

## Установка

```bash
cd backend
npm install
```

## Запуск

```bash
# Разработка
npm run start:dev

# Продакшн
npm run build
npm run start:prod
```

Сервер запустится на `http://localhost:3001`

## API Endpoints

### Регистрация
```
POST /auth/register
Body: {
  "email": "user@example.com",
  "password": "password123",
  "name": "Имя пользователя" // опционально
}
```

### Вход
```
POST /auth/login
Body: {
  "email": "user@example.com",
  "password": "password123"
}
```

### Получить профиль (требует авторизации)
```
GET /auth/profile
Headers: {
  "Authorization": "Bearer <token>"
}
```

## База данных

Используется SQLite база данных `algospec.db`, которая создается автоматически при первом запуске.

**Важно:** В продакшене используйте переменные окружения для:
- JWT секретного ключа
- Настроек базы данных
- CORS настроек

