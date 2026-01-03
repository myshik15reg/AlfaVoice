# Setup Windows SDK Environment Variables for Rust Compilation
# This script configures INCLUDE variable for bindgen/clang
# Run with Administrator privileges: Right-click → Run as Administrator

Write-Host "=== Настройка переменных окружения Windows SDK ===" -ForegroundColor Green
Write-Host ""

# Определяем пути
$ClangInclude = "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Tools\Llvm\x64\lib\clang\19\include"
$SdkVersion = "10.0.26100.0"
$SdkBase = "C:\Program Files (x86)\Windows Kits\10\Include\$SdkVersion"

# Формируем полный путь INCLUDE
$IncludePaths = @(
    $ClangInclude,
    "$SdkBase\ucrt",
    "$SdkBase\shared",
    "$SdkBase\um"
)
$IncludeValue = $IncludePaths -join ";"

Write-Host "Шаг 1: Удаление старой переменной CPATH..." -ForegroundColor Yellow
try {
    [Environment]::SetEnvironmentVariable("CPATH", $null, "User")
    [Environment]::SetEnvironmentVariable("CPATH", $null, "Machine")
    Write-Host "  ✓ CPATH удалена" -ForegroundColor Green
} catch {
    Write-Host "  ! Ошибка удаления CPATH: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Шаг 2: Установка новой переменной INCLUDE..." -ForegroundColor Yellow
try {
    [Environment]::SetEnvironmentVariable("INCLUDE", $IncludeValue, "User")
    Write-Host "  ✓ INCLUDE установлена" -ForegroundColor Green
} catch {
    Write-Host "  ! Ошибка установки INCLUDE: $_" -ForegroundColor Red
    Write-Host "  Убедитесь, что скрипт запущен с правами администратора" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "=== Установленная конфигурация ===" -ForegroundColor Cyan
Write-Host "INCLUDE = $IncludeValue" -ForegroundColor White

Write-Host ""
Write-Host "=== Проверка путей ===" -ForegroundColor Cyan
foreach ($path in $IncludePaths) {
    if (Test-Path $path) {
        Write-Host "  ✓ $path" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $path (НЕ НАЙДЕН)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== Проверка ключевых файлов ===" -ForegroundColor Cyan
$keyFiles = @{
    "stdbool.h" = "$ClangInclude\stdbool.h"
    "stdio.h" = "$SdkBase\ucrt\stdio.h"
    "windows.h" = "$SdkBase\um\windows.h"
}

foreach ($file in $keyFiles.GetEnumerator()) {
    if (Test-Path $file.Value) {
        Write-Host "  ✓ $($file.Key) найден" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $($file.Key) НЕ НАЙДЕН" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== Следующие шаги ===" -ForegroundColor Yellow
Write-Host "1. Полностью закройте VS Code (File → Exit)"
Write-Host "2. Откройте новое окно VS Code"
Write-Host "3. Откройте новый терминал (Ctrl+``)"
Write-Host "4. Проверьте переменную: echo `$env:INCLUDE"
Write-Host "5. Запустите сборку: cd server && cargo clean && cargo build --release"
Write-Host ""
Write-Host "✅ Настройка завершена успешно!" -ForegroundColor Green
Write-Host ""
Write-Host "Нажмите любую клавишу для выхода..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")