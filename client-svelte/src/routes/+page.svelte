<script lang="ts">
  import { authStore } from '$lib/stores/auth.svelte';
  import { audioStore } from '$lib/stores/audio.svelte';
  import { browser } from '$app/environment';
  import { t } from '$lib/i18n';

  // Audio playback state
  let playingId = $state<number | null>(null);
  let audioRef: HTMLAudioElement | null = null;

  // Stats state
  let daysLeftInWeek = $state<{ count: number, label: string }>({ count: 0, label: 'дней' });
  let stats = $state({ words: 0, wpm: 0 });

  // Calculate stats on mount and when activities change
  $effect(() => {
    const activities = authStore.activities;
    
    // 1. Calculate Days Left (Assuming week ends on Sunday)
    const today = new Date();
    const currentDay = today.getDay(); // 0 (Sun) - 6 (Sat)
    const daysPassed = currentDay === 0 ? 7 : currentDay;
    const daysLeft = 7 - daysPassed;

    let label = t('daysLeft_days');
    if (daysLeft === 1) label = t('daysLeft_day');
    else if (daysLeft > 1 && daysLeft < 5) label = t('daysLeft_days2_4');
    
    daysLeftInWeek = { count: daysLeft, label };

    // 2. Calculate Stats from Activities
    let totalWords = 0;
    let totalSeconds = 0;

    // Only count finished activities
    const finishedActivities = activities.filter(a => !a.isTranscribing);

    finishedActivities.forEach(act => {
      // Simple word count
      const text = act.text.trim();
      const words = text ? text.split(/\s+/).length : 0;
      totalWords += words;

      // Parse duration "mm:ss"
      const parts = act.duration.split(':');
      if (parts.length === 2) {
        const m = parseInt(parts[0], 10);
        const s = parseInt(parts[1], 10);
        totalSeconds += (m * 60) + s;
      }
    });

    const totalMinutes = totalSeconds / 60;
    const avgWpm = totalMinutes > 0 ? Math.round(totalWords / totalMinutes) : 0;

    stats = { words: totalWords, wpm: avgWpm };
  });

  // Cleanup on unmount
  $effect(() => {
    return () => {
      if (audioRef) {
        audioRef.pause();
      }
    };
  });

  // Audio playback functions
  function togglePlay(id: number, audioUrl?: string) {
    if (playingId === id) {
      // Stop current
      if (audioRef) {
        audioRef.pause();
        audioRef.currentTime = 0;
      }
      playingId = null;
    } else {
      // Stop previous if exists
      if (audioRef) {
        audioRef.pause();
      }

      playingId = id;

      if (audioUrl) {
        // Play real audio
        const audio = new Audio(audioUrl);
        audioRef = audio;
        audio.onended = () => { playingId = null; };
        audio.play().catch(e => console.error("Error playing audio", e));
      } else {
        // Mock play for older items without audioUrl
        setTimeout(() => {
          playingId = null;
        }, 2000); // Fake duration
      }
    }
  }

  function handleCopy(text: string) {
    if (browser) {
      navigator.clipboard.writeText(text);
    }
  }

  function handleDeleteActivity(id: number) {
    authStore.deleteActivity(id);
  }

</script>

