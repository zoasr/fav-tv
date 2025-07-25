import { createFileRoute } from "@tanstack/react-router";
import { EntriesPage } from "~/components/entries/entries-page";

export const Route = createFileRoute("/")({
	component: HomeRoute,
});

function HomeRoute() {
	return (
		<div className="min-h-screen bg-gray-50">
			<main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-[1024px]">
				<EntriesPage />
			</main>
		</div>
	);
}
