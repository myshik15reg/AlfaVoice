# Protocol Brief: React → SvelteKit Migration (1:1)

**Дата создания:** 2026-01-05  
**Статус:** Active  
**Приоритет:** High

---

## Обзор

Миграция готовой React-верстки из `client/Верстка/` в текущий SvelteKit проект (`client/src/`) с сохранением **абсолютно всех** визуальных элементов и функциональности в соотношении 1:1.

**Цель:** Получить полностью функциональное SvelteKit приложение с идентичным UX/UI, интегрированное с Tauri v2 для нативных функций (запись через hotkey, системный трей).

---

## Исходные данные

### React верстка (источник)
- **Местоположение:** `client/Верстка/`
- **Структура:**
  - `App.tsx` - главный компонент с роутингом через state
  - `context/AppContext.tsx` - Context API для глобального состояния
  - `components/` - Header, Sidebar
  - `pages/` - 7 основных страниц
  - `pages/settings/` - 7 страниц настроек
  - `data/db.ts` - mock данные
  - `data/constants.ts` - константы навигации
  - `styles.css` - кастомные стили (Material Symbols, scrollbar)

### Целевой проект
- **Фреймворк:** SvelteKit (уже инициализирован)
- **Desktop:** Tauri v2
- **Стилизация:** Tailwind v4 + кастомная тема (CSS переменные)
- **Иконки:** Material Symbols Outlined (веб-шрифт)
- **State:** Svelte Stores (writable)

---

## Детальный маппинг компонентов

### 1. State Management: React Context → Svelte Stores

| React (AppContext) | Svelte Stores | Тип |
|-------------------|---------------|-----|
| `user` | `userStore.ts` | `Readable<User>` (статический) |
| `activities` | `activitiesStore.ts` | `Writable<Activity[]>` |
| `news` | `newsStore.ts` | `Writable<NewsItem[]>` |
| `snippets` | `snippetsStore.ts` | `Writable<Snippet[]>` + CRUD методы |
| `notes` | `notesStore.ts` | `Writable<Note[]>` + CRUD методы |
| `dictionary` | `dictionaryStore.ts` | `Writable<DictionaryTerm[]>` + CRUD |
| `globalHotkey`, `volume`, `selectedDeviceId` | `settingsStore.ts` | `Writable<AppSettings>` (объединить все) |
| `styleSettings` | `settingsStore.ts` (поле `style`) | `Writable<StyleSettings>` |
| `integrationSettings` | `settingsStore.ts` (поле `integrations`) | `Writable<IntegrationSettings>` |
| `codeSettings` | `settingsStore.ts` (поле `code`) | `Writable<CodeSettings>` |
| `isGlobalRecording`, `startRecording`, `stopRecording` | `audioStore.ts` | `Writable<RecordingState>` + Tauri commands |

**Ключевые изменения:**
- React Context API → Svelte Stores (`$lib/stores/`)
- `useState/useEffect` → Svelte reactivity (`$:`)
- Persist логика: localStorage + server sync → сохраняется аналогично

### 2. Компоненты Layout

#### Header

| React (`components/Header.tsx`) | Svelte (`$lib/components/Header.svelte`) |
|--------------------------------|------------------------------------------|
| `<span className="material-symbols-outlined">` | `<Icon name="notifications" />` (компонент-обертка) |
| Lucide icons (Sun/Moon) | Material Symbols (`light_mode` / `dark_mode`) |
| `onClick={toggleTheme}` | `on:click={toggleTheme}` |
| `isDarkMode` prop | `isDarkMode` store (reactive `$isDarkMode`) |
| `setCurrentView('settings_general')` | `goto('/settings')` (SvelteKit routing) |

**Критичные детали:**
- Dropdown уведомлений: использовать `bind:this` + `clickOutside` action
- Avatar клик → навигация через `goto('/settings')`
- Window controls (minimize/maximize/close) → Tauri commands

#### Sidebar

| React (`components/Sidebar.tsx`) | Svelte (`$lib/components/Sidebar.svelte`) |
|---------------------------------|-------------------------------------------|
| `NAV_ITEMS.map(...)` | `{#each navItems as item}` |
| Lucide icons | Material Symbols (`menu_book`, `content_cut`, etc.) |
| `currentView === view` | `$page.url.pathname === item.path` |
| `setCurrentView(view)` | `goto(item.path)` |
| `isCollapsed` prop | `isCollapsed` store |

