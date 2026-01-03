use axum::{
    extract::{
        State,
        ws::{Message, WebSocket, WebSocketUpgrade},
    },
    response::Response,
};
use futures::{sink::SinkExt, stream::StreamExt};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tracing::{info, error, debug};

use crate::state::AppState;
use crate::whisper;
use crate::llm;

#[cfg(feature = "nlp")]
use crate::nlp::BertModel;

/// Сообщение от клиента
#[derive(Debug, Deserialize)]
#[serde(tag = "type")]
enum ClientMessage {
    #[serde(rename = "audio")]
    AudioData { data: String },
    #[serde(rename = "ping")]
    Ping,
}

/// Сообщение клиенту
#[derive(Debug, Serialize)]
#[serde(tag = "type")]
enum ServerMessage {
    #[serde(rename = "transcription")]
    Transcription { text: String },
    #[serde(rename = "pong")]
    Pong,
    #[serde(rename = "error")]
    Error { message: String },
}

/// Обработчик WebSocket соединения
pub async fn websocket_handler(
    ws: WebSocketUpgrade,
    State(state): State<Arc<AppState>>,
) -> Response {
    ws.on_upgrade(move |socket| handle_socket(socket, state))
}

/// Обработка WebSocket соединения
async fn handle_socket(socket: WebSocket, state: Arc<AppState>) {
    let (mut sender, mut receiver) = socket.split();
    let client_id = uuid::Uuid::new_v4();

    // Регистрируем клиента
    state.add_client(client_id.to_string()).await;
    
    info!("New WebSocket client connected: {}", client_id);

    // Отправляем приветственное сообщение
    let welcome_msg = ServerMessage::Transcription {
        text: "Подключено к AlfaVoice Server".to_string(),
    };
    
    if let Ok(msg_json) = serde_json::to_string(&welcome_msg) {
        if let Err(e) = sender.send(Message::Text(msg_json)).await {
            error!("Failed to send welcome message to client {}: {}", client_id, e);
            return;
        }
    }

    // Обрабатываем сообщения от клиента
    while let Some(result) = receiver.next().await {
        match result {
            Ok(msg) => {
                match msg {
                    Message::Text(text) => {
                        debug!("Received text message from {}: {}", client_id, text);
                        
                        // Парсим сообщение
                        if let Ok(client_msg) = serde_json::from_str::<ClientMessage>(&text) {
                            match client_msg {
                                ClientMessage::Ping => {
                                    // Отвечаем на ping
                                    let pong_msg = ServerMessage::Pong;
                                    if let Ok(msg_json) = serde_json::to_string(&pong_msg) {
                                        let _ = sender.send(Message::Text(msg_json)).await;
                                    }
                                }
                                ClientMessage::AudioData { data } => {
                                    // Обрабатываем аудио данные
                                    debug!("Received audio data from {}: {} bytes", client_id, data.len());
                                    
                                    // Пытаемся выполнить транскрипцию через Whisper
                                    let transcription = match &state.whisper_model {
                                        Some(model) => {
                                            // Декодируем base64 аудио данные
                                            match base64_decode(&data) {
                                                Ok(audio_bytes) => {
                                                    // Конвертируем в PCM формат
                                                    match whisper::convert_audio_to_pcm(&audio_bytes) {
                                                        Ok(pcm_data) => {
                                                            // Выполняем транскрипцию
                                                            match model.transcribe(&pcm_data).await {
                                                                Ok(text) => {
                                                                    // Постобработка через BERT (если доступен) или LLM
                                                                    #[cfg(feature = "nlp")]
                                                                    let processed_text = if let Some(bert_model) = &state.bert_model {
                                                                        if bert_model.is_ready() {
                                                                            match bert_model.process_text(&text) {
                                                                                Ok(result) => {
                                                    debug!("BERT постобработка за {}ms (GPU: {})",
                                                        result.processing_time_ms, result.used_gpu);
                                                    result.text
                                                }
                                                Err(e) => {
                                                    debug!("Ошибка BERT постобработки: {}, используем LLM", e);
                                                    // Fallback на LLM
                                                    match state.llm_model.post_process(&text).await {
                                                        Ok(llm_text) => llm_text,
                                                        Err(_) => text
                                                    }
                                                }
                                            }
                                        } else {
                                            // BERT не готов, используем LLM
                                            match state.llm_model.post_process(&text).await {
                                                Ok(llm_text) => llm_text,
                                                Err(_) => text
                                            }
                                        }
                                    } else {
                                        // BERT недоступен, используем LLM
                                        match state.llm_model.post_process(&text).await {
                                            Ok(llm_text) => llm_text,
                                            Err(_) => text
                                        }
                                    };

                                                                    #[cfg(not(feature = "nlp"))]
                                                                    let processed_text = match state.llm_model.post_process(&text).await {
                                                                        Ok(llm_text) => llm_text,
                                                                        Err(_) => text
                                                                    };

                                                                    processed_text
                                                                }
                                                                Err(e) => {
                                                                    error!("Ошибка транскрипции: {}", e);
                                                                    format!("Ошибка транскрипции: {}", e)
                                                                }
                                                            }
                                                        }
                                                        Err(e) => {
                                                            error!("Ошибка конвертации аудио: {}", e);
                                                            format!("Ошибка конвертации аудио: {}", e)
                                                        }
                                                    }
                                                }
                                                Err(e) => {
                                                    error!("Ошибка декодирования base64: {}", e);
                                                    format!("Ошибка декодирования аудио: {}", e)
                                                }
                                            }
                                        }
                                        None => {
                                            // Whisper модель не загружена - используем заглушку
                                            let stub_text = process_audio_stub(&data).await;
                                            // Постобработка заглушки через LLM
                                            match state.llm_model.post_process(&stub_text).await {
                                                Ok(processed_text) => processed_text,
                                                Err(e) => {
                                                    debug!("Ошибка постобработки LLM: {}", e);
                                                    stub_text
                                                }
                                            }
                                        }
                                    };
                                    
                                    let response = ServerMessage::Transcription { text: transcription };
                                    
                                    if let Ok(msg_json) = serde_json::to_string(&response) {
                                        if let Err(e) = sender.send(Message::Text(msg_json)).await {
                                            error!("Failed to send transcription to client {}: {}", client_id, e);
                                            break;
                                        }
                                    }
                                }
                            }
                        } else {
                            error!("Failed to parse message from client {}", client_id);
                        }
                    }
                    Message::Binary(data) => {
                        debug!("Received binary data from {}: {} bytes", client_id, data.len());
                        
                        // Пытаемся выполнить транскрипцию через Whisper
                        let transcription = match &state.whisper_model {
                            Some(model) => {
                                // Конвертируем бинарные данные в PCM формат
                                match whisper::convert_audio_to_pcm(&data) {
                                    Ok(pcm_data) => {
                                        // Выполняем транскрипцию
                                        match model.transcribe(&pcm_data).await {
                                            Ok(text) => {
                                                // Постобработка через BERT (если доступен) или LLM
                                                #[cfg(feature = "nlp")]
                                                let processed_text = if let Some(bert_model) = &state.bert_model {
                                                    if bert_model.is_ready() {
                                                        match bert_model.process_text(&text) {
                                                            Ok(result) => {
                                                                debug!("BERT постобработка за {}ms (GPU: {})",
                                                                    result.processing_time_ms, result.used_gpu);
                                                                result.text
                                                            }
                                                            Err(e) => {
                                                                debug!("Ошибка BERT постобработки: {}, используем LLM", e);
                                                                // Fallback на LLM
                                                                match state.llm_model.post_process(&text).await {
                                                                    Ok(llm_text) => llm_text,
                                                                    Err(_) => text
                                                                }
                                                            }
                                                        }
                                                    } else {
                                                        // BERT не готов, используем LLM
                                                        match state.llm_model.post_process(&text).await {
                                                            Ok(llm_text) => llm_text,
                                                            Err(_) => text
                                                        }
                                                    }
                                                } else {
                                                    // BERT недоступен, используем LLM
                                                    match state.llm_model.post_process(&text).await {
                                                        Ok(llm_text) => llm_text,
                                                        Err(_) => text
                                                    }
                                                };

                                                #[cfg(not(feature = "nlp"))]
                                                let processed_text = match state.llm_model.post_process(&text).await {
                                                    Ok(llm_text) => llm_text,
                                                    Err(_) => text
                                                };

                                                processed_text
                                            }
                                            Err(e) => {
                                                error!("Ошибка транскрипции: {}", e);
                                                format!("Ошибка транскрипции: {}", e)
                                            }
                                        }
                                    }
                                    Err(e) => {
                                        error!("Ошибка конвертации аудио: {}", e);
                                        format!("Ошибка конвертации аудио: {}", e)
                                    }
                                }
                            }
                            None => {
                                // Whisper модель не загружена - используем заглушку
                                let stub_text = process_audio_binary_stub(&data).await;
                                // Постобработка заглушки через LLM
                                match state.llm_model.post_process(&stub_text).await {
                                    Ok(processed_text) => processed_text,
                                    Err(e) => {
                                        debug!("Ошибка постобработки LLM: {}", e);
                                        stub_text
                                    }
                                }
                            }
                        };
                        
                        let response = ServerMessage::Transcription { text: transcription };
                        
                        if let Ok(msg_json) = serde_json::to_string(&response) {
                            if let Err(e) = sender.send(Message::Text(msg_json)).await {
                                error!("Failed to send transcription to client {}: {}", client_id, e);
                                break;
                            }
                        }
                    }
                    Message::Close(_) => {
                        info!("Client {} disconnected", client_id);
                        break;
                    }
                    _ => {}
                }
            }
            Err(e) => {
                error!("WebSocket error for client {}: {}", client_id, e);
                break;
            }
        }
    }

    // Удаляем клиента при отключении
    state.remove_client(&client_id.to_string()).await;
    info!("WebSocket connection closed for client {}", client_id);
}

