import { createAuthClient } from "better-auth/client";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "./src/auth.js";

export const authClient = createAuthClient({
	baseURL: `http://localhost:${process.env.PORT || 3000}`,
	plugins: [inferAdditionalFields<typeof auth>()],
});
