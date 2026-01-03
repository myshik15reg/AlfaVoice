<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { isTauri, safeInvoke, safeListen } from '$lib/tauri';
	import { isConnected, transcription, connect, disconnect, sendAudio, cleanup } from '$lib/stores/socketStore';
	import { updateStats, startRecordingTracking, stopRecordingTracking } from '$lib/stores/statsStore';
	import { recordingsStore } from '$lib/stores/recordingsStore';
	import { settingsStore } from '$lib/stores/settingsStore';
	import { AudioCapture } from '$lib/audio';
	import Header from '$lib/components/Header.svelte';
	import Banner from '$lib/components/Banner.svelte';
	import QuickAccess from '$lib/components/QuickAccess.svelte';
	import HistoryList from '$lib/components/HistoryList.svelte';
	import * as Icons from 'lucide-svelte';

	console.log('[DEBUG] +page.svelte: Script block started');

	// Состояние записи
	let isRecording = false;
	let audioLevel = 0;
	let hotkey = 'Ctrl+Super';
	let recordingStartTime: number | null = null;
	
	// Защита от undefined при инициализации
	$: safeAudioLevel = audioLevel || 0;
	
	// Хранение предыдущей транскрипции для вычисления дельты слов
	let previousTranscription = '';

	// Обновляем статистику при изменении транскрипции
	$: if ($transcription) {
		updateStats($transcription, previousTranscription);
		previousTranscription = $transcription;
	}

	// Audio Context для визуализации уровня
	let audioContext: AudioContext | null = null;
	let analyser: AnalyserNode | null = null;
	let mediaStream: MediaStream | null = null;
	let audioCapture: AudioCapture | null = null;

	// Функция для отписки от Tauri событий
	let unlistenHotkey: (() => void) | null = null;

	onMount(async () => {
		console.log('[DEBUG] +page.svelte: onMount called');
		console.log('[DEBUG] +page.svelte: isTauri() =', await isTauri());
		
		// Подключаемся к серверу через socketStore
		console.log('[DEBUG] +page.svelte: Connecting to WebSocket');
		connect();

		// Регистрируем горячую клавишу через Tauri (только в Tauri окружении)
		if (await isTauri()) {
			console.log('[DEBUG] +page.svelte: Registering hotkey');
			const result = await safeInvoke('register_hotkey', {
				shortcut: hotkey,
				action: 'toggle_recording'
			});
			if (result !== null) {
				console.log('Hotkey registered:', hotkey);
			}
		}

		// Слушаем события от Tauri (только в Tauri окружении)
		console.log('[DEBUG] +page.svelte: Setting up Tauri event listener');
		unlistenHotkey = await safeListen('hotkey-pressed', (event: any) => {
			if (event.payload === 'toggle_recording') {
				toggleRecording();
			}
		});
	});

	onDestroy(() => {
		stopRecording();
		cleanup();
		
		// Отписываемся от Tauri событий
		if (unlistenHotkey) {
			unlistenHotkey();
		}
	});

	async function toggleRecording() {
		if (isRecording) {
			stopRecording();
		} else {
			await startRecording();
		}
	}

	/**
	 * Определяет поддерживаемый MIME тип для MediaRecorder
	 * @returns Поддерживаемый MIME тип или null
	 */
	function getSupportedMimeType(): string | null {
		const mimeTypes = [
			'audio/webm;codecs=opus',
			'audio/webm',
			'audio/ogg;codecs=opus',
			'audio/ogg'
		];

		for (const mimeType of mimeTypes) {
			if (MediaRecorder.isTypeSupported(mimeType)) {
				console.log('[DEBUG] Supported MIME type:', mimeType);
				return mimeType;
			}
		}

		console.warn('[WARN] No supported MIME type found');
		return null;
	}

	async function validateDeviceId(deviceId: string | null): Promise<string | null> {
		if (!deviceId) {
			return null;
		}

		try {
			const audioCapture = new AudioCapture();
			const devices = await audioCapture.getDevices();
			const deviceExists = devices.some(d => d.deviceId === deviceId);
			
			if (!deviceExists) {
				console.warn('[WARN] Selected device ID not found in available devices:', deviceId);
				// Сбрасываем невалидный deviceId
				settingsStore.setSelectedMicrophoneId(null);
				return null;
			}
			
			return deviceId;
		} catch (error) {
			console.error('[ERROR] Failed to validate device ID:', error);
			return null;
		}
	}

	async function startRecording() {
		try {
			// Получаем deviceId из настроек
			const selectedDeviceId = $settingsStore.selectedMicrophoneId;
			console.log('[DEBUG] Selected microphone ID:', selectedDeviceId);
			
			// Валидируем deviceId перед использованием
			const validDeviceId = await validateDeviceId(selectedDeviceId);
			console.log('[DEBUG] Validated device ID:', validDeviceId);
			
			// Используем AudioCapture для инициализации аудио
			audioCapture = new AudioCapture({
				deviceId: validDeviceId || undefined,
				channelCount: 1,
				echoCancellation: true,
				noiseSuppression: true,
				autoGainControl: true
			});
			
			await audioCapture.initialize();
			console.log('[DEBUG] Audio capture initialized successfully');
			
			// Получаем media stream, audio context и analyser через публичные геттеры
			mediaStream = audioCapture.mediaStream;
			audioContext = audioCapture.audioContext;
			analyser = audioCapture.analyser;

			// Определяем поддерживаемый MIME тип
			const mimeType = getSupportedMimeType();
			if (!mimeType) {
				alert('Ваш браузер не поддерживает ни один из поддерживаемых форматов аудио. Пожалуйста, используйте современный браузер (Chrome, Firefox, Edge).');
				stopRecording();
				return;
			}

			// Начинаем отправку аудио на сервер через socketStore
			if (!mediaStream) {
				throw new Error('Media stream is null');
			}
			const mediaRecorder = new MediaRecorder(mediaStream, { mimeType });
			
			// Обработка ошибок MediaRecorder
			mediaRecorder.onerror = (event: Event) => {
				const errorEvent = event as ErrorEvent;
				console.error('[ERROR] MediaRecorder error:', errorEvent.error);
				alert(`Ошибка записи аудио: ${errorEvent.error?.message || 'Неизвестная ошибка'}`);
				stopRecording();
			};
			
			mediaRecorder.ondataavailable = (event) => {
				if (event.data.size > 0) {
					// Проверяем подключение WebSocket перед отправкой
					if (!$isConnected) {
						console.warn('[WARN] WebSocket not connected, audio data lost');
						alert('Сервер отключен. Аудиоданные не будут отправлены. Пожалуйста, подключитесь к серверу.');
						return;
					}
					sendAudio(event.data);
				}
			};
			mediaRecorder.start(100); // Отправляем каждые 100мс

			// Начинаем отслеживание статистики
			startRecordingTracking();
			recordingStartTime = Date.now();

			isRecording = true;
			updateAudioLevel();
		} catch (error) {
			console.error('Failed to start recording:', error);
			
			if (error instanceof Error) {
				switch (error.name) {
					case 'NotAllowedError':
						alert('Доступ к микрофону запрещён. Пожалуйста, разрешите доступ в настройках браузера.');
						break;
					case 'NotFoundError':
						alert('Микрофон не найден. Пожалуйста, подключите микрофон и попробуйте снова.');
						break;
					case 'NotReadableError':
						alert('Не удалось получить доступ к микрофону. Возможно, другое приложение использует микрофон.');
						break;
					case 'OverconstrainedError':
						alert('Устройство не соответствует требуемым ограничениям. Попробуйте другой микрофон.');
						break;
					case 'SecurityError':
						alert('Ошибка безопасности при доступе к микрофону. Проверьте настройки браузера.');
						break;
					default:
						alert(`Не удалось получить доступ к микрофону: ${error.message}`);
				}
			} else {
				alert('Не удалось получить доступ к микрофону: неизвестная ошибка');
			}
		}
	}

	function stopRecording() {
		// Очищаем AudioCapture, если он был инициализирован
		if (audioCapture) {
			audioCapture.cleanup();
			audioCapture = null;
		} else {
			// Fallback для ручной очистки (на случай если AudioCapture не использовался)
			if (mediaStream) {
				mediaStream.getTracks().forEach((track) => track.stop());
				mediaStream = null;
			}
			if (audioContext) {
				audioContext.close();
				audioContext = null;
			}
		}
		
		// Останавливаем отслеживание статистики
		stopRecordingTracking();

		// Сохраняем запись, если есть транскрипция
		if (recordingStartTime && $transcription) {
			const duration = (Date.now() - recordingStartTime) / 1000; // в секундах
			recordingsStore.addRecording($transcription, duration);
		}
		recordingStartTime = null;
		
		isRecording = false;
		audioLevel = 0;
	}

	function updateAudioLevel() {
		if (!isRecording || !analyser) return;

		try {
			const freqBinCount = analyser.frequencyBinCount || 256;
			const dataArray = new Uint8Array(freqBinCount);
			analyser.getByteFrequencyData(dataArray);

			// Вычисляем средний уровень громкости
			const sum = dataArray.reduce((a, b) => a + b, 0);
			audioLevel = sum / dataArray.length / 255;

			requestAnimationFrame(updateAudioLevel);
		} catch (error) {
			console.error('Error updating audio level:', error);
			audioLevel = 0;
		}
	}

	function clearTranscription() {
		transcription.set('');
		previousTranscription = '';
	}
