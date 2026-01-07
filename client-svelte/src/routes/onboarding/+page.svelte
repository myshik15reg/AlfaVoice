<script lang="ts">
  import { settingsStore } from '$lib/stores/settings.svelte';
  import { TONE_LABELS, TONE_DESCRIPTIONS, TONE_ICONS, STYLE_PARAMS } from '$lib/constants/settings';

  // Style slider local state
  let localToneValue = $state(settingsStore.styleSettings.toneValue);

  // Sync local tone value from global when it loads/changes
  $effect(() => {
    localToneValue = settingsStore.styleSettings.toneValue;
  });

  // Style handlers
  const getActiveIndex = (value: number) => {
    if (value < 33) return 0;
    if (value > 66) return 2;
    return 1;
  };

  const activeIndex = $derived(getActiveIndex(localToneValue));

  const handleSliderChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    localToneValue = Number(target.value);
  };

  const snapToValueAndSave = () => {
    settingsStore.setStyleSettings({ ...settingsStore.styleSettings, toneValue: localToneValue });
  };

  const handleToneSelect = (idx: number) => {
    const val = idx * 50;
    localToneValue = val;
    settingsStore.setStyleSettings({ ...settingsStore.styleSettings, toneValue: val });
  };

  const toggleParam = (id: string) => {
    const newParams = { ...settingsStore.styleSettings.activeParams, [id]: !settingsStore.styleSettings.activeParams[id] };
    settingsStore.setStyleSettings({ ...settingsStore.styleSettings, activeParams: newParams });
  };

  const handleStopWordsChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    settingsStore.setStyleSettings({ ...settingsStore.styleSettings, stopWords: target.value });
  };

  const handleReset = () => {
    settingsStore.setStyleSettings({
      toneValue: 50,
      activeParams: { caps: true, emoji: false, simple: true },
      stopWords: 'типа, короче'
    });
  };
</script>

