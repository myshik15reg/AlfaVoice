# Setup Windows SDK Environment Variables for Rust Compilation
# This script configures INCLUDE variable for bindgen/clang
# Run with Administrator privileges: Right-click -> Run as Administrator

Write-Host "=== Nastroyka peremennykh okruzheniya Windows SDK ===" -ForegroundColor Green
Write-Host ""

# Opredelyaem puti
$ClangInclude = "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Tools\Llvm\x64\lib\clang\19\include"
$SdkVersion = "10.0.26100.0"
$SdkBase = "C:\Program Files (x86)\Windows Kits\10\Include\$SdkVersion"

# Formiruem polnyy put INCLUDE
$IncludePaths = @(
    $ClangInclude,
    "$SdkBase\ucrt",
    "$SdkBase\shared",
    "$SdkBase\um"
)
$IncludeValue = $IncludePaths -join ";"

Write-Host "Shag 1: Udalenie staroy peremennoy CPATH..." -ForegroundColor Yellow
try {
    [Environment]::SetEnvironmentVariable("CPATH", $null, "User")
    [Environment]::SetEnvironmentVariable("CPATH", $null, "Machine")
    Write-Host " [OK] CPATH udalena" -ForegroundColor Green
} catch {
    Write-Host " [ERROR] Oshibka udaleniya CPATH: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Shag 2: Ustanovka novoy peremennoy INCLUDE..." -ForegroundColor Yellow
try {
    [Environment]::SetEnvironmentVariable("INCLUDE", $IncludeValue, "User")
    Write-Host " [OK] INCLUDE ustanovlena" -ForegroundColor Green
} catch {
    Write-Host " [ERROR] Oshibka ustanovki INCLUDE: $_" -ForegroundColor Red
    Write-Host " Ubeditesʹ, chto skript zapushchen s pravami administratora" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "=== Ustanovlennaya konfiguratsiya ===" -ForegroundColor Cyan
Write-Host "INCLUDE = $IncludeValue" -ForegroundColor White

Write-Host ""
Write-Host "=== Proverka putey ===" -ForegroundColor Cyan
foreach ($path in $IncludePaths) {
    if (Test-Path $path) {
        Write-Host " [OK] $path" -ForegroundColor Green
    } else {
        Write-Host " [X] $path (NE NAYDEN)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== Proverka klyuchevykh faylov ===" -ForegroundColor Cyan
$keyFiles = @{
    "stdbool.h" = "$ClangInclude\stdbool.h"
    "stdio.h" = "$SdkBase\ucrt\stdio.h"
    "windows.h" = "$SdkBase\um\windows.h"
}

foreach ($file in $keyFiles.GetEnumerator()) {
    if (Test-Path $file.Value) {
        Write-Host " [OK] $($file.Key) nayden" -ForegroundColor Green
    } else {
        Write-Host " [X] $($file.Key) NE NAYDEN" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== Sleduyushchie shagi ===" -ForegroundColor Yellow
Write-Host "1. Polnostʹyu zakroyte VS Code (File -> Exit)"
Write-Host "2. Otkroyte novoe okno VS Code"
Write-Host "3. Otkroyte novyy terminal (Ctrl+``)"
Write-Host "4. Proverʹte peremennuyu: echo `$env:INCLUDE"
Write-Host "5. Zapustite sborku: cd server && cargo clean && cargo build --release"
Write-Host ""
Write-Host "[SUCCESS] Nastroyka zavershena uspeshno!" -ForegroundColor Green
Write-Host ""
Write-Host "Nazhmite lyubuyu klavishu dlya vykhoda..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")