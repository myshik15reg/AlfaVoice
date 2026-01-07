// Translation types
export type Locale = 'ru' | 'en';

// Russian translations
const ru = {
	toggleSidebar: 'Переключить боковую панель',
	enableLightTheme: 'Включить светлую тему',
	enableDarkTheme: 'Включить темную тему',
	notifications: 'Уведомления',
	markAllAsRead: 'Все прочитаны',
	showAll: 'Показать все',
	goToSettings: 'Настройки',
	minimize: 'Свернуть',
	maximize: 'Развернуть',
	close: 'Закрыть',
	dictionary: 'Словарь',
	snippets: 'Сниппеты',
	notes: 'Заметки',
	settings: 'Настройки',
	support: 'Поддержка',
	goToHome: 'На главную',
	appName: 'AlfaVoice',
	welcomeBack: (name: string) => `С возвращением, ${name}!`,
	productivityOverview: 'Обзор продуктивности за неделю',
	daysLeft_days: 'дней',
	daysLeft_day: 'день',
	daysLeft_days2_4: 'дня',
	wordsCount: 'слов',
	wpmLabel: 'слов/мин',
	recordingInProgress: 'Идёт запись...',
	personalizeTitle: 'Персонализируйте свой опыт',
	personalizeDescription: 'Настройте AlfaVoice под свои уникальные потребности для максимальной продуктивности.',
	startPersonalization: 'Начать персонализацию',
	integrations: 'Интеграции',
	development: 'Разработка',
	vscodeExtension: 'Расширение VS Code',
	browser: 'Браузер',
	chromeIntegration: 'Интеграция с Chrome',
	recentActivity: (date: string) => `Недавняя активность — ${date}`,
	viewAllHistory: 'Посмотреть всю историю',
	transcribing: 'Идёт расшифровка...',
	copyText: 'Копировать текст',
	deleteRecording: 'Удалить запись',
	settingsTitle: 'Настройки',
	settingsDescription: 'Управление общими параметрами приложения и вашей учетной записи.',
	general: 'Общие',
	devices: 'Устройства',
	languages: 'Языки',
	notificationsTab: 'Уведомления',
	privacy: 'Приватность',
	userProfile: 'Профиль пользователя',
	userProfileDescription: 'Информация о вашей учетной записи и аватар.',
	managedByLdap: 'Учетная запись управляется через LDAP',
	firstName: 'Имя',
	lastName: 'Фамилия',
	email: 'Email адрес',
	role: 'Должность',
	microphone: 'Микрофон',
	active: 'Активен',
	requiresAccess: 'Требуется доступ',
	notFound: 'Не найден',
	recording: 'Запись...',
	playback: 'Воспроизведение...',
	inputDevice: 'Устройство ввода',
	microphonesNotFound: 'Микрофоны не найдены',
	stopRecording: 'Остановить запись',
	stopPlayback: 'Остановить воспроизведение',
	startTest: 'Начать тест',
	inputLevel: 'Уровень входного сигнала',
	decreaseVolume: 'Уменьшить громкость',
	increaseVolume: 'Увеличить громкость',
	recordingWorksWhenHolding: 'Запись будет работать когда удерживаешь горячие клавиши',
	hotkeys: 'Горячие клавиши',
	quickRecording: 'Быстрая запись',
	globalHotkeyDescription: 'Глобальная комбинация для старта/остановки записи',
	pressKeys: 'Нажмите клавиши...',
	change: 'Изменить',
	cancel: 'Отмена',
	regionalSettings: 'Региональные настройки',
	interfaceLanguage: 'Язык интерфейса',
	languageChangeRequiresReload: 'Изменение языка может потребовать перезагрузки приложения.',
	timezone: 'Часовой пояс',
	notificationCategories: 'Категории уведомлений',
	notificationType: 'Тип уведомления',
	email: 'Email',
	push: 'Push',
	descriptionFor: (type: string) => `Описание для ${type.toLowerCase()}...`,
	protectedPerimeterActive: 'Защищенный контур активен',
	protectedPerimeterDescription: 'Приложение работает в изолированной среде. Все текстовые данные шифруются (AES-256). Синхронизация с облаком ограничена политикой безопасности.',
	checkStatus: 'Проверить статус',
	appAccess: 'Доступ к приложениям',
};

