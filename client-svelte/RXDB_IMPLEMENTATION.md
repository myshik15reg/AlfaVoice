# RxDB Implementation Guide

## Обзор

В проекте AlfaVoice реализована оффлайн-синхронизация с использованием RxDB - реактивной базы данных для JavaScript приложений. Данные сохраняются в IndexedDB и доступны оффлайн.

## Архитектура

### Структура файлов

```
client-svelte/
├── src/
│   ├── lib/
│   │   ├── db/
│   │   │   └── index.ts          # Инициализация RxDB и схемы коллекций
│   │   └── stores/
│   │       ├── db.svelte.ts         # Svelte store для RxDB
│   │       └── auth.svelte.ts      # Auth store с интеграцией RxDB
│   └── routes/
│       └── test-rxdb/
│           └── +page.svelte        # Страница для тестирования RxDB
```

### Компоненты

1. **`src/lib/db/index.ts`** - Инициализация базы данных
   - Создание экземпляра RxDB
   - Определение схем коллекций
   - Начальное заполнение данными (seeding)

2. **`src/lib/stores/db.svelte.ts`** - Svelte store для RxDB
   - Реактивное состояние коллекций
   - Live queries для автоматической синхронизации
   - CRUD операции для всех коллекций

3. **`src/lib/stores/auth.svelte.ts`** - Auth store
   - Использует `dbStore` для работы с данными
   - Делегирует CRUD операции в RxDB
   - Сохраняет user, news, activities в памяти (не в RxDB)

## Коллекции

### Snippets

```typescript
interface Snippet {
  id: number;
  title: string;
  category: string;
  content: string;
  tags: string[];
  color: string;
  cmd: string;
  createdAt: string;
}
```

### Notes

```typescript
interface Note {
  id: number;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  date: string;
  isFavorite: boolean;
}
```

### Dictionary Terms

```typescript
interface DictionaryTerm {
  id: number;
  title: string;
  tag: string;
  desc: string;
  example?: string;
}
```

## Использование

### Инициализация

База данных инициализируется автоматически в [`+layout.svelte`](src/routes/+layout.svelte):

```typescript
import { dbStore } from '$lib/stores/db.svelte';

// В +layout.svelte
if (typeof localStorage !== 'undefined') {
  dbStore.init();
}
```

### Чтение данных

```typescript
import { dbStore } from '$lib/stores/db.svelte';

// Получить все сниппеты
const snippets = dbStore.snippets;

// Получить все заметки
const notes = dbStore.notes;

// Получить все термины словаря
const dictionary = dbStore.dictionary;
```

### Создание данных

```typescript
// Добавить сниппет
await dbStore.addSnippet({
  id: Date.now(),
  title: 'Новый сниппет',
  category: 'Категория',
  content: 'Содержимое сниппета',
  tags: ['тег1', 'тег2'],
  color: 'bg-blue-500',
  cmd: '/new',
  createdAt: new Date().toISOString()
});

// Добавить заметку
await dbStore.addNote({
  id: Date.now(),
  title: 'Новая заметка',
  content: 'Содержимое заметки',
  tags: ['тег'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  date: 'Только что',
  isFavorite: false
});

// Добавить термин словаря
await dbStore.addDictionaryTerm({
  id: Date.now(),
  title: 'Новый термин',
  tag: 'Категория',
  desc: 'Описание термина',
  example: 'Пример использования'
});
```

### Обновление данных

```typescript
// Обновить сниппет
await dbStore.updateSnippet({
  id: 1,
  title: 'Обновлённый заголовок',
  category: 'Категория',
  content: 'Обновлённое содержимое',
  tags: ['тег1', 'тег2'],
  color: 'bg-green-500',
  cmd: '/updated',
  createdAt: '2024-01-15'
});

// Обновить заметку
await dbStore.updateNote({
  id: 1,
  title: 'Обновлённая заметка',
  content: 'Обновлённое содержимое',
  tags: ['тег'],
  createdAt: '2024-01-15',
  updatedAt: new Date().toISOString(),
  date: 'Только что',
  isFavorite: true
});

// Обновить термин словаря
await dbStore.updateDictionaryTerm({
  id: 1,
  title: 'Обновлённый термин',
  tag: 'Категория',
  desc: 'Обновлённое описание',
  example: 'Обновлённый пример'
});
```

### Удаление данных

