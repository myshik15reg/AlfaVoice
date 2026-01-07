import React, { useState } from 'react';
import { SUPPORT_FAQS } from '../data/constants';

const Support: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="p-8 lg:px-12 lg:py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-text-main dark:text-white tracking-tight mb-2">Поддержка</h1>
        <p className="text-text-secondary text-sm mb-8">Мы здесь, чтобы помочь вам с любыми вопросами по AlfaVoice.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-surface-dark rounded-xl p-6 border border-gray-200 dark:border-border-dark shadow-sm hover:shadow-card dark:hover:shadow-card-dark transition-all">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
              <span className="material-symbols-outlined text-2xl">chat</span>
            </div>
            <h3 className="text-lg font-bold text-text-main dark:text-white mb-2">Чат с поддержкой</h3>
            <p className="text-sm text-text-secondary dark:text-gray-400 mb-4">Напишите нам в реальном времени. Мы отвечаем в течение 5 минут.</p>
            <button className="text-primary font-bold text-sm hover:underline flex items-center">
              Начать чат <span className="material-symbols-outlined text-base ml-1">arrow_forward</span>
            </button>
          </div>

          <div className="bg-white dark:bg-surface-dark rounded-xl p-6 border border-gray-200 dark:border-border-dark shadow-sm hover:shadow-card dark:hover:shadow-card-dark transition-all">
             <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
              <span className="material-symbols-outlined text-2xl">mail</span>
            </div>
            <h3 className="text-lg font-bold text-text-main dark:text-white mb-2">Email</h3>
            <p className="text-sm text-text-secondary dark:text-gray-400 mb-4">Для сложных вопросов и предложений. support@alfavoice.ru</p>
            <button className="text-primary font-bold text-sm hover:underline flex items-center">
              Написать письмо <span className="material-symbols-outlined text-base ml-1">arrow_forward</span>
            </button>
          </div>
        </div>

        <div className="mt-8 bg-white dark:bg-surface-dark rounded-xl p-6 border border-gray-200 dark:border-border-dark shadow-sm">
           <h3 className="text-lg font-bold text-text-main dark:text-white mb-4">Часто задаваемые вопросы</h3>
           <div className="space-y-4">
             {SUPPORT_FAQS.map((item, i) => (
               <div key={i} className="rounded-lg overflow-hidden border border-gray-100 dark:border-white/5 transition-all">
                 <div 
                    className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group ${openIndex === i ? 'bg-gray-50 dark:bg-white/5' : 'bg-white dark:bg-transparent'}`}
                    onClick={() => toggleAccordion(i)}
                 >
                   <span className="text-sm font-medium text-text-main dark:text-gray-200 group-hover:text-primary transition-colors">{item.question}</span>
                   <span className={`material-symbols-outlined text-gray-400 group-hover:text-primary transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`}>expand_more</span>
                 </div>
                 <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="p-4 pt-0 text-sm text-text-secondary dark:text-gray-400 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5">
                        {item.answer}
                    </div>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Support;