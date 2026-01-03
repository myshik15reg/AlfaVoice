<script lang="ts">
	import * as Icons from 'lucide-svelte';
	import { streak, wordsCount, wpmStore } from '$lib/stores/statsStore';

	export let userName = 'Евгений';
</script>

<header class="header">
	<div class="header-content">
		<div class="greeting">
			<h1>С возвращением, {userName}</h1>
		</div>

		<div class="stats">
			<div class="stat-item">
				<svelte:component this={Icons.Flame} size={18} class="stat-icon" />
				<span class="stat-label">Серия</span>
				<span class="stat-value">{$streak} день</span>
			</div>
			<div class="stat-item">
				<svelte:component this={Icons.FileText} size={18} class="stat-icon" />
				<span class="stat-label">Слова</span>
				<span class="stat-value">{$wordsCount}</span>
			</div>
			<div class="stat-item">
				<svelte:component this={Icons.Zap} size={18} class="stat-icon" />
				<span class="stat-label">Слов/мин</span>
				<span class="stat-value">{$wpmStore}</span>
			</div>
		</div>
	</div>
</header>

<style>
	.header {
		background: var(--bg-secondary);
		border-bottom: 1px solid var(--border);
		padding: 1.5rem 2rem;
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.greeting h1 {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--text-primary);
		margin: 0;
	}

	.stats {
		display: flex;
		gap: 2rem;
	}

	.stat-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.stat-icon {
		color: var(--accent);
		flex-shrink: 0;
	}

	.stat-label {
		font-size: 0.875rem;
		color: var(--text-secondary);
		font-weight: 500;
	}

	.stat-value {
		font-size: 0.95rem;
		color: var(--text-primary);
		font-weight: 600;
	}

	@media (max-width: 768px) {
		.header-content {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}

		.stats {
			gap: 1.5rem;
		}
	}
</style>
