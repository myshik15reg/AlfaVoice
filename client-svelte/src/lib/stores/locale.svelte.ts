import { set as setStore } from 'svelte/store';
import { loadedLocales, loadedFormatters } from '$i18n/i18n-util';
import type { Locales } from '$i18n/i18n-types';
import type { TranslationFunctions } from '$i18n/i18n-types';

// Initial locale from localStorage
const savedLocale = (typeof localStorage !== 'undefined' && localStorage.getItem('app_locale')) as Locales | null;
const initialLocale: Locales = (savedLocale === 'en' || savedLocale === 'ru') ? savedLocale : 'ru';

// Store for current locale
let currentLocale = initialLocale;

// Subscribers
const subscribers: Set<(locale: Locales) => void> = new Set();

// Subscribe function
function subscribe(subscriber: (locale: Locales) => void) {
  subscribers.add(subscriber);
  subscriber(currentLocale);
  return () => subscribers.delete(subscriber);
}

// Set locale function
function set(locale: Locales) {
  if (currentLocale !== locale) {
    currentLocale = locale;
    localStorage.setItem('app_locale', locale);
    
    // Notify all subscribers
    subscribers.forEach(sub => sub(locale));
  }
}

// Get current locale
function get(): Locales {
  return currentLocale;
}

// Get translation functions for current locale
function getLL(): TranslationFunctions {
  if (!loadedLocales[currentLocale]) {
    console.warn(`Locale ${currentLocale} not loaded yet`);
  }
  
  return {
    // This will be replaced by typesafe-i18n's LL
    // For now, return a simple object that will be enhanced
  } as TranslationFunctions;
}

export const localeStore = {
  subscribe,
  set,
  get
};

export default localeStore;
