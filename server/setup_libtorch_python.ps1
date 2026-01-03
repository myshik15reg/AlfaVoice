# Альтернативный способ: Использование Python PyTorch вместо ручного скачивания libtorch
# Этот метод проще, если у вас уже установлен Python

$ErrorActionPreference = "Stop"

Write-Host "=== Настройка Libtorch через Python PyTorch ===" -ForegroundColor Cyan

# Проверка Python
Write-Host "`n=== Проверка Python ===" -ForegroundColor Cyan
$python = Get-Command python -ErrorAction SilentlyContinue
if (-not $python) {
    Write-Host "✗ Python не найден" -ForegroundColor Red
    Write-Host "Установите Python: https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

$pythonVersion = & python --version
Write-Host "✓ Python найден: $pythonVersion" -ForegroundColor Green

# Проверка pip
Write-Host "`n=== Проверка pip ===" -ForegroundColor Cyan
$pipVersion = & python -m pip --version 2>&1
Write-Host "✓ pip: $pipVersion" -ForegroundColor Green

# Установка PyTorch с поддержкой CUDA
Write-Host "`n=== Установка PyTorch с поддержкой CUDA 12.4 ===" -ForegroundColor Cyan
Write-Host "Это может занять несколько минут..." -ForegroundColor Yellow

try {
    & python -m pip install torch==2.5.1 torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124
    Write-Host "✓ PyTorch установлен" -ForegroundColor Green
} catch {
    Write-Host "✗ Ошибка установки PyTorch: $_" -ForegroundColor Red
    exit 1
}

# Проверка установки
Write-Host "`n=== Проверка установки PyTorch ===" -ForegroundColor Cyan
$checkScript = @"
import torch
print(f"PyTorch version: {torch.__version__}")
print(f"CUDA available: {torch.cuda.is_available()}")
if torch.cuda.is_available():
    print(f"CUDA version: {torch.version.cuda}")
    print(f"Device count: {torch.cuda.device_count()}")
    print(f"Current device: {torch.cuda.current_device()}")
    print(f"Device name: {torch.cuda.get_device_name(0)}")
"@

$checkResult = & python -c $checkScript 2>&1
Write-Host $checkResult -ForegroundColor Gray

if ($checkResult -match "CUDA available: True") {
    Write-Host "✓ CUDA доступна!" -ForegroundColor Green
} else {
    Write-Host "⚠ CUDA недоступна. Проверьте драйвер NVIDIA." -ForegroundColor Yellow
}

# Создание скрипта для сборки проекта
Write-Host "`n=== Создание скрипта сборки ===" -ForegroundColor Cyan

$buildScript = @"
# Скрипт сборки проекта с использованием Python PyTorch
# Выполняйте этот скрипт для сборки проекта

`$Env:LIBTORCH_USE_PYTORCH = "1"
`$Env:LIBCLANG_PATH = "C:\Program Files\LLVM\bin"

Write-Host "Переменные окружения установлены:" -ForegroundColor Green
Write-Host "  LIBTORCH_USE_PYTORCH = 1" -ForegroundColor Gray
Write-Host "  LIBCLANG_PATH = `$Env:LIBCLANG_PATH" -ForegroundColor Gray
Write-Host "`nСборка проекта..." -ForegroundColor Cyan

cd server
cargo build --features nlp
"@

$buildScriptPath = "$PSScriptRoot\build_with_python_pytorch.ps1"
$buildScript | Out-File -FilePath $buildScriptPath -Encoding UTF8
Write-Host "✓ Создан скрипт сборки: $buildScriptPath" -ForegroundColor Green

Write-Host "`n=== Готово! ===" -ForegroundColor Green
Write-Host "Теперь можно собирать проект:" -ForegroundColor Cyan
Write-Host "  .\build_with_python_pytorch.ps1" -ForegroundColor Gray
