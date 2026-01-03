@echo off
REM AlfaVoice Server Setup and Run Script using vcpkg
REM Requires vcpkg to be installed

setlocal enabledelayedexpansion

echo ========================================
echo AlfaVoice Server Setup and Run (vcpkg)
echo ========================================
echo.

REM Get the script directory
set SCRIPT_DIR=%~dp0
set LLVM_PATH=C:\Program Files\LLVM\bin

echo Script directory: %SCRIPT_DIR%
echo.

REM Step 1: Check if vcpkg is installed
echo [1/4] Checking vcpkg installation...
where vcpkg >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: vcpkg is not installed or not in PATH
    echo.
    echo INSTALL VCPKG:
    echo 1. Clone vcpkg: git clone https://github.com/Microsoft/vcpkg.git C:\vcpkg
    echo 2. Run bootstrap: C:\vcpkg\bootstrap-vcpkg.bat
    echo 3. Add to PATH: set PATH=C:\vcpkg;%%PATH%%
    echo.
    echo Or use: setup_and_run.bat for manual Libtorch setup
    pause
    exit /b 1
)

vcpkg version
echo.

REM Step 2: Install Libtorch via vcpkg
echo [2/4] Installing Libtorch via vcpkg...
echo This may take a long time (30-60 minutes)...
echo.

vcpkg install libtorch[cuda]:x64-windows
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to install libtorch via vcpkg
    echo.
    echo Try: vcpkg install libtorch:x64-windows (without CUDA)
    echo Or use: setup_and_run.bat for manual Libtorch setup
    pause
    exit /b 1
)

echo Libtorch installed successfully via vcpkg.
echo.

REM Step 3: Set environment variables
echo [3/4] Setting environment variables...

REM Get vcpkg directory
for /f "delims=" %%i in ('vcpkg integrate install') do set VCPKG_ROOT=%%~dpi

set VCPKG_LIBTORCH=%VCPKG_ROOT%installed\x64-windows

echo VCPKG_LIBTORCH=%VCPKG_LIBTORCH%
echo LIBCLANG_PATH=%LLVM_PATH%
echo.

REM Add to PATH
set PATH=%VCPKG_LIBTORCH%\bin;%LLVM_PATH%;%PATH%

echo Environment variables set.
echo.

REM Step 4: Run the server
echo [4/4] Starting AlfaVoice Server...
echo ========================================
echo.

cd /d "%SCRIPT_DIR%"
cargo run --features nlp

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Server failed to start
    echo.
    echo Common issues:
    echo - LLVM not installed at %LLVM_PATH%
    echo - CUDA not installed or incompatible version
    echo - vcpkg libtorch version mismatch
    echo.
    pause
    exit /b 1
)

pause
