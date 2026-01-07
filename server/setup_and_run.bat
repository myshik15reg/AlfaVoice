@echo off
REM AlfaVoice Server Setup and Run Script
REM Supports both automatic and manual Libtorch setup

setlocal enabledelayedexpansion

echo ========================================
echo AlfaVoice Server Setup and Run
echo ========================================
echo.

REM Get the script directory
set SCRIPT_DIR=%~dp0
set LIBTORCH_DIR=%SCRIPT_DIR%libtorch
set LIBTORCH_ZIP=%SCRIPT_DIR%libtorch.zip
set LLVM_PATH=C:\Program Files\LLVM\bin
set CMAKE_PATH=C:\Program Files\CMake\bin

echo Script directory: %SCRIPT_DIR%
echo Libtorch directory: %LIBTORCH_DIR%
echo.

REM Step 1: Check if libtorch exists
echo [1/4] Checking if Libtorch exists...
if exist "%LIBTORCH_DIR%\include\torch\csrc\api\include\torch\torch.h" (
    echo Libtorch already installed at %LIBTORCH_DIR%
    goto SET_ENV_VARS
)

echo Libtorch not found.
echo.

REM Step 2: Check for manually downloaded libtorch.zip
echo [2/4] Checking for manually downloaded Libtorch...
if exist "%LIBTORCH_ZIP%" (
    echo Found libtorch.zip in server directory
    echo.
    goto EXTRACT_LIBTORCH
)

REM Step 3: Automatic download via PowerShell
echo Libtorch not found and no zip file present.
echo.
echo ========================================
echo DOWNLOADING LIBTORCH 2.2.0
echo ========================================
echo.
echo This will download Libtorch 2.2.0 with CUDA 12.1 support (approx. 2.5GB).
echo Compatible with rust-bert v0.22.0 and torch-sys v0.14.0.
echo Please wait, this may take several minutes...
echo.

set LIBTORCH_URL=https://download.pytorch.org/libtorch/cu121/libtorch-win-shared-with-deps-2.2.0%%2Bcu121.zip

echo Downloading from: %LIBTORCH_URL%
echo.

powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%LIBTORCH_URL%' -OutFile '%LIBTORCH_ZIP%' -UseBasicParsing}"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ========================================
    echo DOWNLOAD FAILED
    echo ========================================
    echo.
    echo Automatic download failed. Please download manually:
    echo.
    echo 1. Visit: %LIBTORCH_URL%
    echo 2. Save the file to: %SCRIPT_DIR%
    echo 3. Rename it to: libtorch.zip (if needed)
    echo 4. Run this script again
    echo.
    pause
    exit /b 1
)

echo.
echo Download completed successfully.
echo.

REM Step 4: Extract libtorch
:EXTRACT_LIBTORCH
echo [3/4] Extracting Libtorch...
echo.

REM Check file size using PowerShell (handles large files > 2GB correctly)
powershell -Command "$size = (Get-Item '%LIBTORCH_ZIP%').Length; if ($size -lt 100MB) { Write-Host \"WARNING: File seems too small ($size bytes)\"; Write-Host \"Expected size: ~2.5GB\"; exit 1 }"
if %ERRORLEVEL% NEQ 0 (
    echo.
    set /p CONTINUE="Continue extraction anyway? (y/n): "
    if /i not "!CONTINUE!"=="y" (
        echo Extraction cancelled.
        pause
        exit /b 1
    )
)

REM Use PowerShell for extraction (handles Unicode paths correctly)
echo Extracting using PowerShell...
powershell -Command "Expand-Archive -LiteralPath '%LIBTORCH_ZIP%' -DestinationPath '%SCRIPT_DIR%' -Force"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to extract Libtorch with PowerShell
    pause
    exit /b 1
)

REM Clean up zip file
del "%LIBTORCH_ZIP%"

echo Extraction completed successfully.
echo.

REM Step 5: Check prerequisites
:SET_ENV_VARS
echo [4/5] Setting environment variables...

set LIBTORCH=%LIBTORCH_DIR%
set LIBCLANG_PATH=%LLVM_PATH%
REM Enable version check bypass to avoid strict version requirements
set LIBTORCH_BYPASS_VERSION_CHECK=1

echo LIBTORCH=%LIBTORCH%
echo LIBCLANG_PATH=%LIBCLANG_PATH%
echo LIBTORCH_BYPASS_VERSION_CHECK=%LIBTORCH_BYPASS_VERSION_CHECK%
echo.

REM Add to PATH (note: this affects only the current script session)
set "PATH=%LIBTORCH_DIR%\lib;%LIBTORCH_DIR%\bin;%LLVM_PATH%;%CMAKE_PATH%;%PATH%"

echo Environment variables set.
echo.

REM Step 6: Check CMake
echo [5/5] Checking prerequisites...
where cmake >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ========================================
    echo CMAKE NOT FOUND
    echo ========================================
    echo.
    echo CMake is required for building NLP dependencies.
    echo Please install CMake:
    echo.
    echo 1. Download from: https://cmake.org/download/
    echo 2. Install with "Add CMake to system PATH" option
    echo 3. Restart your terminal/command prompt
    echo 4. Run this script again
    echo.
    pause
    exit /b 1
)

echo CMake found:
cmake --version
echo.

REM Step 7: Run the server
echo ========================================
echo Starting AlfaVoice Server...
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
    echo - Libtorch version mismatch
    echo.
    echo Check Cargo.toml for required dependencies.
    pause
    exit /b 1
)

pause
