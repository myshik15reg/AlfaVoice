/**
 * Stub-модули для Tauri зависимостей
 * Используются в веб-сборке для предотвращения ошибок импорта
 */

// Stub для @tauri-apps/api
export const invoke = async (command: string, args?: any): Promise<any> => {
	console.warn(`[Tauri Stub] invoke called in web environment: ${command}`);
	return null;
};

export const event = {
	listen: async (eventName: string, callback: (event: any) => void): Promise<() => Promise<void>> => {
		console.warn(`[Tauri Stub] event.listen called in web environment: ${eventName}`);
		return async () => {};
	},
	emit: async (eventName: string, payload?: any): Promise<void> => {
		console.warn(`[Tauri Stub] event.emit called in web environment: ${eventName}`);
	}
};

// Stub для @tauri-apps/plugin-global-shortcut
export const register = async (shortcut: string, handler: () => void): Promise<void> => {
	console.warn(`[Tauri Stub] global-shortcut.register called in web environment: ${shortcut}`);
};

export const unregister = async (shortcut: string): Promise<void> => {
	console.warn(`[Tauri Stub] global-shortcut.unregister called in web environment: ${shortcut}`);
};

export const unregisterAll = async (): Promise<void> => {
	console.warn('[Tauri Stub] global-shortcut.unregisterAll called in web environment');
};
