import React from 'react';

const SettingsNotifications: React.FC = () => {
  return (
    <div className="p-8 lg:px-12 lg:py-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-text-main dark:text-white tracking-tight">Уведомления</h1>
          <p className="text-text-secondary dark:text-gray-400 mt-2 text-lg">Управляйте типами уведомлений и каналами их доставки, чтобы оставаться в курсе важного.</p>
        </div>
        
        <div className="bg-white dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border-light dark:border-border-dark bg-gray-50 dark:bg-white/5 flex justify-between items-center">
            <h3 className="font-bold text-lg text-text-main dark:text-white flex items-center">
              <span className="material-symbols-outlined mr-2.5 text-primary">category</span>
              Категории уведомлений
            </h3>
          </div>
          <div className="hidden md:grid grid-cols-12 gap-6 px-6 py-3 border-b border-border-light dark:border-border-dark bg-gray-50/80 dark:bg-background-dark text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            <div className="col-span-8">Тип уведомления</div>
            <div className="col-span-2 text-center">Email</div>
            <div className="col-span-2 text-center">Push</div>
          </div>
          {['Рекомендации по стилю', 'Еженедельная активность', 'Обновления плагинов', 'Новости и акции'].map((item, idx) => (
            <div key={idx} className="p-6 border-b border-border-light dark:border-border-dark last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-150">
              <div className="md:grid md:grid-cols-12 md:gap-6 md:items-start">
                <div className="col-span-8 mb-4 md:mb-0">
                  <h4 className="font-medium text-text-main dark:text-gray-200 text-base mb-1">{item}</h4>
                  <p className="text-sm text-text-secondary dark:text-gray-400">Описание для {item.toLowerCase()}...</p>
                </div>
                <div className="col-span-2 flex items-center md:justify-center justify-between">
                  <span className="md:hidden text-sm text-gray-500 font-medium">Email</span>
                  <input type="checkbox" className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div className="col-span-2 flex items-center md:justify-center justify-between mt-2 md:mt-0">
                  <span className="md:hidden text-sm text-gray-500 font-medium">Push</span>
                  <input type="checkbox" className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary dark:bg-gray-700 dark:border-gray-600" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsNotifications;