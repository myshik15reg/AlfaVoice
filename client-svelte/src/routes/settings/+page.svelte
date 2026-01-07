<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { authStore } from '$lib/stores/auth.svelte';
  import { audioStore } from '$lib/stores/audio.svelte';
  import { settingsStore } from '$lib/stores/settings.svelte';
  import { SETTINGS_TABS, NOTIFICATION_CATEGORIES, PRIVACY_APPS, TIMEZONES } from '$lib/constants/settings';
  import { t, getLocale, setLocale } from '$lib/i18n';

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

</script>

<div class="p-8 lg:px-12 lg:py-10">
  <div class="max-w-4xl mx-auto">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-text-main dark:text-white tracking-tight mb-2">{t('settingsTitle')}</h1>
      <p class="text-text-secondary text-base">{t('settingsDescription')}</p>
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
            <h3 class="text-xl leading-6 font-medium text-gray-900 dark:text-white">{t('userProfile')}</h3>
            <p class="mt-1 max-w-2xl text-base text-gray-500 dark:text-gray-400">{t('userProfileDescription')}</p>
          </div>
          <div class="px-6 py-6 space-y-6">
            <div class="flex items-center space-x-6">
              <div class="h-24 w-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-3xl font-bold text-gray-600 dark:text-gray-300 overflow-hidden relative border-2 border-white dark:border-gray-600 shadow-md">
                {authStore.user.initials}
              </div>
              <div>
                <h4 class="text-xl font-bold text-text-main dark:text-white">{authStore.user.firstName} {authStore.user.lastName || ''}</h4>
                <p class="text-base text-gray-500 dark:text-gray-400">{t('managedByLdap')}</p>
              </div>
            </div>
            <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div class="sm:col-span-3">
                <label for="first-name" class="block text-base font-medium text-gray-700 dark:text-gray-300">{t('firstName')}</label>
                <div class="mt-1">
                  <input type="text" name="first-name" id="first-name" value={authStore.user.firstName} disabled class="shadow-sm focus:ring-primary focus:border-primary block w-full text-base border-gray-300 dark:border-gray-600 rounded-md dark:bg-[#121212] dark:text-white py-2.5 px-3 bg-gray-50 text-gray-500 cursor-not-allowed opacity-75" />
                </div>
              </div>
              <div class="sm:col-span-3">
                <label for="last-name" class="block text-base font-medium text-gray-700 dark:text-gray-300">{t('lastName')}</label>
                <div class="mt-1">
                  <input type="text" name="last-name" id="last-name" value={authStore.user.lastName || ''} disabled class="shadow-sm focus:ring-primary focus:border-primary block w-full text-base border-gray-300 dark:border-gray-600 rounded-md dark:bg-[#121212] dark:text-white py-2.5 px-3 bg-gray-50 text-gray-500 cursor-not-allowed opacity-75" />
                </div>
              </div>
              <div class="sm:col-span-6">
                <label for="email" class="block text-base font-medium text-gray-700 dark:text-gray-300">{t('email')}</label>
                <div class="mt-1">
                  <input type="email" name="email" id="email" value={authStore.user.email} disabled class="shadow-sm focus:ring-primary focus:border-primary block w-full text-base border-gray-300 dark:border-gray-600 rounded-md dark:bg-[#121212] dark:text-white py-2.5 px-3 bg-gray-50 text-gray-500 cursor-not-allowed opacity-75" />
                </div>
              </div>
              <div class="sm:col-span-6">
                <label for="role" class="block text-base font-medium text-gray-700 dark:text-gray-300">{t('role')}</label>
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
              {t('microphone')}
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
              <label for="device-select" class="block text-base font-medium text-text-main dark:text-gray-200">{t('inputDevice')}</label>
              <div class="flex gap-3">
                <div class="relative flex-1">
                  <select
                    id="device-select"
                    value={audioStore.selectedDeviceId}
                    onchange={handleDeviceChange}
                    class="appearance-none block w-full pl-3 pr-12 py-3 h-[48px] text-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-background-dark dark:text-white focus:outline-none focus:ring-primary focus:border-primary rounded-md shadow-sm truncate cursor-pointer"
                  >
                    {#if audioDevices.length > 0}
                      {#each audioDevices as device, index}
                        <option value={device.deviceId}>
                          {device.label || `${t('microphone')} ${index + 1} (${device.deviceId})`}
                        </option>
                      {/each}
                    {:else}
                      <option>{t('microphonesNotFound')}</option>
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
                <label for="volume-slider" class="block text-base font-medium text-text-main dark:text-gray-200">Уровень входного сигнала</label>
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
                    id="volume-slider"
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
            {t('recordingWorksWhenHolding')}
          </h3>
          <div class="bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-border-dark shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-100 dark:border-border-dark bg-gray-50 dark:bg-white/5 flex justify-between items-center">
              <h3 class="font-bold text-xl text-text-main dark:text-white flex items-center">
                <span class="material-symbols-outlined mr-2 text-gray-400 text-2xl">keyboard</span>
                {t('hotkeys')}
              </h3>
            </div>
            <div class="p-6">
              <div class="flex items-center justify-between">
                <div>
                  <label for="hotkey-display" class="block text-base font-medium text-text-main dark:text-gray-200">{t('quickRecording')}</label>
                  <p class="text-base text-text-secondary dark:text-gray-400 mt-1">{t('globalHotkeyDescription')}</p>
                </div>
                <div class="flex items-center gap-4">
                  <div id="hotkey-display" class={`px-5 py-2.5 rounded-lg border text-base font-mono font-bold transition-all ${
                    isCapturing
                      ? 'bg-primary/5 border-primary text-primary animate-pulse ring-2 ring-primary/20'
                      : 'bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-gray-700 text-text-main dark:text-white'
                  }`}>
                    {isCapturing ? t('pressKeys') : audioStore.globalHotkey}
                  </div>
                  <button
                    onclick={() => isCapturing = !isCapturing}
                    class={`px-5 py-2.5 rounded-lg text-base font-medium transition-colors border ${
                      isCapturing
                        ? 'bg-white dark:bg-surface-dark border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                        : 'bg-white dark:bg-surface-dark border-gray-300 dark:border-gray-600 text-text-main dark:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                  >
                    {isCapturing ? t('cancel') : t('change')}
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
              {t('regionalSettings')}
            </h3>
          </div>
          <div class="p-6 space-y-8">
            <div>
              <label for="language-select" class="block text-base font-medium text-text-main dark:text-gray-200 mb-2">{t('interfaceLanguage')}</label>
              <select
                id="language-select"
                value={getLocale()}
                onchange={(e) => setLocale((e.target as HTMLSelectElement).value as 'en' | 'ru')}
                class="block w-full pl-3 pr-10 py-3 text-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-background-dark dark:text-white focus:outline-none focus:ring-primary focus:border-primary rounded-md shadow-sm cursor-pointer"
              >
                <option value="ru">Русский</option>
                <option value="en">English</option>
              </select>
              <p class="mt-2 text-sm text-text-secondary dark:text-gray-400">{t('languageChangeRequiresReload')}</p>
            </div>
            <div>
              <label for="timezone-select" class="block text-base font-medium text-text-main dark:text-gray-200 mb-2">{t('timezone')}</label>
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
              {t('notificationCategories')}
            </h3>
          </div>
          <div class="hidden md:grid grid-cols-12 gap-6 px-6 py-4 border-b border-border-light dark:border-border-dark bg-gray-50/80 dark:bg-background-dark text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            <div class="col-span-8">{t('notificationType')}</div>
            <div class="col-span-2 text-center">{t('email')}</div>
            <div class="col-span-2 text-center">{t('push')}</div>
          </div>
          {#each NOTIFICATION_CATEGORIES as item, idx}
            <div class="p-6 border-b border-border-light dark:border-border-dark last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-150">
              <div class="md:grid md:grid-cols-12 md:gap-6 md:items-start">
                <div class="col-span-8 mb-4 md:mb-0">
                  <h4 class="font-medium text-text-main dark:text-gray-200 text-lg mb-1">{item}</h4>
                  <p class="text-base text-text-secondary dark:text-gray-400">{t('descriptionFor', item)}</p>
                </div>
                <div class="col-span-2 flex items-center md:justify-center justify-between">
                  <label for={`notif-email-${idx}`} class="md:hidden text-base text-gray-500 font-medium">{t('email')}</label>
                  <input type="checkbox" id={`notif-email-${idx}`} class="w-6 h-6 text-primary border-gray-300 rounded focus:ring-primary dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div class="col-span-2 flex items-center md:justify-center justify-between mt-2 md:mt-0">
                  <label for={`notif-push-${idx}`} class="md:hidden text-base text-gray-500 font-medium">{t('push')}</label>
                  <input type="checkbox" id={`notif-push-${idx}`} class="w-6 h-6 text-primary border-gray-300 rounded focus:ring-primary dark:bg-gray-700 dark:border-gray-600" />
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
              <h2 class="text-xl font-bold text-text-main dark:text-white mb-2">{t('protectedPerimeterActive')}</h2>
              <p class="text-text-secondary text-base leading-relaxed max-w-2xl">
                {t('protectedPerimeterDescription')}
              </p>
            </div>
            <button class="bg-white dark:bg-transparent border border-gray-300 dark:border-gray-600 text-text-main dark:text-white px-6 py-3 rounded-lg text-base font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
              {t('checkStatus')}
            </button>
          </div>

          <div class="bg-white dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden">
            <div class="px-6 py-5 border-b border-border-light dark:border-border-dark flex justify-between items-center">
              <h3 class="font-bold text-xl text-text-main dark:text-white flex items-center">
                <span class="material-symbols-outlined mr-3 text-gray-400 text-2xl">apps</span>
                {t('appAccess')}
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

    </div>
  </div>
</div>
