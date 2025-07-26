import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { EntriesPage } from "~/components/entries/entries-page";
import { HeroSection } from "~/components/ui/hero-section";
import { getSession } from "./__root";

export const Route = createFileRoute("/")({
	component: HomeRoute,
});

function HomeRoute() {
	const {
		data: session,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["session"],
		queryFn: getSession,
	});
	return (
		<div className="min-h-screen ">
			<main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-[1024px]">
				{isLoading && <div>Loading...</div>}
				{isError && <div>Error</div>}
				{session?.data ? <EntriesPage /> : <HeroSection />}
			</main>
		</div>
	);
}
