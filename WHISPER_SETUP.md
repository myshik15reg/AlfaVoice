# Whisper Setup Guide

## Обзор

Этот документ содержит инструкции по настройке Whisper с поддержкой GPU (CUDA) для проекта AlfaVoice.

## Требования

### Для CPU (по умолчанию)
- Rust 1.70+
- C/C++ компилятор (MSVC на Windows, GCC на Linux/macOS)

### Для GPU (CUDA)
- NVIDIA GPU с поддержкой CUDA Compute Capability 5.0+
- NVIDIA Driver версии 450.80.02 или выше
- CUDA Toolkit 11.0 или выше
- Rust 1.70+
- C/C++ компилятор (MSVC на Windows)
- LLVM/clang (требуется для сборки whisper-rs-sys на Windows)

## Установка CUDA Toolkit

### Windows

#### 1. Проверьте совместимость GPU

```powershell
# Откройте NVIDIA Control Panel
# Help > System Information > Components
# Проверьте значение NVCUDA.DLL
```

Поддерживаемые GPU:
- **RTX 3060Ti** - Compute Capability 8.6 ✅
- **RTX 4090 (A16)** - Compute Capability 8.9 ✅

#### 2. Скачайте CUDA Toolkit

Перейдите на [NVIDIA CUDA Toolkit Downloads](https://developer.nvidia.com/cuda-downloads)

Выберите:
- Operating System: Windows
- Architecture: x86_64
- Version: 11 или 12 (рекомендуется 12.x)
- Installer Type: exe (local)

#### 3. Установите CUDA Toolkit

Запустите установщик и выберите:
- **Express Installation** (рекомендуется) или
- **Custom Installation** (для точного контроля компонентов)

Важно: Установщик автоматически добавит CUDA в PATH.

#### 4. Проверьте установку

```powershell
# Откройте новую PowerShell сессию
nvcc --version

# Ожидаемый вывод:
# nvcc: NVIDIA (R) Cuda compiler driver
# Copyright (c) 2005-2024 NVIDIA Corporation
# ...
```

```powershell
# Проверьте драйвер NVIDIA
nvidia-smi

# Ожидаемый вывод с информацией о GPU и драйвере
```

#### 5. Настройка переменных окружения (если нужно)

Если CUDA не добавилась в PATH автоматически:

```powershell
# Добавьте в System Environment Variables:
# CUDA_PATH=C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v12.x
# PATH добавить: %CUDA_PATH%\bin
```

### Linux (Ubuntu/Debian)

```bash
# 1. Проверьте GPU
lspci | grep -i nvidia

# 2. Установите NVIDIA драйверы
sudo apt update
sudo apt install nvidia-driver-535

# 3. Установите CUDA Toolkit
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-ubuntu2204.pin
sudo mv cuda-ubuntu2204.pin /etc/apt/preferences.d/cuda-repository-pin-600

wget https://developer.download.nvidia.com/compute/cuda/12.2.0/local_installers/cuda-repo-ubuntu2204-12-2-local_12.2.0-535.54.03-1_amd64.deb
sudo dpkg -i cuda-repo-ubuntu2204-12-2-local_12.2.0-535.54.03-1_amd64.deb
sudo cp /var/cuda-repo-ubuntu2204-12-2-local/cuda-*-keyring.gpg /usr/share/keyrings/
sudo apt-get update
sudo apt-get install cuda

# 4. Добавьте в PATH (добавьте в ~/.bashrc)
echo 'export PATH=/usr/local/cuda-12.2/bin:$PATH' >> ~/.bashrc
echo 'export LD_LIBRARY_PATH=/usr/local/cuda-12.2/lib64:$LD_LIBRARY_PATH' >> ~/.bashrc
source ~/.bashrc

# 5. Проверьте установку
nvcc --version
nvidia-smi
```

### macOS

**Важно:** CUDA не поддерживается на Apple Silicon (M1/M2/M3). Используйте CPU или Metal.

Для Intel Mac с NVIDIA GPU:
```bash
# Скачайте CUDA Toolkit с NVIDIA官网
# Установите через .pkg файл
```

## Сборка проекта с поддержкой CUDA

### 1. Убедитесь, что CUDA установлена

```powershell
# Windows
nvcc --version
nvidia-smi
```

```bash
# Linux/macOS
nvcc --version
nvidia-smi
```

### 2. Сборка с CUDA feature

Проект использует опциональный feature `cuda` в [`server/Cargo.toml`](server/Cargo.toml):

```toml
whisper-rs = { version = "0.12", default-features = false, features = [] }

[features]
default = []
cuda = ["whisper-rs/cuda"]
```

**Для сборки с поддержкой CUDA:**
```bash
# Перейдите в папку server
cd server

# Соберите проект с CUDA feature
cargo build --release --features cuda
```

**Для сборки только с CPU (по умолчанию):**
```bash
# Перейдите в папку server
cd server

# Соберите проект без CUDA
cargo build --release
```

**Важно:** Для сборки с CUDA feature требуется установленный CUDA Toolkit и LLVM/clang (см. раздел "Требования").

### 3. Запуск с GPU

Установите переменную окружения `WHISPER_DEVICE=gpu`:

**Windows (PowerShell):**
```powershell
$env:WHISPER_DEVICE="gpu"
cargo run --release
```

**Windows (CMD):**
```cmd
set WHISPER_DEVICE=gpu
cargo run --release
```

**Linux/macOS:**
```bash
export WHISPER_DEVICE=gpu
cargo run --release
```

### 4. Запуск с CPU (по умолчанию)

```bash
# Не устанавливайте переменную или установите её в "cpu"
cargo run --release
```

Или явно:

```powershell
# Windows PowerShell
$env:WHISPER_DEVICE="cpu"
cargo run --release
```

```bash
# Linux/macOS
export WHISPER_DEVICE=cpu
cargo run --release
```

## Переменные окружения

| Переменная | Значения | Описание | По умолчанию |
|-----------|----------|----------|--------------|
| `WHISPER_DEVICE` | `cpu`, `gpu`, `cuda` | Устройство для инференса | `cpu` |

## Устранение проблем

### Ошибка: "CUDA not found"

**Причина:** CUDA Toolkit не установлен или не в PATH.

**Решение:**
```powershell
# Windows: Проверьте PATH
echo $env:PATH

# Убедитесь, что CUDA_PATH существует
echo $env:CUDA_PATH

# Если нет - переустановите CUDA Toolkit
```

### Ошибка: "No CUDA-capable device is detected"

**Причина:** Нет NVIDIA GPU или драйверы устарели.

**Решение:**
```powershell
# Проверьте GPU
nvidia-smi

# Обновите драйверы NVIDIA:
# https://www.nvidia.com/Download/index.aspx
```

### Ошибка: "CUDA out of memory"

**Причина:** Недостаточно VRAM для модели.

**Решения:**
1. Используйте меньшую модель (например, `ggml-base.bin` вместо `ggml-large-v3.bin`)
2. Закройте другие GPU-приложения
3. Уменьшите batch size в параметрах Whisper

### Медленная производительность на GPU

**Причины:**
- Модель слишком маленькая (CPU может быть быстрее для tiny/base)
- Переключение между CPU и GPU (data transfer overhead)
- Недостаточно VRAM (swapping)

**Решения:**
1. Используйте модель `ggml-medium-v3.bin` или `ggml-large-v3.bin` для GPU
2. Убедитесь, что `WHISPER_DEVICE=gpu` установлена
3. Проверьте использование VRAM: `nvidia-smi`

### Ошибка компиляции: "linking with cc failed"

**Причина:** C/C++ компилятор не установлен.

**Решение:**

**Windows:**
```powershell
# Установите Visual Studio Build Tools
# https://visualstudio.microsoft.com/visual-cpp-build-tools/
# Выберите "Desktop development with C++"
```

**Linux:**
```bash
sudo apt install build-essential
```

**macOS:**
```bash
xcode-select --install
```

### Ошибка компиляции: "Unable to find libclang"

**Причина:** LLVM/clang не установлен (требуется для сборки whisper-rs-sys).

**Решение:**

**Windows:**
```powershell
# Установите LLVM через winget
winget install LLVM.LLVM

# Или скачайте с https://releases.llvm.org/
# Установите и добавьте в PATH:
# C:\Program Files\LLVM\bin
```

**Linux:**
```bash
sudo apt install libclang-dev clang
```

**macOS:**
```bash
# LLVM обычно устанавливается с Xcode
xcode-select --install
```

## Производительность

### Ожидаемое ускорение

| Модель | CPU (8 cores) | GPU (RTX 3060Ti) | Ускорение |
|--------|---------------|-------------------|-----------|
| tiny | ~5x real-time | ~50x real-time | ~10x |
| base | ~3x real-time | ~40x real-time | ~13x |
| small | ~1.5x real-time | ~30x real-time | ~20x |
| medium | ~0.8x real-time | ~20x real-time | ~25x |
| large-v3 | ~0.4x real-time | ~15x real-time | ~37x |

*Примечание: Реальные значения зависят от длины аудио и настроек.*

### Рекомендации

- **Для разработки/тестирования:** Используйте CPU (быстрее сборка, проще отладка)
- **Для продакшн:** Используйте GPU с моделью `large-v3` для максимального качества
- **Для RTX 3060Ti:** Модель `large-v3` использует ~4-5GB VRAM
- **Для RTX 4090:** Можно использовать несколько инстансов или batch processing

## Мониторинг

### Проверка использования GPU

```powershell
# Windows
nvidia-smi -l 1  # Обновление каждую секунду
```

```bash
# Linux
watch -n 1 nvidia-smi
```

### Логи приложения

При запуске сервер будет логировать выбранное устройство:

```
INFO alfavoice_server::whisper: Загрузка Whisper модели из: models/ggml-large-v3.bin
INFO alfavoice_server::whisper: Используем GPU (CUDA) для Whisper
INFO alfavoice_server::whisper: Whisper модель успешно загружена (устройство: GPU)
```

## Дополнительные ресурсы

- [whisper-rs GitHub](https://github.com/tazz4843/whisper-rs)
- [whisper.cpp GitHub](https://github.com/ggerganov/whisper.cpp)
- [NVIDIA CUDA Toolkit Documentation](https://docs.nvidia.com/cuda/)
- [CUDA Compute Capability](https://developer.nvidia.com/cuda-gpus)

## Следующие шаги

После настройки Whisper с GPU:

1. Протестируйте транскрипцию на тестовом аудио
2. Проверьте производительность и использование VRAM
3. Перейдите к Phase 2 протокола: Qwen Integration
4. См. [`.protocols/2026-01-02-gpu-scaling-and-qwen/plan.md`](.protocols/2026-01-02-gpu-scaling-and-qwen/plan.md)
