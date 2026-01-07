// Settings Tabs
export const SETTINGS_TABS: { id: string; icon: string; label: string }[] = [
  { id: 'general', icon: 'manage_accounts', label: 'Общие' },
  { id: 'devices', icon: 'devices', label: 'Устройства' },
  { id: 'languages', icon: 'language', label: 'Языки и регионы' },
  { id: 'notifications', icon: 'notifications', label: 'Уведомления' },
  { id: 'privacy', icon: 'lock', label: 'Конфиденциальность' },
  { id: 'style', icon: 'tune', label: 'Стиль' },
  { id: 'integrations', icon: 'extension', label: 'Интеграции' },
  { id: 'code', icon: 'code', label: 'Код' }
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

// Regions
export const TIMEZONES = [
  '(UTC+03:00) Москва, Санкт-Петербург',
  '(UTC+02:00) Калининград',
  '(UTC+04:00) Самара',
  '(UTC+05:00) Екатеринбург',
  '(UTC+07:00) Новосибирск'
];
