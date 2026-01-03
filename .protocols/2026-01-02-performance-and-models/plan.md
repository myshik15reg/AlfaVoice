# Plan: Performance Optimization & Model Management

## 1. Model Management
- [x] Создать директорию `server/models`.
- [x] Написать скрипт `scripts/download_models.ps1` (PowerShell для Windows совместимости) для скачивания:
    -   Whisper: `ggml-large-v3-q5_0.bin` (оптимальный баланс).
    -   LLM: `qwen1_5-0_5b-chat-q4_k_m.gguf` (легковесная модель).
- [x] Добавить проверку хэшей файлов.
- [x] Интегрировать проверку наличия моделей при старте сервера.

## 2. Rust Compilation Optimization
- [x] Модифицировать `server/Cargo.toml`:
    -   Добавить профиль `[profile.release]`.
    -   Включить `lto = "fat"`.
    -   Установить `codegen-units = 1`.
    -   Включить `panic = "abort"`.
    -   Включить `strip = true`.

## 3. Inference Optimization
- [x] Анализ текущих параметров запуска Whisper в коде.
- [x] Вынести параметры `n_threads`, `beam_size` в конфиг (или константы, если конфига нет).
- [x] Установить оптимальные дефолтные значения:
    -   `n_threads`: `std::thread::available_parallelism` / 2 (но не более 8-12).
    -   `beam_size`: 5 (стандарт) или меньше для скорости.

## 4. System Monitoring & Rayon Setup
- [x] Добавить логирование характеристик системы при старте (CPU cores, memory, GPU info).
- [x] Добавить зависимость `rayon` в `Cargo.toml`.
- [x] Настроить Rayon global thread pool для Whisper.

## 5. Verification
- [x] Попытка тестовой сборки (cargo check --release).
- [ ] Установка libclang для успешной сборки whisper-rs-sys.
- [ ] Запустить бенчмарк (транскрипция эталонного аудио).
- [ ] Сравнить время выполнения до и после оптимизаций.

## 6. Model Download
- [x] Выполнить скрипт `scripts/download_models.ps1` для загрузки моделей.
- [x] Добавить SHA256 хэши в скрипт после первого скачивания.

## Known Issues
- ❌ **libclang missing**: Требуется установка LLVM/Clang для сборки whisper-rs-sys
  - Решение: `winget install LLVM.LLVM` или настройка `LIBCLANG_PATH`

## Execution Log

### 2026-01-02: Загрузка моделей и оптимизация инференса

**Выполнено:**
1. ✅ Whisper модель успешно загружена: `ggml-large-v3-q5_0.bin` (1.01 GB)
   - SHA256: `d75795ecff3f83b5faa89d1900604ad8c780abd5739fae406de19f23ecd98ad1`
   - Хэш добавлен в скрипт для верификации

2. ✅ Обновлён скрипт загрузки моделей:
   - Заменена недоступная Qwen2.5-7B на `qwen1_5-0_5b-chat-q4_k_m.gguf` (легковесная модель)
   - Обновлён `config.rs` для использования новой модели

3. ✅ Создан модуль `server/src/config.rs`:
   - `WhisperConfig`: параметры инференса (n_threads, beam_size, use_beam_search)
   - `ModelPaths`: пути к моделям и проверка их наличия
   - Предустановленные пресеты: `default()`, `fast()`, `high_quality()`

4. ✅ Обновлён `server/src/whisper.rs`:
   - Добавлено поле `config: WhisperConfig` в `WhisperModel`
   - Параметры инференса теперь берутся из конфигурации
   - Поддержка beam search через `config.use_beam_search`
   - Оптимальное количество потоков: `available_parallelism / 2` (clamp 4-12)

5. ✅ Обновлён `server/src/main.rs`:
   - Добавлена проверка наличия моделей при старте сервера
   - Сервер завершается с ошибкой, если Whisper модель не найдена
   - Используется `ModelPaths::default()` для путей к моделям
   - Логирование параметров конфигурации

6. ✅ Добавлено логирование системы:
   - CPU threads, physical cores, logical cores
   - CUDA support status
   - Total и available memory
   - Rayon thread pool initialization

7. ✅ Добавлен Rayon:
   - Зависимость `rayon = "1.10"` в `Cargo.toml`
   - Настройка global thread pool: `(available_threads / 2).clamp(2, 12)`
   - Логирование количества потоков Rayon

**Ограничения:**
- Код не может быть скомпилирован без установки libclang