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

REM Step 3: Show manual download instructions
echo Libtorch not found and no zip file present.
echo.
echo ========================================
echo MANUAL DOWNLOAD REQUIRED
echo ========================================
echo.
echo PyTorch servers block automatic downloads.
echo Please download Libtorch manually:
echo.
echo 1. Visit: https://pytorch.org/get-started/locally/
echo 2. Select: Stable ^> Windows ^> Libtorch ^> C++ ^> CUDA 12.4
echo 3. Download: libtorch-win-shared-with-deps-2.5.1+cu124.zip (approx. 700MB)
echo 4. Save the file to: %SCRIPT_DIR%
echo 5. Rename it to: libtorch.zip (if needed)
echo 6. Run this script again
echo.
echo Alternatively, you can:
echo - Use vcpkg: vcpkg install libtorch[cuda]:x64-windows
echo - Or extract a different libtorch version to: %LIBTORCH_DIR%
echo.
pause
exit /b 0

REM Step 4: Extract libtorch
:EXTRACT_LIBTORCH
echo [3/4] Extracting Libtorch...
echo.

REM Check file size
for %%F in ("%LIBTORCH_ZIP%") do set ZIP_SIZE=%%~zF
if %ZIP_SIZE% LSS 100000000 (
    echo WARNING: Downloaded file seems too small (%ZIP_SIZE% bytes)
    echo Expected size: ~700MB
    echo.
    set /p CONTINUE="Continue extraction anyway? (y/n): "
    if /i not "!CONTINUE!"=="y" (
        echo Extraction cancelled.
        pause
        exit /b 1
    )
)

REM Use tar (available in Windows 10/11)
echo Extracting using tar...
tar -xf "%LIBTORCH_ZIP%" -C "%SCRIPT_DIR%"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to extract Libtorch with tar
    echo Trying alternative extraction method...
    
    REM Fallback to PowerShell
    powershell -Command "Expand-Archive -Path '%LIBTORCH_ZIP%' -DestinationPath '%SCRIPT_DIR%' -Force"
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to extract Libtorch with both tar and PowerShell
        pause
        exit /b 1
    )
)

REM Clean up zip file
del "%LIBTORCH_ZIP%"

echo Extraction completed successfully.
echo.

REM Step 5: Set environment variables
:SET_ENV_VARS
echo [4/4] Setting environment variables...

set LIBTORCH=%LIBTORCH_DIR%
set LIBCLANG_PATH=%LLVM_PATH%

echo LIBTORCH=%LIBTORCH%
echo LIBCLANG_PATH=%LIBCLANG_PATH%
echo.

REM Add to PATH
set PATH=%LIBTORCH_DIR%\lib;%LIBTORCH_DIR%\bin;%LLVM_PATH%;%PATH%

echo Environment variables set.
echo.

REM Step 6: Run the server
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
