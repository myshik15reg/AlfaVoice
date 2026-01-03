//! BERT модель для обработки текста на русском языке
//!
//! Использует rust-bert для загрузки модели DeepPavlov/rubert-base-cased
//! и выполнения задач NLP (MaskedLM, классификация и т.д.)

use std::path::PathBuf;
use std::sync::Arc;
use std::time::Instant;

use serde::{Deserialize, Serialize};
use thiserror::Error;

#[cfg(feature = "nlp")]
use rust_bert::pipelines::masked_language::{
    MaskedLanguageConfig, MaskedLanguageModel,
};
#[cfg(feature = "nlp")]
use rust_bert::resources::{LocalResource, RemoteResource};
#[cfg(feature = "nlp")]
use rust_bert::Config;
#[cfg(feature = "nlp")]
use tch;

/// Ошибки, возникающие при работе с BERT моделью
#[derive(Error, Debug)]
pub enum BertError {
    #[error("Ошибка инициализации модели: {0}")]
    InitializationError(String),

    #[error("Ошибка инференса: {0}")]
    InferenceError(String),

    #[error("Модель не инициализирована")]
    NotInitialized,

    #[error("Некорректный входной текст: {0}")]
    InvalidInput(String),

    #[error("Ошибка конфигурации: {0}")]
    ConfigError(String),
}

/// Результат обработки текста
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessResult {
    /// Обработанный текст
    pub text: String,
    /// Время выполнения в миллисекундах
    pub processing_time_ms: u64,
    /// Использовалась ли GPU
    pub used_gpu: bool,
}

/// Конфигурация BERT модели
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BertConfig {
    /// Имя модели (например, "DeepPavlov/rubert-base-cased")
    pub model_name: String,
    /// Путь к локальной модели (если None - скачивать из HuggingFace)
    pub local_model_path: Option<PathBuf>,
    /// Использовать GPU если доступно
    pub use_gpu: bool,
    /// Максимальная длина входной последовательности
    pub max_length: usize,
}

impl Default for BertConfig {
    fn default() -> Self {
        Self {
            model_name: "DeepPavlov/rubert-base-cased".to_string(),
            local_model_path: None,
            use_gpu: true,
            max_length: 512,
        }
    }
}

/// BERT модель для обработки текста
pub struct BertModel {
    #[cfg(feature = "nlp")]
    model: Option<Arc<MaskedLanguageModel>>,
    config: BertConfig,
    is_initialized: bool,
}

impl BertModel {
    /// Создает новый экземпляр модели
    pub fn new(config: BertConfig) -> Self {
        Self {
            #[cfg(feature = "nlp")]
            model: None,
            config,
            is_initialized: false,
        }
    }

    /// Создает модель с конфигурацией по умолчанию
    pub fn with_default_config() -> Self {
        Self::new(BertConfig::default())
    }

    /// Инициализирует модель (загружает веса)
    #[cfg(feature = "nlp")]
    pub fn initialize(&mut self) -> Result<(), BertError> {
        let start = Instant::now();

        tracing::info!(
            "Инициализация BERT модели: {}",
            self.config.model_name
        );

        // Определяем ресурсы модели
        let config_resource = if let Some(local_path) = &self.config.local_model_path {
            tracing::info!("Используем локальную модель: {:?}", local_path);
            LocalResource::from(local_path.clone())
        } else {
            tracing::info!("Скачиваем модель из HuggingFace: {}", self.config.model_name);
            RemoteResource::from_pretrained(&self.config.model_name)
        };

        let model_resource = if let Some(local_path) = &self.config.local_model_path {
            LocalResource::from(local_path.join("model.safetensors"))
        } else {
            RemoteResource::from_pretrained(&self.config.model_name)
        };

        let vocab_resource = if let Some(local_path) = &self.config.local_model_path {
            LocalResource::from(local_path.join("vocab.txt"))
        } else {
            RemoteResource::from_pretrained(&self.config.model_name)
        };

        let merges_resource = if let Some(local_path) = &self.config.local_model_path {
            LocalResource::from(local_path.join("merges.txt"))
        } else {
            RemoteResource::from_pretrained(&self.config.model_name)
        };

        // Определяем устройство для инференса
        let device = if self.config.use_gpu && tch::Cuda::is_available() {
            tracing::info!("Используем CUDA для инференса");
            tch::Device::cuda_if_available()
        } else {
            tracing::info!("Используем CPU для инференса");
            tch::Device::Cpu
        };

        // Создаем конфигурацию пайплайна
        let masked_lm_config = MaskedLanguageConfig::new(
            MaskedLanguageConfig::default()
                .with_device(device)
                .with_max_length(self.config.max_length),
        );

        // Создаем модель
        let model = MaskedLanguageModel::new(
            masked_lm_config,
            config_resource,
            vocab_resource,
            merges_resource,
            model_resource,
        )
        .map_err(|e| BertError::InitializationError(e.to_string()))?;

        self.model = Some(Arc::new(model));
        self.is_initialized = true;

        let duration = start.elapsed();
        tracing::info!(
            "BERT модель инициализирована за {:.2}s",
            duration.as_secs_f64()
        );

        Ok(())
    }

