/// <reference types="vite/client" />

import { useQuery, type QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Link,
	Scripts,
	useRouter,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { User } from "lucide-react";
import type * as React from "react";
import { authClient } from "~/auth/auth-client";
import { DefaultCatchBoundary } from "~/components/DefaultCatchBoundary";
import { NotFound } from "~/components/NotFound";
import { Button } from "~/components/ui/button";
import appCss from "~/styles/app.css?url";
import { seo } from "~/utils/seo";

export const getSession = async () => {
	return await authClient.getSession();
};

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
}>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			...seo({
				title: "TanStack Start | Type-Safe, Client-First, Full-Stack React Framework",
				description: `TanStack Start is a type-safe, client-first, full-stack React framework. `,
			}),
		],
		links: [
			{ rel: "stylesheet", href: appCss },
			{
				rel: "apple-touch-icon",
				sizes: "180x180",
				href: "/apple-touch-icon.png",
			},
			{
				rel: "icon",
				type: "image/png",
				sizes: "32x32",
				href: "/favicon-32x32.png",
			},
			{
				rel: "icon",
				type: "image/png",
				sizes: "16x16",
				href: "/favicon-16x16.png",
			},
			{ rel: "manifest", href: "/site.webmanifest", color: "#fffff" },
			{ rel: "icon", href: "/favicon.ico" },
		],
	}),
	errorComponent: DefaultCatchBoundary,
	notFoundComponent: () => <NotFound />,
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	const {
		data: session,
		isLoading,
		isError,
		refetch,
	} = useQuery({
		queryKey: ["session"],
		queryFn: getSession,
		retry: false,
	});
	// const { session } = Route.useLoaderData();
	const router = useRouter();
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body className="dark">
				<header className="p-2 flex flex-col sm:flex-row gap-8 sm:gap-2 justify-between items-center border-b-2 border-border">
					<h1 className="text-2xl font-bold">
						<Link to="/">Favourite movies & TV Shows</Link>
					</h1>
					<aside className="flex gap-2 items-center">
						{isLoading && (
							<div className="flex items-center gap-2 animate-pulse">
								<div className="w-8 h-8 bg-muted-foreground rounded-full" />
								<span className="h-4 w-24 bg-muted-foreground rounded" />
							</div>
						)}
						{isError && <span>Error</span>}
						{session?.data?.user ? (
							<>
								<span className="font-bold flex items-center gap-2 bg-primary text-primary-foreground p-2 rounded-md shadow-md">
									<User />
									{session.data?.user?.name}
								</span>
								<Button
									variant="destructive"
									onClick={async () => {
										await authClient.signOut();
										refetch();
										router.invalidate();
									}}
								>
									Logout
								</Button>
							</>
						) : !isLoading ? (
							<>
								<Link to="/sign-in">
									<Button variant="outline">Sign In</Button>
								</Link>
								<Link to="/sign-up">
									<Button>Sign Up</Button>
								</Link>
							</>
						) : null}
					</aside>
				</header>
				{children}
				<TanStackRouterDevtools position="bottom-right" />
				<Scripts />
			</body>
		</html>
	);
}
