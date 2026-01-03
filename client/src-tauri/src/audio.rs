// Модуль для работы с аудио устройствами

use serde::{Deserialize, Serialize};

/// Информация об аудио устройстве
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioDevice {
    pub id: String,
    pub name: String,
    pub is_default: bool,
}

/// Получает список доступных аудио устройств ввода
pub fn get_audio_devices() -> Result<Vec<AudioDevice>, String> {
    // В реальной реализации здесь будет использование системных API
    // для получения списка микрофонов
    
    // Заглушка для демонстрации
    let devices = vec![
        AudioDevice {
            id: "default".to_string(),
            name: "Микрофон по умолчанию".to_string(),
            is_default: true,
        },
    ];

    Ok(devices)
}
