import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
	dialect: "mysql",
	schema: "./src/db/schema",
	dbCredentials: {
		// biome-ignore lint/style/noNonNullAssertion: env variable exists
		url: process.env.DATABASE_URL!,
	},
});
