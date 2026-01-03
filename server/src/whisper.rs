use std::path::Path;
use std::sync::Arc;
use tokio::sync::Mutex;
use tracing::{info, error, warn};
use whisper_rs::{WhisperContext, FullParams, SamplingStrategy, WhisperContextParameters};

use crate::config::WhisperConfig;

/// Обёртка для Whisper модели
pub struct WhisperModel {
    context: Arc<Mutex<WhisperContext>>,
    config: WhisperConfig,
}

impl WhisperModel {
    /// Загружает Whisper модель из указанного пути
    ///
    /// # Аргументы
    /// * `model_path` - путь к файлу модели Whisper (например, "models/ggml-large-v3.bin")
    /// * `config` - конфигурация параметров инференса (опционально, используется Default если None)
    ///
    /// # Возвращает
    /// * `Ok(WhisperModel)` - если модель успешно загружена
    /// * `Err(String)` - с описанием ошибки и инструкцией по скачиванию модели
    ///
    /// # Переменные окружения
    /// * `WHISPER_DEVICE` - устройство для инференса: "cpu" или "gpu" (по умолчанию: "cpu")
    pub fn load(model_path: &str, config: Option<WhisperConfig>) -> Result<Self, String> {
        let config = config.unwrap_or_default();
        info!("Загрузка Whisper модели из: {}", model_path);
        
        // Проверяем существование файла модели
        if !Path::new(model_path).exists() {
            let error_msg = format!(
                "Модель Whisper не найдена по пути: {}\n\n\
                Для работы с Whisper High Quality необходимо:\n\
                1. Создать папку 'models' в корне проекта\n\
                2. Скачать модель ggml-large-v3.bin (около 3GB)\n\n\
                Способы скачивания:\n\
                - HuggingFace: https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3.bin\n\
                - Или используйте команду:\n\
                  mkdir -p models && curl -L -o models/ggml-large-v3.bin https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3.bin\n\n\
                После скачивания перезапустите сервер.",
                model_path
            );
            error!("{}", error_msg);
            return Err(error_msg);
        }

        // Читаем переменную окружения для выбора устройства
        let device = std::env::var("WHISPER_DEVICE")
            .unwrap_or_else(|_| "cpu".to_string())
            .to_lowercase();
        
        let use_gpu = match device.as_str() {
            "gpu" | "cuda" => {
                info!("Используем GPU (CUDA) для Whisper");
                true
            },
            "cpu" => {
                info!("Используем CPU для Whisper");
                false
            },
            _ => {
                warn!("Неизвестное значение WHISPER_DEVICE: '{}', используем CPU", device);
                false
            }
        };

        // Создаём контекст Whisper с выбранным устройством
        let context = WhisperContext::new_with_params(
            model_path,
            WhisperContextParameters {
                use_gpu,
                ..Default::default()
            },
        ).map_err(|e| {
            let error_msg = format!(
                "Не удалось загрузить Whisper модель: {}\n\
                Убедитесь, что файл модели не повреждён и соответствует формату ggml.\n\
                Если используете GPU, убедитесь, что CUDA Toolkit установлен и NVIDIA драйверы актуальны.",
                e
            );
            error!("{}", error_msg);
            error_msg
        })?;

        info!("Whisper модель успешно загружена (устройство: {})", if use_gpu { "GPU" } else { "CPU" });
        info!("Параметры инференса: threads={}, beam_search={}", config.n_threads, config.use_beam_search);
        
        Ok(Self {
            context: Arc::new(Mutex::new(context)),
            config,
        })
    }

