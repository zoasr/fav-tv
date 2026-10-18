import dotenv from "dotenv";
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

dotenv.config();

export default defineConfig({
	dialect: "postgresql",
	schema: "./src/db/schema",
	dbCredentials: {
		// Direct (unpooled) URL: drizzle-kit runs migrations inside a
		// transaction, which the pgbouncer endpoint handles poorly.
		// biome-ignore lint/style/noNonNullAssertion: env variable exists
		url: process.env.DATABASE_URL!,
	},
});
