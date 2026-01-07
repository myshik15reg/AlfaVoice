# Migration Plan: React → SvelteKit (1:1)

**Протокол:** `.protocols/2026-01-05-react-to-svelte-migration/`  
**Дата:** 2026-01-05  
**Статус:** Active

---

## Обзор плана

Миграция разбита на **7 фаз**, каждая из которых является завершенной и тестируемой. Каждая фаза завершается коммитом и проверкой работоспособности.

**Принципы:**
- Baby Steps: минимальные изменения на каждом шаге
- Тестирование после каждой фазы
- Git коммиты после завершения фазы
- Rollback при поломке

---

## Фаза 1: Foundation & Styles

**Цель:** Подготовить базовую инфраструктуру стилей и компонентов.

### Задачи

- [x] **1.1. Обновить `client/src/app.css`**
  - Скопировать CSS переменные из `client/Верстка/styles.css`
  - Добавить стили Material Symbols (`.material-symbols-outlined`, `.filled`)
  - Добавить custom scrollbar стили
  - Добавить custom range slider стили
  - Добавить утилиту `.no-scrollbar`
  - Проверить: все Tailwind v4 переменные совпадают с React версией

- [x] **1.2. Создать `client/src/lib/components/Icon.svelte`**
  ```svelte
  <script lang="ts">
    export let name: string;
    export let filled = false;
  </script>
  <span class="material-symbols-outlined {filled ? 'filled' : ''}">{name}</span>
  ```
  - Проверить: иконка отображается с размером 24px

- [x] **1.3. Создать базовые stores**
  - `client/src/lib/stores/userStore.ts` (readable, статические данные из db.ts)
  - `client/src/lib/stores/activitiesStore.ts` (writable)
  - `client/src/lib/stores/newsStore.ts` (writable)
  - Скопировать типы из `client/Верстка/data/db.ts`
  - Проверить: stores импортируются без ошибок

- [x] **1.4. Создать `client/src/lib/types/index.ts`**
  - Скопировать типы из `client/Верстка/types/index.ts`, `client/Верстка/data/db.ts`
  - Добавить типы для Settings, Stores
  - Проверить: TypeScript компиляция проходит

### Проверка фазы
```bash
npm run check  # TypeScript проверка
npm run build  # Сборка без ошибок
```

**Коммит:** `feat(foundation): add base styles, Icon component, and stores`

---

## Фаза 2: Layout Components

**Цель:** Мигрировать Header и Sidebar с полной функциональностью.

### Задачи

- [x] **2.1. Обновить `client/src/lib/components/Header.svelte`**
  - Заменить Lucide иконки на Material Symbols (`<Icon name="..." />`)
  - Интегрировать `userStore` и `newsStore`
  - Реализовать dropdown уведомлений (clickOutside action)
  - Добавить навигацию к настройкам через `goto('/settings')`
  - Проверить: Header выглядит идентично React версии

- [x] **2.2. Обновить `client/src/lib/components/Sidebar.svelte`**
  - Заменить Lucide иконки на Material Symbols
  - Использовать `$page.url.pathname` для определения активного пункта
  - Реализовать collapsible функциональность через store
  - Добавить active indicator (левая красная полоска)
  - Обновить навигацию:
    - Dictionary: `/dictionary`
    - Snippets: `/snippets`
    - Notes: `/notes`
    - Settings: `/settings` (активен для всех `/settings/*`)
    - Support: `/support`
  - Проверить: Sidebar выглядит идентично React версии

- [x] **2.3. Обновить `client/src/routes/+layout.svelte`**
  - Интегрировать обновленные Header и Sidebar
  - Подключить stores (darkMode, isSidebarCollapsed, user, news)
  - Проверить toggleTheme() и toggleSidebar()
  - Проверить: Layout работает корректно

### Проверка фазы
```bash
npm run dev  # Запустить dev server
# Визуально проверить Header и Sidebar
# Проверить collapse/expand, theme toggle, уведомления
```

✅ **Выполнено:** Dev server запущен, layout работает корректно

**Коммит:** `feat(layout): migrate Header and Sidebar to Material Symbols`

---

## Фаза 3: Core Pages

**Цель:** Мигрировать 6 основных страниц (Dashboard, Dictionary, Snippets, Notes, Support, StyleGuide).

### Задачи

- [ ] **3.1. Dashboard → `routes/+page.svelte`**
  - Прочитать `client/Верстка/pages/Dashboard.tsx`
  - Скопировать структуру и логику
  - Заменить JSX на Svelte синтаксис
  - Интегрировать `activitiesStore`
  - Проверить: Dashboard идентичен React версии