// English translations
const en = {
	toggleSidebar: 'Toggle sidebar',
	enableLightTheme: 'Enable light theme',
	enableDarkTheme: 'Enable dark theme',
	notifications: 'Notifications',
	markAllAsRead: 'Mark all as read',
	showAll: 'Show all',
	goToSettings: 'Settings',
	minimize: 'Minimize',
	maximize: 'Maximize',
	close: 'Close',
	dictionary: 'Dictionary',
	snippets: 'Snippets',
	notes: 'Notes',
	settings: 'Settings',
	support: 'Support',
	goToHome: 'Go to home',
	appName: 'AlfaVoice',
	welcomeBack: (name: string) => `Welcome back, ${name}!`,
	productivityOverview: 'Productivity overview for the week',
	daysLeft_days: 'days',
	daysLeft_day: 'day',
	daysLeft_days2_4: 'days',
	wordsCount: 'words',
	wpmLabel: 'wpm',
	recordingInProgress: 'Recording in progress...',
	personalizeTitle: 'Personalize your experience',
	personalizeDescription: 'Customize AlfaVoice to fit your unique needs for maximum productivity.',
	startPersonalization: 'Start personalization',
	integrations: 'Integrations',
	development: 'Development',
	vscodeExtension: 'VS Code Extension',
	browser: 'Browser',
	chromeIntegration: 'Chrome Integration',
	recentActivity: (date: string) => `Recent activity — ${date}`,
	viewAllHistory: 'View all history',
	transcribing: 'Transcribing...',
	copyText: 'Copy text',
	deleteRecording: 'Delete recording',
	settingsTitle: 'Settings',
	settingsDescription: 'Manage app-wide settings and your account.',
	general: 'General',
	devices: 'Devices',
	languages: 'Languages',
	notificationsTab: 'Notifications',
	privacy: 'Privacy',
	userProfile: 'User Profile',
	userProfileDescription: 'Your account information and avatar.',
	managedByLdap: 'Account managed by LDAP',
	firstName: 'First name',
	lastName: 'Last name',
	email: 'Email address',
	role: 'Role',
	microphone: 'Microphone',
	active: 'Active',
	requiresAccess: 'Requires access',
	notFound: 'Not found',
	recording: 'Recording...',
	playback: 'Playback...',
	inputDevice: 'Input device',
	microphonesNotFound: 'No microphones found',
	stopRecording: 'Stop recording',
	stopPlayback: 'Stop playback',
	startTest: 'Start test',
	inputLevel: 'Input level',
	decreaseVolume: 'Decrease volume',
	increaseVolume: 'Increase volume',
	recordingWorksWhenHolding: 'Recording works when holding hotkeys',
	hotkeys: 'Hotkeys',
	quickRecording: 'Quick recording',
	globalHotkeyDescription: 'Global combination to start/stop recording',
	pressKeys: 'Press keys...',
	change: 'Change',
	cancel: 'Cancel',
	regionalSettings: 'Regional settings',
	interfaceLanguage: 'Interface language',
	languageChangeRequiresReload: 'Changing language may require app reload.',
	timezone: 'Timezone',
	notificationCategories: 'Notification categories',
	notificationType: 'Notification type',
	email: 'Email',
	push: 'Push',
	descriptionFor: (type: string) => `Description for ${type.toLowerCase()}...`,
	protectedPerimeterActive: 'Protected perimeter active',
	protectedPerimeterDescription: 'The application runs in an isolated environment. All text data is encrypted (AES-256). Cloud sync is restricted by security policy.',
	checkStatus: 'Check status',
	appAccess: 'App access',
};

// Current locale state
let currentLocale: Locale = (typeof localStorage !== 'undefined' && localStorage.getItem('app_locale')) as Locale || 'ru';

// Get current locale
export function getLocale(): Locale {
	return currentLocale;
}

// Set locale
export function setLocale(locale: Locale) {
	currentLocale = locale;
	localStorage.setItem('app_locale', locale);
	
	// Reload page to apply new locale
	window.location.reload();
}

// Get translations for current locale
export function getTranslations() {
	return translations[currentLocale];
}

// Helper function for translation
export function t(key: keyof typeof ru, ...args: any[]): string {
	const translation = translations[currentLocale][key] as any;
	if (typeof translation === 'function') {
		return translation(...args);
	}
	return translation;
}

// Export translations object for backward compatibility
export const i18nTranslations = getTranslations();
export default i18nTranslations;
