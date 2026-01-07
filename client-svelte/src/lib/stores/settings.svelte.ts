import type { StyleSettings, IntegrationSettings, CodeSettings } from '$lib/types';

// Defaults
const DEFAULT_STYLE: StyleSettings = {
  toneValue: 50,
  activeParams: { caps: true, emoji: false, simple: true },
  stopWords: 'типа, короче'
};

const DEFAULT_INTEGRATIONS: IntegrationSettings = {
  chromeEnabled: true
};

const DEFAULT_CODE: CodeSettings = {
  realtimeCheck: true,
  autoTone: false,
  ignoreBlocks: true,
  notifications: true
};

// Settings Store
export function createSettingsStore() {
  let styleSettings = $state<StyleSettings>(DEFAULT_STYLE);
  let integrationSettings = $state<IntegrationSettings>(DEFAULT_INTEGRATIONS);
  let codeSettings = $state<CodeSettings>(DEFAULT_CODE);
  let isSettingsLoading = $state(true);
  let locale = $state<'en' | 'ru'>('ru');

  // Load settings from localStorage
  const loadSettings = () => {
    isSettingsLoading = true;
    
    try {
      const localSettings = localStorage.getItem('app_settings');
      if (localSettings) {
        const parsed = JSON.parse(localSettings);
        
        if (parsed.style) styleSettings = parsed.style;
        if (parsed.integrations) integrationSettings = parsed.integrations;
        if (parsed.code) codeSettings = parsed.code;
        if (parsed.locale) locale = parsed.locale;
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    } finally {
      isSettingsLoading = false;
    }
  };

  // Persist helper
  const persist = (key: string, data: any) => {
    const current = JSON.parse(localStorage.getItem('app_settings') || '{}');
    const updated = { ...current, [key]: data };
    localStorage.setItem('app_settings', JSON.stringify(updated));
    
    // TODO: Send to server
    console.log(`[Settings] Saved ${key}:`, data);
  };

  // Setters
  const setStyleSettings = (settings: StyleSettings) => {
    styleSettings = settings;
    persist('style', settings);
  };

  const setIntegrationSettings = (settings: IntegrationSettings) => {
    integrationSettings = settings;
    persist('integrations', settings);
  };

  const setCodeSettings = (settings: CodeSettings) => {
    codeSettings = settings;
    persist('code', settings);
  };

  const setLocale = (newLocale: 'en' | 'ru') => {
    locale = newLocale;
    persist('locale', newLocale);
  };

  // Initialize
  if (typeof localStorage !== 'undefined') {
    loadSettings();
  }

  return {
    get styleSettings() { return styleSettings; },
    get integrationSettings() { return integrationSettings; },
    get codeSettings() { return codeSettings; },
    get isSettingsLoading() { return isSettingsLoading; },
    get locale() { return locale; },
    setStyleSettings,
    setIntegrationSettings,
    setCodeSettings,
    setLocale,
    loadSettings
  };
}

// Singleton instance
export const settingsStore = createSettingsStore();
