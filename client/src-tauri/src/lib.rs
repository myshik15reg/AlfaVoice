// Библиотечный модуль для Tauri приложения
// Здесь могут быть общие функции и структуры

pub mod hotkey;
pub mod audio;

pub use hotkey::register_hotkey;
pub use audio::get_audio_devices;
