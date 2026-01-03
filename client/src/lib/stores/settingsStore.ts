import { writable } from 'svelte/store';

interface SettingsState {
	selectedMicrophoneId: string | null;
}

const STORAGE_KEY = 'selectedMicrophoneId';

function createSettingsStore() {
	// Загружаем начальное состояние из localStorage
	const storedValue = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
	const initialState: SettingsState = {
		selectedMicrophoneId: storedValue || null
	};

	const { subscribe, set, update } = writable<SettingsState>(initialState);

	return {
		subscribe,
		setSelectedMicrophoneId: (deviceId: string | null) => {
			console.log('[DEBUG] Setting microphone ID:', deviceId);
			update((state) => {
				const newState = { ...state, selectedMicrophoneId: deviceId };
				
				// Сохраняем в localStorage
				if (typeof window !== 'undefined') {
					if (deviceId) {
						localStorage.setItem(STORAGE_KEY, deviceId);
						console.log('[DEBUG] Saved to localStorage:', deviceId);
					} else {
						localStorage.removeItem(STORAGE_KEY);
						console.log('[DEBUG] Removed from localStorage');
					}
				}
				
				return newState;
			});
		},
		getSelectedMicrophoneId: () => {
			// Получаем текущее значение из store
			let deviceId: string | null = null;
			const unsubscribe = subscribe((state) => {
				deviceId = state.selectedMicrophoneId;
				unsubscribe(); // Отписываемся сразу после получения значения
			});
			return deviceId;
		},
		reset: () => {
			set({ selectedMicrophoneId: null });
			if (typeof window !== 'undefined') {
				localStorage.removeItem(STORAGE_KEY);
			}
		}
	};
}

export const settingsStore = createSettingsStore();
