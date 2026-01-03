# Protocol Brief: Client Fixes (Preview)

**ID:** 2025-12-31-client-fixes
**Date:** 2025-12-31
**Status:** Active

## Context
Following the QA preview test (`2025-12-31-client-preview-test`), several issues were identified in the client application (SvelteKit). These issues affect navigation, connectivity, and basic assets.

## Objectives
1.  **Fix Navigation:** Ensure navigation menu items (Dictionary, Snippets, etc.) route to actual pages.
2.  **Robust WebSocket:** Implement graceful error handling for WebSocket connection failures (offline mode/reconnection).
3.  **Assets:** Restore missing `favicon.ico`.
4.  **Svelte Warnings:** Resolve `<Page> received an unexpected prop "params"` warnings.

## Requirements
-   **Routes:** Create stub pages for:
    -   `/dictionary`
    -   `/snippets`
    -   `/style`
    -   `/notes`
    -   `/settings`
    -   `/help`
-   **WebSocket:**
    -   Do not spam console with connection errors.
    -   Show visual indicator if server is offline (optional but recommended).
    -   Implement reconnection logic with backoff.
-   **Favicon:** Add `favicon.png` or `.ico` to `static/`.
-   **Code Quality:** Fix SvelteKit warnings.

## Definition of Done
-   All menu links work and display at least a placeholder page.
-   Console is clean of WebSocket connection spam when server is down.
-   Favicon is displayed in browser tab.
-   No "unexpected prop" warnings in console.