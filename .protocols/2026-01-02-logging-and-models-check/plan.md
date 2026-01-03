# Plan: Client Logging & Model Verification

## 1. Client Logging Implementation
- [ ] Create `client/src/lib/services/logger.ts`.
    - [ ] Implement `Logger` class with `info`, `warn`, `error` methods.
    - [ ] Add timestamp and formatting to logs.
    - [ ] (Bonus) Add an in-memory buffer to store recent logs.
- [ ] Integrate `Logger` into key client components:
    - [ ] `client/src/lib/services/audio.ts` (audio capture start/stop).
    - [ ] `client/src/lib/services/websocket.ts` (connection status, messages).
    - [ ] `client/src/routes/+page.svelte` (UI interactions).

## 2. Server Model Verification
- [ ] Update `server/src/main.rs` (or relevant startup file):
    - [ ] Add checks for model file existence at startup.
    - [ ] Log the absolute path being checked.
    - [ ] Print a clear "SUCCESS: Models loaded" or "ERROR: Model missing at [path]" message.
- [ ] Verify `server/src/asr.rs` and `server/src/llm.rs` error handling during model loading.

## 3. Verification & Testing
- [ ] Start the server and verify console output for model checks.
- [ ] Start the client and perform a test recording.
- [ ] Check client console for structured logs.
- [ ] Verify the full flow: Audio -> Server -> Transcription -> Client.

## 4. Finalization
- [ ] Update `execution.md` with results.
- [ ] Commit changes.