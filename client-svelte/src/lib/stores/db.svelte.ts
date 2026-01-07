import { browser } from '$app/environment';
import type { Snippet, Note, DictionaryTerm } from '$lib/types';
import { getDB, seedInitialData } from '$lib/db';

// Database store using RxDB
export function createDBStore() {
  let db: any = null;
  let isInitialized = false;

  // Reactive state
  let snippets = $state<Snippet[]>([]);
  let notes = $state<Note[]>([]);
  let dictionary = $state<DictionaryTerm[]>([]);

  // Initialize database and subscribe to changes
  async function init() {
    if (isInitialized || !browser) return;

    try {
      db = await getDB();
      await seedInitialData();
      
      // Subscribe to live queries
      subscribeToCollections();
      isInitialized = true;
      console.log('DB Store initialized');
    } catch (error) {
      console.error('Failed to initialize DB store:', error);
    }
  }

  // Subscribe to RxDB collections with live queries
  function subscribeToCollections() {
    if (!db) return;

    // Snippets live query
    db.snippets.find().$.subscribe((results: any[]) => {
      snippets = results.map((doc: any) => doc.toJSON());
    });

    // Notes live query
    db.notes.find().$.subscribe((results: any[]) => {
      notes = results.map((doc: any) => doc.toJSON());
    });

    // Dictionary live query
    db.dictionary.find().$.subscribe((results: any[]) => {
      dictionary = results.map((doc: any) => doc.toJSON());
    });
  }

  // Snippets CRUD operations
  async function addSnippet(snippet: Snippet) {
    if (!db) await init();
    await db.snippets.insert(snippet);
  }

  async function updateSnippet(updatedSnippet: Snippet) {
    if (!db) await init();
    const doc = await db.snippets.findOne(updatedSnippet.id).exec();
    if (doc) {
      await doc.update({
        $set: updatedSnippet
      });
    }
  }

  async function deleteSnippet(id: number) {
    if (!db) await init();
    await db.snippets.findOne(id).remove();
  }

  // Notes CRUD operations
  async function addNote(note: Note) {
    if (!db) await init();
    await db.notes.insert(note);
  }

  async function updateNote(updatedNote: Note) {
    if (!db) await init();
    const doc = await db.notes.findOne(updatedNote.id).exec();
    if (doc) {
      await doc.update({
        $set: updatedNote
      });
    }
  }

  async function deleteNote(id: number) {
    if (!db) await init();
    await db.notes.findOne(id).remove();
  }

  // Dictionary CRUD operations
  async function addDictionaryTerm(term: DictionaryTerm) {
    if (!db) await init();
    await db.dictionary.insert(term);
  }

  async function updateDictionaryTerm(updatedTerm: DictionaryTerm) {
    if (!db) await init();
    const doc = await db.dictionary.findOne(updatedTerm.id).exec();
    if (doc) {
      await doc.update({
        $set: updatedTerm
      });
    }
  }

  async function deleteDictionaryTerm(id: number) {
    if (!db) await init();
    await db.dictionary.findOne(id).remove();
  }

  // Initialize on browser
  if (browser) {
    init();
  }

  return {
    get snippets() { return snippets; },
    get notes() { return notes; },
    get dictionary() { return dictionary; },
    get isInitialized() { return isInitialized; },
    init,
    addSnippet,
    updateSnippet,
    deleteSnippet,
    addNote,
    updateNote,
    deleteNote,
    addDictionaryTerm,
    updateDictionaryTerm,
    deleteDictionaryTerm
  };
}

// Singleton instance
export const dbStore = createDBStore();
