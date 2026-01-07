// Sync state store using Svelte 5 runes
export type SyncStatus = 'connected' | 'syncing' | 'error' | 'disconnected';
export type SyncError = { message: string; timestamp: number };

export function createSyncState() {
  let status = $state<SyncStatus>('disconnected');
  let error = $state<SyncError | null>(null);
  let lastSync = $state<number | null>(null);
  let pendingChanges = $state<number>(0);

  return {
    get status() { return status; },
    get error() { return error; },
    get lastSync() { return lastSync; },
    get pendingChanges() { return pendingChanges; },
    
    setStatus(newStatus: SyncStatus) {
      status = newStatus;
    },
    
    setError(newError: SyncError | null) {
      error = newError;
    },
    
    setLastSync(timestamp: number) {
      lastSync = timestamp;
    },
    
    setPendingChanges(count: number) {
      pendingChanges = count;
    }
  };
}

// Singleton instance
export const syncState = createSyncState();
