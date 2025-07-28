import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { useCurrentEntry, useEntriesActions } from "~/stores/entries";
import { Input } from "../ui/input";
// import { useAuth } from "~/contexts/AuthContext";
import { EntriesList } from "./entries-list";
import { EntryForm } from "./entry-form";

export function EntriesPage() {
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [search, setSearch] = useState("");
	const { setCurrentEntry } = useEntriesActions();

	const handleDialogClose = useCallback(() => {
		setCurrentEntry(null);
	}, [setCurrentEntry]);

	return (
		<div className="space-y-6">
			<div className="sm:flex sm:items-center">
				<div className="sm:flex-auto">
					<h1 className="text-2xl font-semibold text-foreground">
						My Favorites
					</h1>
					<p className="mt-2 text-sm text-muted-foreground">
						A list of all your favorite movies and TV shows.
					</p>
				</div>
				<div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
					<Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
						<DialogTrigger asChild>
							<Button className="w-full sm:w-fit text-lg p-8">
								+ Add Entry
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Add New Entry</DialogTitle>
								<DialogDescription>
									Add a new movie or TV show to your list.
								</DialogDescription>
							</DialogHeader>
							<div className="mt-4">
								<EntryForm handleDialogClose={handleDialogClose} />
							</div>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			<div className="mt-4">
				<Input
					type="text"
					placeholder="Search by title, director, year, or location..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
			</div>

			<div className="mt-8">
				<EntriesList search={search} />
			</div>
		</div>
	);
}
