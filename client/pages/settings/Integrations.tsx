
import React from 'react';
import { useAppContext } from '../../context/AppContext';

const SettingsIntegrations: React.FC = () => {
  const { integrationSettings, setIntegrationSettings } = useAppContext();

  const handleToggle = () => {
      setIntegrationSettings({ 
          ...integrationSettings, 
          chromeEnabled: !integrationSettings.chromeEnabled 
      });
  };

  return (
    <div className="p-8 lg:px-12 lg:py-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <nav className="flex text-base text-gray-500 mb-2">
            <span className="hover:text-primary cursor-pointer transition-colors">Настройки</span>
            <span className="mx-2">/</span>
            <span className="hover:text-primary cursor-pointer transition-colors">Интеграции</span>
            <span className="mx-2">/</span>
            <span className="text-text-main dark:text-gray-200 font-medium">Chrome</span>
          </nav>
          <h1 className="text-3xl font-bold text-text-main dark:text-white tracking-tight">Интеграция с Google Chrome</h1>
          <p className="text-text-secondary dark:text-text-dark-secondary mt-2 text-lg">Персонализируйте свой стиль письма в Gmail, Google Docs и других веб-приложениях с помощью AlfaVoice.</p>
        </div>
        
        <div className="bg-white dark:bg-surface-dark rounded-xl p-8 border border-gray-200 dark:border-border-dark shadow-sm mb-10 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="w-24 h-24 bg-blue-50 dark:bg-white/5 rounded-full flex items-center justify-center flex-shrink-0 border border-blue-100 dark:border-border-dark">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-5xl">public</span>
          </div>
          <div className="flex-1 relative z-10">
            <div className="flex items-center mb-2">
              <h2 className="text-xl font-bold text-text-main dark:text-white mr-3">Расширение AlfaVoice</h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-gray-300">v2.4.0</span>
            </div>
            <p className="text-gray-600 dark:text-text-dark-secondary mb-6 leading-relaxed max-w-2xl text-base">
              Получайте рекомендации по стилю и тону в реальном времени. Расширение автоматически проверяет ваши сообщения на соответствие корпоративному стилю Альфа-Лизинг.
            </p>
            <div className="flex items-center flex-wrap gap-4">
              <button className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-lg text-base font-bold shadow-md transition-all flex items-center group">
                <span className="material-symbols-outlined mr-2 text-xl group-hover:animate-bounce">add_to_queue</span>
                Установить расширение
              </button>
              <button className="text-text-main dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 px-6 py-2.5 rounded-lg text-base font-medium transition-colors">
                Проверить статус
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-border-dark shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-border-dark bg-gray-50 dark:bg-white/5 flex justify-between items-center">
            <h3 className="font-bold text-xl text-text-main dark:text-white flex items-center">
              <span className="material-symbols-outlined mr-2 text-gray-400">tune</span>
              Настройки веб-контента
            </h3>
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 ${integrationSettings.chromeEnabled ? '' : 'hidden'}`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${integrationSettings.chromeEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></span>
              </span>
              <span className="text-sm font-medium text-text-secondary dark:text-gray-400">{integrationSettings.chromeEnabled ? 'Синхронизировано' : 'Отключено'}</span>
            </div>
          </div>
          <div className="p-6 space-y-8">
            <div className="flex items-start justify-between group">
              <div className="pr-8">
                <h4 className="font-medium text-text-main dark:text-gray-200 text-lg">Автоматическая проверка</h4>
                <p className="text-base text-text-secondary dark:text-text-dark-secondary mt-1">Анализировать текст и предлагать улучшения на всех веб-сайтах по умолчанию.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
                <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={integrationSettings.chromeEnabled}
                    onChange={handleToggle}
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsIntegrations;
