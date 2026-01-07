import React from 'react';

const SettingsPrivacy: React.FC = () => {
  return (
    <div className="p-8 lg:px-12 lg:py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-main dark:text-white tracking-tight mb-2">Конфиденциальность и безопасность</h1>
          <p className="text-text-secondary text-sm">Управление защитой данных в соответствии с корпоративными стандартами Альфа-Лизинг.</p>
        </div>

        <div className="bg-white dark:bg-surface-dark rounded-xl p-8 border border-border-light dark:border-border-dark flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-3xl filled">verified_user</span>
          </div>
          <div className="flex-1 z-10 text-center md:text-left">
            <h2 className="text-lg font-bold text-text-main dark:text-white mb-1">Защищенный контур активен</h2>
            <p className="text-text-secondary text-sm leading-relaxed max-w-2xl">
              Приложение работает в изолированной среде. Все текстовые данные шифруются (AES-256). Синхронизация с облаком ограничена политикой безопасности.
            </p>
          </div>
          <button className="bg-white dark:bg-transparent border border-gray-300 dark:border-gray-600 text-text-main dark:text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
            Проверить статус
          </button>
        </div>

        <div className="bg-white dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden">
          <div className="px-6 py-5 border-b border-border-light dark:border-border-dark flex justify-between items-center">
            <h3 className="font-bold text-base text-text-main dark:text-white flex items-center">
              <span className="material-symbols-outlined mr-3 text-gray-400 text-[20px]">apps</span>
              Доступ к приложениям
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {[
                { name: "Веб-браузеры", desc: "Chrome, Edge, Firefox, Yandex", icon: "public" },
                { name: "Мессенджеры", desc: "Telegram, WhatsApp Desktop", icon: "send" },
                { name: "Офисные пакеты", desc: "Word, Outlook, Notion", icon: "description" }
              ].map((app, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center mr-3">
                      <span className="material-symbols-outlined text-gray-500 dark:text-gray-400 text-[20px]">{app.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-text-main dark:text-white text-sm">{app.name}</h4>
                      <p className="text-[11px] text-text-secondary mt-0.5">{app.desc}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPrivacy;