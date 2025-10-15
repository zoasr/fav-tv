import { X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '~/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '~/components/ui/dialog';
import { useDebounce } from '~/hooks/useDebounce';
import { Input } from '../ui/input';
import { EntriesList } from './entries-list';
import { EntryForm } from './entry-form';

export function EntriesPage() {
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [search, setSearch] = useState('');
	const debouncedSearch = useDebounce(search, 300);

	const handleDialogClose = useCallback(() => {
		setIsFormOpen(false);
	}, []);

	const handleSearchClear = useCallback(() => {
		setSearch('');
	}, []);

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
						<DialogContent className="max-h-[80dvh] flex flex-col">
							<DialogHeader>
								<DialogTitle>Add New Entry</DialogTitle>
								<DialogDescription>
									Add a new movie or TV show to your list.
								</DialogDescription>
							</DialogHeader>
							<EntryForm handleDialogClose={handleDialogClose} />
						</DialogContent>
					</Dialog>
				</div>
			</div>

			<div className="mt-4 relative">
				<Input
					type="text"
					placeholder="Search by title, director, year, or location..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="pr-10"
					aria-label="Search entries"
				/>
				{search && (
					<Button
						variant="ghost"
						size="sm"
						onClick={handleSearchClear}
						className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
						aria-label="Clear search"
					>
						<X className="h-4 w-4" />
					</Button>
				)}
			</div>

			<div className="mt-8">
				<EntriesList search={debouncedSearch} />
			</div>
		</div>
	);
}
