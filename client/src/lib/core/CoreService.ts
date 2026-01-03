/**
 * CoreService
 * Абстракция для моста между Svelte UI и Rust Core
 * 
 * Принципы:
 * - Svelte только хранит состояние и реагирует на изменения
 * - Вся бизнес-логика выполняется в Rust через Tauri commands
 * - Этот сервис обеспечивает типизированный интерфейс к Rust
 */

import { invoke } from '@tauri-apps/api/core';
import { listen, UnlistenFn } from '@tauri-apps/api/event';

// ============================================================================
// Типы для сообщений между Frontend и Rust
// ============================================================================

/**
 * Статус соединения с сервером
 */
export enum ConnectionStatus {
	Disconnected = 'disconnected',
	Connecting = 'connecting',
	Connected = 'connected',
	Error = 'error'
}

/**
 * Сообщение от Rust Core
 */
export interface CoreMessage {
	type: 'connection_status' | 'transcription' | 'error' | 'stats_update';
	payload: unknown;
}

/**
 * Сообщение о статусе соединения
 */
export interface ConnectionStatusMessage {
	status: ConnectionStatus;
	error?: string;
}

/**
 * Сообщение с транскрипцией
 */
export interface TranscriptionMessage {
	text: string;
	isPartial: boolean;
}

/**
 * Сообщение об ошибке
 */
export interface ErrorMessage {
	message: string;
	code?: string;
}

/**
 * Сообщение с обновлением статистики
 */
export interface StatsUpdateMessage {
	wordsCount: number;
	wpm: number;
	streak: number;
}

// ============================================================================
// Tauri Commands (выполняются в Rust)
// ============================================================================

/**
 * Команды, которые будут реализованы в Rust
 * 
 * В будущем эти команды будут вызывать invoke('command_name', { ... })
 */

export interface CoreCommands {
	// WebSocket управление
	'ws_connect': { url: string };
	'ws_disconnect': void;
	'ws_send_text': { text: string };
	'ws_send_audio': { audioData: number[] }; // Float32Array
	
	// Статистика
	'stats_get': void;
	'stats_reset': void;
	'stats_update_streak': { days: number };
	
	// Запись
	'recording_start': void;
	'recording_stop': void;
	'recording_save': { transcription: string; duration: number };
	
	// Настройки
	'settings_set_microphone': { deviceId: string | null };
	'settings_get_microphone': void;
}

// ============================================================================
// CoreService API
// ============================================================================

export class CoreService {
	private unlisteners: UnlistenFn[] = [];

	constructor() {
		// В будущем здесь будет подписка на события от Rust
	}

	/**
	 * Инициализирует сервис и подписывается на события от Rust
	 */
	async initialize(): Promise<void> {
		console.log('[CoreService] Initializing...');

		// Подписываемся на события от Rust
		this.unlisteners.push(
			await listen<ConnectionStatusMessage>('core:connection_status', (event) => {
				console.log('[CoreService] Connection status:', event.payload);
				// В будущем здесь будет обновление socketStore
			})
		);

		this.unlisteners.push(
			await listen<TranscriptionMessage>('core:transcription', (event) => {
				console.log('[CoreService] Transcription:', event.payload);
				// В будущем здесь будет обновление transcription store
			})
		);

		this.unlisteners.push(
			await listen<ErrorMessage>('core:error', (event) => {
				console.error('[CoreService] Error:', event.payload);
				// В будущем здесь будет обновление error store
			})
		);

		this.unlisteners.push(
			await listen<StatsUpdateMessage>('core:stats_update', (event) => {
				console.log('[CoreService] Stats update:', event.payload);
				// В будущем здесь будет обновление statsStore
			})
		);

		console.log('[CoreService] Initialized');
	}

	// ------------------------------------------------------------------------
	// WebSocket Commands
	// ------------------------------------------------------------------------

	/**
	 * Подключается к WebSocket серверу
	 * @param url - URL сервера
	 */
	async connectWebSocket(url: string): Promise<void> {
		console.log('[CoreService] Connecting to WebSocket:', url);
		// TODO: invoke('ws_connect', { url })
	}

	/**
	 * Отключается от WebSocket сервера
	 */
	async disconnectWebSocket(): Promise<void> {
		console.log('[CoreService] Disconnecting WebSocket');
		// TODO: invoke('ws_disconnect')
	}

	/**
	 * Отправляет текстовое сообщение
	 * @param text - текст для отправки
	 */
	async sendText(text: string): Promise<void> {
		console.log('[CoreService] Sending text:', text);
		// TODO: invoke('ws_send_text', { text })
	}

	/**
	 * Отправляет аудио данные
	 * @param audioData - Float32Array с аудио данными
	 */
	async sendAudio(audioData: Float32Array): Promise<void> {
		console.log('[CoreService] Sending audio, size:', audioData.length);
		// TODO: invoke('ws_send_audio', { audioData: Array.from(audioData) })
	}

	// ------------------------------------------------------------------------
	// Stats Commands
	// ------------------------------------------------------------------------

	/**
	 * Получает текущую статистику
	 */
	async getStats(): Promise<StatsUpdateMessage> {
		console.log('[CoreService] Getting stats');
		// TODO: invoke('stats_get')
		return { wordsCount: 0, wpm: 0, streak: 1 };
	}

	/**
	 * Сбрасывает статистику
	 */
	async resetStats(): Promise<void> {
		console.log('[CoreService] Resetting stats');
		// TODO: invoke('stats_reset')
	}

	/**
	 * Обновляет серию дней
	 * @param days - количество дней
	 */
	async updateStreak(days: number): Promise<void> {
		console.log('[CoreService] Updating streak:', days);
		// TODO: invoke('stats_update_streak', { days })
	}

	// ------------------------------------------------------------------------
	// Recording Commands
	// ------------------------------------------------------------------------

	/**
	 * Начинает запись
	 */
	async startRecording(): Promise<void> {
		console.log('[CoreService] Starting recording');
		// TODO: invoke('recording_start')
	}

	/**
	 * Останавливает запись
	 */
	async stopRecording(): Promise<void> {
		console.log('[CoreService] Stopping recording');
		// TODO: invoke('recording_stop')
	}

	/**
	 * Сохраняет запись
	 * @param transcription - текст транскрипции
	 * @param duration - длительность в мс
	 */
	async saveRecording(transcription: string, duration: number): Promise<void> {
		console.log('[CoreService] Saving recording:', { transcription, duration });
		// TODO: invoke('recording_save', { transcription, duration })
	}

	// ------------------------------------------------------------------------
	// Settings Commands
	// ------------------------------------------------------------------------

	/**
	 * Устанавливает выбранный микрофон
	 * @param deviceId - ID устройства или null
	 */
	async setMicrophone(deviceId: string | null): Promise<void> {
		console.log('[CoreService] Setting microphone:', deviceId);
		// TODO: invoke('settings_set_microphone', { deviceId })
	}

	/**
	 * Получает выбранный микрофон
	 */
	async getMicrophone(): Promise<string | null> {
		console.log('[CoreService] Getting microphone');
		// TODO: invoke('settings_get_microphone')
		return null;
	}

	// ------------------------------------------------------------------------
	// Cleanup
	// ------------------------------------------------------------------------

	/**
	 * Очищает все подписки и ресурсы
	 */
	async cleanup(): Promise<void> {
		console.log('[CoreService] Cleaning up...');
		
		for (const unlisten of this.unlisteners) {
			await unlisten();
		}
		
		this.unlisteners = [];
		console.log('[CoreService] Cleaned up');
	}
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const coreService = new CoreService();
