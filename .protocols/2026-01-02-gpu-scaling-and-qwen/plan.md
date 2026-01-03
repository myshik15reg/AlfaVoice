# Plan: GPU Scaling & Qwen Integration

## Phase 1: GPU Acceleration for Whisper
- [ ] Исследовать текущую конфигурацию `whisper-rs` и добавить feature flags для CUDA в `Cargo.toml`.
- [ ] Обновить код инициализации Whisper, добавив логику выбора устройства (CPU/CUDA) на основе конфигурации.
- [ ] Протестировать сборку с CUDA.
- [ ] Добавить конфигурационные параметры в структуру `AppConfig` (use_gpu, gpu_device_id).

## Phase 2: Qwen Integration Foundation
- [x] Выбрать библиотеку для запуска LLM (кандидаты: `candle-core` + `candle-nn` + `candle-transformers` или `llama-cpp-rs`). *Решение: использовать `candle` как Rust-native решение или `llama-cpp-rs` для унификации с GGUF.*
- [x] Добавить зависимости в `Cargo.toml`.
- [x] Реализовать модуль `llm_engine` для загрузки модели и инференса.
- [x] Добавить настройки для путей к модели Qwen и параметров генерации.

## Phase 3: Pipeline Integration
- [x] Модифицировать обработчик WebSocket (или сервис транскрибации) для передачи текста из Whisper в LLM.
- [x] Реализовать промпт-инжиниринг для задачи коррекции (system prompt: "You are a helpful assistant that corrects ASR errors...").
- [ ] Обеспечить потоковую передачу результатов (если возможно) или возврат финального текста. *TODO: поточная генерация*

## Phase 4: Testing & Optimization
- [ ] Провести нагрузочное тестирование на RTX 3060Ti.
- [ ] Проверить потребление VRAM.
- [ ] Оптимизировать параметры (размер контекста, квантование), если возникают OOM.

## Phase 5: Cleanup
- [ ] Обновить документацию (`tech.md`).
- [ ] Удалить временные файлы.