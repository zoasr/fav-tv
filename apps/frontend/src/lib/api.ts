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
	type: "Movie" | "TV Show";
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
		"Content-Type": "application/json",
	};
}

export async function getEntries(
	cursor?: number,
): Promise<PaginatedResponse<Entry>> {
	const url = new URL("/entries", API_BASE_URL);
	if (cursor) {
		url.searchParams.append("cursor", cursor.toString());
	}

	const response = await fetch(url.toString(), {
		credentials: "include",
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
		method: "POST",
		headers: getJsonHeaders(),
		credentials: "include",
		body: JSON.stringify(entry),
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({}));
		throw new Error(error.message || "Failed to create entry");
	}

	return response.json();
}

export async function updateEntry(id: number, entry: Entry): Promise<Entry> {
	const response = await fetch(`${API_BASE_URL}/entries/${id}`, {
		method: "PUT",
		headers: getJsonHeaders(),
		credentials: "include",
		body: JSON.stringify(entry),
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({}));
		throw new Error(error.message || "Failed to update entry");
	}

	return response.json();
}

export async function deleteEntry(id: number): Promise<void> {
	const response = await fetch(`${API_BASE_URL}/entries/${id}`, {
		method: "DELETE",
		headers: getJsonHeaders(),
		credentials: "include",
	});

	if (!response.ok) {
		throw new Error("Failed to delete entry");
	}
}