**Критичные детали:**
- Active indicator (левая полоска): сохранить анимацию
- Collapsible: `max-w-0 opacity-0` → `max-w-[150px] opacity-100` transition
- Settings sub-pages: активировать "Настройки" при `currentPath.startsWith('/settings')`

### 3. Роутинг: State-based → File-based

| React View | SvelteKit Route | Компонент |
|-----------|-----------------|-----------|
| `'dashboard'` | `/` | `routes/+page.svelte` |
| `'dictionary'` | `/dictionary` | `routes/dictionary/+page.svelte` |
| `'snippets'` | `/snippets` | `routes/snippets/+page.svelte` |
| `'notes'` | `/notes` | `routes/notes/+page.svelte` |
| `'guide'` | `/guide` | `routes/guide/+page.svelte` |
| `'support'` | `/support` | `routes/support/+page.svelte` |
| `'settings_general'` | `/settings` | `routes/settings/+page.svelte` |
| `'onboarding_style'` | `/settings/style` | `routes/settings/style/+page.svelte` |
| `'settings_notifications'` | `/settings/notifications` | `routes/settings/notifications/+page.svelte` |
| `'integration_chrome'` | `/settings/integrations` | `routes/settings/integrations/+page.svelte` |
| `'integration_code'` | `/settings/code` | `routes/settings/code/+page.svelte` |
| `'settings_privacy'` | `/settings/privacy` | `routes/settings/privacy/+page.svelte` |
| `'settings_devices'` | `/settings/devices` | `routes/settings/devices/+page.svelte` |

**Критичные детали:**
- Layout: `routes/+layout.svelte` содержит Sidebar + Header (уже есть)
- Навигация: `goto()` вместо `setCurrentView()`
- Breadcrumbs/Title: использовать `$page.url.pathname` для динамического отображения

### 4. Темная/Светлая тема

| React | Svelte |
|-------|--------|
| `useEffect(() => { document.documentElement.classList.add('dark') })` | `onMount(() => { applyTheme() })` |
| `isDarkMode` state | `darkMode` store (`$darkMode`) |
| `localStorage.setItem('theme', 'dark')` | Аналогично в `toggleTheme()` |

**Критичные детали:**
- Класс `dark` на `<html>` элементе
- Tailwind v4: классы `dark:bg-background-dark`, `dark:text-white`
- Persistence: localStorage + reactive `$:` для применения темы

### 5. Стилизация

#### CSS переменные (сохранить 1:1)

**React (`styles.css`):**
```css
.material-symbols-outlined {
  font-family: 'Material Symbols Outlined';
  font-size: 24px;
}
```

**Svelte (`app.css`):**
```css
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
```

**Изменения:**
- Убрать дублирование: уже есть в `client/src/app.css`
- Добавить класс `.filled` для заполненных иконок
- Scrollbar, range slider: скопировать из React `styles.css`

#### Tailwind классы (сохранить все)

Кастомные классы из React верстки:
- `bg-background-light` / `dark:bg-background-dark`
- `text-text-main` / `dark:text-text-dark-main`
- `border-border-light` / `dark:border-border-dark`
- `bg-surface-dark` / `dark:bg-surface-dark`
- `text-primary` / `hover:text-primary`

**Критично:** Убедиться, что все классы определены в Tailwind v4 config (`@theme` в `app.css`).

---

## Технические требования

### 1. Синхронизация данных

**React логика (AppContext):**
1. Initial Load: Server → Fail → Local Storage
2. Persist: Update state → Save to LS → Send to server (mockServerApi)

**Svelte аналог:**
```typescript
// $lib/stores/snippetsStore.ts
export const snippets = writable<Snippet[]>([]);

export async function loadSnippets() {
  try {
    const response = await fetch('/api/snippets');
    const data = await response.json();
    snippets.set(data);
    localStorage.setItem('snippets', JSON.stringify(data));
  } catch (error) {
    const local = localStorage.getItem('snippets');
    if (local) snippets.set(JSON.parse(local));
  }
}

export function addSnippet(snippet: Snippet) {
  snippets.update(list => {
    const updated = [snippet, ...list];
    localStorage.setItem('snippets', JSON.stringify(updated));
    fetch('/api/snippets', { method: 'POST', body: JSON.stringify(snippet) });
    return updated;
  });
}
```

### 2. Запись аудио через Tauri

**React (AppContext):**
```typescript
const startRecording = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mediaRecorder = new MediaRecorder(stream);
  // ...
};
```

