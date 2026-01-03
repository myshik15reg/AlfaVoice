/**
 * Audio Capture Module
 * Обертка над Web Audio API для захвата аудио с микрофона
 */

import { logger } from '$lib/services/logger';

export interface AudioConfig {
	sampleRate?: number;
	channelCount?: number;
	echoCancellation?: boolean;
	noiseSuppression?: boolean;
	autoGainControl?: boolean;
	deviceId?: string;
}

export interface AudioLevel {
	level: number; // 0.0 - 1.0
	timestamp: number;
}

export class AudioCapture {
	private _audioContext: AudioContext | null = null;
	private _mediaStream: MediaStream | null = null;
	private _analyser: AnalyserNode | null = null;
	private source: MediaStreamAudioSourceNode | null = null;
	private mediaRecorder: MediaRecorder | null = null;
	private isRecording = false;
	private onDataCallback: ((data: Blob) => void) | null = null;
	private onLevelCallback: ((level: AudioLevel) => void) | null = null;
	private levelInterval: ReturnType<typeof setInterval> | null = null;

	constructor(private config: AudioConfig = {}) {}

	/**
	 * Инициализирует аудио контекст и запрашивает доступ к микрофону
	 */
	async initialize(): Promise<void> {
		if (this._audioContext) {
			return;
		}

		try {
			// Создаем AudioContext
			this._audioContext = new AudioContext({
				sampleRate: this.config.sampleRate || 44100,
			});

			// Формируем audio constraints
			const audioConstraints: MediaTrackConstraints = {
				channelCount: this.config.channelCount || 1,
				echoCancellation: this.config.echoCancellation ?? true,
				noiseSuppression: this.config.noiseSuppression ?? true,
				autoGainControl: this.config.autoGainControl ?? true,
			};

			// Если указан deviceId, используем { exact: ... } для точного выбора
			if (this.config.deviceId) {
				audioConstraints.deviceId = { exact: this.config.deviceId };
				logger.info(`Initializing with specific device: ${this.config.deviceId}`, 'AudioCapture');
			} else {
				logger.info('Initializing with default device', 'AudioCapture');
			}

			// Запрашиваем доступ к микрофону
			this._mediaStream = await navigator.mediaDevices.getUserMedia({
				audio: audioConstraints,
			});

			// Создаем анализатор для измерения уровня громкости
			this._analyser = this._audioContext.createAnalyser();
			this._analyser.fftSize = 256;
			this._analyser.smoothingTimeConstant = 0.8;

			// Подключаем источник к анализатору
			this.source = this._audioContext.createMediaStreamSource(this._mediaStream);
			this.source.connect(this._analyser);
		} catch (error) {
			// Если указан deviceId и произошла ошибка, пробуем с дефолтным устройством
			if (this.config.deviceId && error instanceof Error) {
				logger.warn(`Failed to initialize with specific device, trying default: ${error.message}`, 'AudioCapture');
				
				// Очищаем ресурсы
				this.cleanup();
				
				// Пробуем снова без deviceId (дефолтное устройство)
				try {
					this._audioContext = new AudioContext({
						sampleRate: this.config.sampleRate || 44100,
					});

					this._mediaStream = await navigator.mediaDevices.getUserMedia({
						audio: {
							channelCount: this.config.channelCount || 1,
							echoCancellation: this.config.echoCancellation ?? true,
							noiseSuppression: this.config.noiseSuppression ?? true,
							autoGainControl: this.config.autoGainControl ?? true,
						},
					});

					this._analyser = this._audioContext.createAnalyser();
					this._analyser.fftSize = 256;
					this._analyser.smoothingTimeConstant = 0.8;

					this.source = this._audioContext.createMediaStreamSource(this._mediaStream);
					this.source.connect(this._analyser);
					
					logger.warn('Successfully initialized with default device', 'AudioCapture');
					return;
				} catch (retryError) {
					this.cleanup();
					logger.error(`Failed to initialize audio with device ${this.config.deviceId}`, retryError, 'AudioCapture');
					throw new Error(`Failed to initialize audio with device ${this.config.deviceId}: ${error}. Also failed with default device: ${retryError}`);
				}
			}
			
			this.cleanup();
			logger.error('Failed to initialize audio', error, 'AudioCapture');
			throw new Error(`Failed to initialize audio: ${error}`);
		}
	}

	/**
	 * Начинает запись аудио
	 */
	async startRecording(onData: (data: Blob) => void): Promise<void> {
		if (!this._mediaStream || !this._audioContext) {
			throw new Error('Audio not initialized. Call initialize() first.');
		}

		if (this.isRecording) {
			return;
		}

		this.onDataCallback = onData;

		// Создаем MediaRecorder для записи
		const mimeType = this.getSupportedMimeType();
		this.mediaRecorder = new MediaRecorder(this._mediaStream, { mimeType });

		// Обрабатываем данные записи
		this.mediaRecorder.ondataavailable = (event) => {
			if (event.data.size > 0 && this.onDataCallback) {
				this.onDataCallback(event.data);
			}
		};

		this.mediaRecorder.start(100); // Отправляем данные каждые 100мс
		this.isRecording = true;
	}

