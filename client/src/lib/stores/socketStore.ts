/**
 * Socket Store (Refactored)
 * Svelte store для управления состоянием WebSocket соединения
 * 
 * ПРИНЦИПЫ:
 * - Только хранение состояния (State)
 * - Никакой бизнес-логики
 * - Логика выполняется в Rust через CoreService
 * - Состояние обновляется через события от Rust
 */

import { writable, derived } from 'svelte/store';
import { coreService, ConnectionStatus, type ConnectionStatusMessage, type TranscriptionMessage, type ErrorMessage } from '$lib/core';

// ============================================================================
// Состояние (State)
// ============================================================================

interface SocketState {
	status: ConnectionStatus;
	transcription: string;
	lastError: string | null;
}

const initialState: SocketState = {
	status: ConnectionStatus.Disconnected,
	transcription: '',
	lastError: null
};

// Базовый store с состоянием
const { subscribe, set, update } = writable<SocketState>(initialState);

// ============================================================================
// Public Stores (для компонентов)
// ============================================================================

/**
 * Статус соединения (enum)
 */
export const connectionStatus = derived(
	{ subscribe },
	($state) => $state.status
);

/**
 * Флаг: подключен ли сокет
 */
export const isConnected = derived(
	{ subscribe },
	($state) => $state.status === ConnectionStatus.Connected
);

/**
 * Текущая транскрипция
 */
export const transcription = derived(
	{ subscribe },
	($state) => $state.transcription
);

/**
 * Последняя ошибка
 */
export const lastError = derived(
	{ subscribe },
	($state) => $state.lastError
);

// ============================================================================
// Внутренние функции обновления состояния
// ============================================================================

/**
 * Обновляет статус соединения (вызывается из CoreService)
 */
function updateStatus(status: ConnectionStatus, error?: string) {
	update((state) => ({
		...state,
		status,
		lastError: error || null
	}));
}

/**
 * Обновляет транскрипцию (вызывается из CoreService)
 */
function updateTranscription(text: string) {
	update((state) => ({
		...state,
		transcription: text
	}));
}

/**
 * Обновляет ошибку (вызывается из CoreService)
 */
function updateError(error: string) {
	update((state) => ({
		...state,
		lastError: error
	}));
}

// ============================================================================
// Интеграция с CoreService
// ============================================================================

/**
 * Инициализирует подписку на события от Rust Core
 * Должен вызываться один раз при старте приложения
 */
export async function initializeSocketStore(): Promise<void> {
	console.log('[socketStore] Initializing...');

	// Подписываемся на события от CoreService
	// В будущем это будет через события от Rust
	// Сейчас оставляем заглушки для совместимости с текущей реализацией

	console.log('[socketStore] Initialized');
}

// ============================================================================
// Public Actions (делегируют в CoreService)
// ============================================================================

/**
 * Подключается к WebSocket серверу
 */
export async function connect(url?: string): Promise<void> {
	const wsUrl = url || import.meta.env.VITE_WS_URL || 'ws://localhost:8081/ws';
	await coreService.connectWebSocket(wsUrl);
}

/**
 * Отключается от WebSocket сервера
 */
export async function disconnect(): Promise<void> {
	await coreService.disconnectWebSocket();
}

/**
 * Отправляет текстовое сообщение
 */
export async function sendText(message: string): Promise<void> {
	await coreService.sendText(message);
}

/**
 * Отправляет аудио данные
 */
export async function sendAudio(audioData: Float32Array): Promise<void> {
	await coreService.sendAudio(audioData);
}

// ============================================================================
// Cleanup
// ============================================================================

/**
 * Очищает ресурсы
 */
export async function cleanup(): Promise<void> {
	console.log('[socketStore] Cleaning up...');
	set(initialState);
}

// ============================================================================
// Экспорт внутреннего store (для тестирования)
// ============================================================================

export { subscribe };
