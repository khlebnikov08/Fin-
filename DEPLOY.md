# Deployment and Installation Guide for "ФинПуть"

Игра «ФинПуть» представляет собой современное одностраничное веб-приложение (SPA), разработанное на **React + TypeScript + Vite + Tailwind CSS**.

Для её работы не требуется база данных или серверный бекенд — всё сохранение прогресса, рейтинги и логика работают на клиенте в браузере игрока.

---

## Вариант 1. Самый простой способ (готовая сборка в `dist`)

Если вам нужно просто выложить сайт на хостинг:
1. Возьмите архив **`finlife-production-build.zip`** (или папку `dist/`).
2. Распакуйте все файлы из архива в корневую директорию вашего веб-сервера (например, `public_html/`, `/var/www/html/` или `www/`).
3. Игра сразу же будет работать по адресу вашего домена!

### Настройка Nginx (для Single Page Application)
```nginx
server {
    listen 80;
    server_name your-domain.ru;

    root /var/www/finlife/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Настройка Apache (`.htaccess`)
Если используете Apache, добавьте в корень файл `.htaccess`:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## Вариант 2. Развертывание через Vercel / Netlify / Cloudflare Pages

1. Загрузите репозиторий на GitHub / GitLab.
2. Подключите репозиторий в панели Vercel / Netlify.
3. Настройки сборки определятся автоматически:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Нажмите **Deploy** — проект готов за 30 секунд.

---

## Вариант 3. Запуск исходного кода на своем сервере (Node.js / Docker)

### Требования:
- Node.js 18+ или 20+
- npm или pnpm / yarn / bun

### Шаги установки:
```bash
# 1. Распакуйте архив с исходным кодом finlife-source-code.zip
cd finlife

# 2. Установите зависимости
npm install

# 3. Для запуска в режиме разработки:
npm run dev
# Откройте в браузере: http://localhost:3000

# 4. Для сборки production-версии:
npm run build
# Готовая статическая сборка появится в папке dist/
```

### Запуск через встроенный статический сервер:
```bash
npm run build
npx serve dist -p 80
```

---

## Архивы для скачивания:
- **`finlife-production-build.zip`** — готовый скомпилированный сайт (для немедленной загрузки на хостинг).
- **`finlife-source-code.zip`** — полный исходный код проекта с документацией.