- [ ] **3.2. Dictionary → `routes/dictionary/+page.svelte`**
  - Прочитать `client/Верстка/pages/Dictionary.tsx`
  - Создать `dictionaryStore.ts` (CRUD методы)
  - Мигрировать компонент
  - Проверить: добавление/редактирование/удаление терминов работает

- [ ] **3.3. Snippets → `routes/snippets/+page.svelte`**
  - Прочитать `client/Верстка/pages/Snippets.tsx`
  - Создать `snippetsStore.ts` (CRUD методы)
  - Мигрировать компонент
  - Проверить: CRUD операции работают

- [ ] **3.4. Notes → `routes/notes/+page.svelte`**
  - Прочитать `client/Верстка/pages/Notes.tsx`
  - Создать `notesStore.ts` (CRUD методы)
  - Мигрировать компонент
  - Проверить: создание/редактирование заметок работает

- [ ] **3.5. Support → `routes/support/+page.svelte`**
  - Прочитать `client/Верстка/pages/Support.tsx`
  - Мигрировать FAQ секцию
  - Скопировать константы из `data/constants.ts` (SUPPORT_FAQS)
  - Проверить: FAQ отображается корректно

- [ ] **3.6. StyleGuide → `routes/guide/+page.svelte`**
  - Прочитать `client/Верстка/pages/StyleGuide.tsx`
  - Мигрировать все компоненты UI (кнопки, инпуты, etc.)
  - Проверить: Style Guide идентичен React версии

### Проверка фазы
```bash
# Проверить каждую страницу визуально
# Проверить навигацию между страницами
# Проверить CRUD операции (Snippets, Notes, Dictionary)
```

**Коммит:** `feat(pages): migrate core pages (Dashboard, Dictionary, Snippets, Notes, Support, Guide)`

---

## Фаза 4: Settings Pages

**Цель:** Мигрировать 7 страниц настроек.

### Задачи

- [ ] **4.1. Settings General → `routes/settings/+page.svelte`**
  - Прочитать `client/Верстка/pages/settings/General.tsx`
  - Создать `settingsStore.ts` (volume, microphoneId, hotkey)
  - Мигрировать компонент
  - Проверить: настройки громкости, микрофона, hotkey сохраняются

- [ ] **4.2. Settings Style → `routes/settings/style/+page.svelte`**
  - Прочитать `client/Верстка/pages/settings/Style.tsx`
  - Добавить в `settingsStore.ts` поле `style` (toneValue, activeParams, stopWords)
  - Мигрировать tone slider, параметры стиля, стоп-слова
  - Проверить: все настройки стиля работают

- [ ] **4.3. Settings Notifications → `routes/settings/notifications/+page.svelte`**
  - Прочитать `client/Верстка/pages/settings/Notifications.tsx`
  - Мигрировать список категорий уведомлений
  - Проверить: переключатели работают

- [ ] **4.4. Settings Integrations → `routes/settings/integrations/+page.svelte`**
  - Прочитать `client/Верстка/pages/settings/Integrations.tsx`
  - Добавить в `settingsStore.ts` поле `integrations` (chromeEnabled)
  - Мигрировать компонент
  - Проверить: переключатель Chrome интеграции работает

- [ ] **4.5. Settings Code → `routes/settings/code/+page.svelte`**
  - Прочитать `client/Верстка/pages/settings/Code.tsx`
  - Добавить в `settingsStore.ts` поле `code` (realtimeCheck, autoTone, ignoreBlocks, notifications)
  - Мигрировать компонент
  - Проверить: все настройки кода работают

- [ ] **4.6. Settings Privacy → `routes/settings/privacy/+page.svelte`**
  - Прочитать `client/Верстка/pages/settings/Privacy.tsx`
  - Мигрировать список приложений (PRIVACY_APPS)
  - Проверить: переключатели приложений работают

- [ ] **4.7. Settings Devices → `routes/settings/devices/+page.svelte`**
  - Прочитать `client/Верстка/pages/settings/Devices.tsx`
  - Мигрировать список устройств
  - Проверить: выбор устройства работает

### Проверка фазы
```bash
# Проверить каждую страницу настроек визуально
# Проверить сохранение настроек в localStorage
# Проверить навигацию между страницами настроек
```

**Коммит:** `feat(settings): migrate all 7 settings pages`

---

## Фаза 5: State & Data Synchronization

**Цель:** Реализовать полную синхронизацию данных (localStorage + server).

### Задачи

- [ ] **5.1. Расширить stores синхронизацией**
  - Обновить `snippetsStore.ts`: добавить persist логику (LS + server)
  - Обновить `notesStore.ts`: добавить persist логику
  - Обновить `dictionaryStore.ts`: добавить persist логику
  - Обновить `settingsStore.ts`: persist всех настроек
  - Проверить: изменения сохраняются в localStorage

