# Plan: Microphone Settings Page Implementation

## Steps

- [x] **Step 1: Update AudioCapture Logic**
    - [x] Modify `client/src/lib/audio.ts`:
        - [x] Add `deviceId?: string` to `AudioConfig` interface.
        - [x] Update `initialize()` method to use `deviceId` in `getUserMedia` constraints.

- [x] **Step 2: Create Settings Store**
    - [x] Create `client/src/lib/stores/settingsStore.ts`.
    - [x] Implement a store that syncs with `localStorage`.
    - [x] Add `selectedMicrophoneId` to the store.

- [x] **Step 3: Implement Settings Page UI**
    - [x] Modify `client/src/routes/settings/+page.svelte`.
    - [x] Add "Microphone" section.
    - [x] Display current microphone label (need to fetch device label by ID).
    - [x] Add "Change" button.

- [x] **Step 4: Implement Microphone Selection Dialog**
    - [x] Create `client/src/lib/components/MicrophoneDialog.svelte` (or inline in settings page if simple, but component is better).
    - [x] Use `navigator.mediaDevices.enumerateDevices()` to list audio inputs.
    - [x] Handle permission issues (enumerateDevices might return empty labels if permission not granted).
    - [x] Implement selection logic and save to store.

- [x] **Step 5: Integrate with Recording Logic**
    - [x] Find where `createAudioCapture` is called (likely `client/src/lib/stores/recordingsStore.ts` or similar).
    - [x] Pass the `selectedMicrophoneId` from the store to `createAudioCapture`.

- [x] **Step 6: Verify and Test**
    - [x] Check if settings persist after reload.
    - [x] Check if correct microphone is used for recording.