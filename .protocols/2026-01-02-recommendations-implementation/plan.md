# Plan: Implementation of Recommendations

## Phase 1: Preparation & Migration to Tauri v2

- [x] **Step 1.1**: Backup current configuration.
    -   Copy `client/src-tauri/tauri.conf.json` to `tauri.conf.json.bak`.
    -   Copy `client/package.json` to `package.json.bak`.
    -   **Note**: Project already on Tauri v2, backup not needed.
- [x] **Step 1.2**: Update NPM dependencies.
    -   Install `@tauri-apps/cli@next` and `@tauri-apps/api@next` (or latest v2 stable).
    -   Update `vite` and plugins if necessary.
    -   **Note**: Dependencies already on v2 (`@tauri-apps/cli@^2.2.0`, `@tauri-apps/api@^2.2.0`).
- [x] **Step 1.3**: Update Cargo dependencies.
    -   Update `tauri` to version `2.0` in `client/src-tauri/Cargo.toml`.
    -   Update `tauri-build` to version `2.0`.
    -   **Note**: Dependencies already on v2 (`tauri = "2.0"`, `tauri-build = "2.0"`).
- [x] **Step 1.4**: Migrate Configuration.
    -   Run `npm run tauri migrate` if available, or manually update `tauri.conf.json` schema (v2 has different structure, e.g., `identifier` vs `bundle.identifier`).
    -   **Note**: Configuration already on v2 format (`"$schema": "https://schema.tauri.app/config/2.0"`).
- [x] **Step 1.5**: Update Rust Entrypoint.
    -   Refactor `client/src-tauri/src/main.rs` to match Tauri v2 Builder API.
    -   Ensure permissions (ACL) are correctly configured (Tauri v2 uses capability-based permissions).
    -   **Note**: Rust code already uses Tauri v2 API.
- [x] **Step 1.6**: Update Frontend Code.
    -   Update `client/src/lib/tauri.ts` to use Tauri v2 API modules (`@tauri-apps/api/core`, `@tauri-apps/api/event`).
    -   Update `client/src/routes/+page.svelte` to handle async `isTauri()` function.
    -   Update `client/vite.config.js` aliases for Tauri v2 module structure.
    -   **Status**: Completed successfully.
- [x] **Step 1.7**: Build & Verify.
    -   Run `npm run build` to verify the project builds correctly.
    -   **Status**: Build successful with warnings (non-critical).

## Phase 2: Whisper Integration (Rust Core)

- [ ] **Step 2.1**: Add Dependencies.
    -   Add `whisper-rs` to `client/src-tauri/Cargo.toml`.
    -   Ensure `openblas` or equivalent is available/configured (if needed for Windows build, or use static linking).
- [ ] **Step 2.2**: Implement Transcription Service.
    -   Create `client/src-tauri/src/core/whisper.rs`.
    -   Implement model loading (check for `ggml-large-v3.bin` existence, download if missing).
    -   Implement `transcribe_audio(data: Vec<f32>) -> Result<String, Error>`.
- [ ] **Step 2.3**: Expose Tauri Command.
    -   Create command `transcribe_chunk` in `client/src-tauri/src/lib.rs` (or `main.rs`).
    -   Connect command to the Whisper service.

## Phase 3: Separation of Concerns (Refactoring)

- [x] **Step 3.1**: Analyze Frontend Stores.
    -   Review `client/src/stores/socketStore.ts` and `client/src/stores/statsStore.ts`.
    -   Identify logic handling WebSocket connections or heavy processing.
    -   **Status**: Completed. Created `client/src/lib/core/CoreService.ts` abstraction.
- [ ] **Step 3.2**: Move WebSocket Logic to Rust (Optional/Partial).
    -   *Note*: Tauri v2 has a WebSocket plugin. Evaluate if we should use `tauri-plugin-websocket` or keep custom Rust implementation.
    -   For MVP, ensure the *decision making* is in Rust. If Svelte just forwards messages, it's acceptable for now, but better to move connection management to Rust.
    -   **Status**: Stores refactored. `socketStore.ts` and `statsStore.ts` now delegate to `coreService`.
- [ ] **Step 3.3**: Update Svelte Components.
    -   Replace direct logic calls with `invoke('command_name', { ... })`.
    -   Ensure UI components are "dumb" (reactive to state only).
- [ ] **Step 3.4**: Implement Tauri Commands in Rust.
    -   Create commands for WebSocket, Stats, Recording, Settings.
    -   Connect `CoreService` to Rust backend.
- [ ] **Step 3.5**: Remove Temporary Compatibility Code.
    -   Remove `socketManager` dependency from `socketStore.ts`.
    -   Remove temporary `countWords()` function from `statsStore.ts`.
    -   Enable event listeners from Rust in `CoreService`.

## Phase 4: Verification

- [ ] **Step 4.1**: Build & Run.
    -   Run `npm run tauri dev`.
    -   Verify app launches.
- [ ] **Step 4.2**: Test Audio Capture.
    -   Verify microphone selection and recording still work.
- [ ] **Step 4.3**: Test Transcription.
    -   Speak into microphone -> Verify text output from Whisper.