- [ ] **5.2. Реализовать Initial Load**
  - Создать `client/src/lib/api/sync.ts`
  - Скопировать логику `mockServerApi` из `AppContext.tsx`
  - Реализовать `fetchAllData()`: Server → Fail → localStorage
  - Вызвать в `+layout.svelte` при `onMount()`
  - Проверить: данные загружаются при старте приложения

- [ ] **5.3. Реализовать Mock Server API**
  - Создать `client/src/lib/api/mockServer.ts`
  - Скопировать `mockServerApi.fetchAllData()` и `saveData()`
  - Проверить: 80% success rate (как в React версии)

- [ ] **5.4. Интегрировать синхронизацию в stores**
  - При каждом CRUD действии вызывать `saveData()`
  - При ошибке server - только localStorage
  - Проверить: offline режим работает

### Проверка фазы
```bash
# Отключить mock server (изменить success rate на 0%)
# Проверить, что данные загружаются из localStorage
# Включить server (success rate 100%)
# Проверить, что данные загружаются с сервера
```

**Коммит:** `feat(sync): implement data synchronization (localStorage + server)`

---

## Фаза 6: Tauri Integration

**Цель:** Интегрировать Tauri команды для записи аудио, hotkey, уведомлений.

### Задачи

- [x] **6.1. Создать `audioStore.ts`**
  - Создать `client/src/lib/stores/audioStore.ts`
  - Типы: `RecordingState { isRecording: boolean, duration: number }`
  - Методы: `startRecording()`, `stopRecording()`
  - Проверить: store создан

- [x] **6.2. Реализовать Rust команды (Tauri backend)**
  - Создать `src-tauri/src/commands/audio.rs`
  - Команда `record_start(device_id: String) -> Result<(), String>`
  - Команда `record_stop() -> Result<Vec<u8>, String>`
  - Команда `save_audio(data: Vec<u8>, path: String) -> Result<(), String>`
  - Зарегистрировать команды в `src-tauri/src/main.rs`
  - Проверить: Tauri компиляция проходит

- [x] **6.3. Интегрировать audioStore с Tauri**
  - Обновить `audioStore.ts`: использовать `invoke('record_start')` и `invoke('record_stop')`
  - Создать активность после `stopRecording()` (аналог React версии)
  - Запустить mock транскрипцию (симуляция)
  - Проверить: запись работает в Tauri окружении

- [x] **6.4. Настроить Global Hotkey**
  - Установить `@tauri-apps/plugin-global-shortcut`
  - Создать `client/src/lib/hotkey.ts`
  - Функция `registerHotkey(hotkey: string)` с использованием Tauri plugin
  - Вызвать в `+layout.svelte` при `onMount()`
  - Проверить: Ctrl + Win запускает/останавливает запись

- [x] **6.5. Интегрировать Window Controls**
  - Обновить `Header.svelte`: кнопки minimize/maximize/close
  - Использовать `appWindow.minimize()`, `appWindow.toggleMaximize()`, `appWindow.close()`
  - Проверить: кнопки работают в Tauri

- [x] **6.6. Настроить уведомления (опционально)**
  - Использовать Tauri notification API
  - Показывать уведомление после завершения транскрипции
  - Проверить: уведомления работают

### Проверка фазы
```bash
npm run tauri dev  # Запустить в Tauri окружении
# Проверить запись через hotkey (Ctrl + Win)
# Проверить window controls
# Проверить уведомления
```

✅ **Выполнено:** Tauri dev запущен, все компоненты интегрированы

**Коммит:** `feat(tauri): integrate audio recording, hotkey, and window controls`

---

## Фаза 7: Testing & Cleanup

**Цель:** Написать тесты, провести финальные проверки, удалить React верстку.

### Задачи

- [ ] **7.1. Unit тесты для stores**
  - Создать `client/src/lib/stores/__tests__/`
  - Тесты для `snippetsStore.ts` (CRUD операции)
  - Тесты для `notesStore.ts` (CRUD операции)
  - Тесты для `settingsStore.ts` (persist логика)
  - Тесты для `audioStore.ts` (start/stop recording)
  - Проверить: coverage ≥ 70%

- [ ] **7.2. E2E тесты (Playwright)**
  - Создать `tests/e2e/migration.spec.ts`
  - Тест: Навигация по всем 14 страницам
  - Тест: Темная/светлая тема переключается
  - Тест: CRUD операции для Snippets
  - Тест: Запись через hotkey (mock Tauri команды)
  - Проверить: все E2E тесты проходят

