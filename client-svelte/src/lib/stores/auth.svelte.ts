import { browser } from '$app/environment';
import type { User, Activity, NewsItem, Snippet, Note, DictionaryTerm } from '$lib/types';

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

// Mock DB (в будущем будет импортирован из реального источника данных)
const mockDB = {
  user: {
    id: 1,
    name: 'Евгений',
    firstName: 'Евгений',
    email: 'evgeny@alfa.com',
    initials: 'Е'
  } as User,
  news: [
    { id: 1, title: 'Новая версия стиля: Корпоративный 2.0', time: '2 часа назад', read: false },
    { id: 2, title: 'Интеграция с Chrome обновлена', time: '5 часов назад', read: true },
    { id: 3, title: 'Еженедельный отчёт готов', time: '1 день назад', read: true }
  ] as NewsItem[],
  activities: [
    { id: 1, time: '22:29', text: 'А так работает.', duration: '0:06', date: '26 декабря 2025' },
    { id: 2, time: '22:29', text: 'Работает или нет?', duration: '0:12', date: '26 декабря 2025' },
    { id: 3, time: '22:10', text: 'И внимательно, внимательно разрабатывай, перепроверяй.', duration: '0:12', date: '26 декабря 2025' },
    { id: 4, time: '22:29', text: 'Аудио без звука.', duration: '0:12', date: '26 декабря 2025' }
  ] as Activity[],
  snippets: [
    { id: 1, title: 'Приветствие клиента', category: 'Приветствия', content: 'Здравствуйте! Меня зовут Евгений, я персональный менеджер компании Альфа-Лизинг. Благодарю вас за обращение...', tags: ['продажи', 'общение'], color: 'bg-primary', cmd: '/hello', createdAt: '2024-01-15' },
    { id: 2, title: 'Запрос документов', category: 'Документы', content: 'Для оформления договора лизинга, пожалуйста, пришлите сканы следующих документов: Устав (все страницы), Свидетельство о регистрации (ОГРН/ИНН)...', tags: ['документы'], color: 'bg-blue-500', cmd: '/docs_req', createdAt: '2024-01-15' },
    { id: 3, title: 'Одобрение заявки', category: 'Продажи', content: 'Рады сообщить, что ваша заявка на лизинг одобрена! Мы готовы перейти к этапу подписания договора. Вам будет удобно...', tags: ['продажи'], color: 'bg-green-500', cmd: '/approve', createdAt: '2024-01-15' },
    { id: 4, title: 'Подпись (Стандарт)', category: 'Закрытие', content: 'С уважением, Команда Альфа-Лизинг. Тел: 8 (800) 123-45-67. alfaleasing.ru', tags: ['закрытие'], color: 'bg-gray-400', cmd: '/sig_std', createdAt: '2024-01-15' },
    { id: 5, title: 'Проблема решена', category: 'Тех. поддержка', content: 'Ваш запрос успешно обработан, проблема устранена. Пожалуйста, проверьте работу сервиса и подтвердите, что всё в порядке.', tags: ['поддержка'], color: 'bg-purple-500', cmd: '/solved', createdAt: '2024-01-15' }
  ] as Snippet[],
  notes: [
    { id: 1, title: 'Принципы Tone of Voice', content: 'Наш стиль общения должен быть профессиональным, но дружелюбным...', tags: ['стиль'], createdAt: '2024-01-15', updatedAt: '2024-01-15', date: 'Только что', isFavorite: false },
    { id: 2, title: 'Шаблон приветствия', content: 'Добрый день, [Имя Клиента]! Меня зовут Евгений, я персональный менеджер...', tags: ['шаблоны'], createdAt: '2024-01-14', updatedAt: '2024-01-14', date: '2 часа назад', isFavorite: false },
    { id: 3, title: 'Список стоп-слов', content: 'Слова, которые лучше исключить: \'Доброго времени суток\', \'Заранее спасибо\'...', tags: ['стиль'], createdAt: '2024-01-13', updatedAt: '2024-01-13', date: 'Вчера', isFavorite: true },
    { id: 4, title: 'Идеи для блога', content: '1. Как ИИ помогает автоматизировать рутину в лизинге. 2. Топ-5 ошибок...', tags: ['идеи'], createdAt: '2024-01-10', updatedAt: '2024-01-10', date: '24 дек 2025', isFavorite: false }
  ] as Note[],
  dictionary: [
    { id: 1, title: 'Лизингополучатель', tag: 'Юр. лица', desc: 'Физическое или юридическое лицо, которое в соответствии с договором лизинга принимает предмет лизинга за определенную плату...', example: 'Лизингополучатель обязуется своевременно вносить лизинговые платежи согласно графику.' },
    { id: 2, title: 'Аннуитетный платеж', tag: 'Финансы', desc: 'Схема погашения задолженности, при которой выплаты осуществляются равными суммами...', example: 'Для вашего удобства мы сформировали график с аннуитетными платежами.' },
    { id: 3, title: 'Выкупная стоимость', tag: 'Договор', desc: 'Сумма, которую лизингополучатель должен уплатить лизингодателю по окончании срока лизинга...', example: 'По завершении договора вам останется внести выкупную стоимость.' }
  ] as DictionaryTerm[]
};

