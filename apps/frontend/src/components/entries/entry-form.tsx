/** biome-ignore-all lint/correctness/noChildrenProp: react-form children prop */
import { useForm } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import type { FC } from 'react';
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
import type { Entry } from '~/lib/api';
import { useCurrentEntry, useEntriesActions } from '~/stores/entries';

interface EntryFormProps {
	handleDialogClose: () => void;
}

export const EntryForm: FC<EntryFormProps> = ({ handleDialogClose }) => {
	const currentEntry = useCurrentEntry();
	const { editEntry, addEntry } = useEntriesActions();
	const queryClient = useQueryClient();
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

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
		>
			<Card className="w-full max-w-2xl mx-auto">
				<CardHeader>
					<CardTitle>
						Fill the form to {currentEntry ? 'edit' : 'add'} the
						{currentEntry ? (
							<em className="text-indigo-600">"{currentEntry?.title}"</em>
						) : (
							' new '
						)}
						entry
					</CardTitle>
				</CardHeader>
				<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<form.Field
						name="title"
						children={(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>
									Title <span className="text-red-500">*</span>
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
									<SelectTrigger>
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
	);
};
