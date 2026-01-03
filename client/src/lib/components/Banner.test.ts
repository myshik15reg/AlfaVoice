import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import Banner from './Banner.svelte';

describe('Banner', () => {
	it('renders with default props', () => {
		render(Banner);

		expect(screen.getByText('Настройте звучание AlfaVoice')).toBeTruthy();
		expect(screen.getByText('Адаптируйте голосовой ввод под ваш стиль письма и профессиональный словарь.')).toBeTruthy();
		expect(screen.getByText('Начать')).toBeTruthy();
	});

	it('renders with custom title', () => {
		render(Banner, { title: 'Тестовый заголовок' });
		expect(screen.getByText('Тестовый заголовок')).toBeTruthy();
	});

	it('renders with custom description', () => {
		render(Banner, { description: 'Тестовое описание' });
		expect(screen.getByText('Тестовое описание')).toBeTruthy();
	});

	it('renders with custom button text', () => {
		render(Banner, { buttonText: 'Далее' });
		expect(screen.getByText('Далее')).toBeTruthy();
	});

	it('dispatches click event when button is clicked', async () => {
		render(Banner);

		const button = screen.getByText('Начать');
		let clickEventFired = false;

		// Создаем mock для события click
		const banner = document.querySelector('.banner');
		if (banner) {
			banner.addEventListener('click', () => {
				clickEventFired = true;
			});
		}

		await fireEvent.click(button);
		expect(clickEventFired).toBe(true);
	});

	it('has correct banner structure', () => {
		const { container } = render(Banner);

		const banner = container.querySelector('.banner');
		expect(banner).toBeTruthy();

		const bannerContent = container.querySelector('.banner-content');
		expect(bannerContent).toBeTruthy();

		const bannerTitle = container.querySelector('.banner-title');
		expect(bannerTitle).toBeTruthy();

		const bannerDescription = container.querySelector('.banner-description');
		expect(bannerDescription).toBeTruthy();

		const bannerButton = container.querySelector('.banner-button');
		expect(bannerButton).toBeTruthy();
	});

	it('renders button with arrow icon', () => {
		const { container } = render(Banner);

		const button = container.querySelector('.banner-button');
		expect(button).toBeTruthy();
		expect(button).toContainHTML('svg');
	});
});
