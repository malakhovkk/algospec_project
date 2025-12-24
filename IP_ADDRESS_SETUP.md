# Настройка для работы с IP адресом

## 📋 Быстрая инструкция для IP адреса

Если у вас нет домена и вы используете IP адрес, следуйте этим инструкциям.

---

## 1. Настройка CORS в бэкенде

В файле `backend/.env` укажите ваш IP адрес:

```env
# С HTTP (без SSL)
ALLOWED_ORIGINS=http://123.45.67.89,http://123.45.67.89:3000

# С HTTPS (если настроили самоподписанный сертификат)
# ALLOWED_ORIGINS=https://123.45.67.89,https://123.45.67.89:3000
```

**Важно:** Замените `123.45.67.89` на ваш реальный IP адрес.

---

## 2. Настройка фронтенда

В файле `.env.local` укажите URL бэкенда:

```env
# Прямое подключение к бэкенду
NEXT_PUBLIC_API_URL=http://123.45.67.89:3001/auth

# Или через Nginx проксирование
# NEXT_PUBLIC_API_URL=http://123.45.67.89/api/auth
```

---

## 3. Настройка Nginx для IP адреса

Создайте файл `/etc/nginx/sites-available/algospec`:

```nginx
server {
    listen 80;
    server_name _;  # _ означает "любой домен/IP"
    # или укажите конкретный IP: server_name 123.45.67.89;

    # Проксирование на Next.js (порт 3000)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Проксирование API на бэкенд (порт 3001)
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Активируйте конфигурацию:
```bash
sudo ln -s /etc/nginx/sites-available/algospec /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 4. SSL сертификат для IP адреса (опционально)

**Важно:** Certbot (Let's Encrypt) не работает с IP адресами, только с доменами.

Если вам нужен HTTPS для IP адреса, создайте самоподписанный сертификат:

```bash
# Создание директории для сертификатов
sudo mkdir -p /etc/nginx/ssl

# Создание самоподписанного сертификата
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/nginx-selfsigned.key \
  -out /etc/nginx/ssl/nginx-selfsigned.crt

# При создании сертификата укажите:
# Country Name: RU (или ваш код страны)
# State: ваш регион
# City: ваш город
# Organization: ваша организация (или любое имя)
# Common Name: ваш IP адрес (123.45.67.89)
```

Обновите конфигурацию Nginx для HTTPS:

```nginx
server {
    listen 80;
    listen 443 ssl;
    server_name _;

    ssl_certificate /etc/nginx/ssl/nginx-selfsigned.crt;
    ssl_certificate_key /etc/nginx/ssl/nginx-selfsigned.key;

    # ... остальная конфигурация ...
}
```

**Примечание:** Браузеры будут показывать предупреждение о небезопасном соединении при использовании самоподписанного сертификата. Это нормально для IP адресов.

---

## 5. Проверка работы

После настройки проверьте:

```bash
# Проверка бэкенда
curl http://123.45.67.89:3001/auth/profile

# Проверка фронтенда
curl http://123.45.67.89

# Проверка через браузер
# Откройте: http://123.45.67.89
```

---

## 6. Получение вашего IP адреса

Чтобы узнать ваш публичный IP адрес:

```bash
# На сервере
curl ifconfig.me
# или
curl ipinfo.io/ip
# или
hostname -I
```

---

## 7. Важные замечания

1. **Безопасность:**
   - HTTP не шифрует данные (пароли, токены передаются в открытом виде)
   - Для production рекомендуется использовать домен с SSL сертификатом
   - Если используете IP адрес, убедитесь, что сервер защищен файрволом

2. **Доступность:**
   - Убедитесь, что порты 80 и 443 открыты в файрволе
   - Проверьте настройки облачного провайдера (AWS, DigitalOcean и т.д.)

3. **CORS:**
   - Всегда указывайте полный URL с протоколом (http:// или https://)
   - Если используете порт, укажите его явно: `http://123.45.67.89:3000`

---

## 8. Пример полной конфигурации

**backend/.env:**
```env
PORT=3001
JWT_SECRET=your-secret-key
ALLOWED_ORIGINS=http://123.45.67.89,http://123.45.67.89:3000
NODE_ENV=production
```

**.env.local (фронтенд):**
```env
NEXT_PUBLIC_API_URL=http://123.45.67.89/api/auth
```

**Nginx конфигурация:**
```nginx
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

**Готово! Теперь ваше приложение доступно по IP адресу.** 🚀

