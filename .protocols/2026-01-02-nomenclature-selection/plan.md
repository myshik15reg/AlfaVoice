# Plan: Nomenclature Selection

- [x] **Step 1: Create Dictionary Store**
    -   Create `client/src/lib/stores/dictionaryStore.ts`.
    -   Define `NomenclatureItem` interface (id, name, code, price).
    -   Implement `createDictionaryStore` with mock data.
    -   Add `setSearchQuery`, `selectItem`, `toggleItem` methods.
    -   Expose derived stores for `filteredItems` and `selectedItem`.

- [x] **Step 2: Implement Dictionary Page UI**
    -   Update `client/src/routes/dictionary/+page.svelte`.
    -   Add Search Input component (or inline).
    -   Create a List/Table view for items.
    -   Bind search input to store.
    -   Handle click events for selection.
    -   Style active/selected state using Tailwind.

- [x] **Step 3: Verify & Polish**
    -   Check search responsiveness.
    -   Check selection behavior.
    -   Ensure responsiveness (mobile/desktop).