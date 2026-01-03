<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import * as Icons from 'lucide-svelte';

	const dispatch = createEventDispatcher();

	export let title = 'Настройте звучание AlfaVoice';
	export let description = 'Адаптируйте голосовой ввод под ваш стиль письма и профессиональный словарь.';
	export let buttonText = 'Начать';
</script>

<div class="banner">
	<div class="banner-content">
		<h2 class="banner-title">{title}</h2>
		<p class="banner-description">{description}</p>
	</div>
	<button class="banner-button" on:click={() => dispatch('start-recording')}>
		<span>{buttonText}</span>
		<svelte:component this={Icons.ArrowRight} size={18} />
	</button>
</div>

<style>
	.banner {
		background: linear-gradient(135deg, var(--accent), var(--accent-hover));
		border-radius: 16px;
		padding: 2rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 2rem;
		margin-bottom: 2rem;
	}

	.banner-content {
		flex: 1;
	}

	.banner-title {
		font-size: 1.5rem;
		font-weight: 700;
		color: white;
		margin: 0 0 0.5rem 0;
	}

	.banner-description {
		font-size: 1rem;
		color: rgba(255, 255, 255, 0.9);
		margin: 0;
		line-height: 1.5;
	}

	.banner-button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: white;
		color: var(--accent);
		border: none;
		border-radius: 8px;
		padding: 0.75rem 1.5rem;
		font-size: 0.95rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		white-space: nowrap;
		font-family: inherit;
	}

	.banner-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	}

	.banner-button:active {
		transform: translateY(0);
	}

	@media (max-width: 768px) {
		.banner {
			flex-direction: column;
			align-items: flex-start;
		}

		.banner-button {
			width: 100%;
			justify-content: center;
		}
	}
</style>
