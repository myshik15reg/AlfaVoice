
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { TONE_LABELS, TONE_DESCRIPTIONS, TONE_ICONS, STYLE_PARAMS } from '../../data/constants';

const SettingsStyle: React.FC = () => {
  const { styleSettings, setStyleSettings } = useAppContext();
  
  // Local state for smooth slider experience, sync on mouse up
  const [localToneValue, setLocalToneValue] = useState(styleSettings.toneValue);

  // Sync from global when it loads/changes
  useEffect(() => {
      setLocalToneValue(styleSettings.toneValue);
  }, [styleSettings.toneValue]);

  const getActiveIndex = (value: number) => {
    if (value < 33) return 0;
    if (value > 66) return 2;
    return 1;
  };

  const activeIndex = getActiveIndex(localToneValue);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalToneValue(Number(e.target.value));
  };

  const snapToValueAndSave = () => {
      let finalValue = 50;
      if (localToneValue < 33) finalValue = 0;
      else if (localToneValue > 66) finalValue = 100;
      
      setLocalToneValue(finalValue);
      // Trigger global save
      setStyleSettings({ ...styleSettings, toneValue: finalValue });
  }

  const handleToneSelect = (idx: number) => {
      const val = idx * 50;
      setLocalToneValue(val);
      setStyleSettings({ ...styleSettings, toneValue: val });
  };

  const toggleParam = (id: string) => {
      const newParams = { ...styleSettings.activeParams, [id]: !styleSettings.activeParams[id] };
      setStyleSettings({ ...styleSettings, activeParams: newParams });
  };

  const handleStopWordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setStyleSettings({ ...styleSettings, stopWords: e.target.value });
  };

  const handleReset = () => {
      setStyleSettings({
          toneValue: 50,
          activeParams: { caps: true, emoji: false, simple: true },
          stopWords: 'типа, короче'
      });
  };

  return (
    <div className="p-8 lg:px-12 lg:py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text-main dark:text-white tracking-tight mb-2">Персонализация стиля</h1>
            <p className="text-text-secondary dark:text-gray-400 text-base max-w-xl leading-relaxed">Настройте параметры AI-ассистента, чтобы коммуникация соответствовала вашему личному бренду и корпоративным стандартам Альфа-Лизинг.</p>
          </div>
          <div className="flex space-x-3">
            <button 
                onClick={handleReset}
                className="px-4 py-2 bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-md text-base font-medium text-text-secondary dark:text-gray-300 hover:text-primary dark:hover:text-white transition-colors"
            >
              Сбросить
            </button>
            <button className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md text-base font-bold shadow-sm transition-colors flex items-center">
              <span className="material-symbols-outlined text-xl mr-2">save</span>
              Сохранено
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white dark:bg-surface-dark rounded-xl p-6 lg:p-8 shadow-card dark:shadow-card-dark border border-gray-100 dark:border-border-dark transition-colors duration-300">
              <h3 className="text-xl font-bold text-text-main dark:text-white mb-6 flex items-center">
                <span className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mr-3">
                  <span className="material-symbols-outlined text-primary text-2xl">tune</span>
                </span>
                Тональность (Tone of Voice)
              </h3>
              <div className="mb-8 select-none">
                <div className="flex justify-between text-sm font-semibold text-text-secondary dark:text-gray-400 uppercase tracking-wider mb-4 px-1">
                  {TONE_LABELS.map((label, index) => (
                      <span key={label} className={`transition-colors duration-200 ${activeIndex === index ? 'text-primary font-bold' : ''}`}>{label}</span>
                  ))}
                </div>
                <div className="relative h-2 bg-gray-200 dark:bg-white/10 rounded-full mb-6 touch-none">
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    step="1" 
                    value={localToneValue}
                    onChange={handleSliderChange}
                    onMouseUp={snapToValueAndSave}
                    onTouchEnd={snapToValueAndSave}
                    className="absolute w-full h-2 opacity-0 cursor-pointer z-10 inset-0" 
                  />
                  <div className="absolute top-0 left-0 h-2 bg-primary rounded-full transition-all duration-75" style={{ width: `${localToneValue}%` }}></div>
                  <div 
                    className="absolute top-1/2 left-0 -translate-y-1/2 w-5 h-5 bg-white dark:bg-surface-dark border-4 border-primary rounded-full shadow-md cursor-pointer z-0 transition-all duration-75"
                    style={{ left: `${localToneValue}%`, transform: 'translate(-50%, -50%)' }}
                  ></div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {TONE_LABELS.map((label, idx) => (
                  <div 
                    key={label} 
                    onClick={() => handleToneSelect(idx)}
                    className={`relative group cursor-pointer p-4 rounded-lg border-2 transition-all h-full ${activeIndex === idx ? 'border-primary bg-red-50 dark:bg-red-900/10' : 'border-gray-200 dark:border-border-dark hover:border-red-200 dark:hover:border-red-900/50'}`}
                  >
                    {activeIndex === idx && <div className="absolute top-2 right-2 text-primary"><span className="material-symbols-outlined text-xl">check_circle</span></div>}
                    <div className="flex flex-col items-center text-center">
                      <span className={`material-symbols-outlined text-4xl mb-2 ${activeIndex === idx ? 'text-primary' : 'text-gray-400'}`}>
                        {TONE_ICONS[idx]}
                      </span>
                      <span className="font-bold text-text-main dark:text-white mb-1 text-lg">{label}</span>
                      <span className="text-sm text-text-secondary dark:text-gray-400">
                        {TONE_DESCRIPTIONS[idx]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-surface-dark rounded-xl p-6 lg:p-8 shadow-card dark:shadow-card-dark border border-gray-100 dark:border-border-dark transition-colors duration-300">
              <h3 className="text-xl font-bold text-text-main dark:text-white mb-6 flex items-center">
                <span className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center mr-3">
                  <span className="material-symbols-outlined text-gray-600 dark:text-gray-300 text-2xl">rule</span>
                </span>
                Параметры текста
              </h3>
              <div className="space-y-5">
                {STYLE_PARAMS.map((item) => (
                  <div key={item.id} className="flex items-start">
                    <div className="flex h-6 items-center">
                      <input 
                        id={item.id} 
                        type="checkbox" 
                        checked={!!styleSettings.activeParams[item.id]}
                        onChange={() => toggleParam(item.id)}
                        className="h-5 w-5 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-white/5 text-primary focus:ring-primary focus:ring-offset-0 transition-colors" 
                      />
                    </div>
                    <div className="ml-3">
                      <label htmlFor={item.id} className="font-bold text-base text-text-main dark:text-gray-200">{item.label}</label>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
                <div className="pt-4 border-t border-gray-100 dark:border-border-dark">
                  <label className="block text-base font-bold text-text-main dark:text-gray-200 mb-2">Стоп-слова (через запятую)</label>
                  <input 
                    type="text" 
                    value={styleSettings.stopWords}
                    onChange={handleStopWordsChange}
                    className="block w-full rounded-md border-gray-300 dark:border-border-dark bg-white dark:bg-background-dark text-text-main dark:text-white shadow-sm focus:border-primary focus:ring-primary text-base p-2.5 placeholder-gray-400" 
                    placeholder="Например: типа, короче, как бы" 
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Слова, которые AlfaVoice будет всегда предлагать удалить.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-6 space-y-6">
              <div className="bg-white dark:bg-surface-dark rounded-xl shadow-card dark:shadow-card-dark border border-gray-100 dark:border-border-dark overflow-hidden transition-colors duration-300">
                <div className="bg-gray-50 dark:bg-white/5 px-6 py-4 border-b border-gray-100 dark:border-border-dark flex items-center justify-between">
                  <h3 className="font-bold text-text-main dark:text-white text-lg">Предпросмотр</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800/50">LIVE</span>
                </div>
                <div className="p-6">
                  <div className="mb-6">
                    <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Ваш черновик</label>
                    <div className="relative">
                      <textarea rows={3} className="block w-full rounded-lg border-gray-200 dark:border-border-dark bg-white dark:bg-background-dark text-text-secondary dark:text-gray-300 shadow-sm focus:border-primary focus:ring-primary text-sm p-3 placeholder-gray-400" defaultValue="Привет, скинь отчет по продажам плз, очень надо до обеда!"></textarea>
                    </div>
                  </div>
                  <div className="flex justify-center -my-3 relative z-10">
                    <div className="bg-white dark:bg-surface-dark rounded-full p-1 border border-gray-100 dark:border-border-dark shadow-sm text-gray-400 dark:text-gray-500">
                      <span className="material-symbols-outlined text-lg block">arrow_downward</span>
                    </div>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-4 border border-red-100 dark:border-red-900/30 mt-0 relative">
                    <div className="absolute -top-3 -right-3">
                      <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
                        <span className="material-symbols-outlined text-white text-sm">auto_awesome</span>
                      </div>
                    </div>
                    <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">Результат AlfaVoice</label>
                    <p className="text-text-main dark:text-white text-sm leading-relaxed font-medium">
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
  );
};

export default SettingsStyle;