- [ ] **7.3. Проверка адаптивности**
  - Проверить все страницы на разных разрешениях (1920x1080, 1366x768, 1280x720)
  - Проверить sidebar collapse на узких экранах
  - Проверить: адаптивность идентична React версии

- [ ] **7.4. Финальный визуальный аудит**
  - Открыть React версию (`client/Верстка/index.html`) и Svelte версию (`npm run dev`) side-by-side
  - Сравнить каждую из 14 страниц пиксель-в-пиксель
  - Исправить любые визуальные отличия
  - Проверить: 100% визуальная идентичность

- [ ] **7.5. Cleanup**
  - Удалить `client/Верстка/` полностью
  - Удалить зависимости: `react`, `react-dom`, `@types/react`
  - Обновить `package.json`
  - Проверить: сборка проходит без ошибок

- [ ] **7.6. Обновить Memory Bank**
  - Обновить `.kilocode/memory-bank/architecture.md`: добавить информацию о Svelte stores, Tauri integration
  - Обновить `.kilocode/memory-bank/tech.md`: обновить стек (убрать React, добавить Tauri v2)
  - Обновить `.kilocode/memory-bank/context.md`: зафиксировать завершение миграции
  - Проверить: Memory Bank актуален

### Проверка фазы
```bash
npm run test        # Unit тесты
npm run test:e2e    # E2E тесты
npm run check       # TypeScript
npm run build       # Production build
npm run tauri build # Tauri build
```

**Коммит:** `feat(migration): complete React to SvelteKit migration, add tests, cleanup`

---

## Финальная проверка (Acceptance Testing)

### Checklist
- [ ] Все 14 страниц идентичны визуально (Dashboard + 6 core + 7 settings)
- [ ] Темная/светлая тема работает 1:1
- [ ] Все кастомные Tailwind классы сохранены
- [ ] Material Symbols работают через Icon компонент
- [ ] Состояние управляется через Svelte Stores
- [ ] CRUD операции работают (Snippets, Notes, Dictionary)
- [ ] Синхронизация localStorage + server работает
- [ ] Запись через hotkey работает в Tauri
- [ ] Window controls работают (minimize/maximize/close)
- [ ] Все тесты проходят (unit + E2E)
- [ ] Coverage ≥ 70%
- [ ] TypeScript компиляция без ошибок
- [ ] Production build успешен
- [ ] Tauri build успешен
- [ ] React верстка удалена
- [ ] Memory Bank обновлен

---

## Git Strategy

### Branch
`feat/react-to-svelte-migration`

### Commits
1. `feat(foundation): add base styles, Icon component, and stores`
2. `feat(layout): migrate Header and Sidebar to Material Symbols`
3. `feat(pages): migrate core pages (Dashboard, Dictionary, Snippets, Notes, Support, Guide)`
4. `feat(settings): migrate all 7 settings pages`
5. `feat(sync): implement data synchronization (localStorage + server)`
6. `feat(tauri): integrate audio recording, hotkey, and window controls`
7. `feat(migration): complete React to SvelteKit migration, add tests, cleanup`

### Merge
После прохождения всех тестов и финальной проверки:
```bash
git checkout main
git merge --squash feat/react-to-svelte-migration
git commit -m "feat: migrate UI from React to SvelteKit (1:1 visual parity)"
git push origin main
```

---

## Rollback Plan

Если на любой фазе возникает критическая проблема:
1. **Revert последний коммит:**
   ```bash
   git revert HEAD
   ```
2. **Вернуться к предыдущей фазе:**
   ```bash
   git checkout <commit-hash-предыдущей-фазы>
   ```
3. **Пересмотреть подход:** Обновить `plan.md`, уменьшить шаг

---

## Оценка времени (ориентировочно)

| Фаза | Задачи | Время (ч) |
|------|--------|-----------|
| Фаза 1 | Foundation & Styles | 2-3 |
| Фаза 2 | Layout Components | 3-4 |
| Фаза 3 | Core Pages | 8-10 |
| Фаза 4 | Settings Pages | 6-8 |
| Фаза 5 | State & Data | 4-5 |
| Фаза 6 | Tauri Integration | 5-6 |
| Фаза 7 | Testing & Cleanup | 4-5 |
| **Итого** | | **32-41 ч** |

**Примечание:** Время может варьироваться в зависимости от сложности компонентов и количества багов.

---

## Следующий шаг

После утверждения этого плана:
1. **Architect Mode:** Утвердить `plan.md`
2. **Code Mode:** Начать Фазу 1 (`new_task`)
3. **Daily Standups:** Обновлять `execution.md` после каждой фазы

---

**Статус:** Pending Approval  
**Следующий файл:** `context.md`