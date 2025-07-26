import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { createEntry, type Entry } from "~/lib/api";
// import { useAuth } from "~/contexts/AuthContext";
import { EntriesList } from "./entries-list";
import { EntryForm } from "./entry-form";

export function EntriesPage() {
	const [isFormOpen, setIsFormOpen] = useState(false);
	const queryClient = useQueryClient();

	const handleFormSubmit = async (data: Omit<Entry, "id" | "userId">) => {
		try {
			// The actual API call will be handled by the parent component
			setIsFormOpen(false);

			await createEntry({ data });
			// Refresh the entries list
			// This would be better with a proper state management solution
			queryClient.invalidateQueries({ queryKey: ["entries"] });
		} catch (error) {
			console.error("Failed to save entry:", error);
		}
	};

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
							</DialogHeader>
							<div className="mt-4">
								<EntryForm
									onSubmit={handleFormSubmit}
									onCancel={() => setIsFormOpen(false)}
									isSubmitting={false}
								/>
							</div>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			<div className="mt-8">
				<EntriesList />
			</div>
		</div>
	);
}
