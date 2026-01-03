# Protocol: Client Preview Testing

**Date:** 2025-12-31
**Status:** Active
**Feature:** Client Preview & Build Verification

## 1. Overview
The goal of this protocol is to verify that the client application can be successfully built and served using `vite preview`. This ensures that the production build artifacts are correct and the application runs in a production-like environment.

## 2. Goals
- Verify `npm run build` completes without errors.
- Verify `npm run preview` starts the server.
- Perform a basic smoke test to ensure the UI loads.

## 3. Scope
- Directory: `client/`
- Scripts: `build`, `preview`

## 4. Requirements
- The build process must generate the `dist` (or `build`) directory.
- The preview server must be accessible (e.g., on localhost:4173).
- No critical console errors on startup.

## 5. Definition of Done
- [ ] Build completes successfully.
- [ ] Preview server starts.
- [ ] Smoke test confirms UI availability.