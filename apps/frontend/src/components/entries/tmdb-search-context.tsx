import { useQuery } from '@tanstack/react-query';
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';
import { type SearchResult, searchTMDB } from '~/lib/api';

interface TMDBSearchState {
	query: string;
	selectedIndex: number;
	announcementMessage: string;
	results: SearchResult[];
	isLoading: boolean;
	isError: boolean;
	error: Error | null;
}

interface TMDBSearchActions {
	setQuery: (query: string) => void;
	setSelectedIndex: (index: number) => void;
	setAnnouncementMessage: (message: string) => void;
	handleSearch: () => void;
	handleKeyDown: (e: React.KeyboardEvent) => void;
	handleSelectResult: (result: SearchResult) => void;
}

interface TMDBSearchRefs {
	searchInputRef: React.RefObject<HTMLInputElement | null>;
	resultsListRef: React.RefObject<HTMLDivElement | null>;
	selectedItemRef: React.RefObject<HTMLDivElement | null>;
}

interface TMDBSearchContextValue extends TMDBSearchState, TMDBSearchActions {
	refs: TMDBSearchRefs;
}

interface TMDBSearchProviderProps {
	children: ReactNode;
	initialQuery?: string;
	onSelectResult?: (result: SearchResult) => void;
	onClose?: () => void;
}

const TMDBSearchContext = createContext<TMDBSearchContextValue | null>(null);

export const useTMDBSearch = () => {
	const context = useContext(TMDBSearchContext);
	if (!context) {
		throw new Error('useTMDBSearch must be used within a TMDBSearchProvider');
	}
	return context;
};

export const TMDBSearchProvider = ({
	children,
	initialQuery = '',
	onSelectResult,
	onClose,
}: TMDBSearchProviderProps) => {
	const [query, setQuery] = useState(initialQuery);
	const [selectedIndex, setSelectedIndex] = useState(-1);
	const [announcementMessage, setAnnouncementMessage] = useState('');

	const searchInputRef = useRef<HTMLInputElement>(null);
	const resultsListRef = useRef<HTMLDivElement>(null);
	const selectedItemRef = useRef<HTMLDivElement>(null);

	const {
		data: results = [],
		isLoading,
		isError,
		error,
		refetch,
	} = useQuery({
		queryKey: ['tmdb-search', query],
		queryFn: () => searchTMDB(query),
		enabled: false, // Manual trigger
	});

	useEffect(() => {
		setSelectedIndex(-1);
	}, []);

	useEffect(() => {
		if (!isLoading && !isError) {
			if (results.length > 0) {
				setAnnouncementMessage(
					`${results.length} result${results.length !== 1 ? 's' : ''} found`,
				);
			} else if (query.trim()) {
				setAnnouncementMessage(`No results found for "${query}"`);
			}
		}
	}, [results, isLoading, isError, query]);

	useEffect(() => {
		if (selectedIndex >= 0 && selectedItemRef.current) {
			selectedItemRef.current.scrollIntoView({
				block: 'nearest',
				behavior: 'smooth',
			});
		}
	}, [selectedIndex]);

	// Actions
	const handleSearch = useCallback(() => {
		if (query.trim()) {
			refetch();
		}
	}, [query, refetch]);

	const handleSelectResult = useCallback(
		(result: SearchResult) => {
			onSelectResult?.(result);
			onClose?.();
		},
		[onSelectResult, onClose],
	);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			switch (e.key) {
				case 'ArrowDown':
					e.preventDefault();
					if (results.length > 0) {
						setSelectedIndex((prev) =>
							prev < results.length - 1 ? prev + 1 : 0,
						);
					}
					break;
				case 'ArrowUp':
					e.preventDefault();
					if (results.length > 0) {
						setSelectedIndex((prev) =>
							prev > 0 ? prev - 1 : results.length - 1,
						);
					}
					break;
				case 'Enter':
					e.preventDefault();
					if (selectedIndex >= 0 && results[selectedIndex]) {
						handleSelectResult(results[selectedIndex]);
					} else if (query.trim()) {
						handleSearch();
					}
					break;
				case 'Escape':
					e.preventDefault();
					onClose?.();
					break;
			}
		},
		[results, selectedIndex, query, handleSelectResult, handleSearch, onClose],
	);

	const contextValue: TMDBSearchContextValue = {
		query,
		selectedIndex,
		announcementMessage,
		results,
		isLoading,
		isError,
		error: error as Error | null,

		setQuery,
		setSelectedIndex,
		setAnnouncementMessage,
		handleSearch,
		handleKeyDown,
		handleSelectResult,

		refs: {
			searchInputRef,
			resultsListRef,
			selectedItemRef,
		},
	};

	return (
		<TMDBSearchContext.Provider value={contextValue}>
			{children}
		</TMDBSearchContext.Provider>
	);
};
