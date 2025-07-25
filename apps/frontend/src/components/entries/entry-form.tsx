import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import type { Entry } from "~/lib/api";

interface EntryFormProps {
	initialData?: Partial<Entry>;
	onSubmit: (data: Omit<Entry, "id">) => Promise<void>;
	onCancel: () => void;
	isSubmitting: boolean;
}

export function EntryForm({
	initialData,
	onSubmit,
	onCancel,
	isSubmitting,
}: EntryFormProps) {
	const [formData, setFormData] = useState<Omit<Entry, "id" | "userId">>({
		title: initialData?.title || "",
		type: initialData?.type || "Movie",
		director: initialData?.director || "",
		budget: initialData?.budget || "",
		location: initialData?.location || "",
		duration: initialData?.duration || "",
		yearTime: initialData?.yearTime || "",
	});

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSelectChange = (value: string) => {
		setFormData((prev) => ({ ...prev, type: value as "Movie" | "TV Show" }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		await onSubmit(formData);
	};

	return (
		<form onSubmit={handleSubmit}>
			<Card className="w-full max-w-2xl mx-auto">
				<CardHeader>
					<CardTitle>{initialData?.id ? "Edit" : "Create"} Entry</CardTitle>
				</CardHeader>
				<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="space-y-2">
						<Label htmlFor="title">
							Title <span className="text-red-500">*</span>
						</Label>
						<Input
							id="title"
							name="title"
							value={formData.title}
							onChange={handleChange}
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="type">
							Type <span className="text-red-500">*</span>
						</Label>
						<Select
							name="type"
							value={formData.type}
							onValueChange={handleSelectChange}
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
					<div className="space-y-2">
						<Label htmlFor="director">
							Director <span className="text-red-500">*</span>
						</Label>
						<Input
							id="director"
							name="director"
							value={formData.director}
							onChange={handleChange}
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="budget">Budget</Label>
						<Input
							id="budget"
							name="budget"
							value={formData.budget}
							onChange={handleChange}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="location">Location</Label>
						<Input
							id="location"
							name="location"
							value={formData.location}
							onChange={handleChange}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="duration">Duration</Label>
						<Input
							id="duration"
							name="duration"
							value={formData.duration}
							onChange={handleChange}
							placeholder="e.g., 120 min, 45 min/ep"
						/>
					</div>
					<div className="space-y-2 md:col-span-2">
						<Label htmlFor="yearTime">
							Year/Time <span className="text-red-500">*</span>
						</Label>
						<Input
							id="yearTime"
							name="yearTime"
							value={formData.yearTime}
							onChange={handleChange}
							placeholder="e.g., 2023, 2020-2023, Summer 2023"
							required
						/>
					</div>
				</CardContent>
				<CardFooter className="flex justify-end space-x-3 pt-6">
					<Button
						type="button"
						variant="outline"
						onClick={onCancel}
						disabled={isSubmitting}
					>
						Cancel
					</Button>
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? "Saving..." : "Save"}
					</Button>
				</CardFooter>
			</Card>
		</form>
	);
}
