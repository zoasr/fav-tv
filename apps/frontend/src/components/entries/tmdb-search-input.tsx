import { Search } from 'lucide-react';
import { memo } from 'react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { useTMDBSearch } from './tmdb-search-context';

export const TMDBSearchInput = memo(() => {
	const {
		query,
		setQuery,
		isLoading,
		handleSearch,
		handleKeyDown,
		refs: { searchInputRef },
	} = useTMDBSearch();

	return (
		<div className="flex gap-2">
			<div className="flex-1">
				<Label htmlFor="search-input" className="sr-only">
					Search for movies and TV shows
				</Label>
				<Input
					id="search-input"
					ref={searchInputRef}
					type="text"
					placeholder="Enter movie or TV show title..."
					value={query}
					onChange={(e) => {
						setQuery(e.target.value);
					}}
					onKeyDown={handleKeyDown}
					className="w-full"
					aria-describedby="search-instructions"
					aria-expanded={false}
					aria-haspopup="listbox"
					role="combobox"
					autoComplete="off"
				/>
				<div id="search-instructions" className="sr-only">
					Use arrow keys to navigate results, Enter to select, Escape to close
				</div>
			</div>
			<Button
				onClick={handleSearch}
				disabled={!query.trim() || isLoading}
				aria-label="Search TMDB database"
			>
				<Search className="w-4 h-4 mr-2" />
				Search
			</Button>
		</div>
	);
});
