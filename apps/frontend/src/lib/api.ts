import { createServerFn } from "@tanstack/react-start";
import { getHeaders } from "@tanstack/react-start/server";
import { authClient } from "~/auth/auth-client";
import { session } from "./../../../backend/src/db/schema/auth-schema";

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

async function getAuthHeaders() {
	const incomingHeaders = getHeaders();
	const headers = new Headers();

	if (incomingHeaders.cookie) {
		headers.set("cookie", incomingHeaders.cookie as string);
	}

	headers.set("Content-Type", "application/json");

	return headers;
}

export const getSession = createServerFn().handler(async () => {
	const session = await authClient.getSession({
		fetchOptions: {
			headers: await getAuthHeaders(),
		},
	});
	console.log(session);
	return session;
});

export const signUp = createServerFn({ method: "POST" })
	.validator((entries: SignUpData) => {
		if (!entries.name || !entries.email || !entries.password) {
			throw new Error("Missing required fields");
		}
		return entries;
	})
	.handler(async ({ data }) => {
		const response = await authClient.signUp.email({
			name: data.name,
			email: data.email,
			password: data.password,
		});
		console.log(response);

		return response;
	});

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getEntries = createServerFn()
	.validator((cursor?: number) => cursor)
	.handler(
		async ({
			data: cursor,
		}: {
			data?: number;
		}): Promise<PaginatedResponse<Entry>> => {
			const url = new URL("/entries", API_BASE_URL);
			if (cursor) {
				url.searchParams.append("cursor", cursor.toString());
			}

			const response = await fetch(url.toString(), {
				credentials: "include",
				headers: await getAuthHeaders(),
			});

			if (!response.ok) {
				throw new Error(
					`Failed to fetch entries: ${response.status} ${response.statusText}`,
				);
			}

			return response.json();
		},
	);

export const createEntry = createServerFn({ method: "POST" })
	.validator((entry: Entry) => entry)
	.handler(async ({ data: entry }: { data: Entry }): Promise<Entry> => {
		const response = await fetch(`${API_BASE_URL}/entries`, {
			method: "POST",
			headers: await getAuthHeaders(),
			body: JSON.stringify(entry),
		});

		if (!response.ok) {
			const error = await response.json().catch(() => ({}));
			throw new Error(error.message || "Failed to create entry");
		}

		return response.json();
	});

export const updateEntry = createServerFn({ method: "POST" })
	.validator((data: { id: number; entry: Entry }) => data)
	.handler(async ({ data }): Promise<Entry> => {
		const { id, entry } = data;
		const response = await fetch(`${API_BASE_URL}/entries/${id}`, {
			method: "PUT",
			headers: await getAuthHeaders(),
			body: JSON.stringify(entry),
		});

		if (!response.ok) {
			const error = await response.json().catch(() => ({}));
			throw new Error(error.message || "Failed to update entry");
		}

		return response.json();
	});

export const deleteEntry = createServerFn({ method: "POST" })
	.validator((id: number) => id)
	.handler(async ({ data: id }): Promise<void> => {
		const response = await fetch(`${API_BASE_URL}/entries/${id}`, {
			method: "DELETE",
			credentials: "include",
			headers: await getAuthHeaders(),
		});

		if (!response.ok) {
			throw new Error("Failed to delete entry");
		}
	});
