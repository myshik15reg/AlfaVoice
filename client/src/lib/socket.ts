/**
 * WebSocket Manager Module
 * Управление WebSocket соединением с сервером
 */

import { logger } from '$lib/services/logger';

export interface SocketConfig {
	url?: string;
	reconnectInterval?: number;
	maxReconnectAttempts?: number;
}

export interface SocketMessage {
	type: string;
	data?: any;
}

export interface TranscriptionMessage {
	type: 'transcription';
	text: string;
}

export interface ErrorMessage {
	type: 'error';
	message: string;
}

export interface PingMessage {
	type: 'ping';
}

export interface PongMessage {
	type: 'pong';
}

export type ServerMessage = TranscriptionMessage | ErrorMessage | PongMessage;

export class SocketManager {
	private ws: WebSocket | null = null;
	private url: string;
	private reconnectInterval: number;
	private maxReconnectAttempts: number;
	private reconnectAttempts = 0;
	private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
	private isManualClose = false;
	private lastErrorLogged = 0; // Для предотвращения спама ошибок
	private pingInterval: ReturnType<typeof setInterval> | null = null;
	private readonly pingIntervalMs = 30000; // 30 секунд

	private onOpenCallback: (() => void) | null = null;
	private onCloseCallback: (() => void) | null = null;
	private onErrorCallback: ((error: Event) => void) | null = null;
	private onMessageCallback: ((message: ServerMessage) => void) | null = null;

	constructor(config: SocketConfig = {}) {
		this.url = config.url || 'ws://localhost:8081/ws';
		this.reconnectInterval = config.reconnectInterval || 5000;
		this.maxReconnectAttempts = config.maxReconnectAttempts || 10;
	}

	/**
	 * Подключается к WebSocket серверу
	 */
	connect(): void {
		if (this.ws && this.ws.readyState === WebSocket.OPEN) {
			return;
		}

		this.isManualClose = false;
		this.ws = new WebSocket(this.url);

		this.ws.onopen = () => {
			logger.info(`Connected to ${this.url}`, 'Socket');
			this.reconnectAttempts = 0;
			this.startPing();
			if (this.onOpenCallback) {
				this.onOpenCallback();
			}
		};

		this.ws.onclose = (event) => {
			logger.info(`Disconnected (code: ${event.code}, reason: ${event.reason})`, 'Socket');
			this.stopPing();
			if (this.onCloseCallback) {
				this.onCloseCallback();
			}

			// Автоматическое переподключение
			if (!this.isManualClose && this.reconnectAttempts < this.maxReconnectAttempts) {
				this.scheduleReconnect();
			}
		};

		this.ws.onerror = (error) => {
			// Логируем ошибку только раз в 5 секунд, чтобы не спамить в консоль
			const now = Date.now();
			if (now - this.lastErrorLogged > 5000) {
				logger.warn('Connection error (server may be offline)', 'Socket');
				this.lastErrorLogged = now;
			}
			if (this.onErrorCallback) {
				this.onErrorCallback(error);
			}
		};

		this.ws.onmessage = (event) => {
			try {
				const message: ServerMessage = JSON.parse(event.data);
				
				// Игнорируем pong сообщения - они только для keepalive
				if (message.type === 'pong') {
					return;
				}
				
				if (this.onMessageCallback) {
					this.onMessageCallback(message);
				}
			} catch (error) {
				logger.error('Failed to parse message', error, 'Socket');
			}
		};
	}

	/**
	 * Отключается от сервера
	 */
	disconnect(): void {
		this.isManualClose = true;
		this.stopPing();

		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer);
			this.reconnectTimer = null;
		}

		if (this.ws) {
			this.ws.close();
			this.ws = null;
		}
	}

	/**
	 * Отправляет текстовое сообщение
	 */
	sendText(message: string): void {
		if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
			logger.warn('Cannot send message: not connected', 'Socket');
			return;
		}

		this.ws.send(message);
	}

	/**
	 * Отправляет бинарные данные (аудио)
	 */
	sendBinary(data: ArrayBuffer | Blob): void {
		if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
			logger.warn('Cannot send binary data: not connected', 'Socket');
			return;
		}

		this.ws.send(data);
	}

	/**
	 * Отправляет аудио данные
	 */
	sendAudio(audioBlob: Blob): void {
		// Конвертируем Blob в ArrayBuffer и отправляем
		audioBlob.arrayBuffer().then((buffer) => {
			this.sendBinary(buffer);
		});
	}

	/**
	 * Запускает периодическую отправку ping сообщений для keepalive
	 */
	private startPing(): void {
		// Очищаем существующий интервал если есть
		this.stopPing();

		this.pingInterval = setInterval(() => {
			if (this.ws && this.ws.readyState === WebSocket.OPEN) {
				const pingMessage: PingMessage = { type: 'ping' };
				this.ws.send(JSON.stringify(pingMessage));
				console.log('[Socket] Ping sent');
			}
		}, this.pingIntervalMs);
	}

	/**
	 * Останавливает отправку ping сообщений
	 */
	private stopPing(): void {
		if (this.pingInterval) {
			clearInterval(this.pingInterval);
			this.pingInterval = null;
		}
	}

	/**
	 * Планирует переподключение
	 */
	private scheduleReconnect(): void {
		if (this.reconnectTimer) {
			return;
		}

		this.reconnectAttempts++;
		console.log(
			`[Socket] Reconnecting in ${this.reconnectInterval}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
		);

		this.reconnectTimer = setTimeout(() => {
			this.reconnectTimer = null;
			this.connect();
		}, this.reconnectInterval);
	}

	/**
	 * Проверяет, подключен ли сокет
	 */
	isConnected(): boolean {
		return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
	}

	/**
	 * Возвращает состояние соединения
	 */
	getReadyState(): number {
		return this.ws?.readyState ?? WebSocket.CLOSED;
	}

	/**
	 * Устанавливает callback для события открытия соединения
	 */
	onOpen(callback: () => void): void {
		this.onOpenCallback = callback;
	}

	/**
	 * Устанавливает callback для события закрытия соединения
	 */
	onClose(callback: () => void): void {
		this.onCloseCallback = callback;
	}

	/**
	 * Устанавливает callback для события ошибки
	 */
	onError(callback: (error: Event) => void): void {
		this.onErrorCallback = callback;
	}

	/**
	 * Устанавливает callback для получения сообщений
	 */
	onMessage(callback: (message: ServerMessage) => void): void {
		this.onMessageCallback = callback;
	}

	/**
	 * Очищает все callbacks
	 */
	clearCallbacks(): void {
		this.onOpenCallback = null;
		this.onCloseCallback = null;
		this.onErrorCallback = null;
		this.onMessageCallback = null;
	}
}

/**
 * Создает экземпляр SocketManager с настройками по умолчанию
 */
export function createSocketManager(config?: SocketConfig): SocketManager {
	return new SocketManager(config);
}