</script>

<div class="dashboard">
	<!-- Header -->
	<Header />

	<!-- Статус соединения -->
	<div class="status-bar">
		<div class="status-item">
			{#if $isConnected}
				<svelte:component this={Icons.Wifi} size={16} class="status-icon connected" />
				<span class="status-text">Сервер подключен</span>
			{:else}
				<svelte:component this={Icons.WifiOff} size={16} class="status-icon disconnected" />
				<span class="status-text">Сервер отключен</span>
			{/if}
		</div>
		<div class="status-item">
			<span class="hotkey-badge">{hotkey}</span>
		</div>
	</div>

	<!-- Banner -->
	<Banner on:start-recording={startRecording} />

	<!-- Quick Access -->
	<QuickAccess />

	<!-- Панель транскрипции -->
	<div class="transcription-panel">
		<div class="panel-header">
			<h2>Транскрипция</h2>
			<div class="panel-actions">
				<button
					class="record-button {isRecording ? 'recording' : ''}"
					on:click={toggleRecording}
					disabled={!$isConnected}
					aria-label={isRecording ? 'Остановить запись' : 'Начать запись'}
				>
					{#if isRecording}
						<svelte:component this={Icons.Square} size={18} />
						<span>Остановить</span>
					{:else}
						<svelte:component this={Icons.Mic} size={18} />
						<span>Записать</span>
					{/if}
				</button>
				<button
					class="clear-button"
					on:click={clearTranscription}
					disabled={!$transcription}
					aria-label="Очистить"
				>
					Очистить
				</button>
			</div>
		</div>
		<div class="transcription-content">
			{#if $transcription}
				<p>{$transcription}</p>
			{:else}
				<p class="placeholder">Нажмите кнопку записи или используйте горячую клавишу {hotkey}</p>
			{/if}
		</div>
		<!-- Индикатор уровня звука -->
		{#if isRecording}
			<div class="audio-level">
				<div class="audio-level-bar" style="width: {safeAudioLevel * 100}%"></div>
			</div>
		{/if}
	</div>

	<!-- History List -->
	<HistoryList />
</div>

<style>
	.dashboard {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		padding: 2rem;
		max-width: 1000px;
		margin: 0 auto;
	}

	.status-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: var(--bg-tertiary);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 0.75rem 1rem;
	}

	.status-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.status-icon {
		flex-shrink: 0;
	}

	.status-icon.connected {
		color: var(--success-color);
	}

	.status-icon.disconnected {
		color: var(--error-color);
	}

	.status-text {
		font-size: 0.875rem;
		color: var(--text-secondary);
		font-weight: 500;
	}

	.hotkey-badge {
		background: var(--bg-hover);
		border: 1px solid var(--border);
		border-radius: 4px;
		padding: 0.25rem 0.5rem;
		font-size: 0.75rem;
		color: var(--text-secondary);
		font-weight: 600;
	}

	.transcription-panel {
		background: var(--bg-tertiary);
		border: 1px solid var(--border);
		border-radius: 12px;
		overflow: hidden;
	}

	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid var(--border);
	}

	.panel-header h2 {
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0;
	}

	.panel-actions {
		display: flex;
		gap: 0.5rem;
	}

	.record-button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: var(--accent);
		color: white;
		border: none;
		border-radius: 8px;
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		font-family: inherit;
	}

	.record-button:hover:not(:disabled) {
		background: var(--accent-hover);
	}

	.record-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.record-button.recording {
		background: var(--error-color);
		animation: pulse-ring 1s infinite;
	}

	@keyframes pulse-ring {
		0% {
			box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
		}
		50% {
			box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);
		}
		100% {
			box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
		}
	}

	.clear-button {
		background: var(--bg-hover);
		color: var(--text-primary);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		font-family: inherit;
	}

	.clear-button:hover:not(:disabled) {
		background: var(--border-hover);
	}

	.clear-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.transcription-content {
		padding: 1.5rem;
		min-height: 150px;
		max-height: 300px;
		overflow-y: auto;
	}

	.transcription-content p {
		line-height: 1.8;
		color: var(--text-primary);
	}

	.placeholder {
		color: var(--text-muted) !important;
		font-style: italic;
	}

	.audio-level {
		height: 4px;
		background: var(--bg-secondary);
		border-radius: 2px;
		overflow: hidden;
	}

	.audio-level-bar {
		height: 100%;
		background: linear-gradient(90deg, var(--accent), var(--accent-hover));
		transition: width 0.1s;
	}

	@media (max-width: 768px) {
		.dashboard {
			padding: 1rem;
		}

		.panel-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}

		.panel-actions {
			width: 100%;
		}

		.record-button,
		.clear-button {
			flex: 1;
		}
	}
</style>
