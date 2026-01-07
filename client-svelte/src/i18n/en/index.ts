export default {
	// Common
	appName: 'AlfaVoice',
	
	// Navigation
	dictionary: 'Dictionary',
	snippets: 'Snippets',
	notes: 'Notes',
	settings: 'Settings',
	support: 'Support',
	
	// Header
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
	sync: 'Sync',
	syncing: 'Syncing...',
	synced: 'Synced',
	syncError: 'Sync error',
	lastSync: 'Last sync',
	pendingChanges: 'Pending changes',
	
	// Sidebar
	goToHome: 'Go to home',
	
	// Dashboard
	dashboardTitle: 'Dashboard',
	welcomeBack: 'Welcome back, {{name}}',
	productivityOverview: 'Productivity overview',
	recordingInProgress: 'Recording in progress...',
	daysLeft_days: 'days left',
	daysLeft_day: 'day left',
	daysLeft_days2_4: 'days left',
	wordsCount: 'words',
	wpmLabel: 'WPM',
	personalizeTitle: 'Make AlfaVoice sound like <span class="text-primary italic font-serif">you</span>',
	personalizeDescription: 'AlfaVoice adapts to your corporate tone across all platforms. Personalize your writing style for <span class="font-semibold text-text-main dark:text-white">messages, client emails, and internal chats</span> to ensure brand consistency.',
	startPersonalization: 'Start personalization',
	integrations: 'Integrations',
	development: 'Development',
	vsCodeExtension: 'VS Code Extension',
	browser: 'Browser',
	chromeIntegration: 'Chrome Integration',
	recentActivity: 'Recent activity — {{date}}',
	viewAllHistory: 'View all history',
	transcribing: 'Transcribing...',
	copyText: 'Copy text',
	deleteRecording: 'Delete recording',
	
	// Settings
	settingsTitle: 'Settings',
	settingsDescription: 'Manage application settings and your account.',
	
	// Settings tabs
	generalTab: 'General',
	devicesTab: 'Devices',
	languagesTab: 'Languages',
	notificationsTab: 'Notifications',
	privacyTab: 'Privacy',
	
	// General
	userProfile: 'User Profile',
	userProfileDescription: 'Account information and avatar.',
	managedByLdap: 'Account managed via LDAP',
	firstName: 'First name',
	lastName: 'Last name',
	emailAddress: 'Email address',
	role: 'Role',
	
	// Devices
	microphone: 'Microphone',
	inputDevice: 'Input device',
	microphoneNotFound: 'No microphones found',
	recording: 'Recording...',
	playing: 'Playing...',
	active: 'Active',
	accessRequired: 'Access required',
	notFound: 'Not found',
	stopRecording: 'Stop recording',
	stopPlayback: 'Stop playback',
	startTest: 'Start test',
	inputLevel: 'Input level',
	decreaseVolume: 'Decrease volume',
	increaseVolume: 'Increase volume',
	hotkeysWorkWhenHeld: 'Recording will work when you hold the hotkeys',
	hotkeys: 'Hotkeys',
	quickRecording: 'Quick recording',
	quickRecordingDescription: 'Global combination to start/stop recording',
	pressKeys: 'Press keys...',
	change: 'Change',
	cancel: 'Cancel',
	
	// Languages
	regionalSettings: 'Regional Settings',
	interfaceLanguage: 'Interface language',
	languageChangeNote: 'Changing language may require application reload.',
	timezone: 'Timezone',
	
	// Notifications
	notificationCategories: 'Notification Categories',
	notificationType: 'Notification type',
	email: 'Email',
	push: 'Push',
	descriptionFor: 'Description for {{type}}...',
	
	// Privacy
	securePerimeterActive: 'Secure perimeter active',
	securePerimeterDescription: 'Application runs in an isolated environment. All text data is encrypted (AES-256). Cloud sync is limited by security policy.',
	checkStatus: 'Check status',
	appAccess: 'App Access',
	
	// Other
	today: 'Today',
} as const
