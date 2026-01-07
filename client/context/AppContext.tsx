
import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { db, User, Activity, Snippet, Note, DictionaryTerm, NewsItem } from '../data/db';

// --- Types ---
interface StyleSettings {
  toneValue: number;
  activeParams: Record<string, boolean>;
  stopWords: string;
}

interface IntegrationSettings {
  chromeEnabled: boolean;
}

interface CodeSettings {
  realtimeCheck: boolean;
  autoTone: boolean;
  ignoreBlocks: boolean;
  notifications: boolean;
}

interface AppSettings {
  volume: number;
  microphoneId: string;
  hotkey: string;
  style: StyleSettings;
  integrations: IntegrationSettings;
  code: CodeSettings;
}

interface AppContextType {
  user: User;
  activities: Activity[];
  news: NewsItem[];
  deleteActivity: (id: number) => void;
  
  // Collections (Synced)
  snippets: Snippet[];
  addSnippet: (snippet: Snippet) => void;
  updateSnippet: (snippet: Snippet) => void;
  deleteSnippet: (id: number) => void;

  notes: Note[];
  addNote: (note: Note) => void;
  updateNote: (note: Note) => void;
  deleteNote: (id: number) => void;

  dictionary: DictionaryTerm[];
  addDictionaryTerm: (term: DictionaryTerm) => void;
  updateDictionaryTerm: (term: DictionaryTerm) => void;
  deleteDictionaryTerm: (id: number) => void;
  
  // Global Recording
  globalHotkey: string;
  setGlobalHotkey: (key: string) => void;
  isGlobalRecording: boolean;
  
  // General Settings
  volume: number;
  setVolume: (val: number) => void;
  selectedDeviceId: string;
  setSelectedDeviceId: (id: string) => void;
  
  // Style Settings
  styleSettings: StyleSettings;
  setStyleSettings: (settings: StyleSettings) => void;

  // Integration Settings
  integrationSettings: IntegrationSettings;
  setIntegrationSettings: (settings: IntegrationSettings) => void;

  // Code Settings
  codeSettings: CodeSettings;
  setCodeSettings: (settings: CodeSettings) => void;

  isSettingsLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// --- Defaults ---
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

// --- Mock Server API ---
const mockServerApi = {
  fetchAllData: (): Promise<{ settings: AppSettings, data: any }> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const isServerOnline = Math.random() > 0.2; // 80% success
        
        if (isServerOnline) {
           console.log("[Server] All data fetched successfully");
           resolve({
             settings: {
                 volume: 72,
                 microphoneId: 'default',
                 hotkey: 'Ctrl + Win',
                 style: DEFAULT_STYLE,
                 integrations: DEFAULT_INTEGRATIONS,
                 code: DEFAULT_CODE
             },
             data: {
                 snippets: db.snippets,
                 notes: db.notes,
                 dictionary: db.dictionary
             }
           });
        } else {
           console.warn("[Server] Connection failed (Simulated)");
           reject(new Error("Server unavailable"));
        }
      }, 1000);
    });
  },
  saveData: (key: string, data: any): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`[Server] Saved ${key}:`, data);
        resolve(true);
      }, 800);
    });
  }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user] = useState<User>(db.user);
  const [news] = useState<NewsItem[]>(db.news);
  
  // Collections State
  const [activities, setActivities] = useState<Activity[]>(db.activities);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [dictionary, setDictionary] = useState<DictionaryTerm[]>([]);
  
  // Settings State
  const [globalHotkey, setGlobalHotkeyState] = useState<string>('Ctrl + Win');
  const [volume, setVolumeState] = useState<number>(72);
  const [selectedDeviceId, setSelectedDeviceIdState] = useState<string>('');
  
  const [styleSettings, setStyleSettingsState] = useState<StyleSettings>(DEFAULT_STYLE);
  const [integrationSettings, setIntegrationSettingsState] = useState<IntegrationSettings>(DEFAULT_INTEGRATIONS);
  const [codeSettings, setCodeSettingsState] = useState<CodeSettings>(DEFAULT_CODE);

  const [isSettingsLoading, setIsSettingsLoading] = useState(true);

  // Recording State
  const [isGlobalRecording, setIsGlobalRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);

  // --- Synchronization Logic ---

  // 1. Initial Load: Server -> Fail -> Local Storage
  useEffect(() => {
    const loadData = async () => {
      setIsSettingsLoading(true);
      try {
        // A. Try fetching from server
        const response = await mockServerApi.fetchAllData();
        
        // Apply Settings
        setVolumeState(response.settings.volume);
        setGlobalHotkeyState(response.settings.hotkey);
        if (response.settings.microphoneId) setSelectedDeviceIdState(response.settings.microphoneId);
        setStyleSettingsState(response.settings.style);
        setIntegrationSettingsState(response.settings.integrations);
        setCodeSettingsState(response.settings.code);

        // Apply Data
        setSnippets(response.data.snippets);
        setNotes(response.data.notes);
        setDictionary(response.data.dictionary);

        // Sync to Local Storage
        localStorage.setItem('app_settings', JSON.stringify(response.settings));
        localStorage.setItem('app_data', JSON.stringify(response.data));
        
      } catch (error) {
        console.log("[App] Server unavailable. Loading from Local Storage fallback...");
        
        // Settings Fallback
        const localSettings = localStorage.getItem('app_settings');
        if (localSettings) {
          const parsed = JSON.parse(localSettings);
          setVolumeState(parsed.volume ?? 72);
          setGlobalHotkeyState(parsed.hotkey ?? 'Ctrl + Win');
          if (parsed.microphoneId) setSelectedDeviceIdState(parsed.microphoneId);
          if (parsed.style) setStyleSettingsState(parsed.style);
          if (parsed.integrations) setIntegrationSettingsState(parsed.integrations);
          if (parsed.code) setCodeSettingsState(parsed.code);
        }

        // Data Fallback
        const localData = localStorage.getItem('app_data');
        if (localData) {
            const parsedData = JSON.parse(localData);
            setSnippets(parsedData.snippets || []);
            setNotes(parsedData.notes || []);
            setDictionary(parsedData.dictionary || []);
        } else {
            // Very first run offline? Use mock DB as fallback source
            setSnippets(db.snippets);
            setNotes(db.notes);
            setDictionary(db.dictionary);
        }
      } finally {
        setIsSettingsLoading(false);
      }
    };

    loadData();
  }, []);

  // 2. Persist Helper
  const persist = (key: string, data: any, storageKey: 'app_settings' | 'app_data', mergeWithCurrentLS = true) => {
      // 1. Save to LS
      if (mergeWithCurrentLS) {
          const current = JSON.parse(localStorage.getItem(storageKey) || '{}');
          const updated = { ...current, [key]: data };
          localStorage.setItem(storageKey, JSON.stringify(updated));
      } else {
          // Special case for arrays inside app_data where 'data' IS the new array for that key
          const current = JSON.parse(localStorage.getItem(storageKey) || '{}');
          // If key is 'snippets', we replace current.snippets
          const updated = { ...current, [key]: data };
          localStorage.setItem(storageKey, JSON.stringify(updated));
      }

      // 2. Send to Server
      mockServerApi.saveData(key, data).catch(err => console.error("Sync error", err));
  };

  // --- Settings Setters ---

  const setVolume = (val: number) => {
      setVolumeState(val);
      // We need to construct the full partial object for settings if we want to save it structurally, 
      // but for this helper, let's just save the field 'volume' to server
      persist('volume', val, 'app_settings');
  };

  const setGlobalHotkey = (key: string) => {
      setGlobalHotkeyState(key);
      persist('hotkey', key, 'app_settings');
  };

  const setSelectedDeviceId = (id: string) => {
      setSelectedDeviceIdState(id);
      persist('microphoneId', id, 'app_settings');
  };

  const setStyleSettings = (settings: StyleSettings) => {
      setStyleSettingsState(settings);
      persist('style', settings, 'app_settings');
  };

  const setIntegrationSettings = (settings: IntegrationSettings) => {
      setIntegrationSettingsState(settings);
      persist('integrations', settings, 'app_settings');
  };

  const setCodeSettings = (settings: CodeSettings) => {
      setCodeSettingsState(settings);
      persist('code', settings, 'app_settings');
  };

  // --- Collection CRUD ---

  // Snippets
  const addSnippet = (snippet: Snippet) => {
    setSnippets(prev => {
        const next = [snippet, ...prev];
        persist('snippets', next, 'app_data', false);
        return next;
    });
  };
  const updateSnippet = (updatedSnippet: Snippet) => {
    setSnippets(prev => {
        const next = prev.map(s => s.id === updatedSnippet.id ? updatedSnippet : s);
        persist('snippets', next, 'app_data', false);
        return next;
    });
  };
  const deleteSnippet = (id: number) => {
    setSnippets(prev => {
        const next = prev.filter(s => s.id !== id);
        persist('snippets', next, 'app_data', false);
        return next;
    });
  };

  // Notes
  const addNote = (note: Note) => {
    setNotes(prev => {
        const next = [note, ...prev];
        persist('notes', next, 'app_data', false);
        return next;
    });
  };
  const updateNote = (updatedNote: Note) => {
    setNotes(prev => {
        const next = prev.map(n => n.id === updatedNote.id ? updatedNote : n);
        persist('notes', next, 'app_data', false);
        return next;
    });
  };
  const deleteNote = (id: number) => {
    setNotes(prev => {
        const next = prev.filter(n => n.id !== id);
        persist('notes', next, 'app_data', false);
        return next;
    });
  };

  // Dictionary
  const addDictionaryTerm = (term: DictionaryTerm) => {
    setDictionary(prev => {
        const next = [term, ...prev];
        persist('dictionary', next, 'app_data', false);
        return next;
    });
  };
  const updateDictionaryTerm = (updatedTerm: DictionaryTerm) => {
    setDictionary(prev => {
        const next = prev.map(t => t.id === updatedTerm.id ? updatedTerm : t);
        persist('dictionary', next, 'app_data', false);
        return next;
    });
  };
  const deleteDictionaryTerm = (id: number) => {
    setDictionary(prev => {
        const next = prev.filter(t => t.id !== id);
        persist('dictionary', next, 'app_data', false);
        return next;
    });
  };

  const deleteActivity = (id: number) => {
    setActivities(prev => prev.filter(activity => activity.id !== id));
  };

  // --- Recording Logic ---
  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
        const constraints = {
            audio: selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : true
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];
        startTimeRef.current = Date.now();

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunksRef.current.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(audioBlob);
            const durationMs = Date.now() - startTimeRef.current;
            const newId = Date.now();

            const newActivity: Activity = {
                id: newId,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                text: "Идёт расшифровка...",
                duration: formatDuration(durationMs),
                date: "Сегодня",
                audioUrl: audioUrl,
                isTranscribing: true
            };

            setActivities(prev => [newActivity, ...prev]);
            stream.getTracks().forEach(track => track.stop());
            simulateTranscription(newId, durationMs);
        };

        mediaRecorder.start();
        setIsGlobalRecording(true);
        const audio = new Audio('https://freetestdata.com/wp-content/uploads/2021/09/Free_Test_Data_100KB_MP3.mp3');
        audio.volume = 0.2;
        audio.play().catch(() => {});

    } catch (err) {
        console.error("Failed to start recording", err);
        alert("Ошибка доступа к микрофону");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isGlobalRecording) {
        mediaRecorderRef.current.stop();
        setIsGlobalRecording(false);
    }
  };

  const simulateTranscription = (activityId: number, durationMs: number) => {
      const delay = Math.min(Math.max(2000, durationMs), 5000);
      setTimeout(() => {
          const mockPhrases = [
              "Добрый день, высылаю коммерческое предложение.",
              "Коллеги, прошу согласовать договор до конца недели.",
              "Отличная работа, давайте зафиксируем эти договоренности.",
              "Пожалуйста, уточните сроки поставки оборудования.",
              "Клиент просит перенести встречу на вторник."
          ];
          const randomText = mockPhrases[Math.floor(Math.random() * mockPhrases.length)];
          setActivities(prev => prev.map(a => 
              a.id === activityId 
              ? { ...a, text: randomText, isTranscribing: false } 
              : a
          ));
          navigator.clipboard.writeText(randomText).then(() => {
             console.log("Text copied to clipboard");
          }).catch(err => console.error("Clipboard failed", err));
      }, delay);
  };

  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          const keys = globalHotkey.split(' + ').map(k => k.trim().toLowerCase());
          let match = true;
          if (keys.includes('ctrl') && !e.ctrlKey) match = false;
          if (keys.includes('win') && !e.metaKey) match = false;
          if (keys.includes('alt') && !e.altKey) match = false;
          if (keys.includes('shift') && !e.shiftKey) match = false;
          
          const isCtrlWin = e.ctrlKey && e.metaKey; 
          if ((isCtrlWin && globalHotkey === 'Ctrl + Win') || (match && keys.length > 0)) {
              e.preventDefault(); 
              if (isGlobalRecording) {
                  stopRecording();
              } else {
                  startRecording();
              }
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
          window.removeEventListener('keydown', handleKeyDown);
      };
  }, [globalHotkey, isGlobalRecording, selectedDeviceId]);

  return (
    <AppContext.Provider value={{ 
      user, 
      activities, 
      news, 
      deleteActivity,
      snippets,
      addSnippet,
      updateSnippet,
      deleteSnippet,
      notes,
      addNote,
      updateNote,
      deleteNote,
      dictionary,
      addDictionaryTerm,
      updateDictionaryTerm,
      deleteDictionaryTerm,
      globalHotkey,
      setGlobalHotkey,
      isGlobalRecording,
      volume,
      setVolume,
      selectedDeviceId,
      setSelectedDeviceId,
      styleSettings,
      setStyleSettings,
      integrationSettings,
      setIntegrationSettings,
      codeSettings,
      setCodeSettings,
      isSettingsLoading
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
