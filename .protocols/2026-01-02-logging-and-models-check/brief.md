# Protocol: Client Logging & Model Verification

**Date:** 2026-01-02
**Status:** Active

## Goals
1.  **Client Logging:** Implement a logging mechanism on the client side (Tauri/Svelte) to provide visibility into client operations ("what is happening with it").
2.  **Model Verification:** Ensure all required AI models are present on the server and load correctly.
3.  **System Verification:** Verify the end-to-end flow with the new logging and verified models.

## Requirements

### Client Logging
-   Create a `Logger` service in the client application.
-   Support log levels: INFO, WARN, ERROR.
-   Logs should be visible in the developer console (formatted).
-   (Optional but recommended) Logs should be accessible via UI or saved to a file for easier debugging by non-developers. For this iteration, we will implement a simple in-memory log store that *can* be displayed in the UI, alongside console logging.

### Model Verification
-   Verify existence of `whisper` and `llm` model files.
-   Verify that the server can load these models successfully.
-   Provide clear feedback if a model is missing or corrupted.

## Definition of Done
-   [ ] Client displays structured logs in the console (and optionally UI).
-   [ ] Server startup confirms model loading with a clear success message.
-   [ ] End-to-end transcription test passes with logs confirming each step.