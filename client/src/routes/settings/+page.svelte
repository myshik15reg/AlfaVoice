<script lang="ts">
	import { onMount } from 'svelte';
	import Header from '$lib/components/Header.svelte';
	import MicrophoneDialog from '$lib/components/MicrophoneDialog.svelte';
	import { settingsStore } from '$lib/stores/settingsStore';
	import { AudioCapture } from '$lib/audio';
	import * as Icons from 'lucide-svelte';

	let showMicrophoneDialog = false;
	let currentMicrophoneLabel = 'Default';
	let loadingLabel = false;

	async function getCurrentMicrophoneLabel() {
		loadingLabel = true;
		try {
			const deviceId = $settingsStore.selectedMicrophoneId;
			
			if (!deviceId) {
				currentMicrophoneLabel = 'Default';
				return;
			}

			// Используем AudioCapture.getDevices() для получения списка микрофонов
			// Этот метод автоматически запрашивает права доступа, если labels пустые
			const audioCapture = new AudioCapture();
			const devices = await audioCapture.getDevices();
			const device = devices.find((d) => d.deviceId === deviceId);
			
			if (device?.label) {
				currentMicrophoneLabel = device.label;
			} else {
				currentMicrophoneLabel = `Microphone ${deviceId.slice(0, 8)}...`;
			}
		} catch (err) {
			console.error('Failed to get microphone label:', err);
			currentMicrophoneLabel = 'Default';
		} finally {
			loadingLabel = false;
		}
	}

	onMount(() => {
		getCurrentMicrophoneLabel();
	});

	// Обновляем метку при изменении выбранного микрофона
	$: if ($settingsStore.selectedMicrophoneId) {
		getCurrentMicrophoneLabel();
	}
</script>

<div class="page-container">
	<Header />
	
	<div class="content">
		<div class="settings-container">
			<h1 class="page-title">Настройки</h1>
			
			<!-- Microphone Section -->
			<section class="settings-section">
				<div class="section-header">
					<div class="section-title">
						<svelte:component this={Icons.Mic} size={20} class="section-icon" />
						<h2>Микрофон</h2>
					</div>
				</div>
				
				<div class="setting-item">
					<div class="setting-info">
						<label class="setting-label">Выбранный микрофон</label>
						<p class="setting-description">
							Выберите устройство для записи голоса
						</p>
					</div>
					<div class="setting-control">
						{#if loadingLabel}
							<div class="microphone-label loading">Загрузка...</div>
						{:else}
							<div class="microphone-label">
								<svelte:component this={Icons.Mic} size={16} class="mic-icon" />
								<span>{currentMicrophoneLabel}</span>
							</div>
						{/if}
						<button class="change-button" on:click={() => (showMicrophoneDialog = true)}>
							Изменить
						</button>
					</div>
				</div>
			</section>

			<!-- Other Settings Sections (placeholders for future) -->
			<section class="settings-section">
				<div class="section-header">
					<div class="section-title">
						<svelte:component this={Icons.Volume2} size={20} class="section-icon" />
						<h2>Аудио</h2>
					</div>
				</div>
				<div class="setting-item">
					<p class="coming-soon">Скоро будет доступно</p>
				</div>
			</section>

			<section class="settings-section">
				<div class="section-header">
					<div class="section-title">
						<svelte:component this={Icons.Globe} size={20} class="section-icon" />
						<h2>Язык</h2>
					</div>
				</div>
				<div class="setting-item">
					<p class="coming-soon">Скоро будет доступно</p>
				</div>
			</section>
		</div>
	</div>
</div>

<!-- Microphone Selection Dialog -->
<MicrophoneDialog bind:open={showMicrophoneDialog} />

<style>
	.page-container {
		padding: 2rem;
		max-width: 1000px;
		margin: 0 auto;
	}

	.content {
		margin-top: 2rem;
	}

	.settings-container {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.page-title {
		font-size: 2rem;
		font-weight: 600;
		margin: 0;
		color: var(--text-primary);
	}

	.settings-section {
		background-color: white;
		border-radius: 12px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		padding: 1.5rem;
	}

	.section-header {
		margin-bottom: 1.5rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.section-title {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.section-title h2 {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0;
		color: var(--text-primary);
	}

	.section-icon {
		color: var(--primary-color);
	}

	.setting-item {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 2rem;
		padding: 1rem 0;
	}

	.setting-info {
		flex: 1;
	}

	.setting-label {
		display: block;
		font-size: 1rem;
		font-weight: 500;
		color: var(--text-primary);
		margin-bottom: 0.25rem;
	}

	.setting-description {
		font-size: 0.875rem;
		color: var(--text-muted);
		margin: 0;
	}

	.setting-control {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-shrink: 0;
	}

	.microphone-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background-color: #f3f4f6;
		border-radius: 6px;
		font-size: 0.875rem;
		color: var(--text-primary);
		min-width: 200px;
	}

	.microphone-label.loading {
		color: var(--text-muted);
	}

	.mic-icon {
		color: var(--text-muted);
	}

	.change-button {
		padding: 0.5rem 1rem;
		background-color: var(--primary-color);
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.change-button:hover {
		background-color: #2563eb;
	}

	.change-button:active {
		background-color: #1d4ed8;
	}

	.coming-soon {
		font-size: 0.875rem;
		color: var(--text-muted);
		font-style: italic;
		margin: 0;
	}

	@media (max-width: 640px) {
		.setting-item {
			flex-direction: column;
			gap: 1rem;
		}

		.setting-control {
			width: 100%;
			justify-content: space-between;
		}

		.microphone-label {
			flex: 1;
		}
	}
</style>
