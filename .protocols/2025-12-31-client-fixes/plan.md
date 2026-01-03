# Protocol Plan: Client Fixes

**ID:** 2025-12-31-client-fixes

## Todo List

- [x] **Analysis**
    - [x] Inspect `client/src/routes/+layout.svelte` for navigation links and props.
    - [x] Inspect `client/src/lib/socket.ts` (or where WS is initialized) for error handling.
    - [x] Check `client/static` content.

- [x] **Navigation Implementation**
    - [x] Create `client/src/routes/dictionary/+page.svelte` (Stub)
    - [x] Create `client/src/routes/snippets/+page.svelte` (Stub)
    - [x] Create `client/src/routes/style/+page.svelte` (Stub)
    - [x] Create `client/src/routes/notes/+page.svelte` (Stub)
    - [x] Create `client/src/routes/settings/+page.svelte` (Stub)
    - [x] Create `client/src/routes/help/+page.svelte` (Stub)

- [x] **WebSocket Improvements**
    - [x] Implement `reconnect` logic with exponential backoff or simple delay.
    - [x] Add `onerror` handler to suppress console spam or log only once.
    - [x] Add global store state for `isOffline` (optional).

- [ ] **Assets**
    - [ ] Create a simple `favicon.png` or `favicon.ico` in `client/static/` (can use a placeholder or copy existing).

- [x] **Bug Fixes**
    - [x] Remove unused `export let params` from pages/layouts where it causes warnings.

- [x] **Verification**
    - [x] Build and Preview (`npm run preview`).
    - [x] Click all links.
    - [x] Check console for errors.