```typescript
// Удалить сниппет
await dbStore.deleteSnippet(1);

// Удалить заметку
await dbStore.deleteNote(1);

// Удалить термин словаря
await dbStore.deleteDictionaryTerm(1);
```

## Live Queries

RxDB использует live queries для автоматической синхронизации данных. Когда данные в базе изменяются, Svelte store автоматически обновляется:

```typescript
// В db.svelte.ts
db.snippets.find().$.subscribe((results: any[]) => {
  snippets = results.map((doc: any) => doc.toJSON());
});
```

Это означает, что любые изменения в базе данных автоматически отражаются в UI без необходимости вручную обновлять состояние.

## Начальное заполнение данными (Seeding)

При первой инициализации базы данных RxDB автоматически заполняет её начальными данными:

```typescript
// В db/index.ts
export async function seedInitialData() {
  const db = await getDB();
  
  // Проверяет, пуста ли коллекция, и заполняет её
  const snippetsCount = await db.snippets.find().count().exec();
  if (snippetsCount === 0) {
    await db.snippets.bulkInsert(initialSnippets);
  }
  
  // Аналогично для notes и dictionary
}
```

## Тестирование

Для тестирования RxDB используется страница [`/test-rxdb`](src/routes/test-rxdb/+page.svelte):

- Отображает статус инициализации базы данных
- Показывает количество записей в каждой коллекции
- Позволяет добавлять тестовые записи
- Позволяет очищать базу данных

## Оффлайн-режим

RxDB автоматически сохраняет данные в IndexedDB, что обеспечивает:

1. **Оффлайн-доступность** - данные доступны без интернет-соединения
2. **Автономная работа** - пользователь может создавать, редактировать и удалять данные оффлайн
3. **Синхронизация** - при восстановлении соединения данные синхронизируются с сервером (требуется реализация репликации)

## Интеграция с Auth Store

Auth store [`auth.svelte.ts`](src/lib/stores/auth.svelte.ts) использует RxDB для работы с коллекциями:

```typescript
// Инициализация
const checkDB = setInterval(() => {
  if (dbStore.isInitialized) {
    clearInterval(checkDB);
    syncCollections();
  }
}, 100);

// Синхронизация коллекций
function syncCollections() {
  snippets = dbStore.snippets;
  notes = dbStore.notes;
  dictionary = dbStore.dictionary;
  
  // Подписка на изменения
  $effect(() => {
    snippets = dbStore.snippets;
  });
  // ... аналогично для notes и dictionary
}
```

CRUD операции делегируются в `dbStore`:

```typescript
const addSnippet = async (snippet: Snippet) => {
  await dbStore.addSnippet(snippet);
};

const updateSnippet = async (updatedSnippet: Snippet) => {
  await dbStore.updateSnippet(updatedSnippet);
};

const deleteSnippet = async (id: number) => {
  await dbStore.deleteSnippet(id);
};
```

## Зависимости

```json
{
  "dependencies": {
    "rxdb": "^15.0.0",
    "rxjs": "^7.8.0",
    "dexie": "^4.0.0"
  }
}
```

## Dev Mode

В режиме разработки включён RxDB Dev Mode, который:

- Проверяет правильность использования RxDB
- Выводит предупреждения о потенциальных проблемах
- Замедляет производительность (отключить в production)

## Будущие улучшения

1. **Репликация с сервером** - синхронизация данных с backend
2. **Конфликты при слиянии** - обработка конфликтов при одновременном редактировании
3. **Индексы** - добавление индексов для оптимизации запросов
4. **Шифрование** - шифрование чувствительных данных в IndexedDB
5. **Backup/Restore** - экспорт и импорт данных

## Troubleshooting

### База данных не инициализируется

Проверьте консоль браузера на наличие ошибок RxDB. Убедитесь, что:

- IndexedDB поддерживается браузером
- Нет конфликтов с другими расширениями
- Достаточно места в хранилище

### Данные не сохраняются

1. Откройте DevTools → Application → IndexedDB
2. Проверьте наличие базы данных `alfavoice_db`
3. Проверьте наличие коллекций: `snippets`, `notes`, `dictionary`

### Live queries не обновляются

Убедитесь, что:

- Подписка на live queries активна
- RxDB корректно инициализирован
- Нет ошибок в консоли

## Полезные ссылки

- [RxDB Documentation](https://rxdb.info/)
- [RxDB Quickstart](https://rxdb.info/quickstart)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Dexie.js](https://dexie.org/)
