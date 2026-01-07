# Architecture Brief: i18n & Local-First Sync

**Protocol:** 2026-01-07-i18n-offline-sync
**Status:** Planning
**Date:** 2026-01-07

## 1. Overview
This protocol defines the architecture for implementing Internationalization (i18n) and Local-First data synchronization for the AlfaVoice Svelte client. The goal is to ensure the application supports multiple languages with type safety and operates seamlessly offline with automatic background synchronization when online.

## 2. Internationalization (i18n)

### Selected Library: `typesafe-i18n`
**Rationale:**
- **Type Safety:** Prevents missing translation keys and argument errors at compile time.
- **Performance:** Supports asynchronous loading of locales, reducing initial bundle size.
- **Svelte Integration:** Native support for Svelte stores.
- **Reputation:** High community adoption and active maintenance.

### Architecture
- **Structure:**
  - Translations located in `src/i18n/{locale}/index.ts`.
  - Base locale: `en` (or `ru` depending on primary audience, defaulting to `ru` based on user preference).
- **Loading Strategy:**
  - Use `loadLocaleAsync` to fetch translations on demand.
  - Preload user's preferred language or fallback to default.
- **State Management:**
  - Use `LL` store for reactive translations in components.
  - Persist selected language in `localStorage` (and sync to user settings in DB).

### Implementation Plan
1. Install `typesafe-i18n`.
2. Configure generator in `.typesafe-i18n.json`.
3. Create base locale files.
4. Implement `i18n-util.ts` wrapper for loading and switching.
5. Wrap root layout with i18n provider/initializer.

## 3. Local-First & Synchronization

### Selected Library: `RxDB`
**Rationale:**
- **Local-First Design:** Built specifically for offline-first apps.
- **Reactivity:** Exposes data as observables (perfect for Svelte stores).
- **Replication:** Robust replication protocol with support for custom backends (HTTP, GraphQL, etc.).
- **Ecosystem:** Mature plugins for storage (IndexedDB), encryption, and schema validation.

### Architecture
- **Storage Engine:** `Dexie.js` or `idb` (via RxDB storage plugins) for IndexedDB persistence.
- **Schema:** JSON Schema definition for client-side collections (matching server-side DTOs where possible).
- **Sync Strategy:**
  - **Replication:** Use `replicateRxCollection` with custom HTTP `push` and `pull` handlers.
  - **Conflict Resolution:** Client-wins or Last-Write-Wins (LWW) strategy initially, with server validation.
  - **Retry Logic:** RxDB's built-in exponential backoff for connectivity issues.
- **Queueing:** RxDB internally manages the replication queue, persisting pending changes until successful sync.

### Implementation Plan
1. Install `rxdb` and `rxjs`.
2. Define JSON Schemas for core entities (Notes, Settings, etc.).
3. Initialize `RxDatabase` instance in a singleton service.
4. Implement `pull` handler (fetch changes from API since last checkpoint).
5. Implement `push` handler (send local changes to API).
6. Create Svelte stores that subscribe to RxDB queries for UI binding.

## 4. Execution Roadmap
1. **i18n Setup:** Initialize `typesafe-i18n` and migrate basic UI strings.
2. **Database Core:** Setup RxDB instance and schemas.
3. **Replication Layer:** Implement HTTP sync handlers.
4. **UI Integration:** Connect Svelte components to reactive data sources.