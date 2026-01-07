<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { authStore } from '$lib/stores/auth.svelte';
  import { audioStore } from '$lib/stores/audio.svelte';
  import { settingsStore } from '$lib/stores/settings.svelte';
  import { SETTINGS_TABS, TONE_LABELS, TONE_DESCRIPTIONS, TONE_ICONS, STYLE_PARAMS, NOTIFICATION_CATEGORIES, PRIVACY_APPS, TIMEZONES } from '$lib/constants/settings';

  // Active tab state
  let activeTab = $state('general');

  // Microphone test state
  let isRecording = $state(false);
  let isPlaying = $state(false);
  let audioDevices = $state<MediaDeviceInfo[]>([]);
  let permissionGranted = $state(false);

  // Hotkey capturing state
  let isCapturing = $state(false);

  // Audio refs
  let mediaRecorder: MediaRecorder | null = null;
  let audioChunks: Blob[] = [];
  let audioElement: HTMLAudioElement | null = null;

  // Style slider local state
  let localToneValue = $state(settingsStore.styleSettings.toneValue);

  // Sync local tone value from global when it loads/changes
  $effect(() => {
    localToneValue = settingsStore.styleSettings.toneValue;
  });

  // Fetch audio devices
  const fetchDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const mics = devices.filter(device => device.kind === 'audioinput');
      audioDevices = mics;

      // Check for labels to determine permission status
      const hasLabels = mics.some(d => d.label.length > 0);
      permissionGranted = hasLabels;
    } catch (error) {
      console.error("Error fetching audio devices:", error);
    }
  };

  // Initialize on mount
  onMount(() => {
    fetchDevices();
    navigator.mediaDevices.addEventListener('devicechange', fetchDevices);

    // Validate/Initialize selection when devices list updates
    const validateDeviceSelection = () => {
      if (audioDevices.length > 0) {
        const currentExists = audioDevices.find(d => d.deviceId === audioStore.selectedDeviceId);

        if (!audioStore.selectedDeviceId || !currentExists) {
          // Priority: Default -> First available
          const defaultMic = audioDevices.find(d => d.deviceId === 'default');
          const fallbackId = defaultMic ? defaultMic.deviceId : audioDevices[0].deviceId;

          if (fallbackId && fallbackId !== audioStore.selectedDeviceId) {
            audioStore.setSelectedDeviceId(fallbackId);
          }
        }
      }
    };

    $effect(() => {
      validateDeviceSelection();
    });

    // Hotkey capturing
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isCapturing) return;
      e.preventDefault();

      const keys: string[] = [];
      if (e.ctrlKey) keys.push('Ctrl');
      if (e.metaKey) keys.push('Win');
      if (e.altKey) keys.push('Alt');
      if (e.shiftKey) keys.push('Shift');

      const key = e.key.toUpperCase();
      // Ignore modifier keys themselves as "trigger"
      if (!['CONTROL', 'META', 'ALT', 'SHIFT'].includes(key)) {
        keys.push(key);
        const newHotkey = keys.join(' + ');
        audioStore.setGlobalHotkey(newHotkey);
        isCapturing = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', fetchDevices);
      window.removeEventListener('keydown', handleKeyDown);

      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
      if (audioElement) {
        audioElement.pause();
      }
    };
  });

  // Handlers
  const handleDeviceChange = (e: Event) => {
    const target = e.target as HTMLSelectElement;
    audioStore.setSelectedDeviceId(target.value);
  };

  const handleVolumeChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    audioStore.setVolume(Number(target.value));
  };

  const decreaseVolume = () => {
    audioStore.setVolume(Math.max(0, audioStore.volume - 5));
  };

  const increaseVolume = () => {
    audioStore.setVolume(Math.min(100, audioStore.volume + 5));
  };

  const handleMicTest = async () => {
    // If playing, stop playback and reset to initial state
    if (isPlaying) {
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
      isPlaying = false;
      return;
    }

    // If recording, stop recording -> this triggers onstop which starts playback
    if (isRecording) {
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
      isRecording = false;
      return;
    }

    // Start recording
    try {
      const constraints = {
        audio: audioStore.selectedDeviceId ? { deviceId: { exact: audioStore.selectedDeviceId } } : true
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      // Refresh devices list to get labels if they were missing (permission granted now)
      fetchDevices();

      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Release microphone
        stream.getTracks().forEach(track => track.stop());

        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audioElement = audio;

        isPlaying = true;
        audio.play().catch(e => console.error("Playback error:", e));

        audio.onended = () => {
          isPlaying = false;
          URL.revokeObjectURL(audioUrl);
        };
      };

      mediaRecorder.start();
      isRecording = true;
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Не удалось получить доступ к микрофону. Пожалуйста, разрешите доступ в браузере.');
    }
  };

  // Determine status text/color
  const getStatus = () => {
    if (isRecording) return { text: 'Запись...', color: 'text-red-500', dot: 'bg-red-500' };
    if (isPlaying) return { text: 'Воспроизведение...', color: 'text-green-500', dot: 'bg-green-500' };
    if (permissionGranted && audioDevices.length > 0) return { text: 'Активен', color: 'text-text-secondary dark:text-gray-400', dot: 'bg-green-500' };
    if (!permissionGranted && audioDevices.length > 0) return { text: 'Требуется доступ', color: 'text-yellow-500', dot: 'bg-yellow-500' };
    return { text: 'Не найден', color: 'text-gray-400', dot: 'bg-gray-400' };
  };

  const status = getStatus();

  // Style handlers
  const getActiveIndex = (value: number) => {
    if (value < 33) return 0;
    if (value > 66) return 2;
    return 1;
  };

  const activeIndex = getActiveIndex(localToneValue);

  const handleSliderChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    localToneValue = Number(target.value);
  };

  const snapToValueAndSave = () => {
    let finalValue = 50;
    if (localToneValue < 33) finalValue = 0;
    else if (localToneValue > 66) finalValue = 100;

    localToneValue = finalValue;
    settingsStore.setStyleSettings({ ...settingsStore.styleSettings, toneValue: finalValue });
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

  // Integration handlers
  const handleToggleIntegration = () => {
    settingsStore.setIntegrationSettings({
      ...settingsStore.integrationSettings,
      chromeEnabled: !settingsStore.integrationSettings.chromeEnabled
    });
  };

  // Code settings handlers
  const toggleCodeSetting = (key: keyof typeof settingsStore.codeSettings) => {
    settingsStore.setCodeSettings({
      ...settingsStore.codeSettings,
      [key]: !settingsStore.codeSettings[key]
    });
  };
</script>

<div class="p-8 lg:px-12 lg:py-10">
  <div class="max-w-4xl mx-auto">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-text-main dark:text-white tracking-tight mb-2">Настройки</h1>
      <p class="text-text-secondary text-base">Управление общими параметрами приложения и вашей учетной записи.</p>
    </div>

    <div class="border-b border-gray-200 dark:border-border-dark mb-8">
      <nav aria-label="Tabs" class="-mb-px flex space-x-8 overflow-x-auto">
        {#each SETTINGS_TABS as tab}
          <button
            onclick={() => activeTab = tab.id}
            class={`${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-base flex items-center transition-colors`}
          >
            <span class="material-symbols-outlined mr-2 text-xl">{tab.icon}</span>
            {tab.label}
          </button>
        {/each}
      </nav>
    </div>

    <div class="space-y-8">
      <!-- General Tab -->
      {#if activeTab === 'general'}
        <div class="bg-white dark:bg-surface-dark shadow-sm rounded-lg border border-gray-200 dark:border-border-dark overflow-hidden">
          <div class="px-6 py-5 border-b border-gray-200 dark:border-border-dark bg-gray-50 dark:bg-white/5">
            <h3 class="text-xl leading-6 font-medium text-gray-900 dark:text-white">Профиль пользователя</h3>
            <p class="mt-1 max-w-2xl text-base text-gray-500 dark:text-gray-400">Информация о вашей учетной записи и аватар.</p>
          </div>
          <div class="px-6 py-6 space-y-6">
            <div class="flex items-center space-x-6">
              <div class="h-24 w-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-3xl font-bold text-gray-600 dark:text-gray-300 overflow-hidden relative border-2 border-white dark:border-gray-600 shadow-md">
                {authStore.user.initials}
              </div>
              <div>
                <h4 class="text-xl font-bold text-text-main dark:text-white">{authStore.user.firstName} {authStore.user.lastName || ''}</h4>
                <p class="text-base text-gray-500 dark:text-gray-400">Учетная запись управляется через LDAP</p>
              </div>
            </div>
            <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div class="sm:col-span-3">
                <label for="first-name" class="block text-base font-medium text-gray-700 dark:text-gray-300">Имя</label>
                <div class="mt-1">
                  <input type="text" name="first-name" id="first-name" value={authStore.user.firstName} disabled class="shadow-sm focus:ring-primary focus:border-primary block w-full text-base border-gray-300 dark:border-gray-600 rounded-md dark:bg-[#121212] dark:text-white py-2.5 px-3 bg-gray-50 text-gray-500 cursor-not-allowed opacity-75" />
                </div>
              </div>
              <div class="sm:col-span-3">
                <label for="last-name" class="block text-base font-medium text-gray-700 dark:text-gray-300">Фамилия</label>
                <div class="mt-1">
                  <input type="text" name="last-name" id="last-name" value={authStore.user.lastName || ''} disabled class="shadow-sm focus:ring-primary focus:border-primary block w-full text-base border-gray-300 dark:border-gray-600 rounded-md dark:bg-[#121212] dark:text-white py-2.5 px-3 bg-gray-50 text-gray-500 cursor-not-allowed opacity-75" />
                </div>
              </div>
              <div class="sm:col-span-6">
                <label for="email" class="block text-base font-medium text-gray-700 dark:text-gray-300">Email адрес</label>
                <div class="mt-1">
                  <input type="email" name="email" id="email" value={authStore.user.email} disabled class="shadow-sm focus:ring-primary focus:border-primary block w-full text-base border-gray-300 dark:border-gray-600 rounded-md dark:bg-[#121212] dark:text-white py-2.5 px-3 bg-gray-50 text-gray-500 cursor-not-allowed opacity-75" />
                </div>
              </div>
              <div class="sm:col-span-6">
                <label for="role" class="block text-base font-medium text-gray-700 dark:text-gray-300">Должность</label>
                <div class="mt-1">
                  <input type="text" name="role" id="role" value={authStore.user.role || 'Менеджер'} disabled class="shadow-sm focus:ring-primary focus:border-primary block w-full text-base border-gray-300 dark:border-gray-600 rounded-md dark:bg-[#121212] dark:text-white py-2.5 px-3 bg-gray-50 text-gray-500 cursor-not-allowed opacity-75" />
                </div>
              </div>
            </div>
          </div>
        </div>
      {/if}

      <!-- Devices Tab -->
      {#if activeTab === 'devices'}
        <div class="bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-border-dark shadow-sm overflow-hidden mb-8">
          <div class="px-6 py-4 border-b border-gray-100 dark:border-border-dark bg-gray-50 dark:bg-white/5 flex justify-between items-center">
            <h3 class="font-bold text-xl text-text-main dark:text-white flex items-center">
              <span class="material-symbols-outlined mr-2 text-gray-400 text-2xl">mic</span>
              Микрофон
            </h3>
            <div class="flex items-center space-x-2">
              <span class="relative flex h-3 w-3">
                <span class={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status.dot} ${isRecording || isPlaying ? '' : 'hidden'}`}></span>
                <span class={`relative inline-flex rounded-full h-3 w-3 ${status.dot}`}></span>
              </span>
              <span class={`text-sm font-medium ${status.color}`}>{status.text}</span>
            </div>
          </div>
          <div class="p-6 space-y-8">
            <div class="space-y-3">
              <label class="block text-base font-medium text-text-main dark:text-gray-200">Устройство ввода</label>
              <div class="flex gap-3">
                <div class="relative flex-1">
                  <select
                    value={audioStore.selectedDeviceId}
                    onchange={handleDeviceChange}
                    class="appearance-none block w-full pl-3 pr-12 py-3 h-[48px] text-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-background-dark dark:text-white focus:outline-none focus:ring-primary focus:border-primary rounded-md shadow-sm truncate cursor-pointer"
                  >
                    {#if audioDevices.length > 0}
                      {#each audioDevices as device, index}
                        <option value={device.deviceId}>
                          {device.label || `Микрофон ${index + 1} (${device.deviceId})`}
                        </option>
                      {/each}
                    {:else}
                      <option>Микрофоны не найдены</option>
                    {/if}
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 dark:text-gray-400">
                    <span class="material-symbols-outlined text-xl">expand_more</span>
                  </div>
                </div>
                <button
                  onclick={handleMicTest}
                  class={`px-5 py-3 rounded-md text-text-main dark:text-gray-200 transition-all shadow-sm h-[48px] aspect-square flex items-center justify-center ${
                    isRecording
                      ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse border border-red-500'
                      : isPlaying
                        ? 'bg-green-500 hover:bg-green-600 text-white border border-green-500'
                        : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
                  }`}
                  title={isRecording ? "Остановить запись" : isPlaying ? "Остановить воспроизведение" : "Начать тест"}
                >
                  <span class="material-symbols-outlined text-2xl">
                    {#if isRecording}stop{:else if isPlaying}volume_up{:else}graphic_eq{/if}
                  </span>
                </button>
              </div>
            </div>

            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <label class="block text-base font-medium text-text-main dark:text-gray-200">Уровень входного сигнала</label>
                <span class="text-base text-text-secondary dark:text-gray-400">{audioStore.volume}%</span>
              </div>
              <div class="flex items-center space-x-4">
                <button
                  onclick={decreaseVolume}
                  class="p-2.5 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors group"
                  title="Уменьшить громкость"
                >
                  <span class="material-symbols-outlined text-2xl group-hover:text-text-main dark:group-hover:text-white transition-colors">volume_down</span>
                </button>
                <div class="flex-1 relative h-8 flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={audioStore.volume}
                    oninput={handleVolumeChange}
                    class="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                    style="background: linear-gradient(to right, #EF3124 0%, #EF3124 {audioStore.volume}%, #E5E7EB {audioStore.volume}%, #E5E7EB 100%);"
                  />
                </div>
                <button
                  onclick={increaseVolume}
                  class="p-2.5 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors group"
                  title="Увеличить громкость"
                >
                  <span class="material-symbols-outlined text-2xl group-hover:text-text-main dark:group-hover:text-white transition-colors">volume_up</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="mb-8">
          <h3 class="font-bold text-xl text-blue-600 dark:text-blue-400 mb-2">
            Запись будет работать когда удерживаешь горячие клавиши
          </h3>
          <div class="bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-border-dark shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-100 dark:border-border-dark bg-gray-50 dark:bg-white/5 flex justify-between items-center">
              <h3 class="font-bold text-xl text-text-main dark:text-white flex items-center">
                <span class="material-symbols-outlined mr-2 text-gray-400 text-2xl">keyboard</span>
                Горячие клавиши
              </h3>
            </div>
            <div class="p-6">
              <div class="flex items-center justify-between">
                <div>
                  <label class="block text-base font-medium text-text-main dark:text-gray-200">Быстрая запись</label>
                  <p class="text-base text-text-secondary dark:text-gray-400 mt-1">Глобальная комбинация для старта/остановки записи</p>
                </div>
                <div class="flex items-center gap-4">
                  <div class={`px-5 py-2.5 rounded-lg border text-base font-mono font-bold transition-all ${
                    isCapturing
                      ? 'bg-primary/5 border-primary text-primary animate-pulse ring-2 ring-primary/20'
                      : 'bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-gray-700 text-text-main dark:text-white'
                  }`}>
                    {isCapturing ? 'Нажмите клавиши...' : audioStore.globalHotkey}
                  </div>
                  <button
                    onclick={() => isCapturing = !isCapturing}
                    class={`px-5 py-2.5 rounded-lg text-base font-medium transition-colors border ${
                      isCapturing
                        ? 'bg-white dark:bg-surface-dark border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                        : 'bg-white dark:bg-surface-dark border-gray-300 dark:border-gray-600 text-text-main dark:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                  >
                    {isCapturing ? 'Отмена' : 'Изменить'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/if}

      <!-- Languages Tab -->
      {#if activeTab === 'languages'}
        <div class="bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-border-dark shadow-sm overflow-hidden mb-8">
          <div class="px-6 py-4 border-b border-gray-100 dark:border-border-dark bg-gray-50 dark:bg-white/5 flex justify-between items-center">
            <h3 class="font-bold text-xl text-text-main dark:text-white flex items-center">
              <span class="material-symbols-outlined mr-2 text-blue-600 dark:text-blue-400 text-2xl">language</span>
              Региональные настройки
            </h3>
          </div>
          <div class="p-6 space-y-8">
            <div>
              <label for="language-select" class="block text-base font-medium text-text-main dark:text-gray-200 mb-2">Язык интерфейса</label>
              <select id="language-select" class="block w-full pl-3 pr-10 py-3 text-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-background-dark dark:text-white focus:outline-none focus:ring-primary focus:border-primary rounded-md shadow-sm">
                <option>Русский</option>
                <option>English</option>
              </select>
              <p class="mt-2 text-sm text-text-secondary dark:text-gray-400">Изменение языка может потребовать перезагрузки приложения.</p>
            </div>
            <div>
              <label for="timezone-select" class="block text-base font-medium text-text-main dark:text-gray-200 mb-2">Часовой пояс</label>
              <select id="timezone-select" class="block w-full pl-3 pr-10 py-3 text-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-background-dark dark:text-white focus:outline-none focus:ring-primary focus:border-primary rounded-md shadow-sm">
                {#each TIMEZONES as tz}
                  <option>{tz}</option>
                {/each}
              </select>
            </div>
          </div>
        </div>
      {/if}

      <!-- Notifications Tab -->
      {#if activeTab === 'notifications'}
        <div class="bg-white dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
          <div class="px-6 py-5 border-b border-border-light dark:border-border-dark bg-gray-50 dark:bg-white/5 flex justify-between items-center">
            <h3 class="font-bold text-xl text-text-main dark:text-white flex items-center">
              <span class="material-symbols-outlined mr-3 text-primary text-2xl">category</span>
              Категории уведомлений
            </h3>
          </div>
          <div class="hidden md:grid grid-cols-12 gap-6 px-6 py-4 border-b border-border-light dark:border-border-dark bg-gray-50/80 dark:bg-background-dark text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            <div class="col-span-8">Тип уведомления</div>
            <div class="col-span-2 text-center">Email</div>
            <div class="col-span-2 text-center">Push</div>
          </div>
          {#each NOTIFICATION_CATEGORIES as item, idx}
            <div class="p-6 border-b border-border-light dark:border-border-dark last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-150">
              <div class="md:grid md:grid-cols-12 md:gap-6 md:items-start">
                <div class="col-span-8 mb-4 md:mb-0">
                  <h4 class="font-medium text-text-main dark:text-gray-200 text-lg mb-1">{item}</h4>
                  <p class="text-base text-text-secondary dark:text-gray-400">Описание для {item.toLowerCase()}...</p>
                </div>
                <div class="col-span-2 flex items-center md:justify-center justify-between">
                  <label class="md:hidden text-base text-gray-500 font-medium">Email</label>
                  <input type="checkbox" class="w-6 h-6 text-primary border-gray-300 rounded focus:ring-primary dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div class="col-span-2 flex items-center md:justify-center justify-between mt-2 md:mt-0">
                  <label class="md:hidden text-base text-gray-500 font-medium">Push</label>
                  <input type="checkbox" class="w-6 h-6 text-primary border-gray-300 rounded focus:ring-primary dark:bg-gray-700 dark:border-gray-600" />
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}

      <!-- Privacy Tab -->
      {#if activeTab === 'privacy'}
        <div class="space-y-6">
          <div class="bg-white dark:bg-surface-dark rounded-xl p-8 border border-border-light dark:border-border-dark flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
            <div class="w-20 h-20 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
              <span class="material-symbols-outlined text-green-600 dark:text-green-400 text-4xl filled">verified_user</span>
            </div>
            <div class="flex-1 z-10 text-center md:text-left">
              <h2 class="text-xl font-bold text-text-main dark:text-white mb-2">Защищенный контур активен</h2>
              <p class="text-text-secondary text-base leading-relaxed max-w-2xl">
                Приложение работает в изолированной среде. Все текстовые данные шифруются (AES-256). Синхронизация с облаком ограничена политикой безопасности.
              </p>
            </div>
            <button class="bg-white dark:bg-transparent border border-gray-300 dark:border-gray-600 text-text-main dark:text-white px-6 py-3 rounded-lg text-base font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
              Проверить статус
            </button>
          </div>

          <div class="bg-white dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden">
            <div class="px-6 py-5 border-b border-border-light dark:border-border-dark flex justify-between items-center">
              <h3 class="font-bold text-xl text-text-main dark:text-white flex items-center">
                <span class="material-symbols-outlined mr-3 text-gray-400 text-2xl">apps</span>
                Доступ к приложениям
              </h3>
            </div>
            <div class="p-6">
              <div class="space-y-6">
                {#each PRIVACY_APPS as app, idx}
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <div class="w-12 h-12 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center mr-4">
                        <span class="material-symbols-outlined text-gray-500 dark:text-gray-400 text-2xl">{app.icon}</span>
                      </div>
                      <div>
                        <h4 class="font-medium text-text-main dark:text-white text-lg">{app.name}</h4>
                        <p class="text-sm text-text-secondary mt-0.5">{app.desc}</p>
                      </div>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" class="sr-only peer" id={`privacy-app-${idx}`} />
                      <div class="w-14 h-7 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                {/each}
              </div>
            </div>
          </div>
        </div>
      {/if}

      <!-- Style Tab -->
      {#if activeTab === 'style'}
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
                    <label class="block text-base font-bold text-text-main dark:text-gray-200 mb-2">Стоп-слова (через запятую)</label>
                    <input
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
                      <label class="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Ваш черновик</label>
                      <div class="relative">
                        <textarea rows={3} class="block w-full rounded-lg border-gray-200 dark:border-border-dark bg-white dark:bg-background-dark text-text-secondary dark:text-gray-300 shadow-sm focus:border-primary focus:ring-primary text-sm p-3 placeholder-gray-400">Привет, скинь отчет по продажам плз, очень надо до обеда!</textarea>
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
                      <label class="block text-xs font-bold text-primary uppercase tracking-wider mb-2">Результат AlfaVoice</label>
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
      {/if}

      <!-- Integrations Tab -->
      {#if activeTab === 'integrations'}
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
                  <span class={`animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 ${settingsStore.integrationSettings.chromeEnabled ? '' : 'hidden'}`}></span>
                  <span class={`relative inline-flex rounded-full h-2.5 w-2.5 ${settingsStore.integrationSettings.chromeEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                </span>
                <span class="text-sm font-medium text-text-secondary dark:text-gray-400">{settingsStore.integrationSettings.chromeEnabled ? 'Синхронизировано' : 'Отключено'}</span>
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
                    id="chrome-enabled"
                    checked={settingsStore.integrationSettings.chromeEnabled}
                    onchange={handleToggleIntegration}
                  />
                  <div class="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      {/if}

      <!-- Code Tab -->
      {#if activeTab === 'code'}
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
                Плагин AlfaVoice активно отслеживает файлы <code class="bg-gray-100 dark:bg-surface-dark-lighter px-1.5 py-0.5 rounded text-sm border border-gray-200 dark:border-border-dark dark:text-gray-300">.md</code>, <code class="bg-gray-100 dark:bg-surface-dark-lighter px-1.5 py-0.5 rounded text-sm border border-gray-200 dark:border-border-dark dark:text-gray-300">.txt</code> и комментарии в коде на соответствие корпоративному стилю.
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
                  <div class={`flex items-center justify-between pb-6 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0`}>
                    <div>
                      <h4 class="text-base font-bold text-text-main dark:text-white">{item.label}</h4>
                      <p class="text-sm text-text-secondary dark:text-gray-400 mt-0.5">{item.desc}</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        id={`code-setting-${item.id}`}
                        checked={settingsStore.codeSettings[item.id as keyof typeof settingsStore.codeSettings]}
                        onchange={() => toggleCodeSetting(item.id as keyof typeof settingsStore.codeSettings)}
                        class="sr-only peer"
                      />
                      <div class="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
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
                    <p class="text-base text-gray-700 dark:text-gray-300 leading-snug">{@html step}</p>
                  </div>
                {/each}
              </div>
              <div class="mt-8">
                <label class="text-xs font-bold text-gray-500 uppercase mb-2 block tracking-wider">API Токен разработчика</label>
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
      {/if}
    </div>
  </div>
</div>
