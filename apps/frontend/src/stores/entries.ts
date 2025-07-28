import { create } from "zustand";
import { createEntry, deleteEntry, type Entry, updateEntry } from "~/lib/api";

type EntriesStore = {
	entries: Entry[];
	currentEntry: Entry | null;
	actions: {
		setEntries: (entries: Entry[]) => void;
		setCurrentEntry: (id: number | null) => void;
		deleteEntry: (id: number) => Promise<void>;
		editEntry: (id: number, entry: Entry) => Promise<void>;
		addEntry: (entry: Entry) => Promise<void>;
	};
};

const useEntriesStore = create<EntriesStore>((set, get) => ({
	entries: [],
	currentEntry: null,
	actions: {
		setEntries: (entries) => {
			set({ entries });
		},
		deleteEntry: async (id: number) => {
			const currEntry = get().entries.find((e) => e.id === id);
			const currEntryIndex = get().entries.findIndex((e) => e.id === id);
			set((state) => ({
				entries: state.entries.filter((entry) => entry.id !== id),
			}));
			try {
				await deleteEntry(id);
			} catch {
				// Optionally handle rollback or show error to user
				if (currEntry)
					set((state) => ({
						entries: [
							...state.entries.slice(0, currEntryIndex),
							currEntry,
							...state.entries.slice(currEntryIndex + 1),
						],
					}));
			}
		},
		editEntry: async (id, entry) => {
			console.log(id);
			const currEntry = get().entries.find((e) => e.id === id);
			set((state) => ({
				entries: state.entries.map((e) => (e.id === id ? entry : e)),
			}));
			try {
				await updateEntry(id, entry);
			} catch {
				// Optionally handle rollback or show error to user
				if (currEntry)
					set((state) => ({
						entries: state.entries.map((e) =>
							e.id === entry.id ? currEntry : e,
						),
					}));
			}
		},
		setCurrentEntry: (id) => {
			const entry = get().entries.find((e) => e.id === id);
			set({ currentEntry: entry });
		},
		addEntry: async (entry) => {
			set((state) => ({
				entries: [...state.entries, entry],
			}));
			try {
				await createEntry(entry);
			} catch {
				// Optionally handle rollback or show error to user
				set((state) => ({
					entries: state.entries.filter((e) => e.id !== entry.id),
				}));
			}
		},
	},
}));

export const useEntries = () => useEntriesStore((state) => state.entries);
export const useCurrentEntry = () =>
	useEntriesStore((state) => state.currentEntry);
export const useEntriesActions = () =>
	useEntriesStore((state) => state.actions);