<div class="p-8 lg:px-12 lg:py-10">
  <div class="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
    <div>
      <h1 class="text-3xl font-bold text-text-main dark:text-white tracking-tight mb-1">
        {t('welcomeBack', authStore.user.firstName)}
      </h1>
      <p class="text-text-secondary dark:text-text-dark-secondary text-base">
        {t('productivityOverview')}
      </p>
    </div>
    
    <!-- Recording Status Indicator -->
    {#if audioStore.isGlobalRecording}
      <div class="flex items-center bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg border border-red-100 dark:border-red-900/50 animate-pulse">
        <div class="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
        <span class="font-bold text-red-600 dark:text-red-400">{t('recordingInProgress')}</span>
      </div>
    {/if}

    <div class="flex items-center bg-white dark:bg-surface-dark rounded-lg px-2 py-4 border border-gray-200 dark:border-border-dark shadow-sm">
      <div class="flex items-center px-4 py-1 border-r border-gray-100 dark:border-gray-700">
        <span class="material-symbols-outlined text-primary mr-2 text-lg">local_fire_department</span>
        <div class="flex flex-col justify-center">
          <span class="text-base font-bold text-text-main dark:text-gray-200">
            {daysLeftInWeek.count} {daysLeftInWeek.label}
          </span>
        </div>
      </div>
      <div class="flex items-center px-4 py-1 border-r border-gray-100 dark:border-gray-700">
        <span class="material-symbols-outlined text-primary mr-2 text-lg">edit_note</span>
        <div class="flex flex-col justify-center">
          <span class="text-base font-bold text-text-main dark:text-gray-200">
            {stats.words.toLocaleString()} {t('wordsCount')}
          </span>
        </div>
      </div>
      <div class="flex items-center px-4 py-1">
        <span class="material-symbols-outlined text-primary mr-2 text-lg">speed</span>
        <div class="flex flex-col justify-center">
          <span class="text-base font-bold text-text-main dark:text-gray-200">
            {stats.wpm} {t('wpmLabel')}
          </span>
        </div>
      </div>
    </div>
  </div>

  <!-- Personalization Section -->
  <div class="bg-white dark:bg-surface-dark rounded-xl p-10 mb-12 border border-gray-200 dark:border-border-dark relative overflow-hidden shadow-card dark:shadow-card-dark group transition-colors duration-200">
    <div class="relative z-10 max-w-3xl">
      <h2 class="text-4xl text-text-main dark:text-gray-100 font-bold mb-4 tracking-tight">
        {t('personalizeTitle')}
      </h2>
      <p class="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed max-w-2xl">
        {t('personalizeDescription')}
      </p>
      <a
        href="/onboarding"
        class="bg-primary hover:bg-primary-hover text-white px-8 py-3.5 rounded-md text-base font-bold uppercase tracking-wide transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 inline-block"
      >
        {t('startPersonalization')}
      </a>
    </div>
    <div class="absolute -right-16 -top-16 w-80 h-80 rounded-full border-[20px] border-accent-red-light dark:border-gray-800 opacity-50 pointer-events-none group-hover:scale-105 transition-transform duration-700"></div>
    <div class="absolute right-32 -bottom-24 w-64 h-64 rounded-full bg-accent-red-light dark:bg-gray-800/50 pointer-events-none"></div>
  </div>

  <!-- Integrations Section -->
  <div class="mb-12">
    <h3 class="text-xl font-bold text-text-main dark:text-gray-100 mb-5 flex items-center">
      <div class="w-1 h-6 bg-primary mr-3"></div>
      {t('integrations')}
    </h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <a
        href="/integration/code"
        class="bg-white dark:bg-surface-dark rounded-lg border border-gray-200 dark:border-border-dark hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-card dark:hover:shadow-card-dark transition-all cursor-pointer p-6 flex items-center h-32 group relative overflow-hidden"
      >
        <div class="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-gray-50 to-transparent dark:from-white/5 transition-opacity opacity-0 group-hover:opacity-100"></div>
        <div class="w-14 h-14 rounded-lg bg-red-50 dark:bg-gray-800 flex items-center justify-center mr-5 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
          <span class="material-symbols-outlined text-primary dark:text-gray-300 text-3xl group-hover:text-white">code</span>
        </div>
        <div>
          <span class="text-lg font-bold text-text-main dark:text-gray-200 block mb-1">{t('development')}</span>
          <span class="text-sm text-text-secondary dark:text-gray-500">{t('vscodeExtension')}</span>
        </div>
        <span class="material-symbols-outlined ml-auto text-gray-300 dark:text-gray-600 group-hover:text-primary transition-colors">arrow_forward</span>
      </a>
      <a
        href="/integration/chrome"
        class="bg-white dark:bg-surface-dark rounded-lg border border-gray-200 dark:border-border-dark hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-card dark:hover:shadow-card-dark transition-all cursor-pointer p-6 flex items-center h-32 group relative overflow-hidden"
      >
        <div class="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-gray-50 to-transparent dark:from-white/5 transition-opacity opacity-0 group-hover:opacity-100"></div>
        <div class="w-14 h-14 rounded-lg bg-red-50 dark:bg-gray-800 flex items-center justify-center mr-5 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
          <span class="material-symbols-outlined text-primary dark:text-gray-300 text-3xl group-hover:text-white">public</span>
        </div>
        <div>
          <span class="text-lg font-bold text-text-main dark:text-gray-200 block mb-1">Браузер</span>
          <span class="text-sm text-text-secondary dark:text-gray-500">Интеграция с Chrome</span>
        </div>
        <span class="material-symbols-outlined ml-auto text-gray-300 dark:text-gray-600 group-hover:text-primary transition-colors">arrow_forward</span>
      </a>
    </div>
  </div>

  <!-- Activity Section with Audio Player -->
  <div>
    <div class="flex items-center justify-between mb-4">
      <h4 class="text-sm font-bold text-text-secondary dark:text-gray-500 uppercase tracking-wider">
        Недавняя активность — {authStore.activities[0]?.date || 'Сегодня'}
      </h4>
      <button class="text-sm text-primary font-medium hover:underline">Посмотреть всю историю</button>
    </div>
    <div class="bg-white dark:bg-surface-dark rounded-lg border border-gray-200 dark:border-border-dark divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden shadow-sm transition-colors duration-200">
      {#each authStore.activities as item (item.id)}
        <div class="flex flex-col px-6 py-5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group cursor-default">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center overflow-hidden mr-4">
              <div class="w-16 flex-shrink-0 mr-4">
                <span class="text-sm font-medium text-gray-400 dark:text-gray-600">{item.time}</span>
              </div>
              {#if item.isTranscribing}
                <div class="flex items-center space-x-2 text-primary">
                  <span class="material-symbols-outlined animate-spin text-lg">sync</span>
                  <p class="text-base font-medium truncate italic">Идёт расшифровка...</p>
                </div>
              {:else}
                <p class="text-base font-medium text-text-main dark:text-gray-200 truncate group-hover:text-primary transition-colors">
                  {item.text}
                </p>
              {/if}
            </div>
            
            <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              {#if !item.isTranscribing}
                <button 
                  onclick={() => handleCopy(item.text)}
                  class="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                  title="Копировать текст"
                >
                  <span class="material-symbols-outlined text-[20px]">content_copy</span>
                </button>
              {/if}
              <button 
                onclick={() => handleDeleteActivity(item.id)}
                class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Удалить запись"
              >
                <span class="material-symbols-outlined text-[20px]">delete</span>
              </button>
            </div>
          </div>
          
          <!-- Audio Player with Visualization -->
          <div class="bg-gray-50 dark:bg-surface-dark-lighter rounded-xl p-3 flex items-center gap-4 border border-gray-200 dark:border-border-dark hover:border-primary/30 dark:hover:border-primary/30 transition-all w-full shadow-sm">
            <button 
              onclick={() => togglePlay(item.id, item.audioUrl)}
              class="w-10 h-10 bg-white dark:bg-surface-dark rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-sm flex-shrink-0 group-button border border-gray-100 dark:border-gray-700"
            >
              <span class="material-symbols-outlined text-2xl {playingId === item.id ? '' : 'ml-0.5 mt-0.5'}">
                {playingId === item.id ? 'pause' : 'play_arrow'}
              </span>
            </button>
            <div class="flex-1 flex items-center h-8 gap-[3px] overflow-hidden">
              {#each Array(180) as _, i}
                <div 
                  class="w-[3px] rounded-full transition-all duration-300 {playingId === item.id ? 'animate-pulse bg-primary/70' : 'bg-gray-300 dark:bg-gray-600 group-hover:bg-primary/50'}" 
                  style="height: {Math.max(25, Math.random() * 100)}%"
                ></div>
              {/each}
            </div>
            <span class="text-sm font-bold text-gray-500 dark:text-gray-400 w-10 text-right flex-shrink-0">
              {item.duration}
            </span>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
