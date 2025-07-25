import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db/index.js";
import {
	account,
	session,
	user,
	verification,
} from "./db/schema/auth-schema.js";

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
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 60 * 60 * 24 * 7, // 7 days
		},
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24, // 1 day
		cookieOptions: {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
			domain: process.env.NODE_ENV === "production" ? undefined : undefined,
		},
	},
	cors: {
		origin: [
			"http://localhost:3000",
			"https://fav-tv.vercel.app",
		],
		credentials: true,
	},
	emailAndPassword: {
		enabled: true,
	},
});
