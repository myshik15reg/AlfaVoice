import { loadedLocales, loadedFormatters, i18nObject } from './i18n-util';
import type { Locales } from './i18n-types';

let currentLocale: Locales = 'ru';

export const setLocale = (locale: Locales): void => {
  currentLocale = locale;
  localStorage.setItem('app_locale', locale);
  
  // Reload page to apply new locale
  window.location.reload();
};

export const getLocale = (): Locales => {
  return currentLocale;
};

export const initLocale = (): void => {
  const savedLocale = localStorage.getItem('app_locale') as Locales | null;
  if (savedLocale && (savedLocale === 'en' || savedLocale === 'ru')) {
    currentLocale = savedLocale;
  }
  
  // Load all locales
  if (!loadedLocales[currentLocale]) {
    // Import and load the locale
    const loadLocale = async () => {
      if (currentLocale === 'en') {
        const en = await import('./en');
        loadedLocales.en = en.default as any;
      } else {
        const ru = await import('./ru');
        loadedLocales.ru = ru.default as any;
      }
    };
    
    loadLocale();
  }
};

export const getCurrentTranslation = () => {
  return i18nObject(currentLocale);
};
