import { createRxDatabase } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import type { Snippet, Note, DictionaryTerm } from '$lib/types';


// Database name
const DB_NAME = 'alfavoice_db';

// RxDB Schema for Snippets
// Note: RxDB automatically adds _deleted, _rev, _meta, _attachments fields for replication
const snippetSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'number',
      final: true,
      minimum: 1
    },
    title: {
      type: 'string',
      minLength: 1,
      maxLength: 200
    },
    category: {
      type: 'string',
      minLength: 1,
      maxLength: 100
    },
    content: {
      type: 'string',
      minLength: 1
    },
    tags: {
      type: 'array',
      items: {
        type: 'string',
        minLength: 1
      },
      minItems: 0
    },
    color: {
      type: 'string',
      minLength: 1,
      maxLength: 50
    },
    cmd: {
      type: 'string',
      minLength: 1,
      maxLength: 100
    },
    createdAt: {
      type: 'string'
    }
  },
  required: ['id', 'title', 'category', 'content', 'tags', 'color', 'cmd', 'createdAt']
};

// RxDB Schema for Notes
const noteSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'number',
      final: true,
      minimum: 1
    },
    title: {
      type: 'string',
      minLength: 1,
      maxLength: 200
    },
    content: {
      type: 'string',
      minLength: 1
    },
    tags: {
      type: 'array',
      items: {
        type: 'string',
        minLength: 1
      },
      minItems: 0
    },
    createdAt: {
      type: 'string'
    },
    updatedAt: {
      type: 'string'
    },
    date: {
      type: 'string',
      minLength: 1,
      maxLength: 50
    },
    isFavorite: {
      type: 'boolean'
    }
  },
  required: ['id', 'title', 'content', 'tags', 'createdAt', 'updatedAt', 'date', 'isFavorite']
};

// RxDB Schema for Dictionary Terms
const dictionarySchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'number',
      final: true,
      minimum: 1
    },
    title: {
      type: 'string',
      minLength: 1,
      maxLength: 200
    },
    tag: {
      type: 'string',
      minLength: 1,
      maxLength: 100
    },
    desc: {
      type: 'string',
      minLength: 1
    },
    example: {
      type: 'string',
      optional: true,
      maxLength: 500
    }
  },
  required: ['id', 'title', 'tag', 'desc']
};

// Database instance
let dbInstance: any = null;

// Initialize RxDB
export async function initDB() {
  if (dbInstance) {
    return dbInstance;
  }

  try {
    dbInstance = await createRxDatabase({
      name: DB_NAME,
      storage: getRxStorageDexie()
    });

    // Create collections
    await dbInstance.addCollections({
      snippets: {
        schema: snippetSchema
      },
      notes: {
        schema: noteSchema
      },
      dictionary: {
        schema: dictionarySchema
      }
    });

    console.log('RxDB initialized successfully');
    return dbInstance;
  } catch (error) {
    console.error('Failed to initialize RxDB:', error);
    throw error;
  }
}

// Get database instance
export async function getDB() {
  if (!dbInstance) {
    return await initDB();
  }
  return dbInstance;
}

