# Настройка Libtorch с поддержкой CUDA для rust-bert

## Проблема

При сборке проекта с флагом `--features nlp` возникает ошибка:
```
Error: Cannot find a libtorch install
```

## Решение

Нужно скачать и установить Libtorch с поддержкой CUDA для Windows.

### Вариант 1: Автоматическая установка (рекомендуется)

Выполните скрипт:
```powershell
cd server
.\download_libtorch_cuda.ps1
```

Скрипт автоматически:
1. Скачает libtorch с поддержкой CUDA 12.4
2. Распакует в `C:\libtorch`
3. Создаст скрипт настройки переменных окружения

### Вариант 2: Ручная установка

#### 1. Скачайте Libtorch

Для CUDA 12.4 (подходит для RTX 3060 Ti и NVIDIA A16):
```
https://download.pytorch.org/libtorch/libtorch-win-shared-with-deps-2.5.1%2Bcu124.zip
```

Сохраните архив в папку Downloads.

#### 2. Распакуйте архив

Распакуйте содержимое архива в `C:\libtorch`

Структура должна быть такой:
```
C:\libtorch\
├── include\
├── lib\
├── share\
└── ...
```

#### 3. Настройте переменные окружения

**Временная настройка (для текущей сессии PowerShell):**
```powershell
$Env:LIBTORCH = "C:\libtorch"
$Env:LIBCLANG_PATH = "C:\Program Files\LLVM\bin"
$Env:Path += ";C:\libtorch\lib"
```

**Постоянная настройка:**
1. Откройте "Системные свойства" → "Дополнительно" → "Переменные среды"
2. Добавьте новую системную переменную:
   - Имя: `LIBTORCH`
   - Значение: `C:\libtorch`
3. Добавьте в Path: `C:\libtorch\lib`

#### 4. Соберите проект

```powershell
cd server
cargo build --features nlp
```

## Проверка CUDA

Убедитесь, что у вас установлен:
- NVIDIA CUDA Toolkit 12.4 или выше: https://developer.nvidia.com/cuda-downloads
- Актуальный драйвер NVIDIA: https://www.nvidia.com/Download/index.aspx

Проверьте драйвер:
```powershell
nvidia-smi
```

## Troubleshooting

### Ошибка: "Cannot find a libtorch install"
- Убедитесь, что переменная `LIBTORCH` установлена
- Проверьте, что директория `C:\libtorch` существует
- Перезапустите терминал после настройки переменных окружения

### Ошибка: "CUDA not available"
- Убедитесь, что установлен драйвер NVIDIA
- Проверьте версию CUDA Toolkit
- Запустите `nvidia-smi` для проверки драйвера

### Python 3.14 не поддерживается PyTorch
Если хотите использовать метод с Python PyTorch, установите Python 3.10 или 3.11:
```powershell
# Используйте pyenv или скачайте с python.org
# https://www.python.org/downloads/
```

## Ссылки

- PyTorch Libtorch: https://pytorch.org/get-started/locally/
- tch-rs README: https://github.com/LaurentMazare/tch-rs/blob/main/README.md
- rust-bert: https://github.com/guillaume-be/rust-bert
