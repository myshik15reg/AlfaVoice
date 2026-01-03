import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import HistoryList from './HistoryList.svelte';

describe('HistoryList', () => {
	it('renders section title', () => {
		render(HistoryList);
		expect(screen.getByText('История')).toBeTruthy();
	});

	it('renders all history groups with correct dates', () => {
		render(HistoryList);

		expect(screen.getByText('Сегодня')).toBeTruthy();
		expect(screen.getByText('Вчера')).toBeTruthy();
	});

	it('renders all history entries with correct times', () => {
		render(HistoryList);

		const times = ['14:30', '12:15', '10:45', '16:20', '14:05'];
		times.forEach(time => {
			expect(screen.getByText(time)).toBeTruthy();
		});
	});

	it('renders all history entries with correct text', () => {
		render(HistoryList);

		expect(screen.getByText('Создайте новый компонент для боковой панели с навигацией')).toBeTruthy();
		expect(screen.getByText('Обновите конфигурацию TailwindCSS для поддержки темной темы')).toBeTruthy();
		expect(screen.getByText('Добавьте иконки из библиотеки lucide-svelte')).toBeTruthy();
		expect(screen.getByText('Настройте WebSocket соединение с сервером')).toBeTruthy();
		expect(screen.getByText('Реализуйте логику записи аудио с микрофона')).toBeTruthy();
	});

	it('dispatches select event when entry is clicked', async () => {
		const { component } = render(HistoryList);

		const entryText = screen.getByText('Создайте новый компонент для боковой панели с навигацией');
		const entryButton = entryText.closest('.entry-item');
		let selectEventFired = false;
		let selectedEntryId = '';

		// Используем component.$on для отслеживания событий компонента
		component.$on('select', (e: any) => {
			selectEventFired = true;
			selectedEntryId = e.detail.entryId;
		});

		if (entryButton) {
			await fireEvent.click(entryButton);
			expect(selectEventFired).toBe(true);
			expect(selectedEntryId).toBe('1');
		}
	});

	it('has correct history list structure', () => {
		const { container } = render(HistoryList);

		const historyList = container.querySelector('.history-list');
		expect(historyList).toBeTruthy();

		const sectionTitle = container.querySelector('.section-title');
		expect(sectionTitle).toBeTruthy();

		const historyContent = container.querySelector('.history-content');
		expect(historyContent).toBeTruthy();
	});

	it('renders all history groups', () => {
		const { container } = render(HistoryList);

		const historyGroups = container.querySelectorAll('.history-group');
		expect(historyGroups).toHaveLength(2);
	});

	it('renders all entries in each group', () => {
		const { container } = render(HistoryList);

		const historyGroups = container.querySelectorAll('.history-group');

		// Первая группа (Сегодня) - 3 записи
		const firstGroupEntries = historyGroups[0].querySelectorAll('.entry-item');
		expect(firstGroupEntries).toHaveLength(3);

		// Вторая группа (Вчера) - 2 записи
		const secondGroupEntries = historyGroups[1].querySelectorAll('.entry-item');
		expect(secondGroupEntries).toHaveLength(2);
	});

	it('renders all entries with clock icons', () => {
		const { container } = render(HistoryList);

		const entries = container.querySelectorAll('.entry-item');
		expect(entries).toHaveLength(5);

		entries.forEach(entry => {
			const icon = entry.querySelector('.entry-icon');
			expect(icon).toBeTruthy();
		});
	});

	it('renders all entries with correct content structure', () => {
		const { container } = render(HistoryList);

		const entries = container.querySelectorAll('.entry-item');

		entries.forEach(entry => {
			const entryContent = entry.querySelector('.entry-content');
			expect(entryContent).toBeTruthy();

			const entryTime = entry.querySelector('.entry-time');
			expect(entryTime).toBeTruthy();

			const entryText = entry.querySelector('.entry-text');
			expect(entryText).toBeTruthy();
		});
	});

	it('renders custom history data', () => {
		const customHistory = [
			{
				date: 'Тестовая дата',
				entries: [
					{ id: 'test1', time: '09:00', text: 'Тестовая запись' }
				]
			}
		];

		render(HistoryList, { history: customHistory });

		expect(screen.getByText('Тестовая дата')).toBeTruthy();
		expect(screen.getByText('09:00')).toBeTruthy();
		expect(screen.getByText('Тестовая запись')).toBeTruthy();
	});
});
