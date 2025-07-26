import { useQuery } from "@tanstack/react-query";
import {
	createFileRoute,
	useLoaderData,
	useRouter,
} from "@tanstack/react-router";
import { EntriesPage } from "~/components/entries/entries-page";
import { HeroSection } from "~/components/ui/hero-section";
import { getSession } from "./__root";

export const Route = createFileRoute("/")({
	component: HomeRoute,
});

function HomeRoute() {
	const router = useRouter();
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
				{isLoading && (
					<div className="flex flex-col gap-6 animate-pulse">
						<div className="h-8 w-1/3 bg-muted rounded mb-4" />
						<div className="space-y-4">
							{Array.from({ length: 3 }).map((_, i) => (
								<div
									key={i}
									className="rounded-md bg-muted/60 p-6 flex flex-col gap-4 shadow"
								>
									<div className="flex items-center gap-4">
										<div className="h-8 w-8 bg-muted-foreground/30 rounded-full" />
										<div className="h-6 w-1/4 bg-muted-foreground/20 rounded" />
										<div className="ml-auto h-6 w-16 bg-muted-foreground/10 rounded" />
									</div>
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
										<div className="h-4 w-3/4 bg-muted-foreground/10 rounded" />
										<div className="h-4 w-1/2 bg-muted-foreground/10 rounded" />
										<div className="h-4 w-2/3 bg-muted-foreground/10 rounded" />
									</div>
									<div className="flex justify-end gap-2 mt-2">
										<div className="h-8 w-20 bg-muted-foreground/20 rounded" />
										<div className="h-8 w-20 bg-muted-foreground/20 rounded" />
									</div>
								</div>
							))}
						</div>
					</div>
				)}
				{isError && (
					<div className="flex flex-col items-center justify-center py-12">
						<div className="bg-destructive/10 border border-destructive/30 rounded-lg p-8 max-w-md w-full shadow-lg flex flex-col items-center">
							<svg
								className="w-12 h-12 text-destructive mb-4"
								fill="none"
								stroke="currentColor"
								strokeWidth={1.5}
								viewBox="0 0 24 24"
							>
								<circle
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="2"
									fill="none"
								/>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M12 8v4m0 4h.01"
								/>
							</svg>
							<h2 className="text-lg font-semibold text-destructive mb-2">
								Something went wrong
							</h2>
							<p className="text-sm text-destructive/80 mb-4 text-center">
								We couldn't load your session. Please try
								refreshing the page or check your connection.
							</p>
							<button
								className="px-4 py-2 bg-destructive text-white rounded hover:bg-destructive/90 transition"
								onClick={() => router.invalidate()}
							>
								Reload
							</button>
						</div>
					</div>
				)}
				{!isLoading && !isError && session?.data ? (
					<EntriesPage />
				) : (
					!isLoading && !isError && <HeroSection />
				)}
			</main>
		</div>
	);
}
