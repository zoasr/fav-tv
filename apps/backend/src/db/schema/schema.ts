import { mysqlTable, serial, varchar } from "drizzle-orm/mysql-core";

export const entries = mysqlTable("entries", {
	id: serial("id").primaryKey(),
	title: varchar("title", { length: 255 }),
	type: varchar("type", { length: 32 }), // 'Movie' or 'TV Show'
	director: varchar("director", { length: 255 }),
	budget: varchar("budget", { length: 255 }),
	location: varchar("location", { length: 255 }),
	duration: varchar("duration", { length: 255 }),
	yearTime: varchar("yearTime", { length: 64 }),
});
