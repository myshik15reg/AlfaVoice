import React, { useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Snippets from './pages/Snippets';
import StyleGuide from './pages/StyleGuide';
import Notes from './pages/Notes';
import Dictionary from './pages/Dictionary';
import Support from './pages/Support';
import SettingsGeneral from './pages/settings/General';
import SettingsStyle from './pages/settings/Style';
import SettingsNotifications from './pages/settings/Notifications';
import SettingsIntegrations from './pages/settings/Integrations';
import SettingsCode from './pages/settings/Code';
import SettingsPrivacy from './pages/settings/Privacy';
import SettingsDevices from './pages/settings/Devices';
import type { View } from './types';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard setCurrentView={setCurrentView} />;
      case 'snippets': return <Snippets />;
      case 'dictionary': return <Dictionary />;
      case 'guide': return <StyleGuide />;
      case 'notes': return <Notes />;
      case 'support': return <Support />;
      case 'settings_general': return <SettingsGeneral setCurrentView={setCurrentView} />;
      case 'onboarding_style': return <SettingsStyle />;
      case 'settings_notifications': return <SettingsNotifications />;
      case 'integration_chrome': return <SettingsIntegrations />;
      case 'integration_code': return <SettingsCode />;
      case 'settings_privacy': return <SettingsPrivacy />;
      case 'settings_devices': return <SettingsDevices />;
      default: return <Dashboard setCurrentView={setCurrentView} />;
    }
  };

  return (
    <div className="flex w-full h-full bg-background-light dark:bg-background-dark text-text-main dark:text-text-dark-main transition-colors duration-200">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        isCollapsed={isSidebarCollapsed}
      />
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Header 
          isDarkMode={isDarkMode} 
          toggleTheme={toggleTheme} 
          toggleSidebar={toggleSidebar}
          setCurrentView={setCurrentView}
          currentView={currentView}
        />
        <div className="flex-1 overflow-y-auto bg-[#FAFAFA] dark:bg-background-dark">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;