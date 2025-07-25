import { createFileRoute, Link, useLoaderData } from "@tanstack/react-router";
import { EntriesPage } from "~/components/entries/entries-page";
import { Button } from "~/components/ui/button";

export const Route = createFileRoute("/")({
	component: HomeRoute,
});

function HomeRoute() {
	const { session } = useLoaderData({ from: "__root__" });
	return (
		<div className="min-h-screen bg-gray-50">
			<main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-[1024px]">
				{session.data ? (
					<EntriesPage />
				) : (
					<div className="grid place-content-center place-items-center gap-8 ">
						<h1 className="text-2xl font-bold">
							Please sign in to view your favorite movies and TV shows.
						</h1>
						<div className="flex gap-4">
							<Link to="/sign-in">
								<Button variant="outline">Sign In</Button>
							</Link>
							<Link to="/sign-up">
								<Button>Sign Up</Button>
							</Link>
						</div>
					</div>
				)}
			</main>
		</div>
	);
}
