<script lang="ts">
  import { authStore } from '$lib/stores/auth.svelte';
  
  let integrationSettings = {
    chromeEnabled: true
  };

  function handleToggle() {
    integrationSettings = {
      ...integrationSettings,
      chromeEnabled: !integrationSettings.chromeEnabled
    };
  }
</script>

<div class="p-8 lg:px-12 lg:py-10">
  <div class="max-w-4xl mx-auto">
    <div class="mb-8">
      <nav class="flex text-base text-gray-500 mb-2">
        <span class="hover:text-primary cursor-pointer transition-colors">Настройки</span>
        <span class="mx-2">/</span>
        <span class="hover:text-primary cursor-pointer transition-colors">Интеграции</span>
        <span class="mx-2">/</span>
        <span class="text-text-main dark:text-gray-200 font-medium">Chrome</span>
      </nav>
      <h1 class="text-3xl font-bold text-text-main dark:text-white tracking-tight">Интеграция с Google Chrome</h1>
      <p class="text-text-secondary dark:text-text-dark-secondary mt-2 text-lg">Персонализируйте свой стиль письма в Gmail, Google Docs и других веб-приложениях с помощью AlfaVoice.</p>
    </div>
    
    <div class="bg-white dark:bg-surface-dark rounded-xl p-8 border border-gray-200 dark:border-border-dark shadow-sm mb-10 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
      <div class="w-24 h-24 bg-blue-50 dark:bg-white/5 rounded-full flex items-center justify-center flex-shrink-0 border border-blue-100 dark:border-border-dark">
        <span class="material-symbols-outlined text-blue-600 dark:text-blue-400 text-5xl">public</span>
      </div>
      <div class="flex-1 relative z-10">
        <div class="flex items-center mb-2">
          <h2 class="text-xl font-bold text-text-main dark:text-white mr-3">Расширение AlfaVoice</h2>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-gray-300">v2.4.0</span>
        </div>
        <p class="text-gray-600 dark:text-text-dark-secondary mb-6 leading-relaxed max-w-2xl text-base">
          Получайте рекомендации по стилю и тону в реальном времени. Расширение автоматически проверяет ваши сообщения на соответствие корпоративному стилю Альфа-Лизинг.
        </p>
        <div class="flex items-center flex-wrap gap-4">
          <button class="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-lg text-base font-bold shadow-md transition-all flex items-center group">
            <span class="material-symbols-outlined mr-2 text-xl group-hover:animate-bounce">add_to_queue</span>
            Установить расширение
          </button>
          <button class="text-text-main dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 px-6 py-2.5 rounded-lg text-base font-medium transition-colors">
            Проверить статус
          </button>
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-border-dark shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100 dark:border-border-dark bg-gray-50 dark:bg-white/5 flex justify-between items-center">
        <h3 class="font-bold text-xl text-text-main dark:text-white flex items-center">
          <span class="material-symbols-outlined mr-2 text-gray-400">tune</span>
          Настройки веб-контента
        </h3>
        <div class="flex items-center space-x-2">
          <span class="relative flex h-2.5 w-2.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" class:hidden={!integrationSettings.chromeEnabled}></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5" class:bg-green-500={integrationSettings.chromeEnabled} class:bg-gray-400={!integrationSettings.chromeEnabled}></span>
          </span>
          <span class="text-sm font-medium text-text-secondary dark:text-gray-400">{integrationSettings.chromeEnabled ? 'Синхронизировано' : 'Отключено'}</span>
        </div>
      </div>
      <div class="p-6 space-y-8">
        <div class="flex items-start justify-between group">
          <div class="pr-8">
            <h4 class="font-medium text-text-main dark:text-gray-200 text-lg">Автоматическая проверка</h4>
            <p class="text-base text-text-secondary dark:text-text-dark-secondary mt-1">Анализировать текст и предлагать улучшения на всех веб-сайтах по умолчанию.</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
            <input 
                type="checkbox" 
                class="sr-only peer" 
                checked={integrationSettings.chromeEnabled}
                on:change={handleToggle}
                id="chrome-enabled"
            />
            <label for="chrome-enabled" class="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></label>
          </label>
        </div>
      </div>
    </div>
  </div>
</div>
