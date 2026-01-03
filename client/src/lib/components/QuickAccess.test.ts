import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import QuickAccess from './QuickAccess.svelte';

describe('QuickAccess', () => {
	it('renders section title', () => {
		render(QuickAccess);
		expect(screen.getByText('Вернуться в поток')).toBeTruthy();
	});

	it('renders all cards with correct titles', () => {
		render(QuickAccess);

		expect(screen.getByText('Code')).toBeTruthy();
		expect(screen.getByText('Chrome')).toBeTruthy();
	});

	it('renders all cards with correct descriptions', () => {
		render(QuickAccess);

		expect(screen.getByText('Голосовой ввод для программирования')).toBeTruthy();
		expect(screen.getByText('Быстрые заметки в браузере')).toBeTruthy();
	});

	it('dispatches select event when card is clicked', async () => {
		const { component } = render(QuickAccess);

		const codeCard = screen.getByText('Code').closest('.card');
		let selectEventFired = false;
		let selectedCardId = '';

		// Используем component.$on для отслеживания событий компонента
		component.$on('select', (e: any) => {
			selectEventFired = true;
			selectedCardId = e.detail.cardId;
		});

		if (codeCard) {
			await fireEvent.click(codeCard);
			expect(selectEventFired).toBe(true);
			expect(selectedCardId).toBe('code');
		}
	});

	it('dispatches select event with correct cardId for Chrome card', async () => {
		const { component } = render(QuickAccess);

		const chromeCard = screen.getByText('Chrome').closest('.card');
		let selectEventFired = false;
		let selectedCardId = '';

		component.$on('select', (e: any) => {
			selectEventFired = true;
			selectedCardId = e.detail.cardId;
		});

		if (chromeCard) {
			await fireEvent.click(chromeCard);
			expect(selectEventFired).toBe(true);
			expect(selectedCardId).toBe('chrome');
		}
	});

	it('has correct quick access structure', () => {
		const { container } = render(QuickAccess);

		const quickAccess = container.querySelector('.quick-access');
		expect(quickAccess).toBeTruthy();

		const sectionTitle = container.querySelector('.section-title');
		expect(sectionTitle).toBeTruthy();

		const cardsGrid = container.querySelector('.cards-grid');
		expect(cardsGrid).toBeTruthy();
	});

	it('renders all cards with icons', () => {
		const { container } = render(QuickAccess);

		const cards = container.querySelectorAll('.card');
		expect(cards).toHaveLength(2);

		cards.forEach(card => {
			const cardIcon = card.querySelector('.card-icon');
			expect(cardIcon).toBeTruthy();
		});
	});

	it('renders card content correctly', () => {
		const { container } = render(QuickAccess);

		const cards = container.querySelectorAll('.card');
		expect(cards).toHaveLength(2);

		cards.forEach(card => {
			const cardContent = card.querySelector('.card-content');
			expect(cardContent).toBeTruthy();

			const cardTitle = card.querySelector('.card-title');
			expect(cardTitle).toBeTruthy();

			const cardDescription = card.querySelector('.card-description');
			expect(cardDescription).toBeTruthy();
		});
	});
});