// Seed initial data (if collections are empty)
export async function seedInitialData() {
  const db = await getDB();
  
  // Check if snippets collection is empty
  const snippetsCount = await db.snippets.find().count().exec();
  if (snippetsCount === 0) {
    const initialSnippets: Snippet[] = [
      { id: 1, title: 'Приветствие клиента', category: 'Приветствия', content: 'Здравствуйте! Меня зовут Евгений, я персональный менеджер компании Альфа-Лизинг. Благодарю вас за обращение...', tags: ['продажи', 'общение'], color: 'bg-primary', cmd: '/hello', createdAt: '2024-01-15' },
      { id: 2, title: 'Запрос документов', category: 'Документы', content: 'Для оформления договора лизинга, пожалуйста, пришлите сканы следующих документов: Устав (все страницы), Свидетельство о регистрации (ОГРН/ИНН)...', tags: ['документы'], color: 'bg-blue-500', cmd: '/docs_req', createdAt: '2024-01-15' },
      { id: 3, title: 'Одобрение заявки', category: 'Продажи', content: 'Рады сообщить, что ваша заявка на лизинг одобрена! Мы готовы перейти к этапу подписания договора. Вам будет удобно...', tags: ['продажи'], color: 'bg-green-500', cmd: '/approve', createdAt: '2024-01-15' },
      { id: 4, title: 'Подпись (Стандарт)', category: 'Закрытие', content: 'С уважением, Команда Альфа-Лизинг. Тел: 8 (800) 123-45-67. alfaleasing.ru', tags: ['закрытие'], color: 'bg-gray-400', cmd: '/sig_std', createdAt: '2024-01-15' },
      { id: 5, title: 'Проблема решена', category: 'Тех. поддержка', content: 'Ваш запрос успешно обработан, проблема устранена. Пожалуйста, проверьте работу сервиса и подтвердите, что всё в порядке.', tags: ['поддержка'], color: 'bg-purple-500', cmd: '/solved', createdAt: '2024-01-15' }
    ];
    await db.snippets.bulkInsert(initialSnippets);
    console.log('Seeded initial snippets');
  }

  // Check if notes collection is empty
  const notesCount = await db.notes.find().count().exec();
  if (notesCount === 0) {
    const initialNotes: Note[] = [
      { id: 1, title: 'Принципы Tone of Voice', content: 'Наш стиль общения должен быть профессиональным, но дружелюбным...', tags: ['стиль'], createdAt: '2024-01-15', updatedAt: '2024-01-15', date: 'Только что', isFavorite: false },
      { id: 2, title: 'Шаблон приветствия', content: 'Добрый день, [Имя Клиента]! Меня зовут Евгений, я персональный менеджер...', tags: ['шаблоны'], createdAt: '2024-01-14', updatedAt: '2024-01-14', date: '2 часа назад', isFavorite: false },
      { id: 3, title: 'Список стоп-слов', content: 'Слова, которые лучше исключить: \'Доброго времени суток\', \'Заранее спасибо\'...', tags: ['стиль'], createdAt: '2024-01-13', updatedAt: '2024-01-13', date: 'Вчера', isFavorite: true },
      { id: 4, title: 'Идеи для блога', content: '1. Как ИИ помогает автоматизировать рутину в лизинге. 2. Топ-5 ошибок...', tags: ['идеи'], createdAt: '2024-01-10', updatedAt: '2024-01-10', date: '24 дек 2025', isFavorite: false }
    ];
    await db.notes.bulkInsert(initialNotes);
    console.log('Seeded initial notes');
  }

  // Check if dictionary collection is empty
  const dictionaryCount = await db.dictionary.find().count().exec();
  if (dictionaryCount === 0) {
    const initialDictionary: DictionaryTerm[] = [
      { id: 1, title: 'Лизингополучатель', tag: 'Юр. лица', desc: 'Физическое или юридическое лицо, которое в соответствии с договором лизинга принимает предмет лизинга за определенную плату...', example: 'Лизингополучатель обязуется своевременно вносить лизинговые платежи согласно графику.' },
      { id: 2, title: 'Аннуитетный платеж', tag: 'Финансы', desc: 'Схема погашения задолженности, при которой выплаты осуществляются равными суммами...', example: 'Для вашего удобства мы сформировали график с аннуитетными платежами.' },
      { id: 3, title: 'Выкупная стоимость', tag: 'Договор', desc: 'Сумма, которую лизингополучатель должен уплатить лизингодателю по окончании срока лизинга...', example: 'По завершении договора вам останется внести выкупную стоимость.' }
    ];
    await db.dictionary.bulkInsert(initialDictionary);
    console.log('Seeded initial dictionary');
  }
}

// Export types
export type Database = typeof dbInstance;
