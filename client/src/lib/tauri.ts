import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

// Расширение типа Window для TypeScript
declare global {
	interface Window {
		__TAURI__?: any;
	}
}

/**
 * Безопасная проверка, запущено ли приложение в Tauri окружении
 * Это предотвращает ошибки при запуске в обычном браузере
 */
export async function isTauri(): Promise<boolean> {
	try {
		// Проверяем, что __TAURI__ существует в window
		if (typeof window !== 'undefined' && '__TAURI__' in window && window.__TAURI__) {
			console.log('[DEBUG] tauri.ts: isTauri() = true');
			return true;
		}
		console.log('[DEBUG] tauri.ts: isTauri() = false (no __TAURI__ in window)');
		return false;
	} catch {
		console.log('[DEBUG] tauri.ts: isTauri() = false (exception)');
		return false;
	}
}

/**
 * Безопасный вызов Tauri invoke
 * Возвращает null, если не в Tauri окружении или при ошибке
 */
export async function safeInvoke<T = any>(command: string, args?: any): Promise<T | null> {
	console.log(`[DEBUG] tauri.ts: safeInvoke('${command}') called`);
	
	try {
		console.log(`[DEBUG] tauri.ts: Invoking command '${command}' with args:`, args);
		return await invoke<T>(command, args);
	} catch (error) {
		console.error(`[Tauri] Failed to invoke ${command}:`, error);
		return null;
	}
}

/**
 * Безопасная подписка на Tauri события
 * Возвращает функцию для отписки
 */
export async function safeListen(
	eventName: string,
	callback: (event: any) => void
): Promise<() => void> {
	console.log(`[DEBUG] tauri.ts: safeListen('${eventName}') called`);
	
	try {
		console.log(`[DEBUG] tauri.ts: Listening to event '${eventName}'`);
		const unlisten = await listen(eventName, callback);
		return () => {
			unlisten();
		};
	} catch (error) {
		console.error(`[Tauri] Failed to listen to ${eventName}:`, error);
		return () => {};
	}
}
