import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import cors from "cors";
import dotenv from "dotenv";
import { and, eq, lt } from "drizzle-orm";
import express, {
	type NextFunction,
	type Request,
	type Response,
} from "express";
import { MovieDb, type MovieResult, type TvResult } from "moviedb-promise";
import { z } from "zod";
import { auth } from "./auth.js";
import { db } from "./db/index.js";
import { entries } from "./db/schema/schema.js";
import { AppError, sendError } from "./errors/error.js";

dotenv.config();
export const app = express();
export const PORT = process.env.PORT || 3241;
const TMDB_API_KEY = process.env.TMDB_API_KEY;
let moviedb: MovieDb | undefined;
if (TMDB_API_KEY) {
	moviedb = new MovieDb(TMDB_API_KEY);
}

export type SearchResult = MovieResult | TvResult;

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

app.set("trust proxy", 1);
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

// -------------------- MOVIE DB -------------------

const searchTMDB = async (res: Response, query: string) => {
	if (!moviedb) {
		return new AppError("SERVER_ERROR");
	}
	const config = await moviedb.configuration();
	const data = await moviedb.searchMulti({ query: query });
	if (!data.results?.length) {
		return new AppError("SEARCH_ERROR");
	}
	const results_with_posters = data.results
		.filter((result) => !(result.media_type === "person"))
		.map((result) => ({
			...result,
			backdrop: config?.images?.poster_sizes
				? `${config.images.secure_base_url}${config.images.poster_sizes[3]}${result.poster_path || result.backdrop_path}`
				: "",
		}))
		.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

	return results_with_posters;
};
const queryParamsSchema = z.object({
	query: z.string(),
});
const validateSearchParams = (schema: z.ZodTypeAny) => {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			schema.parse(req.query);
			next();
		} catch (error) {
			if (error instanceof z.ZodError) {
				res.status(400).json({
					message: "Invalid query parameters",
					errors: z.treeifyError(error),
				});
			} else {
				next(error);
			}
		}
	};
};

app.get(
	"/moviedb/search",
	validateSearchParams(queryParamsSchema),
	async (req: Request, res: Response) => {
		if (!moviedb) return sendError(res, "SERVER_ERROR");
		const { query } = req.query;
		if (!query)
			return sendError(res, "VALIDATION_FAILED", "query parameter is required");
		const searchResult = await searchTMDB(res, query as string);
		if (searchResult instanceof AppError)
			return sendError(res, searchResult.errorKey, searchResult.message);
		res.json(searchResult);
	},
);

// 404 handler
app.use((req: Request, res: Response) => {
	sendError(res, "NOT_FOUND", `Route ${req.originalUrl} not found`);
});
app.listen(PORT, () =>
	console.log(`Server running on port ${PORT}: http://localhost:${PORT}`),
);
