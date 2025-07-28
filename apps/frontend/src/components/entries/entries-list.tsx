import { useQuery } from "@tanstack/react-query";
import {
	Calendar,
	Clock,
	DollarSign,
	Film,
	MapPin,
	Tv,
	User,
} from "lucide-react";
import type { FC } from "react";
import { memo, useCallback, useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "~/components/ui/dialog";
import { type Entry, getEntries } from "~/lib/api";
import {
	useCurrentEntry,
	useEntries,
	useEntriesActions,
} from "~/stores/entries";
import { EntryForm } from "./entry-form";

interface EntriesListProps {
	search?: string;
}

const EntryCard: FC<{
	entry: Entry;
}> = memo(({ entry }) => {
	const { deleteEntry, setCurrentEntry } = useEntriesActions();
	return (
		<Card className="hover:shadow-lg transition-shadow duration-200 !rounded-md">
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						{entry.type === "Movie" ? (
							<Film className="h-6 w-6 text-indigo-600" />
						) : (
							<Tv className="h-6 w-6 text-indigo-600" />
						)}
						{entry.title}
					</CardTitle>
					<span
						className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold leading-5 ${entry.type === "Movie" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}
					>
						{entry.type}
					</span>
				</div>
			</CardHeader>
			<CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-muted-foreground">
				<div className="flex items-center gap-2">
					<User className="h-4 w-4 text-muted-foreground" />
					<span>
						<strong>Director:</strong> {entry.director}
					</span>
				</div>
				{entry.yearTime && (
					<div className="flex items-center gap-2">
						<Calendar className="h-4 w-4 text-muted-foreground" />
						<span>
							<strong>Year:</strong> {entry.yearTime}
						</span>
					</div>
				)}
				{entry.budget && (
					<div className="flex items-center gap-2">
						<DollarSign className="h-4 w-4 text-muted-foreground" />
						<span>
							<strong>Budget:</strong> {entry.budget}
						</span>
					</div>
				)}
				{entry.location && (
					<div className="flex items-center gap-2">
						<MapPin className="h-4 w-4 text-muted-foreground" />
						<span>
							<strong>Location:</strong> {entry.location}
						</span>
					</div>
				)}
				{entry.duration && (
					<div className="flex items-center gap-2">
						<Clock className="h-4 w-4 text-gray-500" />
						<span>
							<strong>Duration:</strong> {entry.duration}
						</span>
					</div>
				)}
			</CardContent>
			<CardFooter className="flex justify-end space-x-2 bg-muted/50 py-3 px-6 rounded-md">
				<Button
					variant="ghost"
					className="flex-1  sm:grow-0"
					onClick={() => setCurrentEntry(entry.id as number)}
				>
					Edit
				</Button>
				<Button
					variant="destructive"
					className="flex-1  sm:grow-0"
					onClick={() => deleteEntry(entry.id as number)}
				>
					Delete
				</Button>
			</CardFooter>
		</Card>
	);
});

export const EntriesList: FC<EntriesListProps> = ({ search = "" }) => {
	const [cursor, setCursor] = useState<number | undefined>();
	const { setCurrentEntry, setEntries } = useEntriesActions();
	const currentEntry = useCurrentEntry();
	const entries = useEntries();

	const { isLoading, isError, error, refetch } = useQuery({
		queryKey: ["entries", cursor],
		queryFn: async () => {
			const entriesData = await getEntries(cursor);
			setEntries(entriesData.entries);
			return entriesData;
		},
		retry: false,
	});

	const filteredEntries = useMemo(
		() =>
			entries.filter((entry) => {
				const term = search.toLowerCase();
				return (
					entry.title.toLowerCase().includes(term) ||
					entry.director.toLowerCase().includes(term) ||
					entry.location?.toLowerCase().includes(term) ||
					entry.yearTime?.toLowerCase().includes(term) ||
					entry.budget?.toLowerCase().includes(term)
				);
			}),
		[entries, search],
	);

	const filteredEntriesEls = useMemo(
		() =>
			filteredEntries?.map((entry) => (
				<EntryCard key={entry.id} entry={entry} />
			)),
		[filteredEntries],
	);

	const handleDialogClose = useCallback(
		() => setCurrentEntry(null),
		[setCurrentEntry],
	);

	if (isError) {
		return (
			<div className="rounded-md bg-destructive/10 p-4">
				<h3 className="text-sm font-medium text-destructive">
					Error loading entries: {error.message}
				</h3>
				<Button onClick={() => refetch()} className="mt-4">
					Retry
				</Button>
			</div>
		);
	}

	if (entries?.length === 0 && !isLoading) {
		return (
			<div className="text-center py-12">
				<h3 className="mt-2 text-sm font-medium text-muted-foreground">
					No entries
				</h3>
				<p className="mt-1 text-sm text-muted-foreground">
					Get started by adding a new movie or TV show.
				</p>
			</div>
		);
	}
	if (isLoading) {
		return (
			<div className="flex justify-center py-4">
				<div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{filteredEntries?.length ? (
				filteredEntriesEls
			) : (
				<div className="text-center py-12">
					<h3 className="mt-2 text-sm font-medium text-muted-foreground">
						No entries or search results
					</h3>
				</div>
			)}

			<Dialog open={!!currentEntry} onOpenChange={handleDialogClose}>
				<DialogContent>
					<DialogTitle>{currentEntry ? "Edit" : "Create"} Entry</DialogTitle>
					<DialogDescription>
						{currentEntry
							? `Edit entry "${currentEntry.title}"`
							: "Add a new entry"}
					</DialogDescription>
					<div className="mt-4">
						<EntryForm handleDialogClose={handleDialogClose} />
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};
