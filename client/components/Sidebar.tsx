import React from 'react';
import type { View } from '../types';
import { NAV_ITEMS, BOTTOM_NAV_ITEMS } from '../data/constants';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  isCollapsed: boolean;
}

interface NavItemProps {
  view: View;
  icon: string;
  label: string;
  isSettings?: boolean;
  currentView: View;
  setCurrentView: (view: View) => void;
  isCollapsed: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ 
  view, 
  icon, 
  label, 
  isSettings = false,
  currentView,
  setCurrentView,
  isCollapsed
}) => {
  const isActive = currentView === view;
  // Special handling for settings sub-pages to keep the Settings nav item active
  // Ensure currentView is treated as string to prevent any potential runtime type issues
  const currentViewStr = String(currentView || '');
  const isSettingsActive = isSettings && currentViewStr.startsWith('settings_') && view === 'settings_general';
  
  const activeClass = "bg-primary/10 text-primary dark:bg-primary/20 dark:text-white relative";
  const inactiveClass = "text-text-secondary dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-text-main dark:hover:text-white";

  return (
    <button
      onClick={() => setCurrentView(view)}
      className={`w-full flex items-center py-3 text-lg font-medium rounded-md group transition-all duration-300 ease-in-out ${isActive || isSettingsActive ? activeClass : inactiveClass} ${isCollapsed ? 'pl-5' : 'pl-4'}`}
      title={isCollapsed ? label : undefined}
    >
      {/* Active Indicator */}
      <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r transition-opacity duration-300 ${isActive || isSettingsActive ? 'opacity-100' : 'opacity-0'} ${isCollapsed ? 'opacity-0' : ''}`}></div>
      
      <span className={`material-symbols-outlined flex-shrink-0 transition-all duration-300 text-2xl ${(isActive || isSettingsActive) ? '' : 'group-hover:text-primary transition-colors'}`}>{icon}</span>
      
      <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[150px] opacity-100 ml-3'}`}>
          {label}
      </span>
    </button>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, isCollapsed }) => {
  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-background-light dark:bg-surface-dark border-r border-border-light dark:border-border-dark flex flex-col h-full flex-shrink-0 z-20 transition-all duration-300 ease-in-out overflow-hidden`}>
      <div 
        className="h-20 flex items-center cursor-pointer transition-all duration-300 ease-in-out pl-6" 
        onClick={() => setCurrentView('dashboard')}
      >
        <span className="material-symbols-outlined text-primary text-3xl font-bold flex-shrink-0">graphic_eq</span>
        <span className={`text-2xl font-bold tracking-tight text-text-main dark:text-white whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[200px] opacity-100 ml-2'}`}>
          AlfaVoice
        </span>
      </div>
      <nav className="flex-1 px-2 space-y-1 mt-2 overflow-y-auto overflow-x-hidden">
        {NAV_ITEMS.map((item) => (
          <NavItem 
            key={item.view} 
            view={item.view} 
            icon={item.icon} 
            label={item.label} 
            currentView={currentView}
            setCurrentView={setCurrentView}
            isCollapsed={isCollapsed}
          />
        ))}
      </nav>
      <div className="px-2 py-4 space-y-1 border-t border-border-light dark:border-border-dark mt-auto">
        {BOTTOM_NAV_ITEMS.map((item) => (
          <NavItem 
            key={item.view} 
            view={item.view} 
            icon={item.icon} 
            label={item.label} 
            isSettings={item.isSettings} 
            currentView={currentView}
            setCurrentView={setCurrentView}
            isCollapsed={isCollapsed}
          />
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;