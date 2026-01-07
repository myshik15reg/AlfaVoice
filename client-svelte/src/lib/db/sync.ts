import { replicateRxCollection } from 'rxdb';
import type { RxDatabase } from 'rxdb';
import { syncState } from '$lib/stores/syncState.svelte';

// Mock backend data storage (in-memory)
const mockBackend = new Map<string, any[]>();

// Initialize mock backend with some data
function initMockBackend() {
  if (mockBackend.size === 0) {
    mockBackend.set('snippets', []);
    mockBackend.set('notes', []);
    mockBackend.set('dictionary', []);
    console.log('[Sync] Mock backend initialized');
  }
}

// Mock pull handler - simulates fetching data from server
async function mockPullHandler(collectionName: string, lastCheckpoint: any, batchSize: number) {
  console.log(`[Sync] Pulling ${collectionName} from server...`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
  
  // Simulate random network error (10% chance)
  if (Math.random() < 0.1) {
    console.error(`[Sync] Pull failed for ${collectionName}: Network error`);
    throw new Error('Network error: Unable to fetch from server');
  }
  
  const remoteDocs = mockBackend.get(collectionName) || [];  
  console.log(`[Sync] Pulled ${remoteDocs.length} documents for ${collectionName}`);
  
  return {
    documents: remoteDocs
  };
}

// Mock push handler - simulates sending data to server
async function mockPushHandler(collectionName: string, docs: any[]) {
  console.log(`[Sync] Pushing ${docs.length} documents to server for ${collectionName}...`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
  
  // Simulate random network error (15% chance)
  if (Math.random() < 0.15) {
    console.error(`[Sync] Push failed for ${collectionName}: Network error`);
    throw new Error('Network error: Unable to push to server');
  }
  
  // Get current documents from mock backend
  const currentDocs = mockBackend.get(collectionName) || [];  
  // Merge new documents
  const updatedDocs = [...currentDocs];
  for (const doc of docs) {
    // Check if document already exists
    const existingIndex = updatedDocs.findIndex(d => d.id === doc.id);
    if (existingIndex >= 0) {
      // Update existing document
      updatedDocs[existingIndex] = { ...doc };
    } else {
      // Add new document
      updatedDocs.push({ ...doc });
    }
  }
  
  // Remove deleted documents
  const activeDocs = updatedDocs.filter(doc => !doc._deleted);
  mockBackend.set(collectionName, activeDocs);
  
  console.log(`[Sync] Pushed ${docs.length} documents for ${collectionName}, total: ${activeDocs.length}`);
  
  // Return empty array (no conflicts)
  return [];
}

/**
 * Setup replication for a single collection using RxDB v16 built-in replication
 */
export function setupCollectionReplication(
  db: RxDatabase,
  collectionName: string,
  pullInterval: number = 10000,
  pushInterval: number = 5000
) {
  const collection = db[collectionName];
  
  if (!collection) {
    console.error(`[Sync] Collection ${collectionName} not found`);
    return null;
  }
  
  console.log(`[Sync] Setting up replication for ${collectionName}`);
  
  // Initialize mock backend
  initMockBackend();
  
  // Setup replication using RxDB v16 built-in replicateRxCollection
  const replicationState = replicateRxCollection({
    collection,
    replicationIdentifier: `alfavoice-${collectionName}-sync`,
    live: true,
    retryTime: 5000, // Retry failed requests after 5 seconds
    waitForLeadership: true,
    autoStart: true,
    
    pull: {
      batchSize: 50,
      async handler(lastCheckpoint, batchSize) {
        try {
          return await mockPullHandler(collectionName, lastCheckpoint, batchSize);
        } catch (error) {
          console.error(`[Sync] Pull error for ${collectionName}:`, error);
          // RxDB will automatically retry based on retryTime
          throw error;
        }
      }
    },
    
    push: {
      batchSize: 50,
      async handler(docs) {
        try {
          return await mockPushHandler(collectionName, docs);
        } catch (error) {
          console.error(`[Sync] Push error for ${collectionName}:`, error);
          // RxDB will automatically retry based on retryTime
          throw error;
        }
      }
    }
  });
  
  // Subscribe to replication events
  replicationState.active$.subscribe((isActive) => {
    console.log(`[Sync] ${collectionName} replication active: ${isActive}`);
    if (isActive) {
      syncState.setStatus('syncing');
    } else {
      syncState.setStatus('connected');
    }
  });
  
  replicationState.error$.subscribe((error) => {
    if (error) {
      console.error(`[Sync] ${collectionName} replication error:`, error);
      syncState.setError({
        message: error.message || 'Sync error',
        timestamp: Date.now()
      });
      syncState.setStatus('error');
    }
  });
  
  replicationState.initialSync$.subscribe((isInitialSync) => {
    if (isInitialSync) {
      console.log(`[Sync] ${collectionName} initial sync started`);
      syncState.setStatus('syncing');
    }
  });
  
  replicationState.canceled$.subscribe((isCanceled) => {
    if (isCanceled) {
      console.log(`[Sync] ${collectionName} replication canceled`);
      syncState.setStatus('disconnected');
    }
  });
  
  console.log(`[Sync] Replication setup complete for ${collectionName}`);
  return replicationState;
}

/**
 * Setup replication for all collections
 */
export function setupAllReplications(db: RxDatabase): any[] {
  console.log('[Sync] Setting up replication for all collections');
  
  const replicationStates: any[] = [];
  
  // Setup replication for snippets collection
  const snippetsReplication = setupCollectionReplication(db, 'snippets', 10000, 5000);
  if (snippetsReplication) {
    replicationStates.push(snippetsReplication);
  }
  
  // Setup replication for notes collection
  const notesReplication = setupCollectionReplication(db, 'notes', 10000, 5000);
  if (notesReplication) {
    replicationStates.push(notesReplication);
  }
  
  // Setup replication for dictionary collection
  const dictionaryReplication = setupCollectionReplication(db, 'dictionary', 10000, 5000);
  if (dictionaryReplication) {
    replicationStates.push(dictionaryReplication);
  }
  
  console.log(`[Sync] Replication setup complete for ${replicationStates.length} collections`);
  return replicationStates;
}

/**
 * Stop all replications
 */
export function stopAllReplications(replicationStates: any[]) {
  console.log('[Sync] Stopping all replications');
  replicationStates.forEach((replicationState, index) => {
    console.log(`[Sync] Stopping replication ${index + 1}/${replicationStates.length}`);
    replicationState.cancel();
  });
  syncState.setStatus('disconnected');
}

/**
 * Trigger manual sync
 */
export function triggerSync(replicationStates: any[]) {
  console.log('[Sync] Manual sync triggered');
  syncState.setStatus('syncing');
  replicationStates.forEach(replicationState => {
    replicationState.start();
  });
}

/**
 * Get current sync status summary
 */
export function getSyncStatus(replicationStates: any[]) {
  const activeCount = replicationStates.filter(r => r.active$.getValue()).length;
  const errorCount = replicationStates.filter(r => r.error$.getValue()).length;
  
  return {
    total: replicationStates.length,
    active: activeCount,
    errors: errorCount,
    status: errorCount > 0 ? 'error' : activeCount > 0 ? 'syncing' : 'connected'
  };
}
