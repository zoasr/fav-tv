import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import {
	Calendar,
	Clock,
	DollarSign,
	Film,
	MapPin,
	Tv,
	User,
} from "lucide-react";
import { useState } from "react";
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
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { deleteEntry, type Entry, getEntries, updateEntry } from "~/lib/api";
import { EntryForm } from "./entry-form";

export function EntriesList() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [cursor, setCursor] = useState<number | undefined>();
	const [editingEntry, setEditingEntry] = useState<Entry | null>(null);

	const { mutate: deleteMutate } = useMutation({
		mutationFn: (id: number) => deleteEntry({ data: id }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["entries"] });
		},
	});

	const { mutate: updateMutate, isPending: isUpdating } = useMutation({
		mutationFn: ({ id, entry }: { id: number; entry: Entry }) =>
			updateEntry({ data: { id, entry } }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["entries"] });
			setEditingEntry(null);
		},
	});

	const { data, isLoading, isError, error } = useQuery({
		queryKey: ["entries", cursor],
		queryFn: () => getEntries({ data: cursor }),
		retry: false,
	});

	const handleUpdate = async (formData: Omit<Entry, "id">) => {
		if (editingEntry) {
			updateMutate({ id: editingEntry.id as number, entry: formData });
		}
	};

	if (isError) {
		return (
			<div className="rounded-md bg-red-50 p-4">
				<h3 className="text-sm font-medium text-red-800">
					Error loading entries: {error.message}
				</h3>
				<Button onClick={() => router.invalidate()} className="mt-4">
					Retry
				</Button>
			</div>
		);
	}

	if (data?.entries.length === 0 && !isLoading) {
		return (
			<div className="text-center py-12">
				<h3 className="mt-2 text-sm font-medium text-gray-900">No entries</h3>
				<p className="mt-1 text-sm text-gray-500">
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
			{data?.entries.map((entry) => (
				<Card
					key={entry.id}
					className="hover:shadow-lg transition-shadow duration-200 !rounded-md"
				>
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
					<CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-700">
						<div className="flex items-center gap-2">
							<User className="h-4 w-4 text-gray-500" />
							<span>
								<strong>Director:</strong> {entry.director}
							</span>
						</div>
						{entry.yearTime && (
							<div className="flex items-center gap-2">
								<Calendar className="h-4 w-4 text-gray-500" />
								<span>
									<strong>Year:</strong> {entry.yearTime}
								</span>
							</div>
						)}
						{entry.budget && (
							<div className="flex items-center gap-2">
								<DollarSign className="h-4 w-4 text-gray-500" />
								<span>
									<strong>Budget:</strong> {entry.budget}
								</span>
							</div>
						)}
						{entry.location && (
							<div className="flex items-center gap-2">
								<MapPin className="h-4 w-4 text-gray-500" />
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
							onClick={() => setEditingEntry(entry)}
						>
							Edit
						</Button>
						<Button
							variant="destructive"
							className="flex-1  sm:grow-0"
							onClick={() => deleteMutate(entry.id as number)}
						>
							Delete
						</Button>
					</CardFooter>
				</Card>
			))}

			<Dialog open={!!editingEntry} onOpenChange={() => setEditingEntry(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit Entry</DialogTitle>
					</DialogHeader>
					<div className="mt-4">
						<EntryForm
							initialData={editingEntry ?? undefined}
							onSubmit={handleUpdate}
							onCancel={() => setEditingEntry(null)}
							isSubmitting={isUpdating}
						/>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
