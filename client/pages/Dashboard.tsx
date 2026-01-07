
import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import type { View } from '../types';

interface DashboardProps {
  setCurrentView: (view: View) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setCurrentView }) => {
  const { user, activities, deleteActivity, isGlobalRecording } = useAppContext();
  const [playingId, setPlayingId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [daysLeftInWeek, setDaysLeftInWeek] = useState<{ count: number, label: string }>({ count: 0, label: 'дней' });
  const [stats, setStats] = useState({ words: 0, wpm: 0 });

  useEffect(() => {
    // 1. Calculate Days Left (Assuming week ends on Sunday)
    const today = new Date();
    const currentDay = today.getDay(); // 0 (Sun) - 6 (Sat)
    // Convert to Monday=1 ... Sunday=7 for easier logic or just assume 7 days total
    // If Sunday (0), days passed = 7. Days left = 0.
    // If Monday (1), days passed = 1. Days left = 6.
    const daysPassed = currentDay === 0 ? 7 : currentDay;
    const daysLeft = 7 - daysPassed;

    let label = 'дней';
    if (daysLeft === 1) label = 'день';
    else if (daysLeft > 1 && daysLeft < 5) label = 'дня';
    
    setDaysLeftInWeek({ count: daysLeft, label });

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
    // Speed = Total Words / Total Minutes
    const avgWpm = totalMinutes > 0 ? Math.round(totalWords / totalMinutes) : 0;

    setStats({ words: totalWords, wpm: avgWpm });

  }, [activities]);

  // Stop playback if playing ID changes or component unmounts
  useEffect(() => {
    return () => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
    };
  }, []);

  const togglePlay = (id: number, audioUrl?: string) => {
    if (playingId === id) {
      // Stop current
      if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
      }
      setPlayingId(null);
    } else {
      // Stop previous if exists
      if (audioRef.current) {
          audioRef.current.pause();
      }

      setPlayingId(id);

      if (audioUrl) {
          // Play real audio
          const audio = new Audio(audioUrl);
          audioRef.current = audio;
          audio.onended = () => setPlayingId(null);
          audio.play().catch(e => console.error("Error playing audio", e));
      } else {
          // Mock play for older items without audioUrl
          setTimeout(() => {
              setPlayingId(null);
          }, 2000); // Fake duration
      }
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="p-8 lg:px-12 lg:py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-main dark:text-white tracking-tight mb-1">С возвращением, {user.firstName}</h1>
          <p className="text-text-secondary dark:text-text-dark-secondary text-base">Обзор вашей продуктивности.</p>
        </div>
        
        {/* Recording Status Indicator */}
        {isGlobalRecording && (
             <div className="flex items-center bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg border border-red-100 dark:border-red-900/50 animate-pulse">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <span className="font-bold text-red-600 dark:text-red-400">Идёт запись...</span>
             </div>
        )}

        <div className="flex items-center bg-white dark:bg-surface-dark rounded-lg px-2 py-4 border border-gray-200 dark:border-border-dark shadow-sm">
          <div className="flex items-center px-4 py-1 border-r border-gray-100 dark:border-gray-700">
            <span className="material-symbols-outlined text-primary mr-2 text-lg">local_fire_department</span>
            <div className="flex flex-col justify-center">
              <span className="text-base font-bold text-text-main dark:text-gray-200">
                {daysLeftInWeek.count} {daysLeftInWeek.label}
              </span>
            </div>
          </div>
          <div className="flex items-center px-4 py-1 border-r border-gray-100 dark:border-gray-700">
            <span className="material-symbols-outlined text-primary mr-2 text-lg">edit_note</span>
            <div className="flex flex-col justify-center">
              <span className="text-base font-bold text-text-main dark:text-gray-200">{stats.words.toLocaleString()} слов</span>
            </div>
          </div>
          <div className="flex items-center px-4 py-1">
            <span className="material-symbols-outlined text-primary mr-2 text-lg">speed</span>
            <div className="flex flex-col justify-center">
              <span className="text-base font-bold text-text-main dark:text-gray-200">{stats.wpm} С/М</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-xl p-10 mb-12 border border-gray-200 dark:border-border-dark relative overflow-hidden shadow-card dark:shadow-card-dark group transition-colors duration-200">
        <div className="relative z-10 max-w-3xl">
          <h2 className="text-4xl text-text-main dark:text-gray-100 font-bold mb-4 tracking-tight">
            Сделайте AlfaVoice похожим на <span className="text-primary italic font-serif">вас</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed max-w-2xl">
            AlfaVoice адаптируется к вашему корпоративному тону на всех платформах. Персонализируйте свой стиль письма для <span className="font-semibold text-text-main dark:text-white">сообщений, писем клиентам и внутренних чатов</span>, чтобы обеспечить единообразие бренда.
          </p>
          <button 
            onClick={() => setCurrentView('onboarding_style')}
            className="bg-primary hover:bg-primary-hover text-white px-8 py-3.5 rounded-md text-base font-bold uppercase tracking-wide transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Начать персонализацию
          </button>
        </div>
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full border-[20px] border-accent-red-light dark:border-gray-800 opacity-50 pointer-events-none group-hover:scale-105 transition-transform duration-700"></div>
        <div className="absolute right-32 -bottom-24 w-64 h-64 rounded-full bg-accent-red-light dark:bg-gray-800/50 pointer-events-none"></div>
      </div>

      <div className="mb-12">
        <h3 className="text-xl font-bold text-text-main dark:text-gray-100 mb-5 flex items-center">
          <div className="w-1 h-6 bg-primary mr-3"></div>
          Интеграции
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            onClick={() => setCurrentView('integration_code')}
            className="bg-white dark:bg-surface-dark rounded-lg border border-gray-200 dark:border-border-dark hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-card dark:hover:shadow-card-dark transition-all cursor-pointer p-6 flex items-center h-32 group relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-gray-50 to-transparent dark:from-white/5 transition-opacity opacity-0 group-hover:opacity-100"></div>
            <div className="w-14 h-14 rounded-lg bg-red-50 dark:bg-gray-800 flex items-center justify-center mr-5 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
              <span className="material-symbols-outlined text-primary dark:text-gray-300 text-3xl group-hover:text-white">code</span>
            </div>
            <div>
              <span className="text-lg font-bold text-text-main dark:text-gray-200 block mb-1">Разработка</span>
              <span className="text-sm text-text-secondary dark:text-gray-500">Расширение VS Code</span>
            </div>
            <span className="material-symbols-outlined ml-auto text-gray-300 dark:text-gray-600 group-hover:text-primary transition-colors">arrow_forward</span>
          </div>
          <div 
            onClick={() => setCurrentView('integration_chrome')}
            className="bg-white dark:bg-surface-dark rounded-lg border border-gray-200 dark:border-border-dark hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-card dark:hover:shadow-card-dark transition-all cursor-pointer p-6 flex items-center h-32 group relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-gray-50 to-transparent dark:from-white/5 transition-opacity opacity-0 group-hover:opacity-100"></div>
            <div className="w-14 h-14 rounded-lg bg-red-50 dark:bg-gray-800 flex items-center justify-center mr-5 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
              <span className="material-symbols-outlined text-primary dark:text-gray-300 text-3xl group-hover:text-white">public</span>
            </div>
            <div>
              <span className="text-lg font-bold text-text-main dark:text-gray-200 block mb-1">Браузер</span>
              <span className="text-sm text-text-secondary dark:text-gray-500">Интеграция с Chrome</span>
            </div>
            <span className="material-symbols-outlined ml-auto text-gray-300 dark:text-gray-600 group-hover:text-primary transition-colors">arrow_forward</span>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-text-secondary dark:text-gray-500 uppercase tracking-wider">Недавняя активность — {activities[0]?.date || 'Сегодня'}</h4>
          <button className="text-sm text-primary font-medium hover:underline">Посмотреть всю историю</button>
        </div>
        <div className="bg-white dark:bg-surface-dark rounded-lg border border-gray-200 dark:border-border-dark divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden shadow-sm transition-colors duration-200">
          {activities.map((item) => (
            <div key={item.id} className="flex flex-col px-6 py-5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group cursor-default">
              <div className="flex items-center justify-between mb-3">
                 <div className="flex items-center overflow-hidden mr-4">
                    <div className="w-16 flex-shrink-0 mr-4">
                        <span className="text-sm font-medium text-gray-400 dark:text-gray-600">{item.time}</span>
                    </div>
                    {item.isTranscribing ? (
                        <div className="flex items-center space-x-2 text-primary">
                            <span className="material-symbols-outlined animate-spin text-lg">sync</span>
                            <p className="text-base font-medium truncate italic">Идёт расшифровка...</p>
                        </div>
                    ) : (
                        <p className="text-base font-medium text-text-main dark:text-gray-200 truncate group-hover:text-primary transition-colors">{item.text}</p>
                    )}
                 </div>
                 
                 <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    {!item.isTranscribing && (
                        <button 
                            onClick={() => handleCopy(item.text)}
                            className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                            title="Копировать текст"
                        >
                            <span className="material-symbols-outlined text-[20px]">content_copy</span>
                        </button>
                    )}
                    <button 
                        onClick={() => deleteActivity(item.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Удалить запись"
                    >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                 </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-surface-dark-lighter rounded-xl p-3 flex items-center gap-4 border border-gray-200 dark:border-border-dark hover:border-primary/30 dark:hover:border-primary/30 transition-all w-full shadow-sm">
                <button 
                    onClick={() => togglePlay(item.id, item.audioUrl)}
                    className="w-10 h-10 bg-white dark:bg-surface-dark rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-sm flex-shrink-0 group-button border border-gray-100 dark:border-gray-700"
                >
                    <span className={`material-symbols-outlined text-2xl ${playingId === item.id ? '' : 'ml-0.5 mt-0.5'}`}>
                        {playingId === item.id ? 'pause' : 'play_arrow'}
                    </span>
                </button>
                <div className="flex-1 flex items-center h-8 gap-[3px] overflow-hidden">
                  {Array.from({ length: 180 }).map((_, i) => (
                    <div 
                        key={i} 
                        className={`w-[3px] rounded-full transition-all duration-300 ${playingId === item.id ? 'animate-pulse bg-primary/70' : 'bg-gray-300 dark:bg-gray-600 group-hover:bg-primary/50'}`} 
                        style={{ height: `${Math.max(25, Math.random() * 100)}%` }}
                    ></div>
                  ))}
                </div>
                <span className="text-sm font-bold text-gray-500 dark:text-gray-400 w-10 text-right flex-shrink-0">{item.duration}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
