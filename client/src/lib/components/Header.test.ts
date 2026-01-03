import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import Header from './Header.svelte';

describe('Header', () => {
	it('renders greeting with default user name', () => {
		render(Header);
		expect(screen.getByText('С возвращением, Евгений')).toBeTruthy();
	});

	it('renders greeting with custom user name', () => {
		render(Header, { userName: 'Алексей' });
		expect(screen.getByText('С возвращением, Алексей')).toBeTruthy();
	});

	it('renders all stat items with correct labels', () => {
		render(Header);

		expect(screen.getByText('Серия')).toBeTruthy();
		expect(screen.getByText('Слова')).toBeTruthy();
		expect(screen.getByText('Слов/мин')).toBeTruthy();
	});

	it('renders default stat values', () => {
		render(Header);

		expect(screen.getByText('1 день')).toBeTruthy();
		expect(screen.getByText('1250')).toBeTruthy();
		expect(screen.getByText('85')).toBeTruthy();
	});

	it('renders custom stat values', () => {
		render(Header, {
			streak: 5,
			wordsCount: 2500
		});

		expect(screen.getByText('5 день')).toBeTruthy();
		expect(screen.getByText('2500')).toBeTruthy();
		// WPM is now a store, not a prop, so we test default value
		expect(screen.getByText('0')).toBeTruthy();
	});

	it('has correct header structure', () => {
		const { container } = render(Header);

		const header = container.querySelector('.header');
		expect(header).toBeTruthy();

		const greeting = container.querySelector('.greeting');
		expect(greeting).toBeTruthy();

		const stats = container.querySelector('.stats');
		expect(stats).toBeTruthy();
	});

	it('renders all stat items with icons', () => {
		const { container } = render(Header);

		const statItems = container.querySelectorAll('.stat-item');
		expect(statItems).toHaveLength(3);

		statItems.forEach(item => {
			const icon = item.querySelector('.stat-icon');
			expect(icon).toBeTruthy();
		});
	});
});
