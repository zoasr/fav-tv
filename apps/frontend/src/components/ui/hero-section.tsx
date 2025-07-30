import { Link } from '@tanstack/react-router';
import { Button } from '~/components/ui/button';

export function HeroSection() {
	return (
		<section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
			<div className="container px-4 md:px-6">
				<div className="flex flex-col items-center space-y-4 text-center">
					<div className="space-y-2">
						<h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
							Welcome to Your Favorite TV Shows and Movies Tracker
						</h1>
						<p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
							Never forget what you've watched and what you want to watch next.
							Sign up to start tracking.
						</p>
					</div>
					<div className="space-x-4">
						<Link to="/sign-in">
							<Button variant="outline">Sign In</Button>
						</Link>
						<Link to="/sign-up">
							<Button>Sign Up</Button>
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}
