<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { syncState } from '$lib/stores/syncState.svelte';
  import { getDB } from '$lib/db';

  let replicationStates: any[] = [];
  let dbInstance: any = null;
  let isInitialized = false;

  onMount(async () => {
    console.log('[SyncManager] Component mounted, initializing replication...');
    
    try {
      // Get database instance
      dbInstance = await getDB();
      
      if (!dbInstance) {
        console.error('[SyncManager] Database instance is null');
        syncState.setError({
          message: 'Database not initialized',
          timestamp: Date.now()
        });
        syncState.setStatus('error');
        return;
      }
      
      // Dynamic import of replicateRxCollection from rxdb/plugins/replication
      const rxdbReplication = await import('rxdb/plugins/replication');
      const { replicateRxCollection } = rxdbReplication;
      
      // Setup replication for all collections
      const collections = ['snippets', 'notes', 'dictionary'];
      
      for (const collectionName of collections) {
        const collection = dbInstance[collectionName];
        if (!collection) {
          console.error(`[SyncManager] Collection ${collectionName} not found`);
          continue;
        }
        
        console.log(`[SyncManager] Setting up replication for ${collectionName}...`);
        
        const replicationState = replicateRxCollection({
          collection,
          replicationIdentifier: `alfavoice-${collectionName}-sync`,
          live: true,
          retryTime: 5000, // Retry failed requests after 5 seconds
          waitForLeadership: true,
          autoStart: true,
          
          pull: {
            batchSize: 50,
            async handler(lastCheckpoint: any, batchSize: number) {
              // Simulate network delay
              await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
              
              // Simulate random network error (10% chance)
              if (Math.random() < 0.1) {
                console.error(`[SyncManager] Pull failed for ${collectionName}: Network error`);
                throw new Error('Network error: Unable to fetch from server');
              }
              
              // Return empty documents (mock backend is empty)
              return {
                documents: [],
                checkpoint: lastCheckpoint || null
              };
            }
          },
          
          push: {
            batchSize: 50,
            async handler(docs: any[]) {
              console.log(`[SyncManager] Pushing ${docs.length} documents to server for ${collectionName}...`);
              
              // Simulate network delay
              await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
              
              // Simulate random network error (15% chance)
              if (Math.random() < 0.15) {
                console.error(`[SyncManager] Push failed for ${collectionName}: Network error`);
                throw new Error('Network error: Unable to push to server');
              }
              
              // Return empty array (no conflicts)
              return [];
            }
          }
        });
        
        // Subscribe to replication events
        replicationState.active$.subscribe((isActive: boolean) => {
          console.log(`[SyncManager] ${collectionName} replication active: ${isActive}`);
          if (isActive) {
            syncState.setStatus('syncing');
          } else {
            syncState.setStatus('connected');
          }
        });
        
        replicationState.error$.subscribe((error: any) => {
          if (error) {
            console.error(`[SyncManager] ${collectionName} replication error:`, error);
            syncState.setError({
              message: error.message || 'Sync error',
              timestamp: Date.now()
            });
            syncState.setStatus('error');
          }
        });
        
        replicationState.canceled$.subscribe((isCanceled: boolean) => {
          if (isCanceled) {
            console.log(`[SyncManager] ${collectionName} replication canceled`);
            syncState.setStatus('disconnected');
          }
        });
        
        replicationStates.push(replicationState);
      }
      
      console.log('[SyncManager] Replication initialized successfully');
      syncState.setStatus('connected');
      syncState.setLastSync(Date.now());
      isInitialized = true;
      
    } catch (error: any) {
      console.error('[SyncManager] Failed to initialize replication:', error);
      syncState.setError({
        message: error.message || 'Failed to initialize sync',
        timestamp: Date.now()
      });
      syncState.setStatus('error');
    }
  });

  onDestroy(() => {
    console.log('[SyncManager] Component destroyed, stopping replication...');
    if (replicationStates.length > 0) {
      replicationStates.forEach((state: any) => {
        state.cancel();
      });
      replicationStates = [];
    }
  });

  // Export functions for manual control
  export function triggerManualSync() {
    console.log('[SyncManager] Manual sync triggered');
    if (replicationStates.length > 0) {
      replicationStates.forEach((state: any) => {
        state.start();
      });
      syncState.setStatus('syncing');
    }
  }

  export function stopSync() {
    console.log('[SyncManager] Stop sync triggered');
    if (replicationStates.length > 0) {
      replicationStates.forEach((state: any) => {
        state.cancel();
      });
      syncState.setStatus('disconnected');
    }
  }

  export function isReady(): boolean {
    return isInitialized && replicationStates.length > 0;
  }
</script>

<!-- This component is not rendered - it's a utility component for managing sync -->
