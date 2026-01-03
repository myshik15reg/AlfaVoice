# AlfaVoice - Model Download Script
# Downloads Whisper and Qwen models with integrity verification

# Error handling
$ErrorActionPreference = "Stop"

# Configuration
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$ModelsDir = Join-Path $ProjectRoot "server\models"

# Ensure models directory exists
if (-not (Test-Path $ModelsDir)) {
    New-Item -ItemType Directory -Force -Path $ModelsDir | Out-Null
    Write-Host "Created directory: $ModelsDir" -ForegroundColor Green
}

# Model definitions
$Models = @(
    @{
        Name = "Whisper large-v3 (Q5_0)"
        Url = "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3-q5_0.bin"
        Filename = "ggml-large-v3-q5_0.bin"
        ExpectedHash = "d75795ecff3f83b5faa89d1900604ad8c780abd5739fae406de19f23ecd98ad1"  # SHA256 hash verified
    },
    @{
        Name = "Qwen1.5-0.5B-Chat (Q4_K_M) - Lightweight model for quick start"
        Url = "https://huggingface.co/Qwen/Qwen1.5-0.5B-Chat-GGUF/resolve/main/qwen1_5-0_5b-chat-q4_k_m.gguf"
        Filename = "qwen1_5-0_5b-chat-q4_k_m.gguf"
        ExpectedHash = ""  # SHA256 hash will be added after first download
    }
)

# Function to calculate SHA256 hash
function Get-FileHashSHA256 {
    param(
        [string]$FilePath
    )
    $hash = Get-FileHash -Path $FilePath -Algorithm SHA256
    return $hash.Hash.ToLower()
}

# Function to download file with progress
function Download-Model {
    param(
        [string]$Name,
        [string]$Url,
        [string]$OutputPath,
        [string]$ExpectedHash
    )

    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "Downloading: $Name" -ForegroundColor Cyan
    Write-Host "URL: $Url" -ForegroundColor Gray
    Write-Host "Output: $OutputPath" -ForegroundColor Gray
    Write-Host "========================================" -ForegroundColor Cyan

    # Check if file already exists
    if (Test-Path $OutputPath) {
        Write-Host "File already exists: $OutputPath" -ForegroundColor Yellow
        
        # Verify hash if provided
        if ($ExpectedHash -ne "") {
            $actualHash = Get-FileHashSHA256 -FilePath $OutputPath
            Write-Host "Actual SHA256: $actualHash" -ForegroundColor Gray
            Write-Host "Expected SHA256: $ExpectedHash" -ForegroundColor Gray
            
            if ($actualHash -eq $ExpectedHash) {
                Write-Host "File integrity verified. Skipping download." -ForegroundColor Green
                return $true
            } else {
                Write-Host "Hash mismatch! File will be re-downloaded." -ForegroundColor Red
                Remove-Item $OutputPath -Force
            }
        } else {
            $response = Read-Host "File exists but no hash verification. Re-download? (y/N)"
            if ($response -ne "y" -and $response -ne "Y") {
                Write-Host "Skipping download." -ForegroundColor Yellow
                return $true
            }
            Remove-Item $OutputPath -Force
        }
    }

    # Download file
    Write-Host "Starting download..." -ForegroundColor Yellow
    try {
        $ProgressPreference = 'SilentlyContinue'
        Invoke-WebRequest -Uri $Url -OutFile $OutputPath -UseBasicParsing
        $ProgressPreference = 'Continue'
        
        $fileSize = (Get-Item $OutputPath).Length / 1GB
        Write-Host "Download completed: $([math]::Round($fileSize, 2)) GB" -ForegroundColor Green
        
        # Calculate and display hash
        $actualHash = Get-FileHashSHA256 -FilePath $OutputPath
        Write-Host "SHA256: $actualHash" -ForegroundColor Cyan
        
        # Verify hash if provided
        if ($ExpectedHash -ne "") {
            if ($actualHash -eq $ExpectedHash) {
                Write-Host "Hash verification: PASSED" -ForegroundColor Green
            } else {
                Write-Host "Hash verification: FAILED" -ForegroundColor Red
                Write-Host "Expected: $ExpectedHash" -ForegroundColor Red
                Write-Host "Actual: $actualHash" -ForegroundColor Red
                Remove-Item $OutputPath -Force
                return $false
            }
        }
        
        return $true
    }
    catch {
        Write-Host "Download failed: $_" -ForegroundColor Red
        if (Test-Path $OutputPath) {
            Remove-Item $OutputPath -Force
        }
        return $false
    }
}

# Main execution
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "AlfaVoice Model Downloader" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "Models directory: $ModelsDir" -ForegroundColor Gray
Write-Host ""

$successCount = 0
$failCount = 0

foreach ($model in $Models) {
    $outputPath = Join-Path $ModelsDir $model.Filename
    
    if (Download-Model -Name $model.Name -Url $model.Url -OutputPath $outputPath -ExpectedHash $model.ExpectedHash) {
        $successCount++
    } else {
        $failCount++
    }
}

# Summary
Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "Download Summary" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "Successful: $successCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Gray" })
Write-Host "========================================" -ForegroundColor Magenta

if ($failCount -eq 0) {
    Write-Host "`nAll models downloaded successfully!" -ForegroundColor Green
    Write-Host "Note: Update the ExpectedHash values in this script after first download for future verification." -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "`nSome downloads failed. Please check the errors above." -ForegroundColor Red
    exit 1
}
