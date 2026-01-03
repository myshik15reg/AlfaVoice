// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod lib;

use tauri::Manager;
use tauri_plugin_global_hotkey::{GlobalHotKeyEvent, Shortcut, ShortcutState};

#[derive(serde::Deserialize)]
struct HotkeyPayload {
    shortcut: String,
    action: String,
}

#[derive(Clone, serde::Serialize)]
struct HotkeyEvent {
    action: String,
}

#[tauri::command]
async fn register_hotkey(
    app_handle: tauri::AppHandle,
    payload: HotkeyPayload,
) -> Result<(), String> {
    let shortcut = payload.shortcut.as_str();
    
    // Парсим горячую клавишу
    let hotkey = match Shortcut::parse(shortcut) {
        Ok(hk) => hk,
        Err(e) => return Err(format!("Failed to parse shortcut: {}", e)),
    };

    // Регистрируем горячую клавишу
    let mut hotkey_manager = app_handle.global_hotkey_manager();
    
    hotkey_manager
        .register(hotkey)
        .map_err(|e| format!("Failed to register hotkey: {}", e))?;

    Ok(())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_global_hotkey::Builder::new().build())
        .setup(|app| {
            // Обработка событий горячих клавиш
            let app_handle = app.handle().clone();
            
            app.listen_global("global-hotkey", move |event| {
                if let Some(payload) = event.payload() {
                    if let Ok(shortcut_str) = serde_json::from_str::<String>(payload) {
                        // Определяем действие по горячей клавише
                        let action = match shortcut_str.as_str() {
                            "Ctrl+Super" => "toggle_recording",
                            _ => return,
                        };

                        // Отправляем событие на фронтенд
                        let _ = app_handle.emit_all("hotkey-pressed", HotkeyEvent { action });
                    }
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![register_hotkey])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
