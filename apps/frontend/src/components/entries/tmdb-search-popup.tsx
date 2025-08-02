import { Search, X } from 'lucide-react';
import type { FC } from 'react';
import { Button } from '~/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '~/components/ui/dialog';
import type { SearchResult } from '~/lib/api';
import { TMDBSearchProvider } from './tmdb-search-context';
import { TMDBSearchInput } from './tmdb-search-input';
import { TMDBSearchResults } from './tmdb-search-results';

// Internal component that uses the context
const TMDBSearchContent: FC = () => {
	return (
		<div className="space-y-4 flex-1 flex flex-col min-h-0">
			<TMDBSearchInput />
			<TMDBSearchResults />
		</div>
	);
};

interface TMDBSearchPopupProps {
	isOpen: boolean;
	onClose: () => void;
	onSelectResult: (result: SearchResult) => void;
	initialQuery?: string;
}

export const TMDBSearchPopup: FC<TMDBSearchPopupProps> = ({
	isOpen,
	onClose,
	onSelectResult,
	initialQuery = '',
}) => {
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent
				className="max-w-4xl max-h-[80dvh] overflow-hidden flex flex-col"
				showCloseButton={false}
			>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Search className="w-5 h-5" />
						Search TMDB Database
					</DialogTitle>
					<Button
						variant="ghost"
						size="sm"
						onClick={onClose}
						className="absolute top-4 right-4 p-2"
						aria-label="Close search dialog"
					>
						<X className="w-4 h-4" />
					</Button>
				</DialogHeader>

				<TMDBSearchProvider
					initialQuery={initialQuery}
					onSelectResult={onSelectResult}
					onClose={onClose}
				>
					<TMDBSearchContent />
				</TMDBSearchProvider>
			</DialogContent>
		</Dialog>
	);
};
