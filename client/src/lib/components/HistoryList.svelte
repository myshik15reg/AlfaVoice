<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import * as Icons from 'lucide-svelte';

	const dispatch = createEventDispatcher();

	interface HistoryEntry {
		id: string;
		time: string;
		text: string;
	}

	interface HistoryGroup {
		date: string;
		entries: HistoryEntry[];
	}

	// Mock data
	export let history: HistoryGroup[] = [
		{
			date: 'Сегодня',
			entries: [
				{ id: '1', time: '14:30', text: 'Создайте новый компонент для боковой панели с навигацией' },
				{ id: '2', time: '12:15', text: 'Обновите конфигурацию TailwindCSS для поддержки темной темы' },
				{ id: '3', time: '10:45', text: 'Добавьте иконки из библиотеки lucide-svelte' }
			]
		},
		{
			date: 'Вчера',
			entries: [
				{ id: '4', time: '16:20', text: 'Настройте WebSocket соединение с сервером' },
				{ id: '5', time: '14:05', text: 'Реализуйте логику записи аудио с микрофона' }
			]
		}
	];

	function onEntryClick(entryId: string) {
		dispatch('select', { entryId });
	}
</script>

<section class="history-list">
	<h3 class="section-title">История</h3>
	<div class="history-content">
		{#each history as group}
			<div class="history-group">
				<h4 class="group-date">{group.date}</h4>
				<div class="entries-list">
					{#each group.entries as entry}
						<button class="entry-item" on:click={() => onEntryClick(entry.id)}>
							<svelte:component this={Icons.Clock} size={16} class="entry-icon" />
							<div class="entry-content">
								<span class="entry-time">{entry.time}</span>
								<span class="entry-text">{entry.text}</span>
							</div>
						</button>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</section>

<style>
	.history-list {
		background: var(--bg-tertiary);
		border: 1px solid var(--border);
		border-radius: 12px;
		overflow: hidden;
	}

	.section-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0 0 1rem 0;
	}

	.history-content {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.history-group {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.group-date {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin: 0;
	}

	.entries-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.entry-item {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s;
		text-align: left;
		font-family: inherit;
	}

	.entry-item:hover {
		border-color: var(--accent);
		background: var(--bg-hover);
	}

	.entry-icon {
		color: var(--text-muted);
		flex-shrink: 0;
		margin-top: 0.125rem;
	}

	.entry-content {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.entry-time {
		font-size: 0.875rem;
		color: var(--text-muted);
		font-weight: 500;
		flex-shrink: 0;
	}

	.entry-text {
		font-size: 0.95rem;
		color: var(--text-primary);
		line-height: 1.4;
	}
</style>
