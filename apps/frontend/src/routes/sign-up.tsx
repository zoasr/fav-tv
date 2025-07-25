import { createFileRoute, Link } from "@tanstack/react-router";
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
import { type SignUpData, signUp } from "~/lib/api";

export const Route = createFileRoute("/sign-up")({
	component: SignUpComponent,
});

function SignUpComponent() {
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		console.log(e.target);
		const formData = new FormData(e.target as HTMLFormElement);
		const entries: SignUpData = {
			name: formData.get("name") as string,
			email: formData.get("email") as string,
			password: formData.get("password") as string,
		};
		await signUp({ data: entries });
	};
	return (
		<div className="flex justify-center items-center min-h-screen">
			<Card className="mx-auto max-w-sm">
				<CardHeader>
					<CardTitle className="text-xl">Sign Up</CardTitle>
					<CardDescription>
						Enter your information to create an account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="grid gap-4">
						<div className="grid gap-2">
							<Label htmlFor="name">Name</Label>
							<Input id="name" name="name" placeholder="Max" required />
						</div>
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
							<Label htmlFor="password">Password</Label>
							<Input id="password" type="password" name="password" required />
						</div>
						<Button type="submit" className="w-full">
							Sign Up
						</Button>
					</form>
					<div className="mt-4 text-center text-sm">
						Already have an account?{" "}
						<Link to="/sign-in" className="underline">
							Sign in
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
