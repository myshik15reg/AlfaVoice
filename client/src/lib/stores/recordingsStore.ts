import { writable } from 'svelte/store';

export interface Recording {
	id: string;
	timestamp: number;
	transcription: string;
	duration: number;
}

interface RecordingsState {
	recordings: Recording[];
}

function createRecordingsStore() {
	const { subscribe, update, set } = writable<RecordingsState>({
		recordings: []
	});

	return {
		subscribe,
		addRecording: (transcription: string, duration: number) => {
			update((state) => ({
				recordings: [
					{
						id: crypto.randomUUID(),
						timestamp: Date.now(),
						transcription,
						duration
					},
					...state.recordings
				]
			}));
		},
		deleteRecording: (id: string) => {
			update((state) => ({
				recordings: state.recordings.filter((r) => r.id !== id)
			}));
		},
		clearRecordings: () => {
			set({ recordings: [] });
		}
	};
}

export const recordingsStore = createRecordingsStore();
