# 🚀 Полное руководство по деплою на VPS

> **Вся информация о развертывании проекта AlgoSpec на VPS сервере**

---

## 📋 Содержание

1. [Быстрый старт](#-быстрый-старт-5-минут)
2. [Подготовка VPS](#1-подготовка-vps)
3. [Установка ПО](#2-установка-необходимого-по)
4. [Настройка базы данных](#3-настройка-базы-данных)
5. [Развертывание бэкенда](#4-развертывание-бэкенда)
6. [Развертывание фронтенда](#5-развертывание-фронтенда)
7. [Настройка Nginx](#6-настройка-nginx)
8. [Настройка SSL/HTTPS](#7-настройка-ssl-https)
9. [Настройка PM2](#8-настройка-pm2-для-автозапуска)
10. [Настройка файрвола](#9-настройка-файрвола)
11. [Настройка Email (SMTP)](#10-настройка-email-smtp)
12. [Работа с IP адресом](#11-работа-с-ip-адресом)
13. [Решение проблем](#12-решение-проблем)
14. [Обновление приложения](#13-обновление-приложения)

---

## ⚡ Быстрый старт (5 минут)

### Автоматическая настройка сервера

```bash
# 1. Подключитесь к серверу
ssh root@your-server-ip

# 2. Запустите скрипт настройки
chmod +x setup-server.sh
./setup-server.sh

# 3. Загрузите код
cd /var/www
git clone <your-repo-url> algospec
cd algospec

# 4. Настройте переменные окружения (см. разделы ниже)

# 5. Разверните приложение
chmod +x deploy-backend.sh deploy-frontend.sh
cd backend && ../../deploy-backend.sh
cd .. && ./deploy-frontend.sh

# 6. Настройте Nginx (см. раздел 6)
# 7. Настройте SSL (см. раздел 7)
```

---

## 1. Подготовка VPS

### 1.1 Подключение к серверу

```bash
ssh root@your-server-ip
# или
ssh username@your-server-ip
```

### 1.2 Обновление системы

```bash
sudo apt update
sudo apt upgrade -y
```

### 1.3 Создание пользователя (опционально)

```bash
adduser deploy
usermod -aG sudo deploy
su - deploy
```

---

## 2. Установка необходимого ПО

### 2.1 Установка Node.js (версия 18 или выше)

```bash
# Установка через NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Проверка версии
node --version
npm --version
```

### 2.2 Установка PM2 (менеджер процессов)

```bash
sudo npm install -g pm2
```

### 2.3 Установка Nginx

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 2.4 Установка SQLite

```bash
sudo apt install -y sqlite3
```

### 2.5 Установка Git

```bash
sudo apt install -y git
```

### 2.6 Установка Certbot (для SSL)

```bash
sudo apt install -y certbot python3-certbot-nginx
```

---

## 3. Настройка базы данных

### 3.1 Создание директории для базы данных

```bash
sudo mkdir -p /var/lib/algospec
sudo chown $USER:$USER /var/lib/algospec
```

---

## 4. Развертывание бэкенда

### 4.1 Клонирование репозитория

```bash
cd /var/www
sudo mkdir -p algospec
sudo chown $USER:$USER algospec
cd algospec
git clone <your-repo-url> .
# или загрузите файлы через scp/sftp
```

### 4.2 Установка зависимостей бэкенда

```bash
cd backend
npm install
```

### 4.3 Создание файла .env для бэкенда

```bash
cd backend
nano .env
```

**Содержимое `.env`:**

```env
# Порт бэкенда
PORT=3001

# JWT Secret (сгенерируйте случайную строку)
JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-string

# Разрешенные CORS origins (через запятую, без пробелов)
# Для production укажите ваш домен или IP адрес:
# С доменом:
# ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
# С IP адресом (HTTP):
# ALLOWED_ORIGINS=http://123.45.67.89,http://123.45.67.89:3000
# С IP адресом (HTTPS, если настроен SSL):
# ALLOWED_ORIGINS=https://123.45.67.89,https://123.45.67.89:3000

# Настройки SMTP для отправки email
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=587
SMTP_USER=your-email@yandex.ru
SMTP_PASS=your-app-password
SMTP_FROM=your-email@yandex.ru

# Окружение
NODE_ENV=production
```

**Генерация JWT_SECRET:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4.4 Сборка бэкенда

```bash
cd backend
npm run build
```

### 4.5 Запуск бэкенда через PM2

```bash
cd backend
pm2 start dist/main.js --name algospec-backend
pm2 save
pm2 startup
# Выполните команду, которую выведет pm2 startup
```

### 4.6 Проверка работы бэкенда

```bash
pm2 status
pm2 logs algospec-backend
```

---

## 5. Развертывание фронтенда

### 5.1 Установка зависимостей фронтенда

```bash
cd /var/www/algospec
npm install
```

### 5.2 Создание файла .env.local для фронтенда

```bash
nano .env.local
```

**Содержимое `.env.local`:**

```env
# URL бэкенда (замените на ваш домен или IP)
# С доменом:
# NEXT_PUBLIC_API_URL=http://your-domain.com:3001/auth
# С IP адресом:
# NEXT_PUBLIC_API_URL=http://123.45.67.89:3001/auth
# Или если используете Nginx проксирование:
# NEXT_PUBLIC_API_URL=http://your-domain.com/api/auth
# NEXT_PUBLIC_API_URL=http://123.45.67.89/api/auth
```

### 5.3 Сборка фронтенда

```bash
npm run build
```

### 5.4 Запуск фронтенда через PM2

```bash
pm2 start npm --name algospec-frontend -- start
pm2 save
```

**Или используйте встроенный Next.js сервер:**

```bash
pm2 start "npm run start" --name algospec-frontend
pm2 save
```

### 5.5 Проверка работы фронтенда

```bash
pm2 status
pm2 logs algospec-frontend
```

---

## 6. Настройка Nginx

### 6.1 Создание конфигурации

Используйте готовый файл `nginx.conf` из корня проекта или создайте вручную:

```bash
sudo nano /etc/nginx/sites-available/algospec
```

### 6.2 Конфигурация для домена

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

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
        
        # CORS заголовки
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS, PATCH' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, X-Requested-With' always;
    }
}
```

### 6.3 Конфигурация для IP адреса

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

### 6.4 Активация конфигурации

```bash
sudo ln -s /etc/nginx/sites-available/algospec /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 7. Настройка SSL/HTTPS

### 7.1 Для домена (Let's Encrypt)

```bash
# Получение SSL сертификата
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Автоматическое обновление
sudo certbot renew --dry-run
```

Certbot автоматически настроит HTTPS и редирект с HTTP на HTTPS.

### 7.2 Для IP адреса (самоподписанный сертификат)

**Важно:** Certbot не работает с IP адресами, только с доменами.

```bash
# Создание директории для сертификатов
sudo mkdir -p /etc/nginx/ssl

# Создание самоподписанного сертификата
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/certificate.key \
  -out /etc/nginx/ssl/certificate.crt

# Установка прав доступа
sudo chmod 600 /etc/nginx/ssl/certificate.key
sudo chmod 644 /etc/nginx/ssl/certificate.crt
```

**Обновите конфигурацию Nginx:**

```nginx
server {
    listen 80;
    listen 443 ssl;
    server_name _;

    ssl_certificate /etc/nginx/ssl/certificate.crt;
    ssl_certificate_key /etc/nginx/ssl/certificate.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Редирект с HTTP на HTTPS
    if ($scheme != "https") {
        return 301 https://$host$request_uri;
    }

    # ... остальная конфигурация ...
}
```

**Примечание:** Браузеры будут показывать предупреждение о небезопасном соединении при использовании самоподписанного сертификата.

### 7.3 Использование существующего сертификата

Если у вас есть сертификат и ключ:

```bash
# Скопируйте файлы
sudo cp certificate.crt /etc/nginx/ssl/
sudo cp certificate.key /etc/nginx/ssl/

# Установите права доступа
sudo chmod 600 /etc/nginx/ssl/certificate.key
sudo chmod 644 /etc/nginx/ssl/certificate.crt
```

---

## 8. Настройка PM2 для автозапуска

### 8.1 Сохранение текущей конфигурации PM2

```bash
pm2 save
```

### 8.2 Настройка автозапуска при перезагрузке

```bash
pm2 startup
# Выполните команду, которую выведет pm2 startup
```

### 8.3 Полезные команды PM2

```bash
# Просмотр статуса
pm2 status

# Просмотр логов
pm2 logs

# Перезапуск приложения
pm2 restart algospec-backend
pm2 restart algospec-frontend

# Остановка приложения
pm2 stop algospec-backend

# Удаление из PM2
pm2 delete algospec-backend

# Мониторинг
pm2 monit
```

---

## 9. Настройка файрвола

### 9.1 Настройка UFW (Uncomplicated Firewall)

```bash
# Разрешить SSH
sudo ufw allow 22/tcp

# Разрешить HTTP
sudo ufw allow 80/tcp

# Разрешить HTTPS
sudo ufw allow 443/tcp

# Включить файрвол
sudo ufw enable

# Проверка статуса
sudo ufw status
```

---

## 10. Настройка Email (SMTP)

### 10.1 Настройка SMTP для отправки email верификации

#### Вариант 1: Yandex (рекомендуется)

1. Включите двухфакторную аутентификацию в Яндекс аккаунте
2. Создайте пароль приложения: https://id.yandex.ru/security/app-passwords
3. Обновите `backend/.env`:

```env
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=465
SMTP_USER=your-email@yandex.ru
SMTP_PASS=your-app-password
SMTP_FROM=your-email@yandex.ru
```

**Важно для Yandex:**
- Используйте полный email адрес в `SMTP_USER`
- Пароль приложения создается в настройках безопасности Яндекс ID
- Порт 465 (SSL) или 587 (STARTTLS) - оба работают

#### Вариант 2: Gmail

1. Включите двухфакторную аутентификацию в Google аккаунте
2. Создайте пароль приложения: https://myaccount.google.com/apppasswords
3. Обновите `backend/.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@algospec.com
```

#### Вариант 3: Mailtrap (для тестирования)

1. Зарегистрируйтесь на https://mailtrap.io
2. Создайте inbox
3. Скопируйте настройки SMTP
4. Обновите `backend/.env`:

```env
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-mailtrap-username
SMTP_PASS=your-mailtrap-password
SMTP_FROM=noreply@algospec.com
```

### 10.2 Режим разработки (без реальной отправки)

В режиме разработки код будет выводиться в консоль сервера:

```env
NODE_ENV=development
```

Код будет показан в консоли бэкенда при регистрации.

### 10.3 Проверка работы SMTP

```bash
# Проверка доступности SMTP сервера
telnet smtp.yandex.ru 465
# или
nc -zv smtp.yandex.ru 465

# Проверка логов бэкенда
pm2 logs algospec-backend | grep -i "smtp\|email"
```

---

## 11. Работа с IP адресом

### 11.1 Настройка CORS в бэкенде

В файле `backend/.env` укажите ваш IP адрес:

```env
# С HTTP (без SSL)
ALLOWED_ORIGINS=http://123.45.67.89,http://123.45.67.89:3000

# С HTTPS (если настроили самоподписанный сертификат)
# ALLOWED_ORIGINS=https://123.45.67.89,https://123.45.67.89:3000
```

**Важно:** Замените `123.45.67.89` на ваш реальный IP адрес.

### 11.2 Настройка фронтенда

В файле `.env.local` укажите URL бэкенда:

```env
# Прямое подключение к бэкенду
NEXT_PUBLIC_API_URL=http://123.45.67.89:3001/auth

# Или через Nginx проксирование
# NEXT_PUBLIC_API_URL=http://123.45.67.89/api/auth
```

### 11.3 Получение вашего IP адреса

```bash
# На сервере
curl ifconfig.me
# или
curl ipinfo.io/ip
# или
hostname -I
```

---

## 12. Решение проблем

### 12.1 Бэкенд не запускается

```bash
# Проверьте логи
pm2 logs algospec-backend

# Проверьте, что порт свободен
sudo netstat -tulpn | grep 3001

# Проверьте .env файл
cat backend/.env
```

### 12.2 Фронтенд не запускается

```bash
# Проверьте логи
pm2 logs algospec-frontend

# Проверьте, что порт свободен
sudo netstat -tulpn | grep 3000

# Проверьте .env.local файл
cat .env.local
```

### 12.3 Nginx не работает

```bash
# Проверьте конфигурацию
sudo nginx -t

# Проверьте логи
sudo tail -f /var/log/nginx/error.log

# Перезапустите Nginx
sudo systemctl restart nginx
```

### 12.4 Проблемы с CORS

**Диагностика:**

```bash
# Проверьте логи бэкенда
pm2 logs algospec-backend | grep -i cors

# Проверьте переменную окружения
cat backend/.env | grep ALLOWED_ORIGINS
```

**Важно:** Origin должен точно совпадать, включая:
- Протокол (http:// или https://)
- Домен/IP адрес
- Порт (если указан)

**Правильный формат:**

```env
# Без пробелов после запятой
ALLOWED_ORIGINS=http://123.45.67.89,http://123.45.67.89:3000
```

**После изменений:**

```bash
pm2 restart algospec-backend
pm2 logs algospec-backend --lines 50
```

### 12.5 Проблемы с SMTP (ETIMEDOUT)

**Диагностика:**

```bash
# Проверьте доступность SMTP сервера
telnet smtp.yandex.ru 465
# или
nc -zv smtp.yandex.ru 465

# Проверьте DNS
nslookup smtp.yandex.ru
```

**Решения:**

1. Попробуйте другой порт (465 или 587)
2. Проверьте файрвол
3. Используйте альтернативный SMTP сервис
4. Проверьте логи бэкенда - код всегда выводится в консоль

**Проверка логов:**

```bash
pm2 logs algospec-backend | grep "КОД ВЕРИФИКАЦИИ"
```

### 12.6 Проблемы с базой данных

```bash
# Проверьте права доступа
ls -la /var/www/algospec/backend/algospec.db

# Проверьте базу данных
sqlite3 /var/www/algospec/backend/algospec.db ".tables"
```

### 12.7 Порт занят

```bash
# Найти процесс на порту
sudo lsof -i :3000
sudo lsof -i :3001

# Убить процесс
sudo kill -9 <PID>
```

---

## 13. Обновление приложения

### 13.1 Обновление кода

```bash
cd /var/www/algospec
git pull

# Бэкенд
cd backend
npm install
npm run build
pm2 restart algospec-backend

# Фронтенд
cd ..
npm install
npm run build
pm2 restart algospec-frontend
```

### 13.2 Обновление переменных окружения

После изменения `.env` файлов:

```bash
# Бэкенд
cd /var/www/algospec/backend
pm2 restart algospec-backend

# Фронтенд
cd /var/www/algospec
pm2 restart algospec-frontend
```

### 13.3 Мониторинг

```bash
# Просмотр использования ресурсов
pm2 monit

# Просмотр логов в реальном времени
pm2 logs --lines 100
```

### 13.4 Резервное копирование базы данных

```bash
# Создание бэкапа
cp /var/www/algospec/backend/algospec.db /var/backups/algospec-$(date +%Y%m%d).db

# Автоматическое резервное копирование (добавьте в crontab)
crontab -e
# Добавьте строку:
0 2 * * * cp /var/www/algospec/backend/algospec.db /var/backups/algospec-$(date +\%Y\%m\%d).db
```

---

## 📝 Чеклист развертывания

- [ ] VPS настроен и обновлен
- [ ] Node.js установлен
- [ ] PM2 установлен
- [ ] Nginx установлен и настроен
- [ ] Бэкенд развернут и запущен
- [ ] Фронтенд развернут и запущен
- [ ] .env файлы настроены
- [ ] SSL сертификат установлен (если нужен)
- [ ] Файрвол настроен
- [ ] PM2 автозапуск настроен
- [ ] SMTP настроен
- [ ] Резервное копирование настроено
- [ ] Домен настроен и указывает на сервер (или IP доступен)
- [ ] Приложение работает через браузер

---

## 🔧 Дополнительные настройки

### Производительность

Используйте PM2 кластер режим для продакшена:

```bash
pm2 start dist/main.js -i max --name algospec-backend
```

### Логирование

- Логи PM2 находятся в `~/.pm2/logs/`
- Логи Nginx в `/var/log/nginx/`

### Безопасность

1. **Никогда не коммитьте `.env` файлы в Git**
2. **Используйте сильные пароли для JWT_SECRET**
3. **Регулярно обновляйте систему и зависимости**
4. **Настройте регулярные бэкапы**

---

## 🆘 Полезные команды

### Проверка работы

```bash
# Проверка бэкенда
curl http://localhost:3001/auth/profile

# Проверка фронтенда
curl http://localhost:3000

# Проверка через браузер
# http://your-domain.com или http://your-ip
```

### Полезные ссылки

- [PM2 документация](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx документация](https://nginx.org/en/docs/)
- [Certbot документация](https://certbot.eff.org/)
- [Next.js deployment](https://nextjs.org/docs/deployment)

---

## 📚 Дополнительные документы

В проекте есть дополнительные документы:

- `DEPLOYMENT_GUIDE.md` - Подробное руководство по развертыванию
- `HTTPS_SETUP.md` - Настройка HTTPS с собственным сертификатом
- `IP_ADDRESS_SETUP.md` - Настройка для работы с IP адресом
- `EMAIL_VERIFICATION_SETUP.md` - Настройка верификации email
- `CORS_TROUBLESHOOTING.md` - Решение проблем с CORS
- `SMTP_TROUBLESHOOTING.md` - Решение проблем с SMTP
- `QUICK_START.md` - Быстрый старт
- `nginx.conf` - Готовая конфигурация Nginx

---

**Удачи с развертыванием! 🚀**

