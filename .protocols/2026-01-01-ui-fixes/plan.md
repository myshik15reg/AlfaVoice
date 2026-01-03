# Plan: UI Fixes & Dynamic Stats

## Phase 1: WebSocket Store & Status Fix
- [ ] 1. Создать `client/src/lib/stores/socketStore.ts`.
    - Обернуть `SocketManager` в Svelte store.
    - Экспортировать stores: `isConnected`, `transcription`, `lastError`.
- [ ] 2. Рефакторинг `client/src/routes/+page.svelte`.
    - Удалить локальную реализацию WebSocket.
    - Подключить `socketStore`.
    - Использовать `$isConnected` для отображения статуса.
    - Использовать `$transcription` для получения текста.
- [ ] 3. Обновить `client/src/lib/socket.ts` (если необходимо) для интеграции со стором (callbacks).

## Phase 2: Dynamic Statistics
- [ ] 4. Создать `client/src/lib/stores/statsStore.ts`.
    - Stores: `wordsCount`, `wpm`, `streak`.
    - Логика подсчета слов (при обновлении транскрипции).
    - Логика WPM (скользящее среднее).
- [ ] 5. Интеграция статистики в `client/src/lib/components/Header.svelte`.
    - Подписаться на `statsStore`.
    - Убрать mock data.
- [ ] 6. Обновить `client/src/routes/+page.svelte` для обновления статистики при приеме текста.

## Phase 3: Cleanup & Test
- [ ] 7. Проверить работу записи и транскрипции.
- [ ] 8. Убедиться, что статус корректно отображается при разрыве соединения.
- [ ] 9. Удалить неиспользуемый код.