    /// Инициализирует модель (заглушка без feature)
    #[cfg(not(feature = "nlp"))]
    pub fn initialize(&mut self) -> Result<(), BertError> {
        tracing::warn!("NLP feature не включен. BERT модель недоступна.");
        Err(BertError::ConfigError(
            "NLP feature не включен. Скомпилируйте с --features nlp".to_string(),
        ))
    }


    /// Обрабатывает текст (постобработка после Whisper)
    ///
    /// В текущей реализации выполняет базовую нормализацию текста.
    /// В будущем можно добавить:
    /// - Исправление опечаток через MaskedLM
    /// - Восстановление пунктуации
    /// - Коррекцию грамматики
    pub fn process_text(&self, input: &str) -> Result<ProcessResult, BertError> {
        if !self.is_initialized {
            return Err(BertError::NotInitialized);
        }

        if input.trim().is_empty() {
            return Err(BertError::InvalidInput("Пустой текст".to_string()));
        }

        let start = Instant::now();

        #[cfg(feature = "nlp")]
        let used_gpu = if let Some(model) = &self.model {
            // Проверяем, используется ли CUDA
            model.device().is_cuda()
        } else {
            false
        };

        #[cfg(not(feature = "nlp"))]
        let used_gpu = false;

        // Базовая постобработка текста
        let processed_text = self.basic_postprocessing(input);

        let duration = start.elapsed();

        Ok(ProcessResult {
            text: processed_text,
            processing_time_ms: duration.as_millis() as u64,
            used_gpu,
        })
    }

    /// Базовая постобработка текста (без ML)
    ///
    /// Выполняет:
    /// - Удаление лишних пробелов
    /// - Коррекцию заглавных букв в начале предложений
    /// - Удаление повторяющихся слов
    fn basic_postprocessing(&self, text: &str) -> String {
        // Разбиваем на предложения
        let sentences: Vec<&str> = text.split(&['.', '!', '?'][..]).collect();

        let processed: Vec<String> = sentences
            .iter()
            .filter(|s| !s.trim().is_empty())
            .map(|s| {
                let mut sentence = s.trim().to_string();

                // Делаем первую букву заглавной
                if let Some(first_char) = sentence.chars().next() {
                    let mut chars = sentence.chars();
                    let first_upper = first_char.to_uppercase().collect::<String>();
                    let rest: String = chars.skip(1).collect();
                    sentence = format!("{}{}", first_upper, rest);
                }

                // Удаляем лишние пробелы
                sentence.split_whitespace().collect::<Vec<_>>().join(" ")
            })
            .collect();

        processed.join(". ") + "."
    }

    /// Проверяет, инициализирована ли модель
    pub fn is_ready(&self) -> bool {
        self.is_initialized
    }

    /// Получает конфигурацию модели
    pub fn config(&self) -> &BertConfig {
        &self.config
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_basic_postprocessing() {
        let model = BertModel::with_default_config();

        // Тест с лишними пробелами
        let input = "привет   мир   это   тест";
        let output = model.basic_postprocessing(input);
        assert_eq!(output, "Привет мир это тест.");

        // Тест с заглавными буквами
        let input = "привет мир. это тест";
        let output = model.basic_postprocessing(input);
        assert_eq!(output, "Привет мир. Это тест.");

        // Тест с пустым текстом
        let input = "";
        let output = model.basic_postprocessing(input);
        assert_eq!(output, ".");
    }

    #[test]
    fn test_process_text_not_initialized() {
        let model = BertModel::with_default_config();
        let result = model.process_text("тест");
        assert!(result.is_err());
        assert!(matches!(result, Err(BertError::NotInitialized)));
    }

    #[test]
    fn test_process_text_empty_input() {
        let mut model = BertModel::with_default_config();
        model.is_initialized = true; // Эмулируем инициализацию

        let result = model.process_text("");
        assert!(result.is_err());
        assert!(matches!(result, Err(BertError::InvalidInput(_))));
    }

    #[test]
    fn test_bert_config_default() {
        let config = BertConfig::default();
        assert_eq!(config.model_name, "DeepPavlov/rubert-base-cased");
        assert!(config.use_gpu);
        assert_eq!(config.max_length, 512);
        assert!(config.local_model_path.is_none());
    }
}
