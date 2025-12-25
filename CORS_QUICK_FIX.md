# Быстрое решение ошибки CORS

## 🔍 Шаг 1: Проверьте логи бэкенда

```bash
pm2 logs algospec-backend --lines 50
```

Ищите строки вида:
```
[CORS] Request from origin: https://your-domain.com
[CORS] Allowed origins: http://your-domain.com
[CORS] ❌ Origin https://your-domain.com is NOT allowed
```

## ✅ Шаг 2: Обновите ALLOWED_ORIGINS

### Если используете HTTPS:

В `backend/.env`:
```env
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
# или для IP:
ALLOWED_ORIGINS=https://123.45.67.89
```

### Если используете HTTP:

В `backend/.env`:
```env
ALLOWED_ORIGINS=http://your-domain.com,http://www.your-domain.com
# или для IP:
ALLOWED_ORIGINS=http://123.45.67.89,http://123.45.67.89:3000
```

## 🔧 Шаг 3: Перезапустите бэкенд

```bash
cd backend
npm run build
pm2 restart algospec-backend
```

## 📝 Шаг 4: Проверьте точное совпадение

**Важно:** Origin должен точно совпадать, включая:
- ✅ Протокол (`http://` или `https://`)
- ✅ Домен/IP адрес
- ✅ Порт (если указан)

**Примеры:**

Если фронтенд на `https://example.com`:
```env
ALLOWED_ORIGINS=https://example.com
```

Если фронтенд на `https://example.com:3000`:
```env
ALLOWED_ORIGINS=https://example.com:3000
```

Если используете Nginx и фронтенд на `https://example.com` (порт 443):
```env
ALLOWED_ORIGINS=https://example.com
```

## 🆘 Частые ошибки:

### Ошибка 1: HTTP vs HTTPS
- Фронтенд: `https://example.com`
- ALLOWED_ORIGINS: `http://example.com` ❌

**Решение:** Используйте `https://` в ALLOWED_ORIGINS

### Ошибка 2: Порт не указан
- Фронтенд: `https://example.com:3000`
- ALLOWED_ORIGINS: `https://example.com` ❌

**Решение:** Укажите порт: `https://example.com:3000`

### Ошибка 3: Пробелы после запятой
```env
ALLOWED_ORIGINS=https://example.com, https://www.example.com  # ❌ пробелы
```

**Решение:**
```env
ALLOWED_ORIGINS=https://example.com,https://www.example.com  # ✅ без пробелов
```

## 🔍 Проверка в браузере:

1. Откройте консоль (F12)
2. Перейдите на вкладку Network
3. Найдите запрос к API
4. Посмотрите на заголовок `Origin` в запросе
5. Убедитесь, что этот origin точно указан в ALLOWED_ORIGINS

## 💡 Быстрая проверка:

После обновления `.env` и перезапуска, проверьте логи:

```bash
pm2 logs algospec-backend | grep CORS
```

Должны увидеть:
```
[CORS] Request from origin: https://your-domain.com
[CORS] Allowed origins: https://your-domain.com
[CORS] Origin https://your-domain.com is allowed
```

---

**Если проблема сохраняется:** Пришлите вывод из логов бэкенда с сообщениями [CORS].

