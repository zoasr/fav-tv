import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
	baseURL: import.meta.env.VITE_API_BASE_URL,
	fetchOptions: {
		credentials: 'include',
	},
});
