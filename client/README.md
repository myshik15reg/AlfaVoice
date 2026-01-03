# AlfaVoice Client

Клиентское приложение AlfaVoice на базе SvelteKit + Tauri.

## Структура проекта

```
client/
├── src/
│   ├── app.html              # Точка входа HTML
│   ├── app.d.ts              # TypeScript типы
│   ├── lib/
│   │   ├── audio.ts          # Модуль захвата аудио
│   │   └── socket.ts        # Модуль WebSocket
│   └── routes/
│       ├── +layout.svelte    # Глобальный лейаут
│       └── +page.svelte      # Главная страница
├── src-tauri/                # Tauri backend
│   ├── src/
│   │   ├── main.rs          # Точка входа
│   │   ├── lib.rs           # Библиотечный модуль
│   │   ├── hotkey.rs        # Модуль горячих клавиш
│   │   └── audio.rs         # Модуль аудио устройств
│   ├── Cargo.toml           # Rust зависимости
│   └── tauri.conf.json      # Конфигурация Tauri
└── package.json             # Node.js зависимости
```

## Установка

```bash
npm install
```

## Запуск в режиме разработки

```bash
npm run dev
```

## Сборка приложения

```bash
npm run build
```

## Запуск Tauri приложения

```bash
npm run tauri:dev
```

## Сборка Tauri приложения

```bash
npm run tauri:build
```

## Переменные окружения

Создайте файл `.env` в корне проекта:

```env
VITE_WS_URL=ws://localhost:8080/ws
VITE_API_URL=http://localhost:8080
NODE_ENV=development
```

## Возможности

- 🎤 Запись аудио с микрофона
- 📊 Визуализация уровня громкости
- 🔌 WebSocket соединение с сервером
- ⌨️ Глобальные горячие клавиши (Ctrl+Win)
- 🌙 Темная/светлая тема
- 📝 Отображение транскрипции в реальном времени
