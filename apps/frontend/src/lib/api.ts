export type ProductionCompany = {
	name?: string;
	id?: number;
	logo_path?: string;
	origin_country?: string;
};
export type SimplePerson = {
	id?: number;
	credit_id?: string;
	name?: string;
	gender?: number;
	profile_path?: string;
};
export type Genre = {
	id?: number;
	name?: string;
};

export type MovieResult = {
	poster_path?: string;
	adult?: boolean;
	overview?: string;
	release_date?: string;
	genre_ids?: Array<number>;
	id?: number;
	media_type: 'movie';
	original_title?: string;
	original_language?: string;
	title?: string;
	backdrop_path?: string;
	popularity?: number;
	vote_count?: number;
	video?: boolean;
	vote_average?: number;
};
export type TvResult = {
	poster_path?: string;
	popularity?: number;
	id?: number;
	overview?: string;
	backdrop_path?: string;
	vote_average?: number;
	media_type: 'tv';
	first_air_date?: string;
	origin_country?: Array<string>;
	genre_ids?: Array<number>;
	original_language?: string;
	vote_count?: number;
	name?: string;
	original_name?: string;
};
export type SearchResult = (MovieResult | TvResult) & {
	backdrop: string;
	director?: string;
	runtime?: number; // in minutes
	budget?: number;
	status?: string;
	production_countries?: ProductionCompany[];
	genres?: Genre[];
	number_of_seasons?: number;
	number_of_episodes?: number;
	episode_run_time?: number[];
	created_by?: SimplePerson[];
};

export interface SignUpData {
	name: string;
	email: string;
	password: string;
}

export interface SignInData {
	email: string;
	password: string;
}
export interface Entry {
	id?: number;
	title: string;
	type: 'Movie' | 'TV Show';
	director: string;
	budget?: string;
	location?: string;
	duration?: string;
	yearTime: string;
	userId?: string;
}

interface PaginatedResponse<T> {
	entries: T[];
	pagination: {
		nextCursor: number | null;
		hasMore: boolean;
	};
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function getJsonHeaders() {
	return {
		'Content-Type': 'application/json',
	};
}

export async function getEntries(
	cursor?: number,
): Promise<PaginatedResponse<Entry>> {
	const url = new URL('/entries', API_BASE_URL);
	if (cursor) {
		url.searchParams.append('cursor', cursor.toString());
	}

	const response = await fetch(url.toString(), {
		credentials: 'include',
		headers: getJsonHeaders(),
	});

	if (!response.ok) {
		throw new Error(
			`Failed to fetch entries: ${response.status} ${response.statusText}`,
		);
	}

	return response.json();
}

export async function createEntry(entry: Entry): Promise<Entry> {
	const response = await fetch(`${API_BASE_URL}/entries`, {
		method: 'POST',
		headers: getJsonHeaders(),
		credentials: 'include',
		body: JSON.stringify(entry),
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({}));
		throw new Error(error.message || 'Failed to create entry');
	}

	return response.json();
}

export async function updateEntry(id: number, entry: Entry): Promise<Entry> {
	const response = await fetch(`${API_BASE_URL}/entries/${id}`, {
		method: 'PUT',
		headers: getJsonHeaders(),
		credentials: 'include',
		body: JSON.stringify(entry),
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({}));
		throw new Error(error.message || 'Failed to update entry');
	}

	return response.json();
}

export async function deleteEntry(id: number): Promise<void> {
	const response = await fetch(`${API_BASE_URL}/entries/${id}`, {
		method: 'DELETE',
		headers: getJsonHeaders(),
		credentials: 'include',
	});

	if (!response.ok) {
		throw new Error('Failed to delete entry');
	}
}

export async function searchTMDB(query: string): Promise<SearchResult[]> {
	const url = new URL('/moviedb/search', API_BASE_URL);
	url.searchParams.append('query', query);

	const response = await fetch(url.toString(), {
		credentials: 'include',
		headers: getJsonHeaders(),
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({}));
		throw new Error(error.message || 'Failed to search TMDB');
	}

	return response.json();
}
