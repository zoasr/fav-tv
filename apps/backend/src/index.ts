import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import cors from "cors";
import dotenv from "dotenv";
import { and, eq, lt } from "drizzle-orm";
import express, {
	type NextFunction,
	type Request,
	type Response,
} from "express";
import { z } from "zod";
import { auth } from "./auth.js";
import { db } from "./db/index.js";
import { entries } from "./db/schema/schema.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Extend the Express Request type to include user information
declare global {
	namespace Express {
		interface Request {
			user: { id: string };
		}
	}
}

const authMiddleware = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const session = await auth.api.getSession({
			headers: fromNodeHeaders(req.headers),
		});
		if (!session) {
			return res.status(401).json({ error: "Unauthorized - No session found" });
		}
		req.user = { id: session.user.id };
		next();
	} catch (error) {
		console.error("Authentication error:", error);
		res
			.status(500)
			.json({ error: "Internal server error during authentication" });
	}
};

app.use(
	cors({
		origin: [
			"http://localhost:3000",
			"http://localhost:3000/",
			"https://fav-tv.vercel.app/",
			"https://fav-tv.vercel.app",
		],
		methods: ["GET", "POST", "PUT", "DELETE"],
		credentials: true,
	}),
);

// Mount auth routes
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use(express.json());

// Entry validation schema
const EntrySchema = z.object({
	title: z.string().min(1, "Title is required"),
	type: z.enum(["Movie", "TV Show"]),
	director: z.string().min(1, "Director is required"),
	budget: z.string().optional(),
	location: z.string().optional(),
	duration: z.string().optional(),
	yearTime: z.string().min(1, "Year/Time is required"),
});

// Apply auth middleware to all entry routes
app.use("/entries", authMiddleware);

// Get user's entries with pagination
app.get("/entries", async (req, res) => {
	try {
		const cursor = parseInt(req.query.cursor as string) || Date.now();
		const limit = 20;

		const results = await db
			.select()
			.from(entries)
			.where(and(eq(entries.userId, req.user.id), lt(entries.id, cursor)))
			.orderBy(entries.id)
			.limit(limit + 1); // Fetch one extra to check if there are more

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
	} catch (error) {
		console.error("Error fetching entries:", error);
		res.status(500).json({ error: "Failed to fetch entries" });
	}
});

// Create a new entry
app.post("/entries", async (req, res) => {
	try {
		console.log(req.body);
		const parsed = EntrySchema.safeParse(req.body);
		if (!parsed.success) {
			return res.status(400).json({
				error: "Validation failed",
				details: parsed.error.format(),
			});
		}

		const entryData = {
			...parsed.data,
			userId: req.user.id,
		};

		await db.insert(entries).values(entryData);

		res.status(201).json({
			message: "Entry created successfully",
		});
	} catch (error) {
		console.error("Error creating entry:", error);
		res.status(500).json({ error: "Failed to create entry" });
	}
});

// Update an existing entry
app.put("/entries/:id", async (req, res) => {
	try {
		const id = parseInt(req.params.id);
		if (Number.isNaN(id)) {
			return res.status(400).json({ error: "Invalid entry ID" });
		}

		const parsed = EntrySchema.safeParse(req.body);
		if (!parsed.success) {
			return res.status(400).json({
				error: "Validation failed",
				details: parsed.error,
			});
		}

		// First verify the entry exists and belongs to the user
		const [existingEntry] = await db
			.select()
			.from(entries)
			.where(and(eq(entries.id, id), eq(entries.userId, req.user.id)))
			.limit(1);

		if (!existingEntry) {
			return res
				.status(404)
				.json({ error: "Entry not found or access denied" });
		}

		await db
			.update(entries)
			.set(parsed.data)
			.where(and(eq(entries.id, id), eq(entries.userId, req.user.id)));

		res.status(200).json({
			message: "Entry updated successfully",
		});
	} catch (error) {
		console.error("Error updating entry:", error);
		res.status(500).json({ error: "Failed to update entry" });
	}
});

// Delete an entry
app.delete("/entries/:id", async (req, res) => {
	try {
		const id = parseInt(req.params.id);
		if (Number.isNaN(id)) {
			return res.status(400).json({ error: "Invalid entry ID" });
		}

		// First verify the entry exists and belongs to the user
		const [existingEntry] = await db
			.select()
			.from(entries)
			.where(and(eq(entries.id, id), eq(entries.userId, req.user.id)))
			.limit(1);

		if (!existingEntry) {
			return res
				.status(404)
				.json({ error: "Entry not found or access denied" });
		}

		await db
			.delete(entries)
			.where(and(eq(entries.id, id), eq(entries.userId, req.user.id)));

		res.status(204).send();
	} catch (error) {
		console.error("Error deleting entry:", error);
		res.status(500).json({ error: "Failed to delete entry" });
	}
});

app.listen(PORT, () =>
	console.log(`Server running on port ${PORT}: http://localhost:${PORT}`),
);