    /// Выполняет транскрипцию аудио данных
    /// 
    /// # Аргументы
    /// * `audio_data` - сырые аудио данные в формате PCM 16-bit, 16kHz, mono
    /// 
    /// # Возвращает
    /// * `Ok(String)` - распознанный текст
    /// * `Err(String)` - описание ошибки
    pub async fn transcribe(&self, audio_data: &[f32]) -> Result<String, String> {
        let context = self.context.clone();
        let config = self.config.clone();
        
        tokio::task::spawn_blocking(move || {
            let mut ctx = context.blocking_lock();
            
            // Конвертируем f32 в i32 для Whisper
            let samples: Vec<i32> = audio_data
                .iter()
                .map(|&sample| (sample * 32768.0) as i32)
                .collect();
            
            // Определяем стратегию сэмплинга на основе конфигурации
            let strategy = if config.use_beam_search {
                SamplingStrategy::BeamSearch
            } else {
                SamplingStrategy::Greedy
            };
            
            // Получаем параметры контекста
            let mut params = ctx.full_default_params(strategy);
            
            // Применяем настройки из конфигурации
            params.set_n_threads(config.n_threads);
            params.set_beam_size(config.beam_size);
            params.set_translate(false); // Не переводим, только транскрибируем
            params.set_language(Some("ru")); // Русский язык по умолчанию
            params.set_print_special(false);
            params.set_print_progress(false);
            params.set_print_realtime(false);
            params.set_print_timestamps(false);
            
            // Выполняем транскрипцию
            ctx.full(params, &samples).map_err(|e| {
                error!("Ошибка транскрипции Whisper: {}", e);
                format!("Не удалось выполнить транскрипцию: {}", e)
            })?;
            
            // Получаем количество сегментов
            let num_segments = ctx.full_n_segments();
            
            // Собираем все сегменты в один текст
            let mut transcription = String::new();
            for i in 0..num_segments {
                let segment_text = ctx
                    .full_get_segment_text(i)
                    .map_err(|e| format!("Не удалось получить сегмент {}: {}", i, e))?;
                
                transcription.push_str(segment_text.trim());
                transcription.push(' ');
            }
            
            // Убираем лишние пробелы
            let transcription = transcription.trim().to_string();
            
            if transcription.is_empty() {
                warn!("Транскрипция вернула пустой результат");
            } else {
                info!("Транскрипция выполнена успешно, длина: {} символов", transcription.len());
            }
            
            Ok(transcription)
        })
        .await
        .map_err(|e| format!("Ошибка выполнения задачи транскрипции: {}", e))?
    }
}

/// Конвертирует бинарные аудио данные из формата WebM/Opus в PCM 16kHz mono
/// 
/// # Внимание
/// Это упрощённая реализация. Для production рекомендуется использовать
/// специализированные библиотеки для декодирования аудио (symphonia, rodio, etc.)
pub fn convert_audio_to_pcm(audio_data: &[u8]) -> Result<Vec<f32>, String> {
    // Для упрощения предполагаем, что входные данные уже в нужном формате
    // В реальной реализации здесь должна быть конвертация из WebM/Opus в PCM
    
    // Если данные пустые - возвращаем ошибку
    if audio_data.is_empty() {
        return Err("Пустые аудио данные".to_string());
    }
    
    // Предполагаем, что данные уже в формате PCM 16-bit little-endian
    // Конвертируем в f32 для Whisper
    let mut pcm_data = Vec::with_capacity(audio_data.len() / 2);
    
    for chunk in audio_data.chunks_exact(2) {
        let sample = i16::from_le_bytes([chunk[0], chunk[1]]);
        pcm_data.push(sample as f32 / 32768.0);
    }
    
    Ok(pcm_data)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_convert_audio_to_pcm() {
        // Тестовые данные: синусоида
        let test_data: Vec<u8> = vec![
            0x00, 0x00, // 0
            0x7F, 0x7F, // ~32767
            0x00, 0x80, // -32768
        ];
        
        let result = convert_audio_to_pcm(&test_data);
        assert!(result.is_ok());
        
        let pcm = result.unwrap();
        assert_eq!(pcm.len(), 3);
        assert!((pcm[0] - 0.0).abs() < 0.01);
        assert!((pcm[1] - 1.0).abs() < 0.01);
        assert!((pcm[2] - (-1.0)).abs() < 0.01);
    }

    #[test]
    fn test_convert_empty_audio() {
        let result = convert_audio_to_pcm(&[]);
        assert!(result.is_err());
    }
}
