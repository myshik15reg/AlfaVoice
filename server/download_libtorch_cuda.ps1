# Скрипт для скачивания и настройки Libtorch с поддержкой CUDA для Windows
# Для RTX 3060 Ti и NVIDIA A16

$ErrorActionPreference = "Stop"

Write-Host "=== Загрузка Libtorch с поддержкой CUDA для Windows ===" -ForegroundColor Cyan

# Конфигурация
$PYTORCH_VERSION = "2.5.1"
$CUDA_VERSION = "12.4"
$LIBTORCH_URL = "https://download.pytorch.org/libtorch/libtorch-win-shared-with-deps-2.5.1%2Bcu124.zip"
$DOWNLOAD_DIR = "$env:USERPROFILE\Downloads"
$LIBTORCH_ZIP = "$DOWNLOAD_DIR\libtorch-cu124.zip"
$LIBTORCH_DIR = "C:\libtorch"

Write-Host "`nВерсия PyTorch: $PYTORCH_VERSION" -ForegroundColor Yellow
Write-Host "Версия CUDA: $CUDA_VERSION" -ForegroundColor Yellow
Write-Host "Целевая директория: $LIBTORCH_DIR" -ForegroundColor Yellow

# Проверка наличия NVIDIA CUDA Toolkit
Write-Host "`n=== Проверка NVIDIA CUDA Toolkit ===" -ForegroundColor Cyan
$nvccPath = Get-Command nvcc -ErrorAction SilentlyContinue
if ($nvccPath) {
    $nvccVersion = & nvcc --version | Select-String "release"
    Write-Host "✓ CUDA Toolkit найден:" -ForegroundColor Green
    Write-Host "  $nvccVersion" -ForegroundColor Gray
} else {
    Write-Host "⚠ CUDA Toolkit не найден в PATH" -ForegroundColor Yellow
    Write-Host "  Убедитесь, что NVIDIA CUDA Toolkit $CUDA_VERSION установлен" -ForegroundColor Yellow
    Write-Host "  Скачать: https://developer.nvidia.com/cuda-downloads" -ForegroundColor Gray
}

# Проверка драйвера NVIDIA
Write-Host "`n=== Проверка драйвера NVIDIA ===" -ForegroundColor Cyan
try {
    $nvidiaSmi = & nvidia-smi 2>&1 | Select-String "Driver Version"
    if ($nvidiaSmi) {
        Write-Host "✓ Драйвер NVIDIA найден:" -ForegroundColor Green
        Write-Host "  $nvidiaSmi" -ForegroundColor Gray
    }
} catch {
    Write-Host "⚠ Не удалось проверить драйвер NVIDIA" -ForegroundColor Yellow
}

# Скачивание libtorch
Write-Host "`n=== Скачивание Libtorch ===" -ForegroundColor Cyan
if (Test-Path $LIBTORCH_ZIP) {
    Write-Host "Файл уже существует: $LIBTORCH_ZIP" -ForegroundColor Yellow
    $response = Read-Host "Перескачать? (y/N)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        Remove-Item $LIBTORCH_ZIP -Force
    } else {
        Write-Host "Используем существующий файл" -ForegroundColor Green
    }
}

if (-not (Test-Path $LIBTORCH_ZIP)) {
    Write-Host "Скачивание с: $LIBTORCH_URL" -ForegroundColor Yellow
    try {
        Invoke-WebRequest -Uri $LIBTORCH_URL -OutFile $LIBTORCH_ZIP -UseBasicParsing
        Write-Host "✓ Скачивание завершено" -ForegroundColor Green
    } catch {
        Write-Host "✗ Ошибка скачивания: $_" -ForegroundColor Red
        exit 1
    }
}

# Распаковка
Write-Host "`n=== Распаковка Libtorch ===" -ForegroundColor Cyan
$skipExtraction = $false

if (Test-Path $LIBTORCH_DIR) {
    Write-Host "Директория уже существует: $LIBTORCH_DIR" -ForegroundColor Yellow
    $response = Read-Host "Перезаписать? (y/N)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        Remove-Item $LIBTORCH_DIR -Recurse -Force
    } else {
        Write-Host "Используем существующую директорию" -ForegroundColor Green
        $skipExtraction = $true
    }
}

if (-not $skipExtraction) {
    Write-Host "Распаковка архива..." -ForegroundColor Yellow
    try {
        Expand-Archive -Path $LIBTORCH_ZIP -DestinationPath "C:\" -Force
        Write-Host "✓ Распаковка завершена" -ForegroundColor Green
    } catch {
        Write-Host "✗ Ошибка распаковки: $_" -ForegroundColor Red
        exit 1
    }
}

# Настройка переменных окружения
Write-Host "`n=== Настройка переменных окружения ===" -ForegroundColor Cyan

# Проверка структуры директорий
if (Test-Path "$LIBTORCH_DIR\lib") {
    Write-Host "✓ Структура директорий корректна" -ForegroundColor Green
} else {
    Write-Host "✗ Некорректная структура директорий" -ForegroundColor Red
    exit 1
}

# Создание скрипта для настройки окружения
$envScript = @"
# Скрипт настройки переменных окружения для Libtorch
# Выполняйте этот скрипт перед сборкой проекта

`$Env:LIBTORCH = "$LIBTORCH_DIR"
`$Env:LIBCLANG_PATH = "C:\Program Files\LLVM\bin"
`$Env:Path += ";$LIBTORCH_DIR\lib"

Write-Host "Переменные окружения установлены:" -ForegroundColor Green
Write-Host "  LIBTORCH = `$Env:LIBTORCH" -ForegroundColor Gray
Write-Host "  LIBCLANG_PATH = `$Env:LIBCLANG_PATH" -ForegroundColor Gray
Write-Host "`nТеперь можно собирать проект:" -ForegroundColor Cyan
Write-Host "  cd server" -ForegroundColor Gray
Write-Host "  cargo build --features nlp" -ForegroundColor Gray
"@

$envScriptPath = "$PSScriptRoot\setup_libtorch_env.ps1"
$envScript | Out-File -FilePath $envScriptPath -Encoding UTF8
Write-Host "✓ Создан скрипт настройки окружения: $envScriptPath" -ForegroundColor Green

# Инструкция по постоянной настройке
Write-Host "`n=== Инструкция по постоянной настройке ===" -ForegroundColor Cyan
Write-Host "Для постоянной настройки переменных окружения:" -ForegroundColor Yellow
Write-Host "1. Откройте 'Системные свойства' -> 'Дополнительно' -> 'Переменные среды'" -ForegroundColor Gray
Write-Host "2. Добавьте новую системную переменную:" -ForegroundColor Gray
Write-Host "   Имя: LIBTORCH" -ForegroundColor Gray
Write-Host "   Значение: $LIBTORCH_DIR" -ForegroundColor Gray
Write-Host "3. Добавьте в Path: $LIBTORCH_DIR\lib" -ForegroundColor Gray

Write-Host "`n=== Готово! ===" -ForegroundColor Green
Write-Host "Выполните следующую команду для сборки:" -ForegroundColor Cyan
Write-Host "  .\setup_libtorch_env.ps1" -ForegroundColor Gray
Write-Host "  cargo build --features nlp" -ForegroundColor Gray
