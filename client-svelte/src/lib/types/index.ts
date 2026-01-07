// Types from AppContext
export interface StyleSettings {
  toneValue: number;
  activeParams: Record<string, boolean>;
  stopWords: string;
}

export interface IntegrationSettings {
  chromeEnabled: boolean;
}

export interface CodeSettings {
  realtimeCheck: boolean;
  autoTone: boolean;
  ignoreBlocks: boolean;
  notifications: boolean;
}

export interface AppSettings {
  volume: number;
  microphoneId: string;
  hotkey: string;
  style: StyleSettings;
  integrations: IntegrationSettings;
  code: CodeSettings;
}

export interface User {
  id: number;
  name: string;
  firstName: string;
  email: string;
  initials: string;
  avatar?: string;
}

export interface Activity {
  id: number;
  time: string;
  text: string;
  duration: string;
  date: string;
  audioUrl?: string;
  isTranscribing?: boolean;
}

export interface Snippet {
  id: number;
  title: string;
  category: string;
  content: string;
  tags: string[];
  color: string;
  cmd: string;
  createdAt: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  date: string;
  isFavorite: boolean;
}

export interface DictionaryTerm {
  id: number;
  title: string;
  tag: string;
  desc: string;
  example?: string;
}

export interface NewsItem {
  id: number;
  title: string;
  time: string;
  read: boolean;
}

export type View = 
  | 'dashboard' 
  | 'dictionary' 
  | 'snippets' 
  | 'guide' 
  | 'notes' 
  | 'support'
  | 'settings_general'
  | 'onboarding_style'
  | 'settings_notifications'
  | 'integration_chrome'
  | 'integration_code'
  | 'settings_privacy'
  | 'settings_devices';
