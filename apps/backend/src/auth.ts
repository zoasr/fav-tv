import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db/index.js";
import {
	account,
	session,
	user,
	verification,
} from "./db/schema/auth-schema.js";

const isProduction = process.env.NODE_ENV === "production";

const sessionCookieConfig: {
	sameSite: "none";
	secure: boolean;
	httpOnly: true;
	path: string;
} = {
	sameSite: "none",
	secure: isProduction,
	httpOnly: true,
	path: "/",
};
console.log("Session cookie config:", sessionCookieConfig);

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "mysql",
		schema: {
			user,
			session,
			account,
			verification,
		},
	}),
	trustedOrigins: [
		"http://localhost:3000",
		"https://fav-tv.vercel.app",
		process.env.BETTER_AUTH_URL || "http://localhost:3241",
	],
	advanced: {
		cookies: {
			sessionToken: {
				name: "better-auth.session-token",
				attributes: sessionCookieConfig,
			},
		},
	},
	emailAndPassword: {
		enabled: true,
	},
});
