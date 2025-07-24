import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import cors from "cors";
import dotenv from "dotenv";
import { eq, lt } from "drizzle-orm";
import express, {
	type NextFunction,
	type Request,
	type Response,
} from "express";
import { z } from "zod";
import { auth } from "../auth";
import { db } from "./db";
import { entries } from "./db/schema/schema";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

const authMiddleware = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const session = await auth.api.getSession({
		headers: fromNodeHeaders(req.headers),
	});
	if (!session) return res.status(401).json({ error: "Unauthorized" });
	// req.user = session.user;
	next();
};

app.use(
	cors({
		origin: ["http://localhost:3000", "http://localhost:3000/"], // Replace with your frontend's origin
		methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
		credentials: true, // Allow credentials (cookies, authorization headers, etc.)
	}),
);
// app.use(express.json());

// Mount express json middleware after Better Auth handler
// or only apply it to routes that don't interact with Better Auth
app.all("/api/auth/*splat", toNodeHandler(auth)); // For ExpressJS v5

const EntrySchema = z.object({
	title: z.string(),
	type: z.enum(["Movie", "TV Show"]),
	director: z.string(),
	budget: z.string(),
	location: z.string(),
	duration: z.string(),
	yearTime: z.string(),
});
app.use("/entries", authMiddleware);

app.get("/entries", async (req, res) => {
	const cursor = parseInt(req.query.cursor as string);
	const where = !Number.isNaN(cursor) ? lt(entries.id, cursor) : undefined;
	const results = await db
		.select()
		.from(entries)
		.where(where)
		.orderBy(entries.id)
		.limit(20);
	res.json(results);
});

app.post("/entries", async (req, res) => {
	const parsed = EntrySchema.safeParse(req.body);
	if (!parsed.success) return res.status(400).json(parsed.error);

	const result = await db.insert(entries).values(parsed.data);
	res.json(result);
});

app.put("/entries/:id", async (req, res) => {
	const id = Number(req.params.id);
	const parsed = EntrySchema.safeParse(req.body);
	if (!parsed.success) return res.status(400).json(parsed.error);

	const result = await db
		.update(entries)
		.set(parsed.data)
		.where(eq(entries.id, id));
	res.json(result);
});

app.delete("/entries/:id", async (req, res) => {
	const id = Number(req.params.id);
	await db.delete(entries).where(eq(entries.id, id));
	res.status(204).send();
});

app.listen(PORT, () =>
	console.log(`Server running on port ${PORT}: http://localhost:${PORT}`),
);
