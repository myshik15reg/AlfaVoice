<script lang="ts">
	import { onMount } from 'svelte';
	import { settingsStore } from '$lib/stores/settingsStore';
	import { AudioCapture } from '$lib/audio';

	export let open = false;

	interface MediaDeviceInfo {
		deviceId: string;
		label: string;
		kind: string;
	}

	let devices: MediaDeviceInfo[] = [];
	let loading = false;
	let error: string | null = null;

	async function loadDevices() {
		loading = true;
		error = null;
		devices = [];

		try {
			// Используем AudioCapture.getDevices() для получения списка микрофонов
			// Этот метод автоматически запрашивает права доступа, если labels пустые
			const audioCapture = new AudioCapture();
			const mediaDevices = await audioCapture.getDevices();
			
			// Преобразуем в наш формат
			devices = mediaDevices.map((device) => ({
				deviceId: device.deviceId,
				label: device.label || `Microphone ${device.deviceId.slice(0, 8)}...`,
				kind: device.kind
			}));
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load microphones';
		} finally {
			loading = false;
		}
	}

	function selectDevice(deviceId: string) {
		console.log('[DEBUG] Selected device:', deviceId);
		settingsStore.setSelectedMicrophoneId(deviceId);
		open = false;
	}

	onMount(() => {
		if (open) {
			loadDevices();
		}
	});

	$: if (open && devices.length === 0) {
		loadDevices();
	}
</script>

{#if open}
	<div class="dialog-overlay" on:click={() => (open = false)}>
		<div class="dialog" on:click|stopPropagation>
			<div class="dialog-header">
				<h2>Select Microphone</h2>
				<button class="close-button" on:click={() => (open = false)} aria-label="Close">
					✕
				</button>
			</div>

			<div class="dialog-content">
				{#if loading}
					<div class="loading">Loading microphones...</div>
				{:else if error}
					<div class="error">{error}</div>
				{:else if devices.length === 0}
					<div class="empty">No microphones found</div>
				{:else}
					<ul class="device-list">
						{#each devices as device (device.deviceId)}
							<li
								class="device-item"
								class:selected={$settingsStore.selectedMicrophoneId === device.deviceId}
								on:click={() => selectDevice(device.deviceId)}
								role="button"
								tabindex="0"
								on:keydown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault();
										selectDevice(device.deviceId);
									}
								}}
							>
								<div class="device-info">
									<span class="device-label">{device.label}</span>
									{#if $settingsStore.selectedMicrophoneId === device.deviceId}
										<span class="selected-indicator">✓</span>
									{/if}
								</div>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.dialog-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.dialog {
		background-color: white;
		border-radius: 8px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
		width: 90%;
		max-width: 500px;
		max-height: 80vh;
		display: flex;
		flex-direction: column;
	}

	.dialog-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20px;
		border-bottom: 1px solid #e5e7eb;
	}

	.dialog-header h2 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: #111827;
	}

	.close-button {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		padding: 4px 8px;
		color: #6b7280;
		transition: color 0.2s;
	}

	.close-button:hover {
		color: #111827;
	}

	.dialog-content {
		padding: 20px;
		overflow-y: auto;
	}

	.loading,
	.error,
	.empty {
		text-align: center;
		padding: 20px;
		color: #6b7280;
	}

	.error {
		color: #dc2626;
	}

	.device-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.device-item {
		padding: 12px 16px;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		margin-bottom: 8px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.device-item:hover {
		background-color: #f9fafb;
		border-color: #d1d5db;
	}

	.device-item.selected {
		background-color: #eff6ff;
		border-color: #3b82f6;
	}

	.device-item:focus {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}

	.device-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.device-label {
		font-size: 0.95rem;
		color: #111827;
	}

	.selected-indicator {
		color: #3b82f6;
		font-weight: bold;
		font-size: 1.1rem;
	}
</style>
