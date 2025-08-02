/** biome-ignore-all lint/a11y/useSemanticElements: element roles */
/** biome-ignore-all lint/a11y/noNoninteractiveElementToInteractiveRole: element roles */
import {
	Calendar as CalendarIcon,
	Film as FilmIcon,
	Star as StarIcon,
	Tv as TvIcon,
} from 'lucide-react';
import { memo } from 'react';
import type { SearchResult } from '~/lib/api';
import { useTMDBSearch } from './tmdb-search-context';

const Calendar = memo(CalendarIcon);
const Film = memo(FilmIcon);
const Star = memo(StarIcon);
const Tv = memo(TvIcon);

const getTitle = (result: SearchResult) => {
	return result.media_type === 'movie' ? result.title : result.original_name;
};

const getYear = (result: SearchResult) => {
	const date =
		result.media_type === 'movie' ? result.release_date : result.first_air_date;
	return date ? new Date(date).getFullYear() : null;
};

const getTypeLabel = (result: SearchResult) => {
	return result.media_type === 'movie' ? 'Movie' : 'TV Show';
};

const SearchCard = memo(({ result }: { result: SearchResult }) => {
	const {
		results,
		selectedIndex,
		setSelectedIndex,
		handleSelectResult,
		refs: { selectedItemRef },
	} = useTMDBSearch();

	const index = results.indexOf(result);
	const isSelected = index === selectedIndex;

	const title = getTitle(result);
	const year = getYear(result);
	const type = getTypeLabel(result);

	return (
		<article
			key={result.id}
			ref={isSelected ? selectedItemRef : undefined}
			role="option"
			aria-selected={isSelected}
			aria-describedby={`result-${result.id}-description`}
			className={`
				p-4 border rounded-lg cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring
				${
					isSelected
						? 'bg-accent border-accent-foreground'
						: 'hover:bg-accent/50'
				}
			`}
			onClick={() => handleSelectResult(result)}
			onKeyDown={(event) => {
				if (event.key === 'Enter') {
					handleSelectResult(result);
				}
			}}
			onMouseEnter={() => setSelectedIndex(index)}
			onFocus={() => setSelectedIndex(index)}
			tabIndex={isSelected ? 0 : -1}
		>
			<div className="flex gap-4">
				{result.backdrop && (
					<img
						src={result.backdrop}
						alt=""
						className="w-16 h-24 object-cover rounded flex-shrink-0"
						loading="lazy"
					/>
				)}
				<div className="flex-1 min-w-0">
					<div className="flex items-start gap-2 mb-2">
						{result.media_type === 'movie' ? (
							<Film
								className="w-4 h-4 mt-1 text-blue-600 flex-shrink-0"
								aria-hidden="true"
							/>
						) : (
							<Tv
								className="w-4 h-4 mt-1 text-green-600 flex-shrink-0"
								aria-hidden="true"
							/>
						)}
						<div className="flex-1 min-w-0">
							<h3 className="font-semibold text-lg leading-tight truncate">
								{title}
							</h3>
							<div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
								<span className="font-medium">{type}</span>
								{year && (
									<>
										<Calendar className="w-3 h-3" aria-hidden="true" />
										<span>{year}</span>
									</>
								)}
								{result.vote_average && result.vote_average > 0 && (
									<>
										<Star
											className="w-3 h-3 fill-yellow-400 text-yellow-400"
											aria-hidden="true"
										/>
										<span>{result.vote_average.toFixed(1)}</span>
									</>
								)}
							</div>
						</div>
					</div>
					{result.overview && (
						<p
							className="text-sm text-muted-foreground line-clamp-2"
							id={`result-${result.id}-description`}
						>
							{result.overview}
						</p>
					)}
				</div>
			</div>
		</article>
	);
});

export const TMDBSearchResults = () => {
	const {
		query,
		results,
		isLoading,
		isError,
		error,
		announcementMessage,
		refs: { resultsListRef },
	} = useTMDBSearch();

	return (
		<>
			<div
				aria-live="polite"
				aria-atomic="true"
				className="sr-only"
				id="search-status"
			>
				{announcementMessage}
			</div>

			<div
				ref={resultsListRef}
				className="flex-1 overflow-y-auto min-h-0"
				role="listbox"
				aria-label="Search results"
				aria-describedby="search-status"
			>
				{isLoading && (
					<output
						className="flex items-center justify-center py-8"
						aria-live="polite"
					>
						<div className="text-muted-foreground">Searching...</div>
					</output>
				)}

				{isError && (
					<output
						className="flex items-center justify-center py-8 text-red-600"
						role="alert"
					>
						Error: {error instanceof Error ? error.message : 'Failed to search'}
					</output>
				)}

				{!isLoading && !isError && results.length === 0 && query && (
					<output className="flex items-center justify-center py-8 text-muted-foreground">
						No results found for "{query}"
					</output>
				)}

				{!isLoading && !isError && results.length === 0 && !query && (
					<output className="flex items-center justify-center py-8 text-muted-foreground">
						Enter a search term to find movies and TV shows
					</output>
				)}

				{results.length > 0 && (
					<div className="space-y-2" role="none">
						{results.map((result) => {
							return <SearchCard result={result} key={result.id} />;
						})}
					</div>
				)}
			</div>

			{results.length > 0 && (
				<output
					className="text-sm text-muted-foreground text-center border-t pt-2"
					aria-live="polite"
				>
					Found {results.length} result{results.length !== 1 ? 's' : ''}. Use
					arrow keys to navigate, Enter to select.
				</output>
			)}
		</>
	);
};
