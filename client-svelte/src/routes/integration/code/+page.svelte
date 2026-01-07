<script lang="ts">
  import { authStore } from '$lib/stores/auth.svelte';
  
  let codeSettings = {
    realtimeCheck: true,
    autoTone: true,
    ignoreBlocks: false,
    notifications: true
  };

  function toggleSetting(key: keyof typeof codeSettings) {
    codeSettings = {
      ...codeSettings,
      [key]: !codeSettings[key]
    };
  }

  function getSettingValue(id: string): boolean {
    return (codeSettings as Record<string, boolean>)[id];
  }

  function setSettingValue(id: string, value: boolean) {
    (codeSettings as Record<string, boolean>)[id] = value;
  }
</script>

<div class="p-8 lg:px-12 lg:py-10">
  <div class="flex flex-col mb-8">
    <h1 class="text-3xl font-bold text-text-main dark:text-white tracking-tight mb-2">Настройка среды разработки</h1>
    <p class="text-text-secondary dark:text-gray-400 text-base max-w-2xl">
      Подключите AlfaVoice к вашему любимому редактору кода, чтобы получать рекомендации по стилю и тону прямо в процессе написания документации и комментариев.
    </p>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <!-- Left Column -->
    <div class="lg:col-span-2 space-y-6">
        <!-- Connection Status Card -->
        <div class="bg-white dark:bg-surface-dark rounded-xl p-6 border border-border-light dark:border-border-dark shadow-card dark:shadow-card-dark transition-colors duration-200">
            <h4 class="text-sm font-bold text-text-main dark:text-white uppercase tracking-wide mb-4">Статус подключения</h4>
            
            <div class="bg-gray-50 dark:bg-black rounded-lg p-4 border border-border-light dark:border-border-dark flex items-center justify-between mb-4 shadow-inner">
                 <div class="flex items-center space-x-3">
                    <div class="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                    <span class="text-base font-medium text-text-main dark:text-white">Подключено к локальному серверу</span>
                </div>
                <span class="text-sm text-text-secondary dark:text-gray-500 font-mono">Port: 6412</span>
            </div>
            
            <p class="text-base text-text-secondary dark:text-gray-400 mb-6">
                Плагин AlfaVoice активно отслеживает файлы <code class="bg-gray-100 dark:bg-surface-dark-lighter px-1.5 py-0.5 rounded text-sm border border-gray-200 dark:border-border-dark dark:text-gray-300">.md</code> , <code class="bg-gray-100 dark:bg-surface-dark-lighter px-1.5 py-0.5 rounded text-sm border border-gray-200 dark:border-border-dark dark:text-gray-300">.txt</code> и комментарии в коде на соответствие корпоративному стилю.
            </p>
            
            <div class="flex items-center justify-between">
                 <button class="text-primary hover:text-primary-hover text-base font-bold flex items-center group transition-colors">
                    <span class="material-symbols-outlined mr-2 text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    Открыть настройки в VS Code
                </button>
                 <button class="text-gray-400 hover:text-text-main dark:hover:text-white text-base font-medium transition-colors">
                    Отключить
                </button>
            </div>
        </div>

        <!-- Analyzer Settings Card -->
        <div class="bg-white dark:bg-surface-dark rounded-xl p-6 border border-border-light dark:border-border-dark shadow-card dark:shadow-card-dark transition-colors duration-200">
             <h3 class="text-xl font-bold text-text-main dark:text-white mb-6">Настройки анализатора</h3>
             <div class="space-y-6">
                {#each [
                    { id: 'realtimeCheck', label: 'Проверка орфографии в реальном времени', desc: 'Подсветка ошибок при вводе текста' },
                    { id: 'autoTone', label: 'Автокоррекция тональности', desc: 'Предлагать замены для соответствия Tone of Voice' },
                    { id: 'ignoreBlocks', label: 'Игнорировать блоки кода', desc: 'Не проверять текст внутри ``` ```' },
                    { id: 'notifications', label: 'Уведомления об обновлениях', desc: 'Сообщать о новых правилах стиля' }
                ] as item, idx}
                    <div class="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
                        <div>
                            <h4 class="text-base font-bold text-text-main dark:text-white">{item.label}</h4>
                            <p class="text-sm text-text-secondary dark:text-gray-400 mt-0.5">{item.desc}</p>
                        </div>
                        <div class="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={getSettingValue(item.id)}
                                on:change={(e) => setSettingValue(item.id, e.currentTarget.checked)}
                                class="sr-only peer"
                                id={item.id}
                            />
                            <label for={item.id} class="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></label>
                        </div>
                    </div>
                {/each}
             </div>
        </div>
    </div>

    <!-- Right Column -->
    <div class="space-y-6">
         <!-- Activity Log -->
         <div class="bg-white dark:bg-surface-dark rounded-xl p-6 border border-border-light dark:border-border-dark shadow-card dark:shadow-card-dark transition-colors duration-200">
            <h3 class="text-xl font-bold text-text-main dark:text-white mb-6">Журнал активности плагина</h3>
            <div class="space-y-6">
                <div class="flex items-start space-x-3 text-sm">
                    <span class="text-gray-400 text-xs mt-0.5 w-10 flex-shrink-0">10:42</span>
                    <div>
                        <p class="text-text-main dark:text-white font-medium mb-1"><span class="text-green-500 font-bold">Исправлено:</span> "Фича" -{'>'} <br/>"Функциональность"</p>
                        <p class="text-xs text-text-secondary dark:text-gray-500">readme.md</p>
                    </div>
                </div>
                <div class="flex items-start space-x-3 text-sm">
                    <span class="text-gray-400 text-xs mt-0.5 w-10 flex-shrink-0">10:38</span>
                    <div>
                        <p class="text-text-main dark:text-white font-medium mb-1"><span class="text-blue-500 font-bold">Предложено:</span> Упростить формулировку</p>
                        <p class="text-xs text-text-secondary dark:text-gray-500">api_docs.txt</p>
                    </div>
                </div>
                <div class="flex items-start space-x-3 text-sm">
                    <span class="text-gray-400 text-xs mt-0.5 w-10 flex-shrink-0">09:15</span>
                    <div>
                        <p class="text-text-main dark:text-white font-medium mb-1">Синхронизация словаря завершена</p>
                        <p class="text-xs text-text-secondary dark:text-gray-500">System</p>
                    </div>
                </div>
            </div>
            <button class="w-full text-center text-primary text-sm font-bold mt-8 hover:underline uppercase tracking-widest">Показать все события</button>
         </div>

         <!-- Installation Guide -->
         <div class="bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-xl p-6 shadow-card dark:shadow-card-dark transition-colors duration-200">
            <h3 class="text-xl font-bold mb-6 text-gray-900 dark:text-white">Установка плагина</h3>
            <div class="space-y-5">
                {#each [
                    'Откройте раздел расширений <br/>в VS Code (Ctrl+Shift+X).',
                    'Введите в поиск <strong>AlfaVoice Connector</strong>.',
                    'Нажмите Install и <br/>перезагрузите редактор.',
                    'Используйте токен ниже для <br/>авторизации.'
                ] as step, idx}
                    <div class="flex items-start gap-4">
                        <div class="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white shadow-sm">{idx + 1}</div>
                        <p class="text-base text-gray-700 dark:text-gray-300 leading-snug" class:dangerouslySetInnerHTML={true}>{@html step}</p>
                    </div>
                {/each}
            </div>
            <div class="mt-8">
                <span class="text-xs font-bold text-gray-500 uppercase mb-2 block tracking-wider">API Токен разработчика</span>
                <div class="flex items-center space-x-2">
                     <div class="flex-1 bg-gray-100 dark:bg-black border border-gray-200 dark:border-gray-700 rounded px-3 py-2.5 text-sm font-mono text-gray-600 dark:text-gray-300 truncate">
                        alf_dev_88293_xqkw...
                    </div>
                    <button class="p-2.5 text-gray-400 hover:text-primary dark:hover:text-white transition-colors border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10">
                        <span class="material-symbols-outlined text-xl">content_copy</span>
                    </button>
                </div>
                <p class="text-sm text-red-500 dark:text-red-400 mt-3 flex items-center">
                    <span class="material-symbols-outlined text-lg mr-1.5">warning</span>
                    Никому не сообщайте этот токен.
                </p>
            </div>
         </div>
    </div>

  </div>
</div>