**Svelte (audioStore + Tauri):**
```typescript
// $lib/stores/audioStore.ts
import { invoke } from '@tauri-apps/api/tauri';

export async function startRecording() {
  isRecording.set(true);
  await invoke('record_start', { deviceId: $settingsStore.microphoneId });
}

export async function stopRecording() {
  const audioData = await invoke('record_stop');
  // Создать активность и запустить транскрипцию
}
```

**Tauri backend:**
```rust
// src-tauri/src/commands.rs
#[tauri::command]
async fn record_start(device_id: String) -> Result<(), String> {
  // Rust логика записи аудио
}

#[tauri::command]
async fn record_stop() -> Result<Vec<u8>, String> {
  // Вернуть аудио данные
}
```

### 3. Global Hotkey

**React (AppContext):**
```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.metaKey) { // Ctrl + Win
      if (isGlobalRecording) stopRecording();
      else startRecording();
    }
  };
  window.addEventListener('keydown', handleKeyDown);
}, [globalHotkey, isGlobalRecording]);
```

**Svelte (Tauri plugin):**
```typescript
// $lib/hotkey.ts
import { register } from '@tauri-apps/plugin-global-shortcut';

export async function registerHotkey(hotkey: string) {
  await register(hotkey, () => {
    // Toggle recording
  });
}
```

---

## Критерии приемки (Definition of Done)

### Визуальная идентичность (100%)
- [ ] Все 14 страниц (Dashboard + 6 core + 7 settings) выглядят **абсолютно идентично** React версии
- [ ] Темная/светлая тема работает 1:1 (цвета, переходы, состояния)
- [ ] Все анимации сохранены (sidebar collapse, hover states, transitions)
- [ ] Material Symbols иконки отображаются корректно (размер 24px, font-variation-settings)
- [ ] Scrollbar и range slider стилизованы идентично

### Функциональность (100%)
- [ ] Навигация работает через SvelteKit file-based routing
- [ ] Все кнопки, формы, инпуты работают
- [ ] CRUD операции для Snippets/Notes/Dictionary функционируют
- [ ] Синхронизация localStorage + server работает
- [ ] Уведомления отображаются и закрываются корректно
- [ ] Настройки сохраняются (volume, hotkey, style, integrations, code, privacy)

### Tauri Integration (100%)
- [ ] Запись через hotkey работает (Ctrl + Win по умолчанию)
- [ ] Аудио сохраняется через Tauri backend
- [ ] Window controls (minimize/maximize/close) работают
- [ ] Системный трей функционален (опционально для MVP)

### Качество кода (100%)
- [ ] TypeScript типизация полная (no `any`)
- [ ] Svelte Stores используются правильно (writable, derived, readable)
- [ ] Нет дублирования кода (DRY)
- [ ] Unit тесты для stores (coverage ≥ 70%)
- [ ] E2E тесты для критичных user flows (Playwright)

### Cleanup (100%)
- [ ] Удалить `client/Верстка/` после успешной миграции
- [ ] Удалить неиспользуемые зависимости (React, react-dom)
- [ ] Обновить Memory Bank (`architecture.md`, `context.md`)

---

## Риски и ограничения

### Высокий риск
1. **Неточная миграция стилей:** Tailwind v4 может иметь отличия от v3 (проверить классы).
2. **Material Symbols vs Lucide:** Текущая Svelte верстка использует Lucide, нужно полностью заменить на Material Symbols.
3. **Tauri команды:** Rust backend для записи аудио нужно писать с нуля.

### Средний риск
1. **Синхронизация данных:** Mock server API в React может отличаться от реального (проверить ошибки).
2. **Global hotkey:** Tauri plugin может не работать с некоторыми комбинациями клавиш.

### Низкий риск
1. **Производительность:** SvelteKit должен быть быстрее React.
2. **Совместимость:** Все браузеры поддерживаются Tauri.

---

## Зависимости

### Технологические
- SvelteKit 1.x
- Tauri v2.x
- Tailwind CSS v4
- Material Symbols Outlined (веб-шрифт)
- TypeScript 5.x

### Внешние
- Mock server API (из React верстки) → нужно адаптировать или заменить на реальный API

---

## Следующие шаги

После утверждения этого протокола:
1. **Architect Mode:** Утвердить `brief.md`, `plan.md`, `context.md`
2. **Code Mode:** Начать Фазу 1 (Foundation & Styles)
3. **Testing:** E2E тесты после каждой фазы
4. **Cleanup:** Удаление React верстки после Фазы 7

---

**Утверждено:** Pending  
**Следующий шаг:** Создание `plan.md` с детальной декомпозицией 7 фаз