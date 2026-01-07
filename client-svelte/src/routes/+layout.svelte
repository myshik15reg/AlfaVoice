<script lang="ts">
  import favicon from '$lib/assets/favicon.svg';
  import '../app.css';
  import Header from '$lib/components/Header.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import { audioStore } from '$lib/stores/audio.svelte';
  import { dbStore } from '$lib/stores/db.svelte';
  import type { View } from '$lib/types';
  import LL from 'typesafe-i18n/svelte';
  import { loadAllLocales } from '../i18n/i18n-util.sync';
  
  // Initialize i18n
  loadAllLocales();

  let { children } = $props();

  // Theme state
  let isDarkMode = $state(false);
  let isSidebarCollapsed = $state(false);
  let currentView = $state<View>('dashboard');

  // Initialize theme from localStorage or system preference
  function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    let shouldBeDark = false;
    
    if (savedTheme) {
      shouldBeDark = savedTheme === 'dark';
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      shouldBeDark = true;
    }
    
    // Update state
    isDarkMode = shouldBeDark;
  }
  
  if (typeof localStorage !== 'undefined') {
    initializeTheme();
    // Initialize RxDB
    dbStore.init();
  }

  // Toggle theme
  function toggleTheme() {
    isDarkMode = !isDarkMode;
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  // Toggle sidebar
  function toggleSidebar() {
    isSidebarCollapsed = !isSidebarCollapsed;
  }

  // Set current view
  function setCurrentView(view: View) {
    currentView = view;
  }

  // Apply theme on mount
  $effect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  });
  

  // Global hotkey listener
  $effect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keys = audioStore.globalHotkey.split(' + ').map(k => k.trim().toLowerCase());
      let match = true;
      
      if (keys.includes('ctrl') && !e.ctrlKey) match = false;
      if (keys.includes('win') && !e.metaKey) match = false;
      if (keys.includes('alt') && !e.altKey) match = false;
      if (keys.includes('shift') && !e.shiftKey) match = false;
      
      const isCtrlWin = e.ctrlKey && e.metaKey; 
      if ((isCtrlWin && audioStore.globalHotkey === 'Ctrl + Win') || (match && keys.length > 0)) {
        e.preventDefault(); 
        if (audioStore.isGlobalRecording) {
          audioStore.stopRecording();
        } else {
          audioStore.startRecording();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  });
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="flex h-screen bg-background-light dark:bg-surface-dark text-text-main overflow-hidden">
  <Sidebar
    isCollapsed={isSidebarCollapsed}
  />
  
  <div class="flex-1 flex flex-col overflow-hidden">
    <Header
      {isDarkMode}
      {toggleTheme}
      {toggleSidebar}
    />
    
    <main class="flex-1 overflow-auto">
      {@render children()}
    </main>
  </div>
</div>
