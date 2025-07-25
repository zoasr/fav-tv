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
	trustedOrigins: ["http://localhost:3000", "https://fav-tv.vercel.app/"],
	emailAndPassword: {
		enabled: true,
		//...
	},
	//...
});
