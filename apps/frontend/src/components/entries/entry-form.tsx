/** biome-ignore-all lint/correctness/noChildrenProp: react-form children prop */
import { useForm } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { type FC, useState } from 'react';
import { Button } from '~/components/ui/button';
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/ui/select';
import type { Entry, SearchResult } from '~/lib/api';
import { useCurrentEntry, useEntriesActions } from '~/stores/entries';
import { TMDBSearchPopup } from './tmdb-search-popup';
import { cn } from '~/lib/utils';

interface EntryFormProps {
	handleDialogClose: () => void;
}

export const EntryForm: FC<EntryFormProps> = ({ handleDialogClose }) => {
	const currentEntry = useCurrentEntry();
	const { editEntry, addEntry } = useEntriesActions();
	const queryClient = useQueryClient();
	const [isSearchOpen, setIsSearchOpen] = useState(false);

	const form = useForm({
		defaultValues: {
			title: currentEntry?.title || '',
			type: currentEntry?.type || 'Movie',
			director: currentEntry?.director || '',
			budget: currentEntry?.budget || '',
			location: currentEntry?.location || '',
			duration: currentEntry?.duration || '',
			yearTime: currentEntry?.yearTime || '',
		} as Omit<Entry, 'id' | 'userId'>,
		onSubmit: async ({ value }) => {
			if (currentEntry) {
				await editEntry(currentEntry.id as number, {
					id: currentEntry.id,
					...value,
				});
				handleDialogClose();
			} else {
				await addEntry(value);
				queryClient.invalidateQueries({ queryKey: ['entries'] });
				handleDialogClose();
			}
		},
	});

	const handleSearchResult = (result: SearchResult) => {
		const title =
			result.media_type === 'movie' ? result.title : result.original_name;
		const type = result.media_type === 'movie' ? 'Movie' : 'TV Show';
		const year =
			result.media_type === 'movie'
				? result.release_date
				: result.first_air_date;

		// Auto-fill form fields with TMDB data
		form.setFieldValue('title', title || '');
		form.setFieldValue('type', type);

		// Set year from release/air date
		if (year) {
			const yearOnly = new Date(year).getFullYear().toString();
			form.setFieldValue('yearTime', yearOnly);
		}

		// Set director (for movies) or creators (for TV shows)
		if (result.director) {
			form.setFieldValue('director', result.director);
		}

		// Set budget for movies (if available and greater than 0)
		if (result.media_type === 'movie' && result.budget && result.budget > 0) {
			form.setFieldValue('budget', `$${result.budget.toLocaleString()}`);
		}

		// Set location based on production countries
		if (result.production_countries && result.production_countries.length > 0) {
			const countries = result.production_countries
				.map((country) => country.name)
				.join(', ');
			form.setFieldValue('location', countries);
		}

		// Set duration based on media type
		if (result.media_type === 'movie' && result.runtime) {
			form.setFieldValue('duration', `${result.runtime} min`);
		} else if (
			result.media_type === 'tv' &&
			result.episode_run_time &&
			result.episode_run_time.length > 0
		) {
			// Calculate average episode runtime for TV shows
			const avgRuntime = Math.round(
				result.episode_run_time.reduce((a, b) => a + b, 0) /
					result.episode_run_time.length,
			);
			const seasonInfo = result.number_of_seasons
				? ` (${result.number_of_seasons} seasons)`
				: '';
			form.setFieldValue('duration', `${avgRuntime} min/ep${seasonInfo}`);
		}
	};

	return (
		<>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="contents"
			>
				<Card className="w-full max-w-2xl mx-auto overflow-auto ">
					<CardHeader>
						<CardTitle>
							Fill the form to {currentEntry ? 'edit' : 'add'} the{' '}
							{currentEntry ? (
								<em
									className={cn({
										'text-indigo-600': currentEntry.type === 'Movie',
										'text-green-600': currentEntry.type === 'TV Show',
									})}
								>
									"{currentEntry?.title}"
								</em>
							) : (
								' new '
							)}{' '}
							entry
						</CardTitle>
					</CardHeader>
					<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<form.Field
							name="title"
							children={(field) => (
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<Label htmlFor={field.name}>
											Title <span className="text-red-500">*</span>
										</Label>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => setIsSearchOpen(true)}
											className="h-7 px-2 text-xs"
											aria-label="Search TMDB database"
										>
											<Search className="w-3 h-3 mr-1" />
											Search TMDB
										</Button>
									</div>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										required
										placeholder="Enter title or search TMDB..."
									/>
								</div>
							)}
						/>
						<form.Field
							name="type"
							children={(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>
										Type <span className="text-red-500">*</span>
									</Label>
									<Select
										name={field.name}
										value={field.state.value}
										onValueChange={(
											value: Omit<Entry, 'id' | 'userId'>['type'],
										) => field.handleChange(value)}
									>
										<SelectTrigger className="w-full sm:w-fit">
											<SelectValue placeholder="Select a type" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="Movie">Movie</SelectItem>
											<SelectItem value="TV Show">TV Show</SelectItem>
										</SelectContent>
									</Select>
								</div>
							)}
						/>
						<form.Field
							name="director"
							children={(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>
										Director <span className="text-red-500">*</span>
									</Label>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										required
									/>
								</div>
							)}
						/>
						<form.Field
							name="budget"
							children={(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Budget</Label>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
								</div>
							)}
						/>
						<form.Field
							name="location"
							children={(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Location</Label>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
								</div>
							)}
						/>
						<form.Field
							name="duration"
							children={(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Duration</Label>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="e.g., 120 min, 45 min/ep"
									/>
								</div>
							)}
						/>
						<form.Field
							name="yearTime"
							children={(field) => (
								<div className="space-y-2 md:col-span-2">
									<Label htmlFor={field.name}>
										Year/Time <span className="text-red-500">*</span>
									</Label>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="e.g., 2023, 2020-2023, Summer 2023"
										required
									/>
								</div>
							)}
						/>
					</CardContent>
					<CardFooter className="flex justify-end space-x-3 pt-6">
						<form.Subscribe
							selector={(state) => [state.canSubmit, state.isSubmitting]}
							children={([canSubmit, isSubmitting]) => (
								<>
									<Button
										type="button"
										variant="outline"
										onClick={handleDialogClose}
										disabled={isSubmitting}
									>
										Cancel
									</Button>
									<Button type="submit" disabled={!canSubmit || isSubmitting}>
										{isSubmitting ? 'Saving...' : 'Save'}
									</Button>
								</>
							)}
						/>
					</CardFooter>
				</Card>
			</form>
			<TMDBSearchPopup
				isOpen={isSearchOpen}
				onClose={() => setIsSearchOpen(false)}
				onSelectResult={handleSearchResult}
				initialQuery={form.getFieldValue('title')}
			/>
		</>
	);
};
