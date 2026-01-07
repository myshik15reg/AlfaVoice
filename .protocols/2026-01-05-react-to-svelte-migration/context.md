# Context: React to SvelteKit Migration

## Route Mapping Table

| React View (State) | SvelteKit Route | React Component | Svelte Component |
|-------------------|-----------------|-----------------|------------------|
| `dashboard` | `/` | `pages/Dashboard.tsx` | `routes/+page.svelte` |
| `dictionary` | `/dictionary` | `pages/Dictionary.tsx` | `routes/dictionary/+page.svelte` |
| `snippets` | `/snippets` | `pages/Snippets.tsx` | `routes/snippets/+page.svelte` |
| `notes` | `/notes` | `pages/Notes.tsx` | `routes/notes/+page.svelte` |
| `guide` | `/guide` | `pages/StyleGuide.tsx` | `routes/guide/+page.svelte` |
| `support` | `/support` | `pages/Support.tsx` | `routes/support/+page.svelte` |
| `settings_general` | `/settings` | `pages/settings/General.tsx` | `routes/settings/+page.svelte` |
| `onboarding_style` | `/settings/style` | `pages/settings/Style.tsx` | `routes/settings/style/+page.svelte` |
| `settings_notifications` | `/settings/notifications` | `pages/settings/Notifications.tsx` | `routes/settings/notifications/+page.svelte` |
| `integration_chrome` | `/settings/integrations` | `pages/settings/Integrations.tsx` | `routes/settings/integrations/+page.svelte` |
| `integration_code` | `/settings/code` | `pages/settings/Code.tsx` | `routes/settings/code/+page.svelte` |
| `settings_privacy` | `/settings/privacy` | `pages/settings/Privacy.tsx` | `routes/settings/privacy/+page.svelte` |
| `settings_devices` | `/settings/devices` | `pages/settings/Devices.tsx` | `routes/settings/devices/+page.svelte` |

## State Management Mapping

| React Context (`AppContext.tsx`) | Svelte Store (`$lib/stores/`) | Type |
|----------------------------------|------------------------------|------|
| `user` | `userStore.ts` | `Readable<User>` |
| `activities` | `activitiesStore.ts` | `Writable<Activity[]>` |
| `news` | `newsStore.ts` | `Writable<NewsItem[]>` |
| `snippets` | `snippetsStore.ts` | `Writable<Snippet[]>` |
| `notes` | `notesStore.ts` | `Writable<Note[]>` |
| `dictionary` | `dictionaryStore.ts` | `Writable<DictionaryTerm[]>` |
| `globalHotkey` | `settingsStore.ts` | `Writable<AppSettings>` |
| `volume` | `settingsStore.ts` | `Writable<AppSettings>` |
| `selectedDeviceId` | `settingsStore.ts` | `Writable<AppSettings>` |
| `styleSettings` | `settingsStore.ts` | `Writable<AppSettings>` |
| `integrationSettings` | `settingsStore.ts` | `Writable<AppSettings>` |
| `codeSettings` | `settingsStore.ts` | `Writable<AppSettings>` |
| `isGlobalRecording` | `audioStore.ts` | `Writable<RecordingState>` |

## Tauri Integration Context

### Commands (`src-tauri/src/commands/audio.rs`)
- `record_start(device_id: String) -> Result<(), String>`
- `record_stop() -> Result<Vec<u8>, String>`
- `save_audio(data: Vec<u8>, path: String) -> Result<(), String>`

### Plugins
- `@tauri-apps/plugin-global-shortcut` (для глобальных хоткеев)
- `window` (minimize, maximize, close)

## Style Context
- **Framework:** Tailwind CSS v4
- **Variables:** `client/src/app.css` (migrated from `styles.css`)
- **Icons:** Material Symbols Outlined (Web Font)
- **Theme:** Dark/Light (class `dark` on `html`)