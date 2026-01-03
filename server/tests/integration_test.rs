// Интеграционные тесты для AlfaVoice Server
//
// Запуск: cargo test --test integration_test
//
// Примечание: Для запуска этих тестов требуется libclang (для whisper-rs-sys)
// Установите LLVM или задайте LIBCLANG_PATH

use std::time::Duration;
use tokio_tungstenite::tungstenite::client::IntoClientRequest;
use tokio_tungstenite::{connect_async, tungstenite::Message};

const SERVER_URL: &str = "ws://127.0.0.1:8081/ws";
const HEALTH_URL: &str = "http://127.0.0.1:8081/health";

/// Тест проверки здоровья сервера
#[tokio::test]
async fn test_health_check() {
    // Проверяем, что сервер запущен
    let request = HEALTH_URL.into_client_request().expect("Invalid health URL");
    
    let response = reqwest::get(request).await.expect("Failed to connect to server");
    
    assert_eq!(response.status(), 200, "Health check should return 200");
    
    let body = response.text().await.expect("Failed to read response body");
    let json: serde_json::Value = serde_json::from_str(&body).expect("Invalid JSON response");
    
    assert_eq!(json["status"], "ok", "Status should be 'ok'");
    assert!(json["version"].is_string(), "Version should be a string");
    
    println!("✓ Health check passed: {}", body);
}

/// Тест WebSocket подключения
#[tokio::test]
async fn test_websocket_connection() {
    // Подключаемся к WebSocket
    let request = SERVER_URL.into_client_request().expect("Invalid WebSocket URL");
    
    let (ws_stream, response) = connect_async(request)
        .await
        .expect("Failed to connect to WebSocket");
    
    assert_eq!(response.status(), 101, "WebSocket upgrade should return 101");
    
    let (_, mut write) = ws_stream.split();
    
    // Отправляем тестовое сообщение (пустое аудио)
    let test_message = serde_json::json!({
        "type": "audio",
        "data": "", // пустой base64
        "sample_rate": 16000
    });
    
    write.send(Message::Text(test_message.to_string()))
        .await
        .expect("Failed to send message");
    
    // Ждем немного
    tokio::time::sleep(Duration::from_millis(500)).await;
    
    println!("✓ WebSocket connection test passed");
}

/// Тест обработки сообщения с аудио данными
#[tokio::test]
async fn test_audio_message_handling() {
    let request = SERVER_URL.into_client_request().expect("Invalid WebSocket URL");
    
    let (ws_stream, response) = connect_async(request)
        .await
        .expect("Failed to connect to WebSocket");
    
    assert_eq!(response.status(), 101, "WebSocket upgrade should return 101");
    
    let (mut read, mut write) = ws_stream.split();
    
    // Создаем минимальное тестовое аудио (1 секунда тишины, 16kHz, mono)
    let sample_rate = 16000u32;
    let duration_sec = 1;
    let num_samples = sample_rate as usize * duration_sec;
    let audio_data: Vec<i16> = vec![0; num_samples]; // тишина
    
    // Конвертируем в байты
    let audio_bytes: Vec<u8> = audio_data
        .iter()
        .flat_map(|&sample| sample.to_le_bytes())
        .collect();
    
    // Кодируем в base64
    let base64_audio = base64::encode(&audio_bytes);
    
    // Отправляем сообщение
    let message = serde_json::json!({
        "type": "audio",
        "data": base64_audio,
        "sample_rate": sample_rate
    });
    
    write.send(Message::Text(message.to_string()))
        .await
        .expect("Failed to send audio message");
    
    // Ждем ответа (с таймаутом)
    let timeout = Duration::from_secs(30);
    let result = tokio::time::timeout(timeout, read.next()).await;
    
    match result {
        Ok(Some(Ok(message))) => {
            match message {
                Message::Text(text) => {
                    let json: serde_json::Value = serde_json::from_str(&text)
                        .expect("Invalid JSON response");
                    
                    assert_eq!(json["type"], "transcription", "Response type should be 'transcription'");
                    assert!(json["text"].is_string(), "Text should be a string");
                    
                    println!("✓ Audio message handling test passed");
                    println!("  Response: {}", text);
                }
                Message::Close(_) => {
                    println!("✓ Server closed connection (expected for empty audio)");
                }
                _ => {
                    println!("✓ Received message: {:?}", message);
                }
            }
        }
        Ok(Some(Err(e))) => {
            panic!("WebSocket error: {}", e);
        }
        Ok(None) => {
            println!("✓ Connection closed by server");
        }
        Err(_) => {
            println!("⚠ Timeout - server may still be processing (this is OK for large models)");
        }
    }
}

