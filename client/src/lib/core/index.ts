/**
 * Core Module
 * Экспорт всех типов и сервисов для взаимодействия с Rust Core
 */

export { CoreService, coreService } from './CoreService';
export type {
	// Типы сообщений
	CoreMessage,
	ConnectionStatusMessage,
	TranscriptionMessage,
	ErrorMessage,
	StatsUpdateMessage,
	// Enum
	ConnectionStatus,
	// Tauri Commands интерфейс
	CoreCommands
} from './CoreService';
