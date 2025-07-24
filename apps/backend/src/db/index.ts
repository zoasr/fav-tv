import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

dotenv.config();
const poolConnection = mysql.createPool({
	uri: process.env.DATABASE_URL,

	ssl: {
		rejectUnauthorized: false,
	},
});
export const db = drizzle(poolConnection);