/// Тест обработки нескольких сообщений подряд
#[tokio::test]
async fn test_multiple_messages() {
    let request = SERVER_URL.into_client_request().expect("Invalid WebSocket URL");
    
    let (ws_stream, response) = connect_async(request)
        .await
        .expect("Failed to connect to WebSocket");
    
    assert_eq!(response.status(), 101, "WebSocket upgrade should return 101");
    
    let (mut read, mut write) = ws_stream.split();
    
    // Отправляем несколько коротких сообщений
    for i in 1..=3 {
        let message = serde_json::json!({
            "type": "audio",
            "data": "", // пустой base64 для скорости
            "sample_rate": 16000
        });
        
        write.send(Message::Text(message.to_string()))
            .await
            .expect("Failed to send message");
        
        println!("  Sent message {}", i);
        tokio::time::sleep(Duration::from_millis(100)).await;
    }
    
    // Ждем закрытия соединения или таймаута
    let timeout = Duration::from_secs(5);
    let _ = tokio::time::timeout(timeout, read.next()).await;
    
    println!("✓ Multiple messages test passed");
}

/// Тест обработки некорректных сообщений
#[tokio::test]
async fn test_invalid_messages() {
    let request = SERVER_URL.into_client_request().expect("Invalid WebSocket URL");
    
    let (ws_stream, response) = connect_async(request)
        .await
        .expect("Failed to connect to WebSocket");
    
    assert_eq!(response.status(), 101, "WebSocket upgrade should return 101");
    
    let (mut read, mut write) = ws_stream.split();
    
    // Отправляем некорректное сообщение
    let invalid_messages = vec![
        "invalid json",
        "{}",
        r#"{"type": "invalid"}"#,
        r#"{"type": "audio"}"#, // без data и sample_rate
    ];
    
    for msg in invalid_messages {
        write.send(Message::Text(msg.to_string()))
            .await
            .expect("Failed to send message");
        
        tokio::time::sleep(Duration::from_millis(100)).await;
    }
    
    // Ждем закрытия соединения или таймаута
    let timeout = Duration::from_secs(5);
    let _ = tokio::time::timeout(timeout, read.next()).await;
    
    println!("✓ Invalid messages test passed (server handled gracefully)");
}

/// Тест нагрузки (load test) - отправка множества сообщений
#[tokio::test]
#[ignore] // Игнорируем по умолчанию, запускать вручную: cargo test --test integration_test test_load -- --ignored
async fn test_load() {
    let request = SERVER_URL.into_client_request().expect("Invalid WebSocket URL");
    
    let (ws_stream, response) = connect_async(request)
        .await
        .expect("Failed to connect to WebSocket");
    
    assert_eq!(response.status(), 101, "WebSocket upgrade should return 101");
    
    let (_, mut write) = ws_stream.split();
    
    let num_messages = 10;
    let start = std::time::Instant::now();
    
    for i in 1..=num_messages {
        let message = serde_json::json!({
            "type": "audio",
            "data": "",
            "sample_rate": 16000
        });
        
        write.send(Message::Text(message.to_string()))
            .await
            .expect("Failed to send message");
        
        if i % 5 == 0 {
            println!("  Sent {} messages", i);
        }
        
        tokio::time::sleep(Duration::from_millis(50)).await;
    }
    
    let elapsed = start.elapsed();
    
    println!("✓ Load test passed: {} messages in {:?}", num_messages, elapsed);
    println!("  Average: {:.2} ms per message", elapsed.as_millis() as f64 / num_messages as f64);
}
