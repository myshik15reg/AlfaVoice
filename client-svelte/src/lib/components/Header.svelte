<script lang="ts">
  import { authStore } from '$lib/stores/auth.svelte';
  import { audioStore } from '$lib/stores/audio.svelte';

  interface Props {
    isDarkMode: boolean;
    toggleTheme: () => void;
    toggleSidebar: () => void;
  }

  const { isDarkMode, toggleTheme, toggleSidebar }: Props = $props();

  let isNotificationsOpen = $state(false);
  let dropdownRef: HTMLDivElement;

  function handleClickOutside(event: MouseEvent) {
    if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
      isNotificationsOpen = false;
    }
  }

  $effect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });
</script>

<header class="h-16 flex items-center justify-between px-8 border-b border-gray-100 dark:border-border-dark flex-shrink-0 bg-white dark:bg-surface-dark transition-colors duration-200">
  <div class="flex items-center space-x-4 text-gray-400 dark:text-gray-400">
    <button 
      onclick={toggleSidebar}
      class="p-1 rounded-full transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
      aria-label="Переключить боковую панель"
    >
      <span class="material-symbols-outlined text-xl">side_navigation</span>
    </button>
  </div>
  
  <div class="flex items-center space-x-5 text-gray-500 dark:text-gray-400">
    <button 
      onclick={toggleTheme}
      class="flex items-center justify-center p-2 rounded-full transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
      title={isDarkMode ? "Включить светлую тему" : "Включить темную тему"}
      aria-label={isDarkMode ? "Включить светлую тему" : "Включить темную тему"}
    >
      <span class="material-symbols-outlined text-xl">
        {isDarkMode ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
    
    <div class="relative" bind:this={dropdownRef}>
      <button 
        class="relative cursor-pointer hover:text-primary transition-colors"
        onclick={() => isNotificationsOpen = !isNotificationsOpen}
        aria-label="Уведомления"
        aria-expanded={isNotificationsOpen}
      >
        <span class="material-symbols-outlined text-[22px]">notifications</span>
        <span class="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white dark:ring-surface-dark bg-primary transform translate-x-1/2 -translate-y-1/2"></span>
      </button>
      
      {#if isNotificationsOpen}
        <div class="absolute right-0 top-full mt-4 w-80 bg-white dark:bg-surface-dark rounded-xl shadow-lg border border-gray-200 dark:border-border-dark overflow-hidden z-50">
          <div class="px-4 py-3 border-b border-gray-100 dark:border-border-dark flex justify-between items-center bg-gray-50 dark:bg-white/5">
            <h3 class="font-bold text-sm text-text-main dark:text-white">Уведомления</h3>
            <span class="text-xs text-primary cursor-pointer hover:underline">Все прочитаны</span>
          </div>
          <!-- Approx 5 items height limit (around 320px) -->
          <div class="max-h-[320px] overflow-y-auto">
            {#each authStore.news as item (item.id)}
              <div 
                class={`px-4 py-3 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group ${!item.read ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}
              >
                <p class={`text-sm mb-1 leading-snug ${!item.read ? 'font-bold text-text-main dark:text-white' : 'text-text-secondary dark:text-gray-300'}`}>{item.title}</p>
                <span class="text-xs text-gray-400 group-hover:text-primary transition-colors">{item.time}</span>
              </div>
            {/each}
          </div>
          <div class="p-2 bg-gray-50 dark:bg-white/5 text-center border-t border-gray-100 dark:border-border-dark">
            <button class="text-xs font-medium text-text-secondary dark:text-gray-400 hover:text-primary transition-colors">Показать все</button>
          </div>
        </div>
      {/if}
    </div>
    
    <a
      href="/settings"
      class="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-700 dark:text-gray-300 cursor-pointer border border-gray-300 dark:border-gray-600 mr-2 hover:ring-2 hover:ring-primary/20 transition-all"
      aria-label="Настройки"
    >
      {authStore.user.initials}
    </a>

    <div class="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>

    <div class="flex items-center ml-2">
      <button class="w-11 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 group" title="Свернуть" aria-label="Свернуть">
        <div class="w-3.5 h-0.5 bg-current translate-y-1.5 rounded-full"></div>
      </button>
      <button class="w-11 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" title="Развернуть" aria-label="Развернуть">
        <span class="material-symbols-outlined text-[18px]">check_box_outline_blank</span>
      </button>
      <button class="w-11 h-10 flex items-center justify-center hover:bg-red-500 hover:text-white dark:hover:bg-red-600 transition-colors text-gray-400 rounded-lg" title="Закрыть" aria-label="Закрыть">
        <span class="material-symbols-outlined text-xl">close</span>
      </button>
    </div>
  </div>
</header>
