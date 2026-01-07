import React from 'react';

const SettingsDevices: React.FC = () => {
  return (
    <div className="p-8 lg:px-12 lg:py-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <nav className="flex text-sm text-gray-500 mb-2">
            <span className="hover:text-primary cursor-pointer transition-colors">Настройки</span>
            <span className="mx-2">/</span>
            <span className="text-text-main dark:text-gray-200 font-medium">Устройства</span>
          </nav>
          <h1 className="text-3xl font-bold text-text-main dark:text-white tracking-tight">Настройки устройств</h1>
          <p className="text-text-secondary mt-2 text-lg">Управление микрофоном и аудиоустройствами для голосового ввода и команд.</p>
        </div>

        <div className="bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-border-dark shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-border-dark bg-gray-50 dark:bg-white/5 flex justify-between items-center">
            <h3 className="font-bold text-lg text-text-main dark:text-white flex items-center">
              <span className="material-symbols-outlined mr-2 text-gray-400">mic</span>
              Микрофон
            </h3>
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              <span className="text-xs font-medium text-text-secondary dark:text-gray-400">Активен</span>
            </div>
          </div>
          <div className="p-6 space-y-8">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-text-main dark:text-gray-200">Устройство ввода</label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <select className="block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-background-dark dark:text-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md shadow-sm">
                    <option>Микрофон (Realtek(R) Audio)</option>
                    <option>Headset Microphone (Jabra Evolve 65)</option>
                  </select>
                </div>
                <button className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-text-main dark:text-gray-200 transition-colors shadow-sm whitespace-nowrap h-[42px]">
                  Тест
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-text-main dark:text-gray-200">Уровень входного сигнала</label>
                <span className="text-sm text-text-secondary dark:text-gray-400">72%</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="material-symbols-outlined text-gray-400">volume_mute</span>
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[72%] rounded-full relative"></div>
                </div>
                <span className="material-symbols-outlined text-gray-400">volume_up</span>
              </div>
              <div className="flex items-center justify-center space-x-1 h-8 pt-2">
                 {/* Visualizer bars simulation */}
                 {[1,2,1,3,2,4,3,2,1].map((h, i) => (
                    <div key={i} className={`w-1 h-${h*2} bg-primary rounded-full opacity-${h === 1 ? '50' : '100'}`}></div>
                 ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsDevices;