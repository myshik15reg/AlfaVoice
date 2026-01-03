<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import Sidebar from '$lib/components/Sidebar.svelte';

	// Тема приложения
	let darkMode: boolean = browser ? localStorage.getItem('theme') !== 'light' : true;

	onMount(() => {
		if (browser) {
			// Применяем тему при загрузке
			applyTheme();
		}
	});

	function toggleTheme() {
		darkMode = !darkMode;
		if (browser) {
			localStorage.setItem('theme', darkMode ? 'dark' : 'light');
			applyTheme();
		}
	}

	function applyTheme() {
		if (browser) {
			if (darkMode) {
				document.documentElement.classList.remove('light');
				document.documentElement.classList.add('dark');
			} else {
				document.documentElement.classList.remove('dark');
				document.documentElement.classList.add('light');
			}
		}
	}
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="app-layout">
	<Sidebar />
	
	<main class="main-content">
		<slot />
	</main>
</div>

<style>
	.app-layout {
		display: flex;
		min-height: 100vh;
		background: var(--bg-primary);
	}

	.main-content {
		margin-left: 260px;
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	@media (max-width: 768px) {
		.main-content {
			margin-left: 0;
		}
	}
</style>
