
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { View } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { SETTINGS_TABS, PRIVACY_APPS, NOTIFICATION_CATEGORIES, TIMEZONES } from '../../data/constants';

interface SettingsGeneralProps {
  setCurrentView: (view: View) => void;
}

const SettingsGeneral: React.FC<SettingsGeneralProps> = ({ setCurrentView }) => {
  const { 
      user, 
      globalHotkey, 
      setGlobalHotkey, 
      isGlobalRecording, 
      volume, 
      setVolume, 
      selectedDeviceId, 
      setSelectedDeviceId 
  } = useAppContext();

  const [activeTab, setActiveTab] = useState<'general' | 'devices' | 'languages' | 'notifications' | 'privacy'>('general');
  
  // Microphone test state
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [permissionGranted, setPermissionGranted] = useState(false);
  
  // Hotkey capturing state
  const [isCapturing, setIsCapturing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const mics = devices.filter(device => device.kind === 'audioinput');
      setAudioDevices(mics);
      
      // Check for labels to determine permission status
      const hasLabels = mics.some(d => d.label.length > 0);
      setPermissionGranted(hasLabels);
    } catch (error) {
      console.error("Error fetching audio devices:", error);
    }
  }, []);

  // Validate/Initialize selection when devices list updates
  useEffect(() => {
    fetchDevices();
    navigator.mediaDevices.addEventListener('devicechange', fetchDevices);
    return () => {
        navigator.mediaDevices.removeEventListener('devicechange', fetchDevices);
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        if (audioRef.current) {
            audioRef.current.pause();
        }
    };
  }, [fetchDevices]);

  // Handle device selection fallback logic if current selected is invalid
  useEffect(() => {
      if (audioDevices.length > 0) {
          const currentExists = audioDevices.find(d => d.deviceId === selectedDeviceId);
          
          if (!selectedDeviceId || !currentExists) {
              // Priority: Default -> First available
              const defaultMic = audioDevices.find(d => d.deviceId === 'default');
              const fallbackId = defaultMic ? defaultMic.deviceId : audioDevices[0].deviceId;
              
              if (fallbackId && fallbackId !== selectedDeviceId) {
                  setSelectedDeviceId(fallbackId); 
              }
          }
      }
  }, [audioDevices, selectedDeviceId, setSelectedDeviceId]);

  // Hotkey capturing logic
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isCapturing) return;
      e.preventDefault();
      
      const keys: string[] = [];
      if (e.ctrlKey) keys.push('Ctrl');
      if (e.metaKey) keys.push('Win');
      if (e.altKey) keys.push('Alt');
      if (e.shiftKey) keys.push('Shift');
      
      const key = e.key.toUpperCase();
      // Ignore modifier keys themselves as the "trigger"
      if (!['CONTROL', 'META', 'ALT', 'SHIFT'].includes(key)) {
         keys.push(key);
         const newHotkey = keys.join(' + ');
         setGlobalHotkey(newHotkey); // This triggers global save
         setIsCapturing(false);
      }
    };

    if (isCapturing) {
        window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCapturing, setGlobalHotkey]);

  const handleDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newId = e.target.value;
      setSelectedDeviceId(newId); // This triggers global save
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value)); // This triggers global save
  };

  const decreaseVolume = () => {
    setVolume(Math.max(0, volume - 5));
  };

  const increaseVolume = () => {
    setVolume(Math.min(100, volume + 5));
  };

  const handleMicTest = async () => {
    // If playing, stop playback and reset to initial state
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      return;
    }

    // If recording, stop recording -> this triggers onstop which starts playback
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    // Start recording
    try {
      const constraints = {
          audio: selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : true
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Refresh devices list to get labels if they were missing (permission granted now)
      fetchDevices();
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Release microphone
        stream.getTracks().forEach(track => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        
        setIsPlaying(true);
        audio.play().catch(e => console.error("Playback error:", e));
        
        audio.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
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

  return (
    <div className="p-8 lg:px-12 lg:py-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-main dark:text-white tracking-tight mb-2">Настройки</h1>
          <p className="text-text-secondary text-base">Управление общими параметрами приложения и вашей учетной записи.</p>
        </div>
        <div className="border-b border-gray-200 dark:border-border-dark mb-8">
          <nav aria-label="Tabs" className="-mb-px flex space-x-8 overflow-x-auto">
            {SETTINGS_TABS.map((tab) => (
                <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-base flex items-center transition-colors`}
                >
                <span className="material-symbols-outlined mr-2 text-xl">{tab.icon}</span>
                {tab.label}
                </button>
            ))}
          </nav>
        </div>
        
        <div className="space-y-8">
            {activeTab === 'general' && (
                <div className="bg-white dark:bg-surface-dark shadow-sm rounded-lg border border-gray-200 dark:border-border-dark overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200 dark:border-border-dark bg-gray-50 dark:bg-white/5">
                    <h3 className="text-xl leading-6 font-medium text-gray-900 dark:text-white">Профиль пользователя</h3>
                    <p className="mt-1 max-w-2xl text-base text-gray-500 dark:text-gray-400">Информация о вашей учетной записи и аватар.</p>
                    </div>
                    <div className="px-6 py-6 space-y-6">
                    <div className="flex items-center space-x-6">
                        <div className="h-24 w-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-3xl font-bold text-gray-600 dark:text-gray-300 overflow-hidden relative border-2 border-white dark:border-gray-600 shadow-md">
                        {user.initials}
                        </div>
                        <div>
                        <h4 className="text-xl font-bold text-text-main dark:text-white">{user.firstName} {user.lastName}</h4>
                        <p className="text-base text-gray-500 dark:text-gray-400">Учетная запись управляется через LDAP</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                        <label htmlFor="first-name" className="block text-base font-medium text-gray-700 dark:text-gray-300">Имя</label>
                        <div className="mt-1">
                            <input type="text" name="first-name" id="first-name" defaultValue={user.firstName} disabled className="shadow-sm focus:ring-primary focus:border-primary block w-full text-base border-gray-300 dark:border-gray-600 rounded-md dark:bg-[#121212] dark:text-white py-2.5 px-3 bg-gray-50 text-gray-500 cursor-not-allowed opacity-75" />
                        </div>
                        </div>
                        <div className="sm:col-span-3">
                        <label htmlFor="last-name" className="block text-base font-medium text-gray-700 dark:text-gray-300">Фамилия</label>
                        <div className="mt-1">
                            <input type="text" name="last-name" id="last-name" defaultValue={user.lastName} disabled className="shadow-sm focus:ring-primary focus:border-primary block w-full text-base border-gray-300 dark:border-gray-600 rounded-md dark:bg-[#121212] dark:text-white py-2.5 px-3 bg-gray-50 text-gray-500 cursor-not-allowed opacity-75" />
                        </div>
                        </div>
                        <div className="sm:col-span-6">
                        <label htmlFor="email" className="block text-base font-medium text-gray-700 dark:text-gray-300">Email адрес</label>
                        <div className="mt-1">
                            <input type="email" name="email" id="email" defaultValue={user.email} disabled className="shadow-sm focus:ring-primary focus:border-primary block w-full text-base border-gray-300 dark:border-gray-600 rounded-md dark:bg-[#121212] dark:text-white py-2.5 px-3 bg-gray-50 text-gray-500 cursor-not-allowed opacity-75" />
                        </div>
                        </div>
                        <div className="sm:col-span-6">
                        <label htmlFor="role" className="block text-base font-medium text-gray-700 dark:text-gray-300">Должность</label>
                        <div className="mt-1">
                            <input type="text" name="role" id="role" defaultValue={user.role} disabled className="shadow-sm focus:ring-primary focus:border-primary block w-full text-base border-gray-300 dark:border-gray-600 rounded-md dark:bg-[#121212] dark:text-white py-2.5 px-3 bg-gray-50 text-gray-500 cursor-not-allowed opacity-75" />
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
            )}

            {activeTab === 'devices' && (
                <>
                <div className="bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-border-dark shadow-sm overflow-hidden mb-8">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-border-dark bg-gray-50 dark:bg-white/5 flex justify-between items-center">
                    <h3 className="font-bold text-xl text-text-main dark:text-white flex items-center">
                    <span className="material-symbols-outlined mr-2 text-gray-400 text-2xl">mic</span>
                    Микрофон
                    </h3>
                    <div className="flex items-center space-x-2">
                    <span className="relative flex h-3 w-3">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status.dot} ${isRecording || isPlaying ? '' : 'hidden'}`}></span>
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${status.dot}`}></span>
                    </span>
                    <span className={`text-sm font-medium ${status.color}`}>{status.text}</span>
                    </div>
                </div>
                <div className="p-6 space-y-8">
                    <div className="space-y-3">
                    <label className="block text-base font-medium text-text-main dark:text-gray-200">Устройство ввода</label>
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                        <select 
                            value={selectedDeviceId}
                            onChange={handleDeviceChange}
                            className="appearance-none block w-full pl-3 pr-12 py-3 h-[48px] text-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-background-dark dark:text-white focus:outline-none focus:ring-primary focus:border-primary rounded-md shadow-sm truncate cursor-pointer"
                        >
                            {audioDevices.length > 0 ? (
                                audioDevices.map((device, index) => (
                                    <option key={device.deviceId || index} value={device.deviceId}>
                                        {device.label || `Микрофон ${index + 1} (${device.deviceId})`}
                                    </option>
                                ))
                            ) : (
                                <option>Микрофоны не найдены</option>
                            )}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 dark:text-gray-400">
                             <span className="material-symbols-outlined text-xl">expand_more</span>
                        </div>
                        </div>
                        <button 
                            onClick={handleMicTest}
                            className={`px-5 py-3 rounded-md text-text-main dark:text-gray-200 transition-all shadow-sm h-[48px] aspect-square flex items-center justify-center ${
                                isRecording 
                                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse border border-red-500' 
                                    : isPlaying 
                                        ? 'bg-green-500 hover:bg-green-600 text-white border border-green-500'
                                        : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
                            }`}
                            title={isRecording ? "Остановить запись" : isPlaying ? "Остановить воспроизведение" : "Начать тест"}
                        >
                          <span className="material-symbols-outlined text-2xl">
                            {isRecording ? 'stop' : isPlaying ? 'volume_up' : 'graphic_eq'}
                          </span>
                        </button>
                    </div>
                    </div>
                    
                    <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <label className="block text-base font-medium text-text-main dark:text-gray-200">Уровень входного сигнала</label>
                        <span className="text-base text-text-secondary dark:text-gray-400">{volume}%</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button 
                            onClick={decreaseVolume}
                            className="p-2.5 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors group" 
                            title="Уменьшить громкость"
                        >
                            <span className="material-symbols-outlined text-2xl group-hover:text-text-main dark:group-hover:text-white transition-colors">volume_down</span>
                        </button>
                        <div className="flex-1 relative h-8 flex items-center">
                            <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={volume} 
                                onChange={handleVolumeChange}
                                className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                                style={{
                                    background: `linear-gradient(to right, #EF3124 0%, #EF3124 ${volume}%, #E5E7EB ${volume}%, #E5E7EB 100%)`
                                }}
                            />
                        </div>
                         <button 
                            onClick={increaseVolume}
                            className="p-2.5 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors group" 
                            title="Увеличить громкость"
                        >
                            <span className="material-symbols-outlined text-2xl group-hover:text-text-main dark:group-hover:text-white transition-colors">volume_up</span>
                        </button>
                    </div>
                    </div>
                </div>
                </div>

                <div className="mb-8">
                    <h3 className="font-bold text-xl text-blue-600 dark:text-blue-400 mb-2">
                        Запись будет работать когда удерживаешь горячие клавиши
                    </h3>
                    <div className="bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-border-dark shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-border-dark bg-gray-50 dark:bg-white/5 flex justify-between items-center">
                            <h3 className="font-bold text-xl text-text-main dark:text-white flex items-center">
                            <span className="material-symbols-outlined mr-2 text-gray-400 text-2xl">keyboard</span>
                            Горячие клавиши
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="block text-base font-medium text-text-main dark:text-gray-200">Быстрая запись</label>
                                    <p className="text-base text-text-secondary dark:text-gray-400 mt-1">Глобальная комбинация для старта/остановки записи</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className={`px-5 py-2.5 rounded-lg border text-base font-mono font-bold transition-all ${
                                        isCapturing 
                                            ? 'bg-primary/5 border-primary text-primary animate-pulse ring-2 ring-primary/20' 
                                            : 'bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-gray-700 text-text-main dark:text-white'
                                    }`}>
                                        {isCapturing ? 'Нажмите клавиши...' : globalHotkey}
                                    </div>
                                    <button 
                                        onClick={() => setIsCapturing(!isCapturing)}
                                        className={`px-5 py-2.5 rounded-lg text-base font-medium transition-colors border ${
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
                </>
            )}

            {activeTab === 'privacy' && (
                <div className="space-y-6">
                <div className="bg-white dark:bg-surface-dark rounded-xl p-8 border border-border-light dark:border-border-dark flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
                    <div className="w-20 h-20 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-4xl filled">verified_user</span>
                    </div>
                    <div className="flex-1 z-10 text-center md:text-left">
                    <h2 className="text-xl font-bold text-text-main dark:text-white mb-2">Защищенный контур активен</h2>
                    <p className="text-text-secondary text-base leading-relaxed max-w-2xl">
                        Приложение работает в изолированной среде. Все текстовые данные шифруются (AES-256). Синхронизация с облаком ограничена политикой безопасности.
                    </p>
                    </div>
                    <button className="bg-white dark:bg-transparent border border-gray-300 dark:border-gray-600 text-text-main dark:text-white px-6 py-3 rounded-lg text-base font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
                    Проверить статус
                    </button>
                </div>

                <div className="bg-white dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden">
                    <div className="px-6 py-5 border-b border-border-light dark:border-border-dark flex justify-between items-center">
                    <h3 className="font-bold text-xl text-text-main dark:text-white flex items-center">
                        <span className="material-symbols-outlined mr-3 text-gray-400 text-2xl">apps</span>
                        Доступ к приложениям
                    </h3>
                    </div>
                    <div className="p-6">
                    <div className="space-y-6">
                        {PRIVACY_APPS.map((app, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                            <div className="flex items-center">
                            <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center mr-4">
                                <span className="material-symbols-outlined text-gray-500 dark:text-gray-400 text-2xl">{app.icon}</span>
                            </div>
                            <div>
                                <h4 className="font-medium text-text-main dark:text-white text-lg">{app.name}</h4>
                                <p className="text-sm text-text-secondary mt-0.5">{app.desc}</p>
                            </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-14 h-7 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>
                        ))}
                    </div>
                    </div>
                </div>
                </div>
            )}

            {activeTab === 'notifications' && (
                <div className="bg-white dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-border-light dark:border-border-dark bg-gray-50 dark:bg-white/5 flex justify-between items-center">
                    <h3 className="font-bold text-xl text-text-main dark:text-white flex items-center">
                    <span className="material-symbols-outlined mr-3 text-primary text-2xl">category</span>
                    Категории уведомлений
                    </h3>
                </div>
                <div className="hidden md:grid grid-cols-12 gap-6 px-6 py-4 border-b border-border-light dark:border-border-dark bg-gray-50/80 dark:bg-background-dark text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div className="col-span-8">Тип уведомления</div>
                    <div className="col-span-2 text-center">Email</div>
                    <div className="col-span-2 text-center">Push</div>
                </div>
                {NOTIFICATION_CATEGORIES.map((item, idx) => (
                    <div key={idx} className="p-6 border-b border-border-light dark:border-border-dark last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-150">
                    <div className="md:grid md:grid-cols-12 md:gap-6 md:items-start">
                        <div className="col-span-8 mb-4 md:mb-0">
                        <h4 className="font-medium text-text-main dark:text-gray-200 text-lg mb-1">{item}</h4>
                        <p className="text-base text-text-secondary dark:text-gray-400">Описание для {item.toLowerCase()}...</p>
                        </div>
                        <div className="col-span-2 flex items-center md:justify-center justify-between">
                        <span className="md:hidden text-base text-gray-500 font-medium">Email</span>
                        <input type="checkbox" className="w-6 h-6 text-primary border-gray-300 rounded focus:ring-primary dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                        <div className="col-span-2 flex items-center md:justify-center justify-between mt-2 md:mt-0">
                        <span className="md:hidden text-base text-gray-500 font-medium">Push</span>
                        <input type="checkbox" className="w-6 h-6 text-primary border-gray-300 rounded focus:ring-primary dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            )}

            {activeTab === 'languages' && (
                <div className="bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-border-dark shadow-sm overflow-hidden mb-8">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-border-dark bg-gray-50 dark:bg-white/5 flex justify-between items-center">
                    <h3 className="font-bold text-xl text-text-main dark:text-white flex items-center">
                    <span className="material-symbols-outlined mr-2 text-blue-600 dark:text-blue-400 text-2xl">language</span>
                    Региональные настройки
                    </h3>
                </div>
                <div className="p-6 space-y-8">
                    <div>
                        <label className="block text-base font-medium text-text-main dark:text-gray-200 mb-2">Язык интерфейса</label>
                        <select className="block w-full pl-3 pr-10 py-3 text-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-background-dark dark:text-white focus:outline-none focus:ring-primary focus:border-primary rounded-md shadow-sm">
                            <option>Русский</option>
                            <option>English</option>
                        </select>
                         <p className="mt-2 text-sm text-text-secondary dark:text-gray-400">Изменение языка может потребовать перезагрузки приложения.</p>
                    </div>
                    <div>
                        <label className="block text-base font-medium text-text-main dark:text-gray-200 mb-2">Часовой пояс</label>
                        <select className="block w-full pl-3 pr-10 py-3 text-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-background-dark dark:text-white focus:outline-none focus:ring-primary focus:border-primary rounded-md shadow-sm">
                            {TIMEZONES.map(tz => (
                                <option key={tz}>{tz}</option>
                            ))}
                        </select>
                    </div>
                </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default SettingsGeneral;
