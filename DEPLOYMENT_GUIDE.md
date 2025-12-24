# Руководство по развертыванию на VPS Ubuntu

> **💡 Если у вас IP адрес вместо домена, см. [IP_ADDRESS_SETUP.md](./IP_ADDRESS_SETUP.md)**

## 📋 Содержание
1. [Подготовка VPS](#1-подготовка-vps)
2. [Установка необходимого ПО](#2-установка-необходимого-по)
3. [Настройка базы данных](#3-настройка-базы-данных)
4. [Развертывание бэкенда](#4-развертывание-бэкенда)
5. [Развертывание фронтенда](#5-развертывание-фронтенда)
6. [Настройка Nginx](#6-настройка-nginx)
7. [Настройка SSL (HTTPS)](#7-настройка-ssl-https)
8. [Настройка PM2 для автозапуска](#8-настройка-pm2-для-автозапуска)
9. [Настройка файрвола](#9-настройка-файрвола)
10. [Проверка работы](#10-проверка-работы)

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

### 1.3 Создание пользователя (если нужно)
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

### 2.4 Установка SQLite (для базы данных)
```bash
sudo apt install -y sqlite3
```

### 2.5 Установка Git
```bash
sudo apt install -y git
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

Содержимое `.env`:
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
# Для разработки можно оставить пустым (по умолчанию добавится localhost)

# Настройки SMTP для отправки email
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=587
SMTP_USER=your-email@yandex.ru
SMTP_PASS=your-app-password
SMTP_FROM=your-email@yandex.ru

# Окружение
NODE_ENV=production
```

**Важно:** Замените `JWT_SECRET` на случайную строку:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4.4 Сборка бэкенда
```bash
cd backend
npm run build
```

### 4.5 Создание базы данных
```bash
cd backend
# База данных создастся автоматически при первом запуске
# Или создайте вручную:
sqlite3 algospec.db ".databases"
```

### 4.6 Запуск бэкенда через PM2
```bash
cd backend
pm2 start dist/main.js --name algospec-backend
pm2 save
pm2 startup
# Выполните команду, которую выведет pm2 startup
```

### 4.7 Проверка работы бэкенда
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

Содержимое `.env.local`:
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

### 6.1 Создание конфигурации для фронтенда
```bash
sudo nano /etc/nginx/sites-available/algospec
```

**Если у вас домен**, используйте эту конфигурацию:
```nginx
# Проксирование фронтенда (Next.js)
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
        
        # CORS заголовки (если нужно)
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type' always;
    }
}
```

**Или если бэкенд на отдельном поддомене:**
```nginx
# Фронтенд
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

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
}

# Бэкенд API
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
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

**Если у вас IP адрес**, используйте эту конфигурацию:
```nginx
# Проксирование фронтенда (Next.js) - для IP адреса
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

### 6.2 Активация конфигурации
```bash
sudo ln -s /etc/nginx/sites-available/algospec /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 7. Настройка SSL (HTTPS)

**Важно для IP адресов:**
- Certbot (Let's Encrypt) **не работает с IP адресами**, только с доменами
- Для IP адреса можно:
  - Использовать HTTP (без SSL) - подходит для внутренних сетей
  - Использовать самоподписанный SSL сертификат (браузер будет показывать предупреждение)
  - Пропустить этот шаг, если используете только HTTP

### 7.1 Установка Certbot (только для доменов)
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 7.2 Получение SSL сертификата (только для доменов)
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

**Для IP адреса:** Если вам нужен HTTPS для IP адреса, создайте самоподписанный сертификат:
```bash
# Создание самоподписанного сертификата
sudo mkdir -p /etc/nginx/ssl
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/nginx-selfsigned.key \
  -out /etc/nginx/ssl/nginx-selfsigned.crt

# Обновите конфигурацию Nginx для использования HTTPS
# Добавьте в server блок:
# listen 443 ssl;
# ssl_certificate /etc/nginx/ssl/nginx-selfsigned.crt;
# ssl_certificate_key /etc/nginx/ssl/nginx-selfsigned.key;
```

**Примечание:** Браузеры будут показывать предупреждение о небезопасном соединении при использовании самоподписанного сертификата. Это нормально для IP адресов.

### 7.3 Автоматическое обновление сертификата (только для доменов)
```bash
sudo certbot renew --dry-run
```

Certbot автоматически настроит обновление сертификатов (только для доменов).

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

## 10. Проверка работы

### 10.1 Проверка бэкенда
```bash
# Локально на сервере
curl http://localhost:3001/auth/profile

# Извне (если порт открыт)
curl http://your-server-ip:3001/auth/profile
```

### 10.2 Проверка фронтенда
```bash
# Локально на сервере
curl http://localhost:3000

# Извне
curl http://your-domain.com
```

### 10.3 Проверка через браузер
Откройте в браузере:
- `http://your-domain.com` - фронтенд
- `https://your-domain.com` - фронтенд с HTTPS

---

## 🔧 Дополнительные настройки

### Обновление переменных окружения
После изменения `.env` файлов:
```bash
# Бэкенд
cd /var/www/algospec/backend
pm2 restart algospec-backend

# Фронтенд
cd /var/www/algospec
pm2 restart algospec-frontend
```

### Обновление кода
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

### Мониторинг
```bash
# Просмотр использования ресурсов
pm2 monit

# Просмотр логов в реальном времени
pm2 logs --lines 100
```

### Резервное копирование базы данных
```bash
# Создание бэкапа
cp /var/www/algospec/backend/algospec.db /var/backups/algospec-$(date +%Y%m%d).db

# Автоматическое резервное копирование (добавьте в crontab)
crontab -e
# Добавьте строку:
0 2 * * * cp /var/www/algospec/backend/algospec.db /var/backups/algospec-$(date +\%Y\%m\%d).db
```

---

## ⚠️ Важные замечания

1. **Безопасность:**
   - Никогда не коммитьте `.env` файлы в Git
   - Используйте сильные пароли для JWT_SECRET
   - Регулярно обновляйте систему и зависимости
   - Настройте регулярные бэкапы

2. **Производительность:**
   - Используйте PM2 кластер режим для продакшена:
     ```bash
     pm2 start dist/main.js -i max --name algospec-backend
     ```

3. **Логирование:**
   - Логи PM2 находятся в `~/.pm2/logs/`
   - Логи Nginx в `/var/log/nginx/`

4. **Мониторинг:**
   - Рассмотрите использование мониторинга (например, PM2 Plus или собственные решения)

---

## 🆘 Решение проблем

### Бэкенд не запускается
```bash
# Проверьте логи
pm2 logs algospec-backend

# Проверьте, что порт свободен
sudo netstat -tulpn | grep 3001

# Проверьте .env файл
cat backend/.env
```

### Фронтенд не запускается
```bash
# Проверьте логи
pm2 logs algospec-frontend

# Проверьте, что порт свободен
sudo netstat -tulpn | grep 3000

# Проверьте .env.local файл
cat .env.local
```

### Nginx не работает
```bash
# Проверьте конфигурацию
sudo nginx -t

# Проверьте логи
sudo tail -f /var/log/nginx/error.log

# Перезапустите Nginx
sudo systemctl restart nginx
```

### Проблемы с базой данных
```bash
# Проверьте права доступа
ls -la /var/www/algospec/backend/algospec.db

# Проверьте базу данных
sqlite3 /var/www/algospec/backend/algospec.db ".tables"
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
- [ ] SSL сертификат установлен
- [ ] Файрвол настроен
- [ ] PM2 автозапуск настроен
- [ ] Резервное копирование настроено
- [ ] Домен настроен и указывает на сервер
- [ ] Приложение работает через браузер

---

## 🔗 Полезные ссылки

- [PM2 документация](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx документация](https://nginx.org/en/docs/)
- [Certbot документация](https://certbot.eff.org/)
- [Next.js deployment](https://nextjs.org/docs/deployment)

---

**Удачи с развертыванием! 🚀**

