import type { View } from '../types';

// Navigation
export const NAV_ITEMS: { view: View; icon: string; label: string; isSettings?: boolean }[] = [
  { view: 'dictionary', icon: 'menu_book', label: 'Словарь' },
  { view: 'snippets', icon: 'content_cut', label: 'Сниппеты' },
  { view: 'notes', icon: 'note_alt', label: 'Заметки' },
];

export const BOTTOM_NAV_ITEMS: { view: View; icon: string; label: string; isSettings?: boolean }[] = [
  { view: 'settings_general', icon: 'settings', label: 'Настройки', isSettings: true },
  { view: 'support', icon: 'help', label: 'Поддержка' },
];

// Settings Tabs
export const SETTINGS_TABS: { id: 'general' | 'devices' | 'languages' | 'notifications' | 'privacy'; icon: string; label: string }[] = [
  { id: 'general', icon: 'manage_accounts', label: 'Общие' },
  { id: 'devices', icon: 'devices', label: 'Устройства' },
  { id: 'privacy', icon: 'lock', label: 'Конфиденциальность' },
  { id: 'notifications', icon: 'notifications', label: 'Уведомления' },
  { id: 'languages', icon: 'language', label: 'Языки и регионы' },
];

// Style Settings
export const TONE_LABELS = ['Официальный', 'Корпоративный', 'Мягкий'];
export const TONE_DESCRIPTIONS = ['Для юридических документов', 'Стандарт общения', 'Для внутреннего общения'];
export const TONE_ICONS = ['gavel', 'handshake', 'sentiment_satisfied'];

export const STYLE_PARAMS = [
  { id: 'caps', label: 'Обращение на «Вы» с большой буквы', desc: 'Автоматически заменять «вы» на «Вы» при обращении к одному лицу.' },
  { id: 'emoji', label: 'Использовать эмодзи', desc: 'Разрешить вставку уместных эмодзи в конце предложений.' },
  { id: 'simple', label: 'Упрощать сложные конструкции', desc: 'Разбивать длинные предложения и заменять канцеляризмы на живой язык.' }
];

// Notifications
export const NOTIFICATION_CATEGORIES = [
  'Рекомендации по стилю', 
  'Еженедельная активность', 
  'Обновления плагинов', 
  'Новости и акции'
];

// Privacy Apps
export const PRIVACY_APPS = [
  { name: "Веб-браузеры", desc: "Chrome, Edge, Firefox, Yandex", icon: "public" },
  { name: "Мессенджеры", desc: "Telegram, WhatsApp Desktop", icon: "send" },
  { name: "Офисные пакеты", desc: "Word, Outlook, Notion", icon: "description" }
];

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

// Regions
export const TIMEZONES = [
  '(UTC+03:00) Москва, Санкт-Петербург',
  '(UTC+02:00) Калининград',
  '(UTC+04:00) Самара',
  '(UTC+05:00) Екатеринбург',
  '(UTC+07:00) Новосибирск'
];