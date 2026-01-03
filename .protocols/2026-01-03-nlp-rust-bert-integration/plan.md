# Plan: NLP Integration with Rust-BERT

## Phase 1: Environment & Dependencies
- [x] 1. Добавить `rust-bert` и `tch` в `server/Cargo.toml`.
- [ ] 2. Настроить скачивание `libtorch` (CUDA 11.8/12.1) или указать путь через `LIBTORCH` env var.
- [x] 3. Проверить компиляцию пустого проекта с новыми зависимостями.

## Phase 2: Model Loading
- [x] 4. Создать модуль `src/nlp/mod.rs` и `src/nlp/bert.rs`.
- [x] 5. Реализовать структуру `BertModel` для загрузки `DeepPavlov/rubert-base-cased`.
    -   Скачивание весов (опционально) или загрузка локальных файлов.
    -   Инициализация `rust_bert::pipelines::masked_language::MaskedLanguageModel` (или другой пайплайн).
- [ ] 6. Написать тест загрузки модели на CPU и GPU.

## Phase 3: Inference Pipeline
- [x] 7. Реализовать функцию `process_text(input: &str) -> String`.
    -   Пример логики: восстановление пунктуации (если модель позволяет) или исправление опечаток.
- [x] 8. Интегрировать вызов `process_text` в существующий WebSocket flow (после получения транскрипции от Whisper).
- [x] 9. Добавить метрики времени выполнения NLP-обработки.

## Phase 4: Testing & Optimization
- [ ] 10. Провести нагрузочное тестирование (проверка VRAM).
- [x] 11. Реализовать graceful fallback на CPU, если CUDA недоступна.
- [ ] 12. Обновить документацию по запуску (инструкция по установке Libtorch).

## Phase 5: Cleanup
- [ ] 13. Удалить неиспользуемые зависимости (если были добавлены для Qwen/llama).
- [ ] 14. Обновить Memory Bank.