	/**
	 * Останавливает запись
	 */
	stopRecording(): void {
		if (!this.isRecording || !this.mediaRecorder) {
			return;
		}

		this.mediaRecorder.stop();
		this.isRecording = false;
	}

	/**
	 * Начинает отслеживание уровня громкости
	 */
	startLevelMonitoring(onLevel: (level: AudioLevel) => void, intervalMs = 100): void {
		if (!this._analyser) {
			throw new Error('Audio not initialized. Call initialize() first.');
		}

		this.onLevelCallback = onLevel;

		this.levelInterval = setInterval(() => {
			const level = this.getCurrentLevel();
			if (this.onLevelCallback) {
				this.onLevelCallback(level);
			}
		}, intervalMs);
	}

	/**
	 * Останавливает отслеживание уровня громкости
	 */
	stopLevelMonitoring(): void {
		if (this.levelInterval) {
			clearInterval(this.levelInterval);
			this.levelInterval = null;
		}
	}

	/**
	 * Возвращает текущий уровень громкости
	 */
	getCurrentLevel(): AudioLevel {
		if (!this._analyser) {
			return { level: 0, timestamp: Date.now() };
		}

		const dataArray = new Uint8Array(this._analyser.frequencyBinCount);
		this._analyser.getByteFrequencyData(dataArray);

		// Вычисляем средний уровень
		const sum = dataArray.reduce((a, b) => a + b, 0);
		const level = sum / dataArray.length / 255;

		return { level, timestamp: Date.now() };
	}

	/**
	 * Возвращает поддерживаемый MIME тип для MediaRecorder
	 */
	private getSupportedMimeType(): string {
		const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/ogg'];

		for (const type of types) {
			if (MediaRecorder.isTypeSupported(type)) {
				return type;
			}
		}

		return '';
	}

	/**
	 * Освобождает ресурсы
	 */
	cleanup(): void {
		this.stopRecording();
		this.stopLevelMonitoring();

		if (this._mediaStream) {
			this._mediaStream.getTracks().forEach((track) => track.stop());
			this._mediaStream = null;
		}

		if (this.source) {
			this.source.disconnect();
			this.source = null;
		}

		if (this._audioContext && this._audioContext.state !== 'closed') {
			this._audioContext.close();
			this._audioContext = null;
		}

		this._analyser = null;
		this.mediaRecorder = null;
		this.onDataCallback = null;
		this.onLevelCallback = null;
	}

	/**
	 * Проверяет, инициализирован ли аудио
	 */
	isInitialized(): boolean {
		return this._audioContext !== null && this._mediaStream !== null;
	}

	/**
	 * Проверяет, идет ли запись
	 */
	isRecordingActive(): boolean {
		return this.isRecording;
	}

	/**
	 * Возвращает media stream для внешнего использования
	 */
	get mediaStream(): MediaStream | null {
		return this._mediaStream;
	}

	/**
	 * Возвращает audio context для внешнего использования
	 */
	get audioContext(): AudioContext | null {
		return this._audioContext;
	}

	/**
	 * Возвращает analyser node для внешнего использования
	 */
	get analyser(): AnalyserNode | null {
		return this._analyser;
	}

	/**
	 * Возвращает список доступных аудио устройств (микрофонов)
	 * Если у устройств нет labels (пустые из-за отсутствия прав доступа),
	 * сначала запрашивает права через getUserMedia
	 */
	async getDevices(): Promise<MediaDeviceInfo[]> {
		// Получаем список устройств
		let devices = await navigator.mediaDevices.enumerateDevices();
		
		// Фильтруем только аудио входные устройства (микрофоны)
		const audioInputs = devices.filter(device => device.kind === 'audioinput');
		
		// Проверяем, есть ли у устройств labels
		const hasLabels = audioInputs.some(device => device.label && device.label.trim() !== '');
		
		if (!hasLabels && audioInputs.length > 0) {
			// Если labels пустые, запрашиваем права доступа
			logger.info('Labels empty, requesting microphone permission...', 'AudioCapture');
			
			try {
				// Запрашиваем доступ к микрофону
				const tempStream = await navigator.mediaDevices.getUserMedia({ audio: true });
				
				// Сразу останавливаем треки (нам нужен только доступ)
				tempStream.getTracks().forEach(track => track.stop());
				
				// Теперь получаем устройства снова - labels должны быть заполнены
				devices = await navigator.mediaDevices.enumerateDevices();
				logger.info('Permission granted, devices refreshed', 'AudioCapture');
			} catch (error) {
				logger.error('Failed to request microphone permission', error, 'AudioCapture');
				throw new Error(`Failed to request microphone permission: ${error}`);
			}
		}
		
		// Возвращаем только аудио входные устройства
		const audioInputDevices = devices.filter(device => device.kind === 'audioinput');
		
		logger.info(`Found ${audioInputDevices.length} audio devices`, 'AudioCapture');
		audioInputDevices.forEach(d => {
			logger.info(`  - ${d.label || '(empty)'} (ID: ${d.deviceId})`, 'AudioCapture');
		});
		
		return audioInputDevices;
	}
}

/**
	* Создает экземпляр AudioCapture с настройками по умолчанию
	*/
export function createAudioCapture(config?: AudioConfig): AudioCapture {
	return new AudioCapture(config);
}
