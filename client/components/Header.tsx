
import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import type { View } from '../types';

interface HeaderProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setCurrentView: (view: View) => void;
  currentView: View;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleTheme, toggleSidebar, setCurrentView, currentView }) => {
  const { user, news } = useAppContext();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="h-16 flex items-center justify-between px-8 border-b border-gray-100 dark:border-border-dark flex-shrink-0 bg-white dark:bg-surface-dark transition-colors duration-200">
      <div className="flex items-center space-x-4 text-gray-400 dark:text-gray-400">
        <button 
          onClick={toggleSidebar}
          className="p-1 rounded-full transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <span className="material-symbols-outlined text-xl">side_navigation</span>
        </button>
      </div>
      <div className="flex items-center space-x-5 text-gray-500 dark:text-gray-400">
        <button 
          onClick={toggleTheme}
          className="flex items-center justify-center p-2 rounded-full transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          title={isDarkMode ? "Включить светлую тему" : "Включить темную тему"}
        >
          <span className="material-symbols-outlined text-xl">
            {isDarkMode ? 'light_mode' : 'dark_mode'}
          </span>
        </button>
        
        <div className="relative" ref={dropdownRef}>
            <div 
                className="relative cursor-pointer hover:text-primary transition-colors"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            >
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white dark:ring-surface-dark bg-primary transform translate-x-1/2 -translate-y-1/2"></span>
            </div>
            
            {isNotificationsOpen && (
                <div className="absolute right-0 top-full mt-4 w-80 bg-white dark:bg-surface-dark rounded-xl shadow-lg border border-gray-200 dark:border-border-dark overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-border-dark flex justify-between items-center bg-gray-50 dark:bg-white/5">
                        <h3 className="font-bold text-sm text-text-main dark:text-white">Уведомления</h3>
                        <span className="text-xs text-primary cursor-pointer hover:underline">Все прочитаны</span>
                    </div>
                    {/* Approx 5 items height limit (around 320px) */}
                    <div className="max-h-[320px] overflow-y-auto">
                        {news.map(item => (
                            <div key={item.id} className={`px-4 py-3 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group ${!item.read ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}>
                                <p className={`text-sm mb-1 leading-snug ${!item.read ? 'font-bold text-text-main dark:text-white' : 'text-text-secondary dark:text-gray-300'}`}>{item.title}</p>
                                <span className="text-xs text-gray-400 group-hover:text-primary transition-colors">{item.time}</span>
                            </div>
                        ))}
                    </div>
                    <div className="p-2 bg-gray-50 dark:bg-white/5 text-center border-t border-gray-100 dark:border-border-dark">
                        <button className="text-xs font-medium text-text-secondary dark:text-gray-400 hover:text-primary transition-colors">Показать все</button>
                    </div>
                </div>
            )}
        </div>
        
        <div 
            onClick={() => setCurrentView('settings_general')}
            className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-700 dark:text-gray-300 cursor-pointer border border-gray-300 dark:border-gray-600 mr-2 hover:ring-2 hover:ring-primary/20 transition-all"
        >
          {user.initials}
        </div>

        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>

        <div className="flex items-center ml-2">
            <button className="w-11 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 group" title="Свернуть">
                <div className="w-3.5 h-0.5 bg-current translate-y-1.5 rounded-full"></div>
            </button>
            <button className="w-11 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" title="Развернуть">
                <span className="material-symbols-outlined text-[18px]">check_box_outline_blank</span>
            </button>
             <button className="w-11 h-10 flex items-center justify-center hover:bg-red-500 hover:text-white dark:hover:bg-red-600 transition-colors text-gray-400 rounded-lg" title="Закрыть">
                <span className="material-symbols-outlined text-xl">close</span>
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
