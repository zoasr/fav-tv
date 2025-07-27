import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import cors from "cors";
import dotenv from "dotenv";
import { and, eq, lt } from "drizzle-orm";
import express, { type Request, type Response } from "express";
import { z } from "zod";
import { auth } from "./auth.js";
import { db } from "./db/index.js";
import { entries } from "./db/schema/schema.js";
import { AppError, sendError } from "./errors/error.js";

dotenv.config();
export const app = express();
export const PORT = process.env.PORT || 3241;
app.set("trust proxy", 1);

const checkAuth = async (req: Request, res: Response) => {
	const headers = fromNodeHeaders(req.headers);

	if (!headers.get("cookie") && !headers.get("authorization")) {
		sendError(res, "AUTH_REQUIRED");
		return null;
	}

	const session = await auth.api.getSession({ headers });

	if (!session || !session.user?.id) {
		// return new AppError("AUTH_INVALID", "Invalid or expired session");
		sendError(res, "AUTH_INVALID", "Invalid or expired session");
		return null;
	}
	return session;
};

const corsOptions = {
	origin: ["http://localhost:3000", "https://fav-tv.vercel.app"],
	credentials: true,
};

app.use(cors(corsOptions));

app.all("/api/auth/*splat", toNodeHandler(auth));
app.use(express.json());

const EntrySchema = z.object({
	title: z.string().min(1, "Title is required"),
	type: z.enum(["Movie", "TV Show"]),
	director: z.string().min(1, "Director is required"),
	budget: z.string().optional(),
	location: z.string().optional(),
	duration: z.string().optional(),
	yearTime: z.string().min(1, "Year/Time is required"),
});

app.get("/entries", async (req: Request, res: Response) => {
	const session = await checkAuth(req, res);
	if (!session) return;
	const userId = session.user.id;
	const cursor = parseInt(req.query.cursor as string) || Date.now();
	const limit = 20;

	try {
		const results = await db
			.select()
			.from(entries)
			.where(and(eq(entries.userId, userId), lt(entries.id, cursor)))
			.orderBy(entries.id)
			.limit(limit + 1);

		const hasMore = results.length > limit;
		const entriesToReturn = hasMore ? results.slice(0, -1) : results;
		const nextCursor = hasMore
			? entriesToReturn[entriesToReturn.length - 1]?.id
			: null;

		res.json({
			entries: entriesToReturn,
			pagination: {
				nextCursor,
				hasMore,
			},
		});
	} catch {
		return sendError(res, "SERVER_ERROR");
	}
});

app.post("/entries", async (req: Request, res: Response) => {
	const session = await checkAuth(req, res);
	if (!session) return;
	const userId = session.user.id;
	const parsed = EntrySchema.safeParse(req.body);
	if (!parsed.success) {
		sendError(res, "VALIDATION_FAILED", parsed.error.message);
		return;
	}

	try {
		const entryData = {
			...parsed.data,
			userId: userId,
		};

		await db.insert(entries).values(entryData);

		res.status(201).json({
			message: "Entry created successfully",
		});
	} catch {
		sendError(res, "SERVER_ERROR", "Failed to create entry");
		return;
	}
});

app.put("/entries/:id", async (req: Request, res: Response) => {
	const session = await checkAuth(req, res);
	if (!session) return;
	const userId = session.user.id;
	const id = parseInt(req.params.id);
	if (Number.isNaN(id)) {
		sendError(res, "VALIDATION_FAILED", "Invalid entry ID");
		return;
	}

	const parsed = EntrySchema.safeParse(req.body);
	if (!parsed.success) {
		sendError(res, "VALIDATION_FAILED", parsed.error.message);
		return;
	}

	try {
		const [existingEntry] = await db
			.select()
			.from(entries)
			.where(and(eq(entries.id, id), eq(entries.userId, userId)))
			.limit(1);

		if (!existingEntry) {
			throw new AppError("NOT_FOUND", "Entry not found");
		}

		await db
			.update(entries)
			.set(parsed.data)
			.where(and(eq(entries.id, id), eq(entries.userId, userId)));

		res.json({
			message: "Entry updated successfully",
		});
	} catch (err) {
		if (err instanceof AppError) {
			throw err;
		}
		throw new AppError("SERVER_ERROR", "Failed to update entry");
	}
});

app.delete("/entries/:id", async (req: Request, res: Response) => {
	const session = await checkAuth(req, res);
	if (!session) return;
	const userId = session.user.id;
	const id = parseInt(req.params.id);
	if (Number.isNaN(id)) {
		sendError(res, "VALIDATION_FAILED", "Invalid entry ID");
		return;
	}

	try {
		const [existingEntry] = await db
			.select()
			.from(entries)
			.where(and(eq(entries.id, id), eq(entries.userId, userId)))
			.limit(1);

		if (!existingEntry) {
			throw new AppError("NOT_FOUND", "Entry not found");
		}

		await db
			.delete(entries)
			.where(and(eq(entries.id, id), eq(entries.userId, userId)));

		res.status(204).send();
	} catch {
		sendError(res, "SERVER_ERROR", "Failed to delete entry");
	}
});

// 404 handler
app.use((req: Request, res: Response) => {
	sendError(res, "NOT_FOUND", `Route ${req.originalUrl} not found`);
});
app.listen(PORT, () =>
	console.log(`Server running on port ${PORT}: http://localhost:${PORT}`),
);
