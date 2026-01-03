# Установка Whisper для AlfaVoice

## Проблема
`whisper-rs` требует `libclang` для компиляции на Windows через bindgen.

## Решение

### Вариант 1: Установка LLVM/Clang (Рекомендуется для разработки)

1. **Скачайте LLVM:**
   - Перейдите на https://releases.llvm.org/download.html
   - Скачайте LLVM для Windows (например, LLVM 18.x)
   - Распакуйте в `C:\LLVM`

2. **Настройте переменные окружения:**
   ```powershell
   # Добавьте в PATH или временно в терминале:
   $env:LIBCLANG_PATH = "C:\LLVM\bin"
   $env:PATH += ";C:\LLVM\bin"
   ```

3. **Перезапустите терминал и соберите проект:**
   ```bash
   cd server
   cargo build
   ```

### Вариант 2: Использование готовых бинарников whisper.cpp (Для production)

Если не хотите устанавливать LLVM, можно использовать готовые бинарники:

1. **Скачайте whisper.cpp:**
   ```bash
   git clone https://github.com/ggerganov/whisper.cpp.git
   cd whisper.cpp
   ```

2. **Соберите или скачайте бинарник:**
   - Windows: https://github.com/ggerganov/whisper.cpp/releases
   - Скачайте `whisper-x64.exe`

3. **Скачайте модель:**
   ```bash
   mkdir models
   cd models
   # High Quality (Large v3) - ~3GB
   curl -L -o ggml-large-v3.bin https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3.bin
   ```

4. **Запустите сервер:**
   ```bash
   # Сервер будет работать с заглушками пока не настроена интеграция
   cd server
   cargo run
   ```

### Вариант 3: Использование Docker (Самый простой)

```bash
# Создайте Dockerfile для whisper.cpp
FROM ubuntu:22.04

# Установите зависимости
RUN apt-get update && apt-get install -y \
    git \
    cmake \
    build-essential \
    wget

# Скачайте и соберите whisper.cpp
RUN git clone https://github.com/ggerganov/whisper.cpp.git
WORKDIR /whisper.cpp
RUN cmake -B build && cmake --build build -j

# Скачайте модель
RUN wget -P models https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3.bin

# Запустите сервер
CMD ./build/bin/whisper-server -m models/ggml-large-v3.bin
```

## Модели Whisper

| Модель | Размер | Качество | Скорость |
|---------|---------|------------|-----------|
| tiny | ~40MB | Низкое | Очень быстро |
| base | ~75MB | Базовое | Быстро |
| small | ~250MB | Хорошее | Средне |
| medium | ~750MB | Высокое | Медленно |
| **large-v3** | **~3GB** | **Максимальное** | **Медленно** |

**Рекомендация:** Используйте `ggml-large-v3.bin` для максимального качества транскрипции.

## Текущий статус

Интеграция Whisper в код завершена:
- ✅ Модуль `server/src/whisper.rs` создан
- ✅ Интеграция в `server/src/main.rs` выполнена
- ✅ Обработка аудио в `server/src/ws.rs` обновлена
- ⚠️ Требуется установка зависимостей для сборки

## Следующие шаги

1. Установите LLVM или используйте готовые бинарники
2. Скачайте модель `ggml-large-v3.bin` в папку `models/`
3. Соберите проект: `cargo build`
4. Запустите сервер: `cargo run`
