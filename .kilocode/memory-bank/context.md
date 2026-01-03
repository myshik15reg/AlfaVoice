# Context: AlfaVoice

## Текущий фокус
Интеграция NLP пайплайна на базе rust-bert (ruBERT) для постобработки текста и обеспечение поддержки CUDA.

## Активные задачи
- [ ] Протокол `.protocols/2026-01-02-logging-and-models-check` (In Progress)
    - Реализация клиентского логирования.
    - Проверка загрузки моделей на сервере.
- [ ] Протокол `.protocols/2026-01-03-nlp-rust-bert-integration` (New)
    - Интеграция библиотеки rust-bert.
    - Реализация пайплайна постобработки (ruBERT).
    - Настройка CUDA (Libtorch).
- [x] Протокол `.protocols/2026-01-02-gpu-scaling-and-qwen` (Cancelled)
    - Заменен на интеграцию rust-bert.

## Следующие шаги
1. Добавить зависимость `rust-bert` и настроить `libtorch` с CUDA.
2. Реализовать загрузку модели `DeepPavlov/rubert-base-cased`.
3. Интегрировать постобработку в WebSocket обработчик.

## История изменений
- **2026-01-02**: Инициализация протокола GPU Scaling & Qwen.
- **2025-12-31**: Базовая реализация WebSocket сервера и клиента.