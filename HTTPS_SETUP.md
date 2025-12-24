# Настройка HTTPS с собственным сертификатом

## 📋 Что у вас есть:

- `certificate.csr` - Certificate Signing Request (запрос на подпись)
- `certificate.key` - Приватный ключ

## ⚠️ Важно:

Для настройки HTTPS нужен **сам сертификат** (`.crt` или `.pem`), а не CSR.

**CSR** - это запрос, который отправляется в Certificate Authority (CA) для получения сертификата.

## 🔍 Проверьте, есть ли у вас сертификат:

```bash
# Проверьте файлы
ls -la *.crt *.pem *.cer 2>/dev/null
```

Если у вас есть файл `.crt`, `.pem` или `.cer` - это и есть сертификат.

## 📝 Настройка HTTPS в Nginx

### 1. Скопируйте сертификат и ключ на сервер

```bash
# Создайте директорию для сертификатов
sudo mkdir -p /etc/nginx/ssl

# Скопируйте файлы (замените на ваши пути)
sudo cp certificate.crt /etc/nginx/ssl/
sudo cp certificate.key /etc/nginx/ssl/

# Установите правильные права доступа
sudo chmod 600 /etc/nginx/ssl/certificate.key
sudo chmod 644 /etc/nginx/ssl/certificate.crt
sudo chown root:root /etc/nginx/ssl/*
```

### 2. Обновите конфигурацию Nginx

Отредактируйте `/etc/nginx/sites-available/algospec`:

```nginx
server {
    listen 80;
    listen 443 ssl;
    server_name your-domain.com www.your-domain.com;
    # или для IP адреса:
    # server_name _;

    # SSL сертификат
    ssl_certificate /etc/nginx/ssl/certificate.crt;
    ssl_certificate_key /etc/nginx/ssl/certificate.key;

    # SSL настройки
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

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

    # Редирект с HTTP на HTTPS
    if ($scheme != "https") {
        return 301 https://$host$request_uri;
    }
}
```

### 3. Проверьте конфигурацию

```bash
sudo nginx -t
```

### 4. Перезагрузите Nginx

```bash
sudo systemctl reload nginx
```

## 🔧 Если у вас только CSR и ключ

Если у вас есть только CSR, вам нужно:

1. **Отправить CSR в Certificate Authority** для получения сертификата
2. **Или создать самоподписанный сертификат** (для тестирования)

### Создание самоподписанного сертификата из существующего ключа:

```bash
# Если у вас уже есть ключ
sudo openssl x509 -req -days 365 -in certificate.csr -signkey certificate.key -out certificate.crt

# Или создайте новый самоподписанный сертификат
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/certificate.key \
  -out /etc/nginx/ssl/certificate.crt
```

При создании укажите:
- **Common Name (CN)**: ваш домен или IP адрес
- **Country, State, City**: ваши данные
- **Organization**: ваша организация

## 📝 Обновление настроек приложения

### 1. Обновите CORS в бэкенде

В `backend/.env`:
```env
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
# или для IP:
ALLOWED_ORIGINS=https://123.45.67.89
```

### 2. Обновите URL API во фронтенде

В `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://your-domain.com/api/auth
# или для IP:
NEXT_PUBLIC_API_URL=https://123.45.67.89/api/auth
```

### 3. Перезапустите приложения

```bash
# Бэкенд
cd backend
npm run build
pm2 restart algospec-backend

# Фронтенд
npm run build
pm2 restart algospec-frontend
```

## 🔍 Проверка работы HTTPS

### 1. Проверьте в браузере

Откройте: `https://your-domain.com`

**Если видите предупреждение о небезопасном сертификате:**
- Это нормально для самоподписанных сертификатов
- Нажмите "Дополнительно" → "Перейти на сайт"

### 2. Проверьте через curl

```bash
curl -k https://your-domain.com
# -k игнорирует ошибки сертификата
```

### 3. Проверьте SSL сертификат

```bash
openssl s_client -connect your-domain.com:443 -servername your-domain.com
```

## ⚠️ Важные замечания

1. **Самоподписанный сертификат:**
   - Браузеры будут показывать предупреждение
   - Подходит для тестирования и внутренних сетей
   - Для production лучше использовать сертификат от доверенного CA

2. **Сертификат от CA:**
   - Если у вас есть сертификат от Let's Encrypt или другого CA
   - Используйте его вместо самоподписанного
   - Браузеры не будут показывать предупреждения

3. **Безопасность:**
   - Храните приватный ключ в безопасности
   - Не коммитьте ключи в Git
   - Используйте правильные права доступа (600 для ключа)

## 🆘 Решение проблем

### Ошибка: "SSL certificate problem"

**Решение:**
- Проверьте, что путь к сертификату правильный
- Проверьте права доступа к файлам
- Убедитесь, что сертификат не истек

### Ошибка: "Certificate doesn't match domain"

**Решение:**
- Убедитесь, что Common Name (CN) в сертификате совпадает с доменом
- Для IP адреса используйте IP в CN

### Ошибка: "Connection refused"

**Решение:**
- Проверьте, что порт 443 открыт в файрволе:
  ```bash
  sudo ufw allow 443/tcp
  ```
- Проверьте, что Nginx слушает порт 443:
  ```bash
  sudo netstat -tulpn | grep 443
  ```

---

**Готово!** После настройки ваше приложение будет доступно по HTTPS. 🔒

