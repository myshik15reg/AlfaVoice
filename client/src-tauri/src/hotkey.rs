// Модуль для работы с горячими клавишами

use tauri::AppHandle;
use tauri_plugin_global_hotkey::{Shortcut};

#[derive(serde::Deserialize)]
pub struct HotkeyPayload {
    pub shortcut: String,
    pub action: String,
}

/// Регистрирует горячую клавишу для выполнения указанного действия
pub fn register_hotkey(
    app_handle: &AppHandle,
    payload: HotkeyPayload,
) -> Result<(), String> {
    let shortcut = payload.shortcut.as_str();
    
    // Парсим горячую клавишу
    let hotkey = Shortcut::parse(shortcut)
        .map_err(|e| format!("Failed to parse shortcut: {}", e))?;

    // Регистрируем горячую клавишу
    let mut hotkey_manager = app_handle.global_hotkey_manager();
    
    hotkey_manager.register(hotkey)
        .map_err(|e| format!("Failed to register hotkey: {}", e))?;

    Ok(())
}
