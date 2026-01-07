import type { Activity } from '$lib/types';
import { authStore } from './auth.svelte';

// Audio Store
export function createAudioStore() {
  let isGlobalRecording = $state(false);
  let globalHotkey = $state('Ctrl + Win');
  let volume = $state(72);
  let selectedDeviceId = $state('');

  // Recording refs
  let mediaRecorder: MediaRecorder | null = null;
  let audioChunks: Blob[] = [];
  let startTime = 0;

  // Format duration helper
  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Start recording
  const startRecording = async () => {
    try {
      const constraints = selectedDeviceId 
        ? { audio: { deviceId: { exact: selectedDeviceId } } }
        : { audio: true };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];
      startTime = Date.now();

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const durationMs = Date.now() - startTime;
        const newId = Date.now();

        const newActivity: Activity = {
          id: newId,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: "Идёт расшифровка...",
          duration: formatDuration(durationMs),
          date: "Сегодня",
          audioUrl: audioUrl,
          isTranscribing: true
        };

        authStore.activities = [newActivity, ...authStore.activities];
        stream.getTracks().forEach(track => track.stop());
        simulateTranscription(newId, durationMs);
      };

      mediaRecorder.start();
      isGlobalRecording = true;
      
      // Play beep sound
      const audio = new Audio('https://freetestdata.com/wp-content/uploads/2021/09/Free_Test_Data_100KB_MP3.mp3');
      audio.volume = volume / 100 * 0.2;
      audio.play().catch(() => {});

    } catch (err) {
      console.error("Failed to start recording", err);
      alert("Ошибка доступа к микрофону");
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder && isGlobalRecording) {
      mediaRecorder.stop();
      isGlobalRecording = false;
    }
  };

  // Simulate transcription
  const simulateTranscription = (activityId: number, durationMs: number) => {
    const delay = Math.min(Math.max(2000, durationMs), 5000);
    setTimeout(() => {
      const mockPhrases = [
        "Добрый день, высылаю коммерческое предложение.",
        "Коллеги, прошу согласовать договор до конца недели.",
        "Отличная работа, давайте зафиксируем эти договоренности.",
        "Пожалуйста, уточните сроки поставки оборудования.",
        "Клиент просит перенести встречу на вторник."
      ];
      const randomText = mockPhrases[Math.floor(Math.random() * mockPhrases.length)];
      
      authStore.activities = authStore.activities.map(a => 
        a.id === activityId 
          ? { ...a, text: randomText, isTranscribing: false } 
          : a
      );
      
      navigator.clipboard.writeText(randomText).then(() => {
        console.log("Text copied to clipboard");
      }).catch(err => console.error("Clipboard failed", err));
    }, delay);
  };

  // Setters
  const setVolume = (val: number) => {
    volume = val;
    localStorage.setItem('volume', val.toString());
  };

  const setGlobalHotkey = (key: string) => {
    globalHotkey = key;
    localStorage.setItem('hotkey', key);
  };

  const setSelectedDeviceId = (id: string) => {
    selectedDeviceId = id;
    localStorage.setItem('microphoneId', id);
  };

  // Load settings from localStorage
  if (typeof localStorage !== 'undefined') {
    const savedVolume = localStorage.getItem('volume');
    if (savedVolume) volume = parseInt(savedVolume, 10);
    
    const savedHotkey = localStorage.getItem('hotkey');
    if (savedHotkey) globalHotkey = savedHotkey;
    
    const savedDeviceId = localStorage.getItem('microphoneId');
    if (savedDeviceId) selectedDeviceId = savedDeviceId;
  }

  return {
    get isGlobalRecording() { return isGlobalRecording; },
    get globalHotkey() { return globalHotkey; },
    get volume() { return volume; },
    get selectedDeviceId() { return selectedDeviceId; },
    startRecording,
    stopRecording,
    setVolume,
    setGlobalHotkey,
    setSelectedDeviceId
  };
}

// Singleton instance
export const audioStore = createAudioStore();
