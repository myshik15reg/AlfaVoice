/**
 * Stats Store (Refactored)
 * Svelte store для управления состоянием статистики транскрипции
 * 
 * ПРИНЦИПЫ:
 * - Только хранение состояния (State)
 * - Никакой бизнес-логики (расчет WPM, подсчет слов)
 * - Логика выполняется в Rust через CoreService
 * - Состояние обновляется через события от Rust
 */

import { writable, derived } from 'svelte/store';
import { coreService, type StatsUpdateMessage } from '$lib/core';

// ============================================================================
// Состояние (State)
// ============================================================================

interface StatsState {
	wordsCount: number;
	wpm: number; // Words Per Minute
	streak: number;
	recordingStartTime: number | null;
}

const initialState: StatsState = {
	wordsCount: 0,
	wpm: 0,
	streak: 1,
	recordingStartTime: null
};

// Базовый store с состоянием
const { subscribe, set, update } = writable<StatsState>(initialState);

// ============================================================================
// Public Stores (для компонентов)
// ============================================================================

/**
 * Общее количество слов
 */
export const wordsCount = derived(
	{ subscribe },
	($state) => $state.wordsCount
);

/**
 * Скорость речи (слова в минуту)
 */
export const wpmStore = derived(
	{ subscribe },
	($state) => $state.wpm
);

/**
 * Серия дней подряд
 */
export const streak = derived(
	{ subscribe },
	($state) => $state.streak
);

/**
 * Время начала записи (null если не записываем)
 */
export const recordingStartTime = derived(
	{ subscribe },
	($state) => $state.recordingStartTime
);

/**
 * Флаг: идет ли запись
 */
export const isRecording = derived(
	{ subscribe },
	($state) => $state.recordingStartTime !== null
);

// ============================================================================
// Внутренние функции обновления состояния
// ============================================================================

/**
 * Обновляет статистику из сообщения от Rust
 * @param stats - данные статистики от Rust
 */
function updateStats(stats: StatsUpdateMessage) {
	update((state) => ({
		...state,
		wordsCount: stats.wordsCount,
		wpm: stats.wpm,
		streak: stats.streak
	}));
}

/**
 * Устанавливает время начала записи
 */
function setRecordingStartTime(timestamp: number | null) {
	update((state) => ({
		...state,
		recordingStartTime: timestamp
	}));
}

// ============================================================================
// Интеграция с CoreService
// ============================================================================

/**
 * Инициализирует подписку на события от Rust Core
 * Должен вызываться один раз при старте приложения
 */
export async function initializeStatsStore(): Promise<void> {
	console.log('[statsStore] Initializing...');

	// Подписываемся на события от CoreService
	// В будущем это будет через события от Rust
	// Сейчас оставляем заглушки для совместимости с текущей реализацией

	console.log('[statsStore] Initialized');
}

// ============================================================================
// Public Actions (делегируют в CoreService)
// ============================================================================

/**
 * Обновляет статистику при получении новой транскрипции
 * В будущем: будет отправлять текст в Rust для анализа
 * Сейчас: временная реализация для совместимости
 */
export async function updateStatsFromText(text: string, previousText: string = ''): Promise<void> {
	// TODO: В будущем это будет invoke('stats_update', { text, previousText })
	// Сейчас оставляем локальный расчет для совместимости
	console.log('[statsStore] Updating stats from text (temporary implementation)');
	
	// Временная реализация для совместимости
	const newWordsCount = countWords(text);
	update((state) => ({
		...state,
		wordsCount: newWordsCount
	}));
}

/**
 * Начинает отслеживание записи
 */
export async function startRecordingTracking(): Promise<void> {
	const now = Date.now();
	setRecordingStartTime(now);
	// TODO: invoke('recording_start')
}

/**
 * Останавливает отслеживание записи
 */
export async function stopRecordingTracking(): Promise<void> {
	setRecordingStartTime(null);
	// TODO: invoke('recording_stop')
}

/**
 * Сбрасывает статистику
 */
export async function resetStats(): Promise<void> {
	set(initialState);
	await coreService.resetStats();
}

/**
 * Обновляет серию дней (streak)
 */
export async function updateStreak(days: number): Promise<void> {
	update((state) => ({
		...state,
		streak: days
	}));
	await coreService.updateStreak(days);
}

// ============================================================================
// Вспомогательные функции (временные, будут удалены после миграции)
// ============================================================================

/**
 * Подсчитывает количество слов в тексте
 * ВРЕМЕННАЯ ФУНКЦИЯ - будет перенесена в Rust
 */
function countWords(text: string): number {
	if (!text || text.trim().length === 0) return 0;
	
	// Разбиваем текст на слова по пробелам и знакам препинания
	const words = text.trim().split(/[\s,.!?;:()"']+/).filter(word => word.length > 0);
	return words.length;
}

// ============================================================================
// Cleanup
// ============================================================================

/**
 * Очищает ресурсы
 */
export async function cleanup(): Promise<void> {
	console.log('[statsStore] Cleaning up...');
	set(initialState);
}

// ============================================================================
// Экспорт внутреннего store (для тестирования)
// ============================================================================

export { subscribe };
