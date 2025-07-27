import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "~/auth/auth-client";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import type { SignInData } from "~/lib/api";

export const Route = createFileRoute("/sign-in")({
	component: SignInComponent,
});

function SignInComponent() {
	const [error, setError] = useState<null | string | undefined>(null);
	const navigate = Route.useNavigate();
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const formData = new FormData(e.target as HTMLFormElement);
		const entries: SignInData = {
			email: formData.get("email") as string,
			password: formData.get("password") as string,
		};
		// const res = await signIn({ data: entries });
		// console.log(res);
		const res = await authClient.signIn.email({
			email: entries.email,
			password: entries.password,
		});
		if (res.error) {
			setError(res.error.message);
		} else {
			setError(null);
			navigate({ to: "/" });
		}
	};
	return (
		<div className="flex justify-center items-center min-h-screen">
			<Card className="mx-auto max-w-sm">
				<CardHeader>
					<CardTitle className="text-2xl">Login</CardTitle>
					<CardDescription>
						Enter your email below to login to your account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="grid gap-4">
						<div className="grid gap-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								name="email"
								placeholder="m@example.com"
								required
							/>
						</div>
						<div className="grid gap-2">
							<div className="flex items-center">
								<Label htmlFor="password">Password</Label>
							</div>
							<Input id="password" name="password" type="password" required />
						</div>
						<Button type="submit" className="w-full">
							Sign In
						</Button>
						<p
							className="text-red-500 text-center font-bold grid data-[shown=true]:grid-rows-1 grid-rows-0 transition-all duration-300 ease-in-out"
							data-shown={!!error}
						>
							{error}
						</p>
					</form>
					<div className="mt-4 text-center text-sm">
						Don't have an account?{" "}
						<Link to="/sign-up" className="underline">
							Sign up
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
