<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import * as Icons from 'lucide-svelte';

	const dispatch = createEventDispatcher();

	interface QuickAccessCard {
		id: string;
		title: string;
		description: string;
		icon: any;
	}

	const cards: QuickAccessCard[] = [
		{
			id: 'code',
			title: 'Code',
			description: 'Голосовой ввод для программирования',
			icon: Icons.Code
		},
		{
			id: 'chrome',
			title: 'Chrome',
			description: 'Быстрые заметки в браузере',
			icon: Icons.Globe
		}
	];

	function onCardClick(cardId: string) {
		dispatch('select', { cardId });
	}
</script>

<section class="quick-access">
	<h3 class="section-title">Вернуться в поток</h3>
	<div class="cards-grid">
		{#each cards as card}
			<button class="card" on:click={() => onCardClick(card.id)}>
				<div class="card-icon">
					<svelte:component this={card.icon} size={24} />
				</div>
				<div class="card-content">
					<h4 class="card-title">{card.title}</h4>
					<p class="card-description">{card.description}</p>
				</div>
			</button>
		{/each}
	</div>
</section>

<style>
	.quick-access {
		margin-bottom: 2rem;
	}

	.section-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0 0 1rem 0;
	}

	.cards-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1rem;
	}

	.card {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		background: var(--bg-tertiary);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 1.25rem;
		cursor: pointer;
		transition: all 0.2s;
		text-align: left;
		font-family: inherit;
	}

	.card:hover {
		border-color: var(--accent);
		transform: translateY(-2px);
	}

	.card:active {
		transform: translateY(0);
	}

	.card-icon {
		width: 48px;
		height: 48px;
		background: var(--bg-hover);
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--accent);
		flex-shrink: 0;
	}

	.card-content {
		flex: 1;
	}

	.card-title {
		font-size: 1rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0 0 0.25rem 0;
	}

	.card-description {
		font-size: 0.875rem;
		color: var(--text-secondary);
		margin: 0;
		line-height: 1.4;
	}
</style>
