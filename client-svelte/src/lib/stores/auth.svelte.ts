import { browser } from '$app/environment';
import type { User, Activity, NewsItem, Snippet, Note, DictionaryTerm } from '$lib/types';
import { dbStore } from './db.svelte';

// Support FAQ
export const SUPPORT_FAQS = [
  {
    question: "Как подключить интеграцию с Chrome?",
    answer: "Скачайте официальное расширение AlfaVoice из Chrome Web Store. После установки нажмите на иконку расширения и войдите в свою корпоративную учетную запись. Интеграция активируется автоматически на всех поддерживаемых сайтах."
  },
  {
    question: "Почему не работает голосовой ввод?",
    answer: "Убедитесь, что вы дали разрешение браузеру на использование микрофона. Проверьте выбранное устройство ввода в настройках системы и в разделе 'Настройки' > 'Устройства' приложения AlfaVoice."
  },
  {
    question: "Как изменить настройки тональности?",
    answer: "Перейдите в раздел 'Настройки' > 'Стиль' (Tone of Voice). Там вы можете выбрать один из предустановленных режимов (Строгий, Сбалансированный, Дружелюбный) или вручную настроить параметры текста."
  }
];

// Mock data for user, news, and activities (not stored in RxDB)
const mockUser = {
  id: 1,
  name: 'Евгений',
  firstName: 'Евгений',
  email: 'evgeny@alfa.com',
  initials: 'Е'
} as User;

const mockNews = [
  { id: 1, title: 'Новая версия стиля: Корпоративный 2.0', time: '2 часа назад', read: false },
  { id: 2, title: 'Интеграция с Chrome обновлена', time: '5 часов назад', read: true },
  { id: 3, title: 'Еженедельный отчёт готов', time: '1 день назад', read: true }
] as NewsItem[];

const mockActivities = [
  { id: 1, time: '22:29', text: 'А так работает.', duration: '0:06', date: '26 декабря 2025' },
  { id: 2, time: '22:29', text: 'Работает или нет?', duration: '0:12', date: '26 декабря 2025' },
  { id: 3, time: '22:10', text: 'И внимательно, внимательно разрабатывай, перепроверяй.', duration: '0:12', date: '26 декабря 2025' },
  { id: 4, time: '22:29', text: 'Аудио без звука.', duration: '0:12', date: '26 декабря 2025' }
] as Activity[];

// Auth Store
export function createAuthStore() {
  let user = $state<User>(mockUser);
  let news = $state<NewsItem[]>(mockNews);
  let activities = $state<Activity[]>(mockActivities);
  
  // Collections (Synced from RxDB)
  let snippets = $state<Snippet[]>([]);
  let notes = $state<Note[]>([]);
  let dictionary = $state<DictionaryTerm[]>([]);

  // Initialize RxDB and sync collections
  if (browser) {
    // Wait for DB to be initialized
    const checkDB = setInterval(() => {
      if (dbStore.isInitialized) {
        clearInterval(checkDB);
        syncCollections();
      }
    }, 100);
  }

  // Sync collections from RxDB
  function syncCollections() {
    snippets = dbStore.snippets;
    notes = dbStore.notes;
    dictionary = dbStore.dictionary;
    
    // Subscribe to changes
    $effect(() => {
      snippets = dbStore.snippets;
    });
    $effect(() => {
      notes = dbStore.notes;
    });
    $effect(() => {
      dictionary = dbStore.dictionary;
    });
  }

  // Methods
  const deleteActivity = (id: number) => {
    activities = activities.filter(activity => activity.id !== id);
  };

  // Snippets CRUD (delegated to RxDB)
  const addSnippet = async (snippet: Snippet) => {
    await dbStore.addSnippet(snippet);
  };

  const updateSnippet = async (updatedSnippet: Snippet) => {
    await dbStore.updateSnippet(updatedSnippet);
  };

  const deleteSnippet = async (id: number) => {
    await dbStore.deleteSnippet(id);
  };

  // Notes CRUD (delegated to RxDB)
  const addNote = async (note: Note) => {
    await dbStore.addNote(note);
  };

  const updateNote = async (updatedNote: Note) => {
    await dbStore.updateNote(updatedNote);
  };

  const deleteNote = async (id: number) => {
    await dbStore.deleteNote(id);
  };

  // Dictionary CRUD (delegated to RxDB)
  const addDictionaryTerm = async (term: DictionaryTerm) => {
    await dbStore.addDictionaryTerm(term);
  };

  const updateDictionaryTerm = async (updatedTerm: DictionaryTerm) => {
    await dbStore.updateDictionaryTerm(updatedTerm);
  };

  const deleteDictionaryTerm = async (id: number) => {
    await dbStore.deleteDictionaryTerm(id);
  };

  return {
    get user() { return user; },
    get news() { return news; },
    get activities() { return activities; },
    get snippets() { return snippets; },
    get notes() { return notes; },
    get dictionary() { return dictionary; },
    deleteActivity,
    addSnippet,
    updateSnippet,
    deleteSnippet,
    addNote,
    updateNote,
    deleteNote,
    addDictionaryTerm,
    updateDictionaryTerm,
    deleteDictionaryTerm
  };
}

// Singleton instance
export const authStore = createAuthStore();
