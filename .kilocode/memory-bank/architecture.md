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

### 1. Client (Tauri + Svelte)
-   **Core**: Tauri (Rust) для системных взаимодействий (хоткеи, трей, аудио).
-   **UI**: SvelteKit (SPA) для интерфейса.
-   **Функции**:
    -   Захват аудио (Web Audio API / Native).
    -   Глобальные хоткеи (Windows Hooks).
    -   Эмуляция ввода текста (SendInput).
    -   Локальное хранилище (SQLite + SQLCipher).
    -   Синхронизация с сервером.

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