# Execution Log: GPU Scaling & Qwen Integration

## 2026-01-02

### Phase 2: Qwen Integration Foundation

#### Выполнено:
1. ✅ Выбрана библиотека `candle` (candle-core, candle-nn, candle-transformers) для запуска LLM
2. ✅ Добавлены зависимости в `server/Cargo.toml`:
   - `candle-core = { version = "0.6", optional = true }`
   - `candle-nn = { version = "0.6", optional = true }`
   - `candle-transformers = { version = "0.6", optional = true }`
   - `candle-flash-attn = { version = "0.6", optional = true }`
   - `tokenizers = { version = "0.20", optional = true }`
   - `hf-hub = { version = "0.3", optional = true }`
   - Features: `cuda` (для CUDA), `llm` (для LLM функциональности)

3. ✅ Создан модуль `server/src/llm.rs`:
   - Структура `LlmModel` для работы с LLM
   - Типы ошибок `LlmError`
   - Метод `post_process()` для постобработки текста
   - Поддержка условной компиляции через feature flags
   - Переменные окружения: `LLM_ENABLED`, `LLM_MODEL_PATH`

4. ✅ Обновлён `server/src/state.rs`:
   - Добавлено поле `pub llm_model: Arc<LlmModel>`
   - Новые конструкторы: `with_llm_model()`, `with_models()`

5. ✅ Обновлён `server/src/main.rs`:
   - Добавлен модуль `llm`
   - Инициализация LLM модели при старте сервера
   - Логирование статуса LLM (включена/отключена)

6. ✅ Интегрировано в `server/src/ws.rs`:
   - После транскрипции Whisper вызывается `state.llm_model.post_process()`
   - Обработка ошибок LLM с fallback на исходный текст
   - Интеграция для всех путей: текстовый и бинарный аудио, с и без Whisper модели

### Phase 3: Pipeline Integration

#### Выполнено:
1. ✅ Модифицирован обработчик WebSocket для передачи текста из Whisper в LLM
2. ✅ Реализован промпт для коррекции:
   ```
   "Ты - помощник, который исправляет ошибки распознавания речи. 
   Исправь ошибки, расставь знаки препинания и улучши читаемость следующего текста:

   Текст: {text}

   Исправленный текст:"
   ```
3. ✅ Реализован возврат финального текста (потоковая передача TODO)

### Заметки по реализации:

#### Особенности реализации:
- **Опциональность**: LLM постобработка полностью опциональна, работает без модели
- **Graceful degradation**: При ошибках LLM используется исходный текст от Whisper
- **Feature flags**: Поддержка условной компиляции для экономии зависимостей
- **Переменные окружения**: Управление через `LLM_ENABLED` и `LLM_MODEL_PATH`

#### TODO (будущие улучшения):
1. **Полная реализация загрузки модели**: Текущая реализация возвращает ошибку "Полная загрузка модели Qwen ещё не реализована"
   - Нужно загрузить веса модели из safetensors или GGUF
   - Создать VarBuilder с правильным устройством
   - Инициализировать Qwen2 модель

2. **Потоковая генерация**: Текущая реализация возвращает весь текст сразу
   - Можно реализовать потоковую передачу токенов для снижения latency

3. **Оптимизация памяти**: Для RTX 3060Ti (8GB VRAM)
   - Использовать квантованные модели (Q4_K_M)
   - Рассмотреть более маленькие модели (Qwen1.5-0.5B)

4. **Кэширование модели**: Загрузка модели по требованию или при старте

### Проблемы сборки:

#### libclang error:
```
Unable to find libclang: "couldn't find any valid shared libraries matching: ['clang.dll', 'libclang.dll']
```

**Причина**: Системная зависимость для компиляции `whisper-rs-sys` (bindgen требует libclang)

**Решение**: Установить LLVM/Clang или настроить `LIBCLANG_PATH`

**Примечание**: Это не связано с кодом интеграции LLM, проблема существовала ранее

### Рекомендуемые модели Qwen:

Для RTX 3060Ti (8GB VRAM):
- **Qwen1.5-0.5B-Chat-GGUF**: ~0.5GB (минимум VRAM)
- **Qwen1.5-1.8B-Chat-GGUF**: ~1.5GB (баланс качество/VRAM)
- **Qwen2-1.5B-Instruct-GGUF**: ~1.2GB (хорошее качество)

Для Nvidia A16 (48GB VRAM):
- **Qwen2-7B-Instruct-GGUF**: ~5GB (высокое качество)
- **Qwen2-14B-Instruct-GGUF**: ~10GB (максимальное качество)

### Переменные окружения:

Для включения LLM постобработки:
```bash
# Включить постобработку
export LLM_ENABLED=true

# Указать путь к модели
export LLM_MODEL_PATH=/path/to/qwen-model
```

Для сборки с LLM поддержкой:
```bash
# С CPU
cargo build --features llm

# С CUDA
cargo build --features llm,cuda
```
