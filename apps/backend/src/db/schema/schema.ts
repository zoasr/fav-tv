import { mysqlTable, serial, varchar } from "drizzle-orm/mysql-core";
import { user } from "./auth-schema.js";

export const entries = mysqlTable("entries", {
	id: serial("id").primaryKey(),
	title: varchar("title", { length: 255 }).notNull(),
	type: varchar("type", { length: 32 }).notNull(), // 'Movie' or 'TV Show'
	director: varchar("director", { length: 255 }).notNull(),
	budget: varchar("budget", { length: 255 }),
	location: varchar("location", { length: 255 }),
	duration: varchar("duration", { length: 255 }),
	yearTime: varchar("yearTime", { length: 64 }).notNull(),
	userId: varchar("user_id", { length: 36 })
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});
