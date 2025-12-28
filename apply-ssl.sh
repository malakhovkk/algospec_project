#!/bin/bash

# Скрипт для применения SSL сертификата на сервер

set -e

echo "🔒 Применение SSL сертификата на сервер"
echo ""

# Проверка, что скрипт запущен от root или с sudo
if [ "$EUID" -ne 0 ]; then 
    echo "⚠️  Запустите скрипт с sudo: sudo ./apply-ssl.sh"
    exit 1
fi

# Создание директории для сертификатов
echo "📁 Создание директории для сертификатов..."
mkdir -p /etc/nginx/ssl

# Проверка наличия сертификата и ключа
if [ ! -f "certificate.crt" ] || [ ! -f "certificate.key" ]; then
    echo "⚠️  Файлы certificate.crt и/или certificate.key не найдены в текущей директории"
    echo ""
    echo "Выберите вариант:"
    echo "1) Использовать Let's Encrypt (Certbot) - для доменов"
    echo "2) Создать самоподписанный сертификат - для тестирования/IP адресов"
    echo "3) Выход"
    read -p "Ваш выбор (1-3): " choice
    
    case $choice in
        1)
            echo ""
            echo "📦 Установка Certbot..."
            apt update
            apt install -y certbot python3-certbot-nginx
            
            read -p "Введите ваш домен (например: example.com): " domain
            read -p "Введите www домен (например: www.example.com) или нажмите Enter: " www_domain
            
            if [ -z "$www_domain" ]; then
                certbot --nginx -d "$domain"
            else
                certbot --nginx -d "$domain" -d "$www_domain"
            fi
            
            echo "✅ Certbot настроил SSL автоматически!"
            echo "🔍 Проверка автообновления..."
            certbot renew --dry-run
            exit 0
            ;;
        2)
            echo ""
            echo "🔧 Создание самоподписанного сертификата..."
            read -p "Введите Common Name (CN) - домен или IP адрес: " cn
            
            openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
              -keyout /etc/nginx/ssl/certificate.key \
              -out /etc/nginx/ssl/certificate.crt \
              -subj "/CN=$cn"
            
            echo "✅ Самоподписанный сертификат создан!"
            ;;
        3)
            echo "Выход..."
            exit 0
            ;;
        *)
            echo "Неверный выбор. Выход..."
            exit 1
            ;;
    esac
else
    echo "📋 Копирование сертификата и ключа..."
    cp certificate.crt /etc/nginx/ssl/
    cp certificate.key /etc/nginx/ssl/
    echo "✅ Файлы скопированы"
fi

# Установка прав доступа
echo "🔐 Установка прав доступа..."
chmod 600 /etc/nginx/ssl/certificate.key
chmod 644 /etc/nginx/ssl/certificate.crt
chown root:root /etc/nginx/ssl/*

echo "✅ Права доступа установлены"
echo ""

# Проверка конфигурации Nginx
echo "🔍 Проверка конфигурации Nginx..."
if [ -f "/etc/nginx/sites-available/algospec" ]; then
    echo "✅ Конфигурация найдена: /etc/nginx/sites-available/algospec"
    echo ""
    echo "⚠️  ВАЖНО: Обновите конфигурацию Nginx вручную:"
    echo "   1. Откройте: sudo nano /etc/nginx/sites-available/algospec"
    echo "   2. Добавьте SSL настройки (см. APPLY_SSL_CERTIFICATE.md)"
    echo "   3. Проверьте: sudo nginx -t"
    echo "   4. Перезагрузите: sudo systemctl reload nginx"
else
    echo "⚠️  Конфигурация Nginx не найдена"
    echo "   Создайте конфигурацию в /etc/nginx/sites-available/algospec"
fi

echo ""
echo "📝 Следующие шаги:"
echo "   1. Обновите конфигурацию Nginx (добавьте SSL настройки)"
echo "   2. Откройте порт 443: sudo ufw allow 443/tcp"
echo "   3. Обновите переменные окружения (HTTPS URLs)"
echo "   4. Перезапустите приложения"
echo ""
echo "📚 Подробная инструкция: см. APPLY_SSL_CERTIFICATE.md"
echo ""
echo "✅ Готово!"