<div class="p-8 lg:px-12 lg:py-10">
  <div class="max-w-6xl mx-auto">
    <div class="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
      <div>
        <h1 class="text-3xl font-bold text-text-main dark:text-white tracking-tight mb-2">Персонализация стиля</h1>
        <p class="text-text-secondary dark:text-gray-400 text-base max-w-xl leading-relaxed">Настройте параметры AI-ассистента, чтобы коммуникация соответствовала вашему личному бренду и корпоративным стандартам Альфа-Лизинг.</p>
      </div>
      <div class="flex space-x-3">
        <button
          onclick={handleReset}
          class="px-4 py-2 bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-md text-base font-medium text-text-secondary dark:text-gray-300 hover:text-primary dark:hover:text-white transition-colors"
        >
          Сбросить
        </button>
        <a
          href="/settings"
          class="px-4 py-2 bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-md text-base font-medium text-text-secondary dark:text-gray-300 hover:text-primary dark:hover:text-white transition-colors flex items-center"
        >
          <span class="material-symbols-outlined text-xl mr-2">settings</span>
          Настройки
        </a>
        <button class="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md text-base font-bold shadow-sm transition-colors flex items-center">
          <span class="material-symbols-outlined text-xl mr-2">save</span>
          Сохранено
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div class="lg:col-span-8 space-y-6">
        <div class="bg-white dark:bg-surface-dark rounded-xl p-6 lg:p-8 shadow-card dark:shadow-card-dark border border-gray-100 dark:border-border-dark transition-colors duration-300">
          <h3 class="text-xl font-bold text-text-main dark:text-white mb-6 flex items-center">
            <span class="w-8 h-8 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mr-3">
              <span class="material-symbols-outlined text-primary text-2xl">tune</span>
            </span>
            Тональность (Tone of Voice)
          </h3>
          <div class="mb-8 select-none">
            <div class="flex justify-between text-sm font-semibold text-text-secondary dark:text-gray-400 uppercase tracking-wider mb-4 px-1">
              {#each TONE_LABELS as label, index}
                <span class:font-bold={activeIndex === index} class:transition-colors={true} class:text-primary={activeIndex === index}>{label}</span>
              {/each}
            </div>
            <div class="relative h-2 bg-gray-200 dark:bg-white/10 rounded-full mb-6 touch-none">
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={localToneValue}
                oninput={handleSliderChange}
                onmouseup={snapToValueAndSave}
                ontouchend={snapToValueAndSave}
                class="absolute w-full h-2 opacity-0 cursor-pointer z-10 inset-0"
              />
              <div class="absolute top-0 left-0 h-2 bg-primary rounded-full transition-all duration-75" style="width: {localToneValue}%"></div>
              <div
                class="absolute top-1/2 left-0 -translate-y-1/2 w-5 h-5 bg-white dark:bg-surface-dark border-4 border-primary rounded-full shadow-md cursor-pointer z-0 transition-all duration-75"
                style="left: {localToneValue}%; transform: translate(-50%, -50%)"
              ></div>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {#each TONE_LABELS as label, idx}
              <button
                type="button"
                onclick={() => handleToneSelect(idx)}
                class={`relative group cursor-pointer p-4 rounded-lg border-2 transition-all h-full w-full text-left ${
                  activeIndex === idx
                    ? 'border-primary bg-red-50 dark:bg-red-900/10'
                    : 'border-gray-200 dark:border-border-dark hover:border-red-200 dark:hover:border-red-900/50'
                }`}
              >
                {#if activeIndex === idx}
                  <div class="absolute top-2 right-2 text-primary">
                    <span class="material-symbols-outlined text-xl">check_circle</span>
                  </div>
                {/if}
                <div class="flex flex-col items-center text-center">
                  <span class={`material-symbols-outlined text-4xl mb-2 ${activeIndex === idx ? 'text-primary' : 'text-gray-400'}`}>
                    {TONE_ICONS[idx]}
                  </span>
                  <span class="font-bold text-text-main dark:text-white mb-1 text-lg">{label}</span>
                  <span class="text-sm text-text-secondary dark:text-gray-400">
                    {TONE_DESCRIPTIONS[idx]}
                  </span>
                </div>
              </button>
            {/each}
          </div>
        </div>

        <div class="bg-white dark:bg-surface-dark rounded-xl p-6 lg:p-8 shadow-card dark:shadow-card-dark border border-gray-100 dark:border-border-dark transition-colors duration-300">
          <h3 class="text-xl font-bold text-text-main dark:text-white mb-6 flex items-center">
            <span class="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center mr-3">
              <span class="material-symbols-outlined text-gray-600 dark:text-gray-300 text-2xl">rule</span>
            </span>
            Параметры текста
          </h3>
          <div class="space-y-5">
            {#each STYLE_PARAMS as item}
              <div class="flex items-start">
                <div class="flex h-6 items-center">
                  <input
                    id={item.id}
                    type="checkbox"
                    checked={!!settingsStore.styleSettings.activeParams[item.id]}
                    onchange={() => toggleParam(item.id)}
                    class="h-5 w-5 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-primary focus:ring-primary focus:ring-offset-0 transition-colors"
                  />
                </div>
                <div class="ml-3">
                  <label for={item.id} class="font-bold text-base text-text-main dark:text-gray-200">{item.label}</label>
                  <p class="text-gray-500 dark:text-gray-400 text-sm">{item.desc}</p>
                </div>
              </div>
            {/each}
            <div class="pt-4 border-t border-gray-100 dark:border-border-dark">
              <label for="stop-words" class="block text-base font-bold text-text-main dark:text-gray-200 mb-2">Стоп-слова (через запятую)</label>
              <input
                id="stop-words"
                type="text"
                value={settingsStore.styleSettings.stopWords}
                oninput={handleStopWordsChange}
                class="block w-full rounded-md border-gray-300 dark:border-border-dark bg-white dark:bg-background-dark text-text-main dark:text-white shadow-sm focus:border-primary focus:ring-primary text-base p-2.5 placeholder-gray-400"
                placeholder="Например: типа, короче, как бы"
              />
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Слова, которые AlfaVoice будет всегда предлагать удалить.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="lg:col-span-4">
        <div class="sticky top-6 space-y-6">
          <div class="bg-white dark:bg-surface-dark rounded-xl shadow-card dark:shadow-card-dark border border-gray-100 dark:border-border-dark overflow-hidden transition-colors duration-300">
            <div class="bg-gray-50 dark:bg-white/5 px-6 py-4 border-b border-gray-100 dark:border-border-dark flex items-center justify-between">
              <h3 class="font-bold text-text-main dark:text-white text-lg">Предпросмотр</h3>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800/50">LIVE</span>
            </div>
            <div class="p-6">
              <div class="mb-6">
                <label for="draft-textarea" class="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Ваш черновик</label>
                <div class="relative">
                  <textarea id="draft-textarea" rows={3} class="block w-full rounded-lg border-gray-200 dark:border-border-dark bg-white dark:bg-background-dark text-text-secondary dark:text-gray-300 shadow-sm focus:border-primary focus:ring-primary text-sm p-3 placeholder-gray-400">Привет, скинь отчет по продажам плз, очень надо до обеда!</textarea>
                </div>
              </div>
              <div class="flex justify-center -my-3 relative z-10">
                <div class="bg-white dark:bg-surface-dark rounded-full p-1 border border-gray-100 dark:border-border-dark shadow-sm text-gray-400 dark:text-gray-500">
                  <span class="material-symbols-outlined text-lg block">arrow_downward</span>
                </div>
              </div>
              <div class="bg-red-50 dark:bg-red-900/10 rounded-lg p-4 border border-red-100 dark:border-red-900/30 mt-0 relative">
                <div class="absolute -top-3 -right-3">
                  <div class="h-8 w-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
                    <span class="material-symbols-outlined text-white text-sm">auto_awesome</span>
                  </div>
                </div>
                <div class="block text-xs font-bold text-primary uppercase tracking-wider mb-2">Результат AlfaVoice</div>
                <p class="text-text-main dark:text-white text-sm leading-relaxed font-medium">
                  «Добрый день! Коллеги, прошу направить отчет по продажам. Буду признателен, если получится до 13:00.»
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