/// Декодирует base64 строку в байты
fn base64_decode(data: &str) -> Result<Vec<u8>, String> {
    use base64::{Engine as _, engine::general_purpose};
    
    general_purpose::STANDARD
        .decode(data)
        .map_err(|e| format!("Ошибка декодирования base64: {}", e))
}

/// Заглушка для обработки аудио данных (текстовый формат)
async fn process_audio_stub(data: &str) -> String {
    // В реальной реализации здесь будет вызов модели транскрипции
    // Для демонстрации возвращаем mock-ответ
    
    let data_len = data.len();
    match data_len {
        0..=100 => "Короткий аудио фрагмент...".to_string(),
        101..=500 => "Средний аудио фрагмент с некоторым содержанием...".to_string(),
        _ => "Длинный аудио фрагмент с полным содержанием...".to_string(),
    }
}

/// Заглушка для обработки бинарных аудио данных
async fn process_audio_binary_stub(data: &[u8]) -> String {
    // В реальной реализации здесь будет декодирование аудио и вызов модели транскрипции
    
    let data_len = data.len();
    match data_len {
        0..=1000 => "Короткий аудио фрагмент (бинарный)...".to_string(),
        1001..=5000 => "Средний аудио фрагмент с некоторым содержанием (бинарный)...".to_string(),
        _ => "Длинный аудио фрагмент с полным содержанием (бинарный)...".to_string(),
    }
}
