import { createFileRoute, useLoaderData } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

function RouteComponent() {
	const user = useLoaderData({ from: "__root__" });
	return (
		<main className="container mx-auto p-4">
			<pre>{JSON.stringify(user, null, 2)}</pre>
		</main>
	);
}
