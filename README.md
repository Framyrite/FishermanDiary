# Клюнуло — Telegram mini app для рыбацких трофеев

Бесплатный MVP для себя и друзей: профиль, трофеи с фото, каталог видов рыб, ручная отметка пойманных видов, рекорды и простые друзья.

## Что уже есть

- 4 вкладки: **Профиль / Трофеи / Виды / Рекорды**
- Вход через Telegram Mini App `initData`
- Dev-режим без Telegram для локальной разработки
- Supabase Postgres schema
- Supabase Storage bucket `trophy-photos`
- Ручная отметка вида: “я ловил эту рыбу”
- Добавление трофея: фото, вид, вес, длина, дата, место, приманка, заметка
- Автоматическая отметка вида после добавления трофея
- Рекорды по максимальному весу каждого вида
- Друзья через invite-ссылку

## Стек

- Next.js App Router
- TypeScript
- Supabase: Postgres + Storage
- Vercel для хостинга
- Telegram BotFather для запуска mini app

## 1. Установка

```bash
npm install
cp .env.example .env.local
npm run dev
```

Открой:

```text
http://localhost:3000
```

Для локального запуска без Telegram в `.env.local` оставь:

```env
NEXT_PUBLIC_DEV_MODE=true
DEV_TELEGRAM_ID=777001
DEV_TELEGRAM_USERNAME=dev_fisher
DEV_TELEGRAM_FIRST_NAME=Максим
```

## 2. Supabase

1. Создай новый Supabase project.
2. Открой **SQL Editor**.
3. Выполни `supabase/schema.sql`.
4. Потом выполни `supabase/seed.sql`.
5. В Project Settings → API возьми:
   - Project URL
   - anon public key
   - service role key

В `.env.local` вставь:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

Важно: `SUPABASE_SERVICE_ROLE_KEY` нельзя публиковать. Он используется только в server API routes.

## 3. Telegram bot

1. В Telegram открой `@BotFather`.
2. `/newbot`
3. Создай бота.
4. Сохрани токен.
5. В `.env.local` вставь:

```env
TELEGRAM_BOT_TOKEN=123456:ABC...
NEXT_PUBLIC_BOT_USERNAME=your_bot_username_without_at
```

Локально Telegram mini app нормально не откроется по `localhost` из Telegram. Для реального теста нужен HTTPS-домен после деплоя на Vercel.

## 4. Vercel deploy

1. Залей проект в GitHub.
2. Импортируй репозиторий в Vercel.
3. В Vercel → Project Settings → Environment Variables добавь все переменные из `.env.example`, но:
   - `NEXT_PUBLIC_DEV_MODE=false`
   - реальные Supabase ключи
   - реальный Telegram bot token
4. Deploy.

После изменения env-переменных нужно сделать новый deploy.

## 5. Настройка кнопки mini app в Telegram

Когда Vercel даст URL вида:

```text
https://klyunulo.vercel.app
```

В BotFather:

1. Открой своего бота.
2. Bot Settings.
3. Menu Button.
4. Configure menu button.
5. Text: `Открыть дневник`
6. URL: `https://klyunulo.vercel.app`

Также можно настроить Mini App short name, чтобы invite-ссылки были красивыми:

```env
NEXT_PUBLIC_APP_SHORT_NAME=app
```

Если short name ещё не настроен, приложение всё равно работает, но invite-ссылка будет обычной web-ссылкой.

## 6. Как устроена логика

### Виды

`fish_species` — общий каталог рыб.

`user_species` — отметки конкретного пользователя:

- `caught_manual` — пользователь вручную отметил, что ловил этот вид
- `caught_trophy` — вид появился через трофей
- `caught_both` — и вручную отмечал, и трофей есть

### Трофеи

`trophies` — реальные поимки:

- вид рыбы
- фото
- вес
- длина
- дата
- место
- приманка
- заметка

Когда создаётся трофей, приложение автоматически обновляет `user_species`.

### Рекорды

Рекорды считаются по `trophies.weight_grams`.

Ручные отметки без веса не попадают в рекорды.

## 7. Что делать дальше

Ближайшие улучшения:

- удаление/редактирование трофея
- страница конкретной рыбы
- сравнение с другом
- приватные группы
- красивые карточки для шаринга
- настоящие иллюстрации рыб вместо `🐟`
- сжатие фото на клиенте перед загрузкой
- приватный bucket + signed URLs для фото

## 8. Проблемы и решения

### “Нет сессии”

Локально:

```env
NEXT_PUBLIC_DEV_MODE=true
```

На Vercel:

- mini app должен открываться через Telegram
- должен быть задан `TELEGRAM_BOT_TOKEN`

### “Supabase env variables are missing”

Проверь `.env.local` или Vercel env-переменные.

### Фото не загружается

Проверь, что выполнен `schema.sql` и создан bucket `trophy-photos`.

Фото больше 6MB сейчас отклоняются. Сожми фото или увеличь лимит в SQL и API route.
