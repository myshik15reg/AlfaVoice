
import React from 'react';
import { useAppContext } from '../../context/AppContext';

const SettingsCode: React.FC = () => {
  const { codeSettings, setCodeSettings } = useAppContext();

  const toggleSetting = (key: keyof typeof codeSettings) => {
      setCodeSettings({
          ...codeSettings,
          [key]: !codeSettings[key]
      });
  };

  return (
    <div className="p-8 lg:px-12 lg:py-10">
      <div className="flex flex-col mb-8">
        <h1 className="text-3xl font-bold text-text-main dark:text-white tracking-tight mb-2">Настройка среды разработки</h1>
        <p className="text-text-secondary dark:text-gray-400 text-base max-w-2xl">
          Подключите AlfaVoice к вашему любимому редактору кода, чтобы получать рекомендации по стилю и тону прямо в процессе написания документации и комментариев.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
            {/* Connection Status Card */}
            <div className="bg-white dark:bg-surface-dark rounded-xl p-6 border border-border-light dark:border-border-dark shadow-card dark:shadow-card-dark transition-colors duration-200">
                <h4 className="text-sm font-bold text-text-main dark:text-white uppercase tracking-wide mb-4">Статус подключения</h4>
                
                <div className="bg-gray-50 dark:bg-black rounded-lg p-4 border border-border-light dark:border-border-dark flex items-center justify-between mb-4 shadow-inner">
                     <div className="flex items-center space-x-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-base font-medium text-text-main dark:text-white">Подключено к локальному серверу</span>
                    </div>
                    <span className="text-sm text-text-secondary dark:text-gray-500 font-mono">Port: 6412</span>
                </div>
                
                <p className="text-base text-text-secondary dark:text-gray-400 mb-6">
                    Плагин AlfaVoice активно отслеживает файлы <code className="bg-gray-100 dark:bg-surface-dark-lighter px-1.5 py-0.5 rounded text-sm border border-gray-200 dark:border-border-dark dark:text-gray-300">.md</code> , <code className="bg-gray-100 dark:bg-surface-dark-lighter px-1.5 py-0.5 rounded text-sm border border-gray-200 dark:border-border-dark dark:text-gray-300">.txt</code> и комментарии в коде на соответствие корпоративному стилю.
                </p>
                
                <div className="flex items-center justify-between">
                     <button className="text-primary hover:text-primary-hover text-base font-bold flex items-center group transition-colors">
                        <span className="material-symbols-outlined mr-2 text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        Открыть настройки в VS Code
                    </button>
                     <button className="text-gray-400 hover:text-text-main dark:hover:text-white text-base font-medium transition-colors">
                        Отключить
                    </button>
                </div>
            </div>

            {/* Analyzer Settings Card */}
            <div className="bg-white dark:bg-surface-dark rounded-xl p-6 border border-border-light dark:border-border-dark shadow-card dark:shadow-card-dark transition-colors duration-200">
                 <h3 className="text-xl font-bold text-text-main dark:text-white mb-6">Настройки анализатора</h3>
                 <div className="space-y-6">
                    {[
                        { id: 'realtimeCheck', label: 'Проверка орфографии в реальном времени', desc: 'Подсветка ошибок при вводе текста' },
                        { id: 'autoTone', label: 'Автокоррекция тональности', desc: 'Предлагать замены для соответствия Tone of Voice' },
                        { id: 'ignoreBlocks', label: 'Игнорировать блоки кода', desc: 'Не проверять текст внутри ``` ```' },
                        { id: 'notifications', label: 'Уведомления об обновлениях', desc: 'Сообщать о новых правилах стиля' }
                    ].map((item, idx) => {
                        const key = item.id as keyof typeof codeSettings;
                        return (
                            <div key={idx} className={`flex items-center justify-between pb-6 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0`}>
                                <div>
                                    <h4 className="text-base font-bold text-text-main dark:text-white">{item.label}</h4>
                                    <p className="text-sm text-text-secondary dark:text-gray-400 mt-0.5">{item.desc}</p>
                                </div>
                                <label className={`relative inline-flex items-center cursor-pointer`}>
                                    <input 
                                        type="checkbox" 
                                        checked={codeSettings[key]} 
                                        onChange={() => toggleSetting(key)}
                                        className="sr-only peer" 
                                    />
                                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                </label>
                            </div>
                        )
                    })}
                 </div>
            </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
             {/* Activity Log */}
             <div className="bg-white dark:bg-surface-dark rounded-xl p-6 border border-border-light dark:border-border-dark shadow-card dark:shadow-card-dark transition-colors duration-200">
                <h3 className="text-xl font-bold text-text-main dark:text-white mb-6">Журнал активности плагина</h3>
                <div className="space-y-6">
                    <div className="flex items-start space-x-3 text-sm">
                        <span className="text-gray-400 text-xs mt-0.5 w-10 flex-shrink-0">10:42</span>
                        <div>
                            <p className="text-text-main dark:text-white font-medium mb-1"><span className="text-green-500 font-bold">Исправлено:</span> "Фича" -{'>'} <br/>"Функциональность"</p>
                            <p className="text-xs text-text-secondary dark:text-gray-500">readme.md</p>
                        </div>
                    </div>
                    <div className="flex items-start space-x-3 text-sm">
                        <span className="text-gray-400 text-xs mt-0.5 w-10 flex-shrink-0">10:38</span>
                        <div>
                            <p className="text-text-main dark:text-white font-medium mb-1"><span className="text-blue-500 font-bold">Предложено:</span> Упростить формулировку</p>
                            <p className="text-xs text-text-secondary dark:text-gray-500">api_docs.txt</p>
                        </div>
                    </div>
                    <div className="flex items-start space-x-3 text-sm">
                        <span className="text-gray-400 text-xs mt-0.5 w-10 flex-shrink-0">09:15</span>
                        <div>
                            <p className="text-text-main dark:text-white font-medium mb-1">Синхронизация словаря завершена</p>
                            <p className="text-xs text-text-secondary dark:text-gray-500">System</p>
                        </div>
                    </div>
                </div>
                <button className="w-full text-center text-primary text-sm font-bold mt-8 hover:underline uppercase tracking-widest">Показать все события</button>
             </div>

             {/* Installation Guide */}
             <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-xl p-6 shadow-card dark:shadow-card-dark transition-colors duration-200">
                <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Установка плагина</h3>
                <div className="space-y-5">
                    {[
                        'Откройте раздел расширений <br/>в VS Code (Ctrl+Shift+X).',
                        'Введите в поиск <strong>AlfaVoice Connector</strong>.',
                        'Нажмите Install и <br/>перезагрузите редактор.',
                        'Используйте токен ниже для <br/>авторизации.'
                    ].map((step, idx) => (
                        <div key={idx} className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white shadow-sm">{idx + 1}</div>
                            <p className="text-base text-gray-700 dark:text-gray-300 leading-snug" dangerouslySetInnerHTML={{__html: step}}></p>
                        </div>
                    ))}
                </div>
                <div className="mt-8">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block tracking-wider">API Токен разработчика</label>
                    <div className="flex items-center space-x-2">
                         <div className="flex-1 bg-gray-100 dark:bg-black border border-gray-200 dark:border-gray-700 rounded px-3 py-2.5 text-sm font-mono text-gray-600 dark:text-gray-300 truncate">
                            alf_dev_88293_xqkw...
                        </div>
                        <button className="p-2.5 text-gray-400 hover:text-primary dark:hover:text-white transition-colors border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10">
                            <span className="material-symbols-outlined text-xl">content_copy</span>
                        </button>
                    </div>
                    <p className="text-sm text-red-500 dark:text-red-400 mt-3 flex items-center">
                        <span className="material-symbols-outlined text-lg mr-1.5">warning</span>
                        Никому не сообщайте этот токен.
                    </p>
                </div>
             </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsCode;