/// Конфигурация параметров инференса для Whisper
#[derive(Debug, Clone)]
pub struct WhisperConfig {
    /// Количество потоков для инференса
    /// Оптимальное значение: количество физических ядер / 2 (но не более 8-12)
    pub n_threads: i32,
    
    /// Размер луча для beam search
    /// 5 - стандартное значение (баланс точность/скорость)
    /// 1-3 - быстрее, но менее точно
    /// 7-10 - точнее, но медленнее
    pub beam_size: i32,
    
    /// Стратегия сэмплинга
    pub use_beam_search: bool,
}

impl Default for WhisperConfig {
    fn default() -> Self {
        // Определяем оптимальное количество потоков
        let available_threads = std::thread::available_parallelism()
            .map(|n| n.get())
            .unwrap_or(4) as i32;
        
        // Используем половину доступных потоков, но ограничиваем 8-12
        let n_threads = (available_threads / 2).clamp(4, 12);
        
        Self {
            n_threads,
            beam_size: 5, // Стандартное значение для баланса точность/скорость
            use_beam_search: false, // По умолчанию используем greedy (быстрее)
        }
    }
}

impl WhisperConfig {
    /// Создаёт конфигурацию с кастомными параметрами
    pub fn new(n_threads: i32, beam_size: i32, use_beam_search: bool) -> Self {
        Self {
            n_threads: n_threads.clamp(1, 16),
            beam_size: beam_size.clamp(1, 10),
            use_beam_search,
        }
    }
    
    /// Создаёт конфигурацию для максимальной скорости
    pub fn fast() -> Self {
        let available_threads = std::thread::available_parallelism()
            .map(|n| n.get())
            .unwrap_or(4) as i32;
        
        Self {
            n_threads: (available_threads / 2).clamp(2, 8),
            beam_size: 1,
            use_beam_search: false,
        }
    }
    
    /// Создаёт конфигурацию для максимального качества
    pub fn high_quality() -> Self {
        let available_threads = std::thread::available_parallelism()
            .map(|n| n.get())
            .unwrap_or(4) as i32;
        
        Self {
            n_threads: available_threads.clamp(4, 12),
            beam_size: 10,
            use_beam_search: true,
        }
    }
}

/// Конфигурация путей к моделям
#[derive(Debug, Clone)]
pub struct ModelPaths {
    /// Путь к модели Whisper
    pub whisper_model: String,
    
    /// Путь к модели LLM
    pub llm_model: Option<String>,
}

impl Default for ModelPaths {
    fn default() -> Self {
        Self {
            whisper_model: "models/ggml-large-v3-q5_0.bin".to_string(),
            llm_model: Some("models/qwen1_5-0_5b-chat-q4_k_m.gguf".to_string()),
        }
    }
}

impl ModelPaths {
    /// Создаёт конфигурацию с кастомными путями
    pub fn new(whisper_model: String, llm_model: Option<String>) -> Self {
        Self {
            whisper_model,
            llm_model,
        }
    }
    
    /// Проверяет существование файлов моделей
    pub fn check_models_exist(&self) -> Result<(), String> {
        use std::path::Path;
        
        // Проверяем Whisper модель
        if !Path::new(&self.whisper_model).exists() {
            return Err(format!(
                "Whisper модель не найдена: {}\n\n\
                Для работы необходимо:\n\
                1. Создать папку 'models' в корне проекта (если её нет)\n\
                2. Скачать модель:\n\
                   - ggml-large-v3-q5_0.bin (рекомендуется, ~1GB)\n\
                   - Или ggml-large-v3.bin (полная версия, ~3GB)\n\n\
                Способы скачивания:\n\
                - Запустите: powershell -ExecutionPolicy Bypass -File scripts/download_models.ps1\n\
                - Или вручную с HuggingFace:\n\
                  https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3-q5_0.bin",
                self.whisper_model
            ));
        }
        
        // Проверяем LLM модель (если указана)
        if let Some(ref llm_path) = self.llm_model {
            if !Path::new(llm_path).exists() {
                tracing::warn!(
                    "LLM модель не найдена: {}. Постобработка будет отключена.",
                    llm_path
                );
            }
        }
        
        Ok(())
    }
}
