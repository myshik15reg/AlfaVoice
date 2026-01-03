import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import Sidebar from './Sidebar.svelte';

describe('Sidebar', () => {
	it('renders logo correctly', () => {
		render(Sidebar);
		expect(screen.getByText('AlfaVoice')).toBeTruthy();
		expect(screen.getByText('A')).toBeTruthy();
	});

	it('renders all top navigation items with correct labels', () => {
		render(Sidebar);

		const expectedLabels = ['Главная', 'Словарь', 'Сниппеты', 'Стиль', 'Заметки'];
		expectedLabels.forEach(label => {
			expect(screen.getByText(label)).toBeTruthy();
		});
	});

	it('renders all bottom navigation items with correct labels', () => {
		render(Sidebar);

		const expectedLabels = ['Настройки', 'Помощь'];
		expectedLabels.forEach(label => {
			expect(screen.getByText(label)).toBeTruthy();
		});
	});

	it('dispatches navigate event when navigation item is clicked', async () => {
		const { component } = render(Sidebar);

		const mainButton = screen.getByLabelText('Главная');
		let navigateEventFired = false;
		let navigatePath = '';

		// Используем component.$on для отслеживания событий компонента
		component.$on('navigate', (e: any) => {
			navigateEventFired = true;
			navigatePath = e.detail.path;
		});

		await fireEvent.click(mainButton);
		expect(navigateEventFired).toBe(true);
		expect(navigatePath).toBe('/');
	});

	it('renders navigation buttons with correct aria attributes', () => {
		render(Sidebar);

		const mainButton = screen.getByLabelText('Главная');
		expect(mainButton.getAttribute('aria-label')).toBe('Главная');

		const settingsButton = screen.getByLabelText('Настройки');
		expect(settingsButton.getAttribute('aria-label')).toBe('Настройки');
	});

	it('has correct sidebar structure', () => {
		const { container } = render(Sidebar);

		const sidebar = container.querySelector('.sidebar');
		expect(sidebar).toBeTruthy();

		const logo = container.querySelector('.logo');
		expect(logo).toBeTruthy();

		const topNav = container.querySelector('.sidebar-nav:not(.sidebar-nav-bottom)');
		expect(topNav).toBeTruthy();

		const bottomNav = container.querySelector('.sidebar-nav-bottom');
		expect(bottomNav).toBeTruthy();
	});
});
