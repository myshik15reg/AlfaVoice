import React from 'react';

const StyleGuide: React.FC = () => {
  return (
    <div className="p-8 lg:px-12 lg:py-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text-main dark:text-white tracking-tight mb-2">Гайд по стилю</h1>
            <p className="text-text-secondary text-sm">Официальные рекомендации по коммуникации и оформлению текстов.</p>
          </div>
          <div className="flex space-x-3">
            <button className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm font-medium text-text-main dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <span className="material-symbols-outlined text-lg mr-2">download</span>
              Скачать PDF
            </button>
            <button className="flex items-center px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md text-sm font-medium transition-colors shadow-sm">
              <span className="material-symbols-outlined text-lg mr-2">add</span>
              Предложить правило
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-border-dark p-4 sticky top-4 shadow-sm">
              <h3 className="text-xs font-bold text-text-secondary dark:text-gray-400 uppercase tracking-wider mb-4 px-2">Разделы</h3>
              <nav className="space-y-1">
                <a href="#tone-of-voice" className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-red-50 text-primary dark:bg-gray-700 dark:text-white">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mr-3"></span>
                  Tone of Voice
                </a>
                {['Форматирование', 'Грамматика и пунктуация', 'Терминология', 'Деловая переписка'].map((item) => (
                  <a key={item} href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-text-secondary dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-text-main dark:hover:text-white transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mr-3"></span>
                    {item}
                  </a>
                ))}
              </nav>
              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 px-2">
                <h4 className="text-xs font-bold text-text-secondary dark:text-gray-400 uppercase tracking-wider mb-3">Популярные запросы</h4>
                <div className="flex flex-wrap gap-2">
                  {['#тире', '#приветствие', '#вы'].map(tag => (
                    <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-9 space-y-8">
            <section id="tone-of-voice" className="bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-border-dark p-8 shadow-card scroll-mt-24">
              <div className="flex items-center mb-6">
                <span className="material-symbols-outlined text-primary text-3xl mr-3">record_voice_over</span>
                <h2 className="text-2xl font-bold text-text-main dark:text-white">Tone of Voice</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                Мы говорим с клиентами на одном языке: профессионально, но понятно. Уверенно, но без агрессии. Мы — партнеры, которые помогают бизнесу расти.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/50 rounded-lg p-5">
                  <h3 className="text-green-700 dark:text-green-400 font-bold mb-3 flex items-center">
                    <span className="material-symbols-outlined mr-2 text-xl">check_circle</span>
                    Как надо
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start"><span className="mr-2">•</span><span>"Мы подготовили для вас персональное предложение."</span></li>
                    <li className="flex items-start"><span className="mr-2">•</span><span>"Давайте обсудим детали во вторник."</span></li>
                  </ul>
                </div>
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg p-5">
                  <h3 className="text-red-600 dark:text-red-400 font-bold mb-3 flex items-center">
                    <span className="material-symbols-outlined mr-2 text-xl">cancel</span>
                    Как не надо
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start"><span className="mr-2">•</span><span>"Вам необходимо срочно рассмотреть наше КП!"</span></li>
                    <li className="flex items-start"><span className="mr-2">•</span><span>"Доброго времени суток."</span></li>
                  </ul>
                </div>
              </div>
            </section>

            <section id="formatting" className="bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-border-dark p-8 shadow-card scroll-mt-24">
              <div className="flex items-center mb-6">
                <span className="material-symbols-outlined text-primary text-3xl mr-3">format_shapes</span>
                <h2 className="text-2xl font-bold text-text-main dark:text-white">Форматирование</h2>
              </div>
              <div className="space-y-6">
                <div className="border-b border-gray-100 dark:border-gray-700 pb-6">
                  <h3 className="text-lg font-bold text-text-main dark:text-white mb-3">Даты и время</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Единый формат записи дат позволяет избежать путаницы в документах.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded border border-gray-200 dark:border-gray-600">
                      <span className="block text-xs text-text-secondary uppercase mb-1">Полный формат</span>
                      <span className="font-mono text-text-main dark:text-white font-medium">12 апреля 2023 г.</span>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded border border-gray-200 dark:border-gray-600">
                      <span className="block text-xs text-text-secondary uppercase mb-1">Краткий формат</span>
                      <span className="font-mono text-text-main dark:text-white font-medium">12.04.2023</span>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded border border-gray-200 dark:border-gray-600">
                      <span className="block text-xs text-text-secondary uppercase mb-1">Время</span>
                      <span className="font-mono text-text-main dark:text-white font-medium">14:30 (24-часовой)</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StyleGuide;