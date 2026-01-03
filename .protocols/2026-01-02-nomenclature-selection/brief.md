# Protocol: Nomenclature Selection (Dictionary)

**Date:** 2026-01-02
**Status:** Active

## Goal
Implement a functional Dictionary page (`/dictionary`) that allows users to view, search, and select nomenclature items. Currently, the page is a placeholder.

## Requirements

### Functional
1.  **Nomenclature List**: Display a list of items (Product Name, Code/Article, Price - optional).
    *   *Initial Phase*: Use mock data (JSON) until the backend API is ready.
2.  **Search & Filter**: Real-time filtering of items by name or code.
3.  **Selection**:
    *   Users can select one or multiple items (depending on future needs, let's assume single selection for "active item" or multiple for "cart" - let's start with **single selection** as a context for voice commands, or **multiple** if building a list. The user prompt says "selection of nomenclature", often implying picking an item to work with. Let's support **single selection** with a clear UI indication, extensible to multiple).
    *   *Correction*: "Selection" often means "picking items to recognize". Let's assume the user wants to *browse* and *select* an item to perhaps "fill" it somewhere or just see details. Given the "AlfaVoice" context (voice filling), maybe it's selecting items to be *recognized*? Or simply a reference list?
    *   *Decision*: Implement a generic selection mechanism (highlight active row).
4.  **State Management**:
    *   Selected item(s) must be persisted (at least in memory/session) via a Svelte Store.
    *   Search query should be preserved when navigating away and back (optional, but good UX).

### UI/UX
-   Use existing design system (Tailwind CSS).
-   Clean, table-like or list layout.
-   Search bar at the top.
-   Clear visual feedback for selected items.

## Technical Implementation
-   **Store**: `client/src/lib/stores/dictionaryStore.ts` for data and state.
-   **Page**: `client/src/routes/dictionary/+page.svelte`.
-   **Components**: Reusable components if complex, otherwise inline for MVP.
-   **Mock Data**: Hardcoded array of ~10-20 items.

## Definition of Done
-   [ ] `/dictionary` page renders a list of items.
-   [ ] Search bar filters the list instantly.
-   [ ] Clicking an item selects it (visual highlight).
-   [ ] Selection state is managed via Svelte Store.