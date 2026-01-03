<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import * as Icons from 'lucide-svelte';
</script>

<div class="page-container">
	<Header />
	
	<div class="content">
		<div class="placeholder">
			<svelte:component this={Icons.HelpCircle} size={64} class="placeholder-icon" />
			<h1>Помощь</h1>
			<p>Страница в разработке</p>
		</div>
	</div>
</div>

<style>
	.page-container {
		padding: 2rem;
		max-width: 1000px;
		margin: 0 auto;
	}

	.content {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 400px;
	}

	.placeholder {
		text-align: center;
		color: var(--text-secondary);
	}

	.placeholder-icon {
		margin-bottom: 1.5rem;
		color: var(--text-muted);
	}

	.placeholder h1 {
		font-size: 2rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
		color: var(--text-primary);
	}

	.placeholder p {
		font-size: 1rem;
		color: var(--text-muted);
	}
</style>
