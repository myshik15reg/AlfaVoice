# UI Redesign Plan

## Phase 1: Setup
- [ ] Initialize Tailwind CSS (create `tailwind.config.js`, `postcss.config.js`, `src/app.css`).
- [ ] Configure Tailwind in `svelte.config.js` (if needed) and import `app.css` in `+layout.svelte`.

## Phase 2: Components
- [ ] Create `client/src/lib/components/Sidebar.svelte`.
- [ ] Create `client/src/lib/components/StatCard.svelte`.
- [ ] Create `client/src/lib/components/ActionCard.svelte`.
- [ ] Create `client/src/lib/components/HistoryItem.svelte`.

## Phase 3: Layout & Pages
- [ ] Update `client/src/routes/+layout.svelte` to use the new `Sidebar` and grid layout.
- [ ] Update `client/src/routes/+page.svelte` to implement the Dashboard view using the new components.

## Phase 4: Polish
- [ ] Ensure responsive design (basic).
- [ ] Verify Russian localization.
- [ ] Check "blank page" issue (ensure no new Tauri calls are introduced without guards).