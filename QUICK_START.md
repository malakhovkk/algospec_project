# Быстрый старт развертывания

## 🚀 Быстрое развертывание (5 минут)

### 1. Подготовка сервера
```bash
# На сервере выполните:
chmod +x setup-server.sh
./setup-server.sh
```

### 2. Загрузка кода
```bash
cd /var/www
git clone <your-repo-url> algospec
cd algospec
```

### 3. Настройка бэкенда
```bash
cd backend
cp .env.example .env  # или создайте .env вручную
nano .env  # Заполните настройки
```

**Минимальный .env для бэкенда:**
```env
PORT=3001
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=587
SMTP_USER=your-email@yandex.ru
SMTP_PASS=your-app-password
SMTP_FROM=your-email@yandex.ru
NODE_ENV=production
```

### 4. Настройка фронтенда
```bash
cd /var/www/algospec
nano .env.local
```

**Минимальный .env.local для фронтенда:**
```env
NEXT_PUBLIC_API_URL=http://your-domain.com:3001/auth
# или если используете поддомен:
# NEXT_PUBLIC_API_URL=http://api.your-domain.com/auth
```

### 5. Развертывание
```bash
# Бэкенд
cd backend
chmod +x ../../deploy-backend.sh
../../deploy-backend.sh

# Фронтенд
cd /var/www/algospec
chmod +x deploy-frontend.sh
./deploy-frontend.sh
```

### 6. Настройка Nginx
```bash
sudo nano /etc/nginx/sites-available/algospec
# Скопируйте конфигурацию из DEPLOYMENT_GUIDE.md

sudo ln -s /etc/nginx/sites-available/algospec /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7. SSL сертификат
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 8. Готово! 🎉
Откройте `https://your-domain.com` в браузере.

---

## 📝 Обновление приложения

```bash
cd /var/www/algospec
git pull

# Обновить бэкенд
cd backend
npm install
npm run build
pm2 restart algospec-backend

# Обновить фронтенд
cd ..
npm install
npm run build
pm2 restart algospec-frontend
```

---

## 🔍 Проверка статуса

```bash
# Статус всех процессов
pm2 status

# Логи
pm2 logs

# Мониторинг
pm2 monit
```

---

## ⚠️ Частые проблемы

### Порт занят
```bash
# Найти процесс на порту
sudo lsof -i :3000
sudo lsof -i :3001

# Убить процесс
sudo kill -9 <PID>
```

### PM2 не запускается после перезагрузки
```bash
pm2 startup
# Выполните выведенную команду
pm2 save
```

### Nginx не работает
```bash
sudo nginx -t  # Проверка конфигурации
sudo systemctl status nginx  # Статус
sudo tail -f /var/log/nginx/error.log  # Логи
```

