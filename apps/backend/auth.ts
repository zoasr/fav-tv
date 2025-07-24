import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./src/db";
import {
	account,
	session,
	user,
	verification,
} from "./src/db/schema/auth-schema";

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
	trustedOrigins: ["http://localhost:3000"],
	emailAndPassword: {
		enabled: true,
		//...
	},
	//...
});
