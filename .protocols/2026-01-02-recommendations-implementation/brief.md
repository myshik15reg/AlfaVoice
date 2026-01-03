# Brief: Implementation of Architect Recommendations

## 1. Goal
Implement key architectural improvements to prepare AlfaVoice for a stable MVP release. This includes migrating to the latest stable framework version, decoupling UI from business logic, and integrating a high-performance local speech-to-text engine.

## 2. Scope
1.  **Tauri v2 Migration**: Upgrade the project from Tauri v1 to v2 to leverage new features, better security, and improved mobile support (future-proofing).
2.  **Separation of Concerns (SoC)**: Refactor the codebase to ensure the Svelte frontend is purely for presentation (View), while business logic and state management are moved to the Rust Core (Model/Controller).
3.  **Whisper Integration**: Replace any placeholder or external transcription logic with a local, high-performance integration of `whisper-rs` (Rust bindings for whisper.cpp).

## 3. Requirements

### 3.1. Tauri v2 Migration
-   Update `Cargo.toml` dependencies (`tauri`, `tauri-build`).
-   Update `package.json` dependencies (`@tauri-apps/cli`, `@tauri-apps/api`).
-   Migrate `tauri.conf.json` to the new format.
-   Update Rust code to use the new Tauri v2 API (e.g., `tauri::Builder`, permissions).
-   Update Frontend code to use the new `@tauri-apps/api` (v2) structure.

### 3.2. Separation of Concerns
-   Audit `client/src/stores` (e.g., `socketStore`, `statsStore`).
-   Identify logic that belongs in the backend (e.g., WebSocket management, heavy data processing).
-   Implement Tauri Commands for frontend-backend communication.
-   Ensure the frontend only handles UI state and displays data received from the backend.

### 3.3. Whisper Integration
-   Add `whisper-rs` dependency to `client/src-tauri/Cargo.toml`.
-   Implement a Rust service/module for handling audio transcription.
-   Ensure the `ggml-large-v3` (or appropriate quantized version) model is downloaded/loaded correctly.
-   Provide a Tauri Command to stream audio or send audio buffers for transcription.

## 4. Definition of Done
-   [ ] Project builds successfully with Tauri v2 (`npm run tauri dev`).
-   [ ] No deprecated v1 APIs are used.
-   [ ] Frontend stores are simplified; logic resides in Rust.
-   [ ] Audio is captured and transcribed locally using `whisper-rs`.
-   [ ] Performance metrics (RAM/CPU) are within acceptable limits for MVP.