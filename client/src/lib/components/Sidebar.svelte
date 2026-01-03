<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import * as Icons from 'lucide-svelte';

	interface NavItem {
		path: string;
		label: string;
		icon: any;
	}

	const topNavItems: NavItem[] = [
		{ path: '/', label: 'Главная', icon: Icons.Home },
		{ path: '/dictionary', label: 'Словарь', icon: Icons.BookOpen },
		{ path: '/snippets', label: 'Сниппеты', icon: Icons.Code2 },
		{ path: '/style', label: 'Стиль', icon: Icons.Palette },
		{ path: '/notes', label: 'Заметки', icon: Icons.FileText }
	];

	const bottomNavItems: NavItem[] = [
		{ path: '/settings', label: 'Настройки', icon: Icons.Settings },
		{ path: '/help', label: 'Помощь', icon: Icons.HelpCircle }
	];

	function navigate(path: string) {
		goto(path);
	}
</script>

<aside class="sidebar">
	<!-- Logo -->
	<div class="sidebar-header">
		<div class="logo">
			<div class="logo-icon">A</div>
			<span class="logo-text">AlfaVoice</span>
		</div>
	</div>

	<!-- Top Navigation -->
	<nav class="sidebar-nav">
		{#each topNavItems as item}
			<button
				class="nav-item {$page.url.pathname === item.path ? 'active' : ''}"
				on:click={() => navigate(item.path)}
				aria-label={item.label}
				aria-current={$page.url.pathname === item.path ? 'page' : undefined}
			>
				<svelte:component this={item.icon} size={20} />
				<span>{item.label}</span>
			</button>
		{/each}
	</nav>

	<!-- Bottom Navigation -->
	<nav class="sidebar-nav sidebar-nav-bottom">
		{#each bottomNavItems as item}
			<button
				class="nav-item {$page.url.pathname === item.path ? 'active' : ''}"
				on:click={() => navigate(item.path)}
				aria-label={item.label}
				aria-current={$page.url.pathname === item.path ? 'page' : undefined}
			>
				<svelte:component this={item.icon} size={20} />
				<span>{item.label}</span>
			</button>
		{/each}
	</nav>
</aside>

<style>
	.sidebar {
		width: 260px;
		height: 100vh;
		background: var(--bg-secondary);
		border-right: 1px solid var(--border);
		display: flex;
		flex-direction: column;
		position: fixed;
		left: 0;
		top: 0;
		z-index: 100;
	}

	.sidebar-header {
		padding: 1.5rem;
		border-bottom: 1px solid var(--border);
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.logo-icon {
		width: 36px;
		height: 36px;
		background: linear-gradient(135deg, var(--accent), var(--accent-hover));
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 1.25rem;
		color: white;
	}

	.logo-text {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--text-primary);
	}

	.sidebar-nav {
		flex: 1;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.sidebar-nav-bottom {
		border-top: 1px solid var(--border);
		padding-top: 1rem;
		margin-top: auto;
	}

	.nav-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		border: none;
		background: transparent;
		color: var(--text-secondary);
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s;
		font-size: 0.95rem;
		font-weight: 500;
		text-align: left;
		font-family: inherit;
	}

	.nav-item:hover {
		background: var(--bg-hover);
		color: var(--text-primary);
	}

	.nav-item.active {
		background: var(--bg-tertiary);
		color: var(--text-primary);
	}

	.nav-item :global(svg) {
		flex-shrink: 0;
	}
</style>
