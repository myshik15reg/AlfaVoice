# Architecture: AlfaVoice

## Общая схема
Клиент-серверная архитектура с поддержкой офлайн-режима.

```mermaid
graph TD
    Client[Tauri Client] <-->|WebSocket| Server[Rust Server]
    Client -->|Local DB| SQLite[SQLite (Encrypted)]
    Server -->|Whisper/LLM| Models[AI Models]
    Server -->|Storage| PG[PostgreSQL]
    Server -->|Metrics| Prom[Prometheus]
```

## Компоненты

### 1. Client (Tauri v2 + SvelteKit)
-   **Core**: Tauri v2 (Rust) для системных взаимодействий (хоткеи, трей, аудио, window controls).
-   **UI**: SvelteKit (SPA) для интерфейса.
-   **State Management**: Svelte stores (readable/writable) для реактивного состояния.
    -   `userStore`: Пользовательские данные (readable, статические из db.ts)
    -   `activitiesStore`: История активности (writable)
    -   `newsStore`: Новости и уведомления (writable)
    -   `snippetsStore`: Сниппеты кода с CRUD операциями (writable)
    -   `notesStore`: Заметки с CRUD операциями (writable)
    -   `dictionaryStore`: Словарь терминов с CRUD операциями (writable)
    -   `settingsStore`: Настройки приложения (writable, persist в localStorage)
    -   `audioStore`: Состояние записи аудио (writable)
    -   `darkModeStore`: Темная/светлая тема (writable)
    -   `isSidebarCollapsedStore`: Состояние сайдбара (writable)
-   **Функции**:
    -   Захват аудио (Web Audio API / Native).
    -   Глобальные хоткеи (Tauri plugin-global-shortcut, Ctrl + Win).
    -   Window controls (minimize/maximize/close через Tauri API).
    -   Эмуляция ввода текста (SendInput).
    -   Локальное хранилище (localStorage для настроек, SQLite + SQLCipher для данных).
    -   Синхронизация с сервером (mockServer API с 80% success rate).

### 2. Server (Rust)
-   **Framework**: Axum (HTTP/WebSocket).
-   **AI Engine**:
    -   `whisper.cpp` (bindings) для транскрипции.
    -   `rust-bert` (Libtorch) для NLP (ruBERT, ruGPT-3).
    -   Оптимизация: CUDA (NVIDIA GPU), AVX-512 (CPU fallback).
-   **Database**: PostgreSQL (пользователи, история, настройки).
-   **Queue**: Внутренняя очередь задач на транскрипцию.

### 3. Infrastructure
-   **Балансировка**: Nginx.
-   **Мониторинг**: Prometheus + Grafana.
-   **Deployment**: Docker (опционально), Native binary.

## Потоки данных
1.  **Online**: Клиент -> Stream Audio -> Server -> Whisper -> ruBERT (Post-processing) -> Text -> Client -> Active Window.
2.  **Offline**: Клиент -> Save Audio (Local DB) -> Wait Connection -> Sync -> Server -> ... -> Client History.

## Безопасность
-   **Транспорт**: TLS 1.3 (WSS).
-   **Auth**: JWT (Access + Refresh).
-   **Storage**: Шифрование локальной БД и чувствительных данных на сервере.