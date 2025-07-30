import { createFileRoute, Link } from '@tanstack/react-router';
import { Loader } from 'lucide-react';
import { useState } from 'react';
import { authClient } from '~/auth/auth-client';
import { Button } from '~/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import type { SignUpData } from '~/lib/api';

export const Route = createFileRoute('/sign-up')({
	component: SignUpComponent,
});

function SignUpComponent() {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<null | string | undefined>(null);
	const navigate = Route.useNavigate();
	const handleSubmit = async (e: React.FormEvent) => {
		setIsSubmitting(true);
		e.preventDefault();
		const formData = new FormData(e.target as HTMLFormElement);
		const entries: SignUpData = {
			name: formData.get('name') as string,
			email: formData.get('email') as string,
			password: formData.get('password') as string,
		};
		const res = await authClient.signUp.email({
			name: entries.name,
			email: entries.email,
			password: entries.password,
		});
		if (res.error) {
			setError(res.error.message);
		} else {
			setError(null);
			setIsSubmitting(false);
			navigate({ to: '/' });
		}
		// await signUp({ data: entries });
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
							<Loader
								className=" h-4 data-[shown=true]:!w-4 scale-0 !w-0 animate-spin data-[shown=true]:scale-100 transition-all duration-300 ease-in-out origin-center data-[shown=true]:visible data-[shown=false]:invisible"
								data-shown={isSubmitting}
							/>
						</Button>
						<p
							className="text-red-500 text-center font-bold grid data-[shown=true]:grid-rows-1 grid-rows-0 transition-all duration-300 ease-in-out"
							data-shown={!!error}
						>
							{error}
						</p>
					</form>
					<div className="mt-4 text-center text-sm">
						Already have an account?{' '}
						<Link to="/sign-in" className="underline">
							Sign in
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
