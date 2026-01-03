# Скрипт для нагрузочного тестирования WebSocket сервера AlfaVoice
# Требует: .NET 6+ или PowerShell 7+ с WebSocketClient

param(
    [string]$ServerUrl = "ws://127.0.0.1:8081/ws",
    [string]$AudioFile = "",
    [int]$Iterations = 1,
    [int]$DelayMs = 1000
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AlfaVoice WebSocket Load Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Проверка наличия аудиофайла
if ([string]::IsNullOrEmpty($AudioFile)) {
    Write-Host "Использование: .\test_websocket.ps1 -AudioFile <path> [-Iterations <n>] [-DelayMs <ms>]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Примеры:" -ForegroundColor Gray
    Write-Host "  .\test_websocket.ps1 -AudioFile test.wav -Iterations 5" -ForegroundColor Gray
    Write-Host "  .\test_websocket.ps1 -AudioFile test.wav -Iterations 10 -DelayMs 500" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Для теста с пустым аудио (без файла):" -ForegroundColor Gray
    Write-Host "  .\test_websocket.ps1 -AudioFile '' -Iterations 3" -ForegroundColor Gray
    exit 1
}

# Функция для кодирования файла в base64
function Get-Base64Audio {
    param([string]$Path)
    
    if ([string]::IsNullOrEmpty($Path) -or -not (Test-Path $Path)) {
        # Возвращаем пустую строку для теста без файла
        return ""
    }
    
    $bytes = [System.IO.File]::ReadAllBytes($Path)
    return [System.Convert]::ToBase64String($bytes)
}

# Функция для отправки сообщения через WebSocket
function Send-WebSocketMessage {
    param(
        [string]$Url,
        [string]$Message
    )
    
    try {
        # Используем .NET WebSocketClient
        $ws = New-Object System.Net.WebSockets.ClientWebSocket
        $cts = New-Object System.Threading.CancellationTokenSource
        
        $uri = [System.Uri]$Url
        $ws.ConnectAsync($uri, $cts.Token).Wait()
        
        $buffer = [System.Text.Encoding]::UTF8.GetBytes($Message)
        $segment = New-Object System.ArraySegment[byte] -ArgumentList $buffer
        
        $ws.SendAsync($segment, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $cts.Token).Wait()
        
        # Ждем ответа (таймаут 30 секунд)
        $receiveBuffer = New-Object byte[] 4096
        $receiveSegment = New-Object System.ArraySegment[byte] -ArgumentList $receiveBuffer
        
        $result = $ws.ReceiveAsync($receiveSegment, $cts.Token)
        
        if ($result.Wait(30000)) {
            $receivedBytes = $receiveSegment.Array[0..$result.Result.Count]
            $response = [System.Text.Encoding]::UTF8.GetString($receivedBytes)
            return $response
        } else {
            return "TIMEOUT"
        }
        
        $ws.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, "Test complete", $cts.Token).Wait()
    } catch {
        return "ERROR: $($_.Exception.Message)"
    }
}

# Основной цикл тестирования
Write-Host "Сервер: $ServerUrl" -ForegroundColor Green
Write-Host "Аудиофайл: $AudioFile" -ForegroundColor Green
Write-Host "Итераций: $Iterations" -ForegroundColor Green
Write-Host "Задержка: ${DelayMs}ms" -ForegroundColor Green
Write-Host ""

# Подготовка аудио
$base64Audio = Get-Base64Audio -Path $AudioFile
$audioSize = if ([string]::IsNullOrEmpty($AudioFile)) { 0 } else { (Get-Item $AudioFile).Length }

Write-Host "Размер аудио: $audioSize байт" -ForegroundColor Gray
Write-Host "Размер base64: $($base64Audio.Length) символов" -ForegroundColor Gray
Write-Host ""

# Запуск тестов
$totalTime = 0
$successCount = 0
$errorCount = 0

for ($i = 1; $i -le $Iterations; $i++) {
    Write-Host "[$i/$Iterations] Отправка сообщения..." -NoNewline
    
    $message = @{
        type = "audio"
        data = $base64Audio
        sample_rate = 16000
    } | ConvertTo-Json
    
    $start = Get-Date
    $response = Send-WebSocketMessage -Url $ServerUrl -Message $message
    $elapsed = ((Get-Date) - $start).TotalMilliseconds
    
    $totalTime += $elapsed
    
    if ($response -eq "TIMEOUT") {
        Write-Host " TIMEOUT ($([math]::Round($elapsed, 2))ms)" -ForegroundColor Yellow
        $errorCount++
    } elseif ($response -like "ERROR:*") {
        Write-Host " ERROR ($([math]::Round($elapsed, 2))ms)" -ForegroundColor Red
        Write-Host "  $response" -ForegroundColor DarkRed
        $errorCount++
    } else {
        Write-Host " OK ($([math]::Round($elapsed, 2))ms)" -ForegroundColor Green
        $successCount++
        
        # Парсим ответ
        try {
            $json = $response | ConvertFrom-Json
            if ($json.type -eq "transcription" -and $json.text) {
                Write-Host "  Текст: $($json.text.Substring(0, [Math]::Min(50, $json.text.Length)))..." -ForegroundColor Gray
            }
        } catch {
            # Игнорируем ошибки парсинга
        }
    }
    
    if ($i -lt $Iterations) {
        Start-Sleep -Milliseconds $DelayMs
    }
}

# Статистика
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Результаты тестирования" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Всего сообщений: $Iterations" -ForegroundColor White
Write-Host "Успешно: $successCount" -ForegroundColor Green
Write-Host "Ошибок: $errorCount" -ForegroundColor Red
Write-Host "Общее время: $([math]::Round($totalTime, 2))ms" -ForegroundColor White
Write-Host "Среднее время: $([math]::Round($totalTime / $Iterations, 2))ms" -ForegroundColor White
Write-Host "Пропускная способность: $([math]::Round(1000 / ($totalTime / $Iterations), 2)) msg/sec" -ForegroundColor White
Write-Host ""

if ($errorCount -eq 0) {
    Write-Host "✓ Все тесты пройдены успешно!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "✗ Обнаружены ошибки в тестировании" -ForegroundColor Red
    exit 1
}