// Auth Store
export function createAuthStore() {
  let user = $state<User>(mockDB.user);
  let news = $state<NewsItem[]>(mockDB.news);
  let activities = $state<Activity[]>(mockDB.activities);
  
  // Collections (Synced)
  let snippets = $state<Snippet[]>(mockDB.snippets);
  let notes = $state<Note[]>(mockDB.notes);
  let dictionary = $state<DictionaryTerm[]>(mockDB.dictionary);

  // Load from localStorage on mount
  if (browser) {
    const localData = localStorage.getItem('app_data');
    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        snippets = parsed.snippets || [];
        notes = parsed.notes || [];
        dictionary = parsed.dictionary || [];
      } catch (e) {
        console.error('Failed to parse local data:', e);
      }
    }
  }

  // Methods
  const deleteActivity = (id: number) => {
    activities = activities.filter(activity => activity.id !== id);
  };

  // Snippets CRUD
  const addSnippet = (snippet: Snippet) => {
    snippets = [snippet, ...snippets];
    persistCollections();
  };

  const updateSnippet = (updatedSnippet: Snippet) => {
    snippets = snippets.map(s => s.id === updatedSnippet.id ? updatedSnippet : s);
    persistCollections();
  };

  const deleteSnippet = (id: number) => {
    snippets = snippets.filter(s => s.id !== id);
    persistCollections();
  };

  // Notes CRUD
  const addNote = (note: Note) => {
    notes = [note, ...notes];
    persistCollections();
  };

  const updateNote = (updatedNote: Note) => {
    notes = notes.map(n => n.id === updatedNote.id ? updatedNote : n);
    persistCollections();
  };

  const deleteNote = (id: number) => {
    notes = notes.filter(n => n.id !== id);
    persistCollections();
  };

  // Dictionary CRUD
  const addDictionaryTerm = (term: DictionaryTerm) => {
    dictionary = [term, ...dictionary];
    persistCollections();
  };

  const updateDictionaryTerm = (updatedTerm: DictionaryTerm) => {
    dictionary = dictionary.map(t => t.id === updatedTerm.id ? updatedTerm : t);
    persistCollections();
  };

  const deleteDictionaryTerm = (id: number) => {
    dictionary = dictionary.filter(t => t.id !== id);
    persistCollections();
  };

  // Persist helper
  const persistCollections = () => {
    if (browser) {
      const data = { snippets, notes, dictionary };
      localStorage.setItem('app_data', JSON.stringify(data));
      // TODO: Send to server
    }
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
