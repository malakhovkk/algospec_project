#!/bin/bash

# Скрипт для первоначальной настройки сервера Ubuntu

set -e

echo "🔧 Начало настройки сервера..."

# Обновление системы
echo "📦 Обновление системы..."
sudo apt update
sudo apt upgrade -y

# Установка Node.js
echo "📦 Установка Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Установка PM2
echo "📦 Установка PM2..."
sudo npm install -g pm2

# Установка Nginx
echo "📦 Установка Nginx..."
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Установка SQLite
echo "📦 Установка SQLite..."
sudo apt install -y sqlite3

# Установка Git
echo "📦 Установка Git..."
sudo apt install -y git

# Установка Certbot
echo "📦 Установка Certbot..."
sudo apt install -y certbot python3-certbot-nginx

# Настройка файрвола
echo "🔥 Настройка файрвола..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Создание директорий
echo "📁 Создание директорий..."
sudo mkdir -p /var/www/algospec
sudo mkdir -p /var/backups

# Настройка прав доступа
sudo chown -R $USER:$USER /var/www/algospec

echo "✅ Сервер успешно настроен!"
echo ""
echo "📋 Следующие шаги:"
echo "1. Загрузите код в /var/www/algospec"
echo "2. Создайте .env файлы для бэкенда и фронтенда"
echo "3. Запустите deploy-backend.sh"
echo "4. Запустите deploy-frontend.sh"
echo "5. Настройте Nginx конфигурацию"
echo "6. Получите SSL сертификат через certbot"

