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

// Custom error classes for better error handling
class AuthError extends Error {
	constructor(
		message: string,
		public code: string = "AUTH_ERROR",
	) {
		super(message);
		this.name = "AuthError";
	}
}

class UnauthorizedError extends AuthError {
	constructor(message: string = "Unauthorized access") {
		super(message, "UNAUTHORIZED");
		this.name = "UnauthorizedError";
	}
}

// Standardized error response format
interface ErrorResponse {
	error: string;
	code: string;
	message: string;
	timestamp: string;
}

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

// Helper function to create standardized error responses
const createErrorResponse = (
	message: string,
	code: string,
	error?: string,
): ErrorResponse => ({
	error: error || message,
	code,
	message,
	timestamp: new Date().toISOString(),
});

// Enhanced auth middleware with better error handling
const authMiddleware = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		// Check for authorization header or cookies
		const headers = fromNodeHeaders(req.headers);

		if (!headers.get("cookie") && !headers.get("authorization")) {
			const errorResponse = createErrorResponse(
				"No authentication credentials provided",
				"MISSING_AUTH_CREDENTIALS",
				"Authentication required",
			);
			return res.status(401).json(errorResponse);
		}

		// Attempt to get session from better-auth
		const session = await auth.api.getSession({ headers });

		if (!session) {
			const errorResponse = createErrorResponse(
				"Invalid or expired session",
				"INVALID_SESSION",
				"Session expired or invalid",
			);
			return res.status(401).json(errorResponse);
		}

		if (!session.user?.id) {
			const errorResponse = createErrorResponse(
				"User information not found in session",
				"INVALID_USER_SESSION",
				"Invalid user session",
			);
			return res.status(401).json(errorResponse);
		}

		// Attach user info to request
		req.user = { id: session.user.id };
		next();
	} catch (error) {
		console.error("Authentication error:", error);

		// Handle specific authentication errors
		if (error instanceof UnauthorizedError || error instanceof AuthError) {
			const errorResponse = createErrorResponse(
				error.message,
				error.code,
				"Authentication failed",
			);
			return res.status(401).json(errorResponse);
		}

		// Generic server error for unexpected issues
		const errorResponse = createErrorResponse(
			"Internal server error during authentication",
			"AUTH_SERVER_ERROR",
			"Authentication service unavailable",
		);
		res.status(500).json(errorResponse);
	}
};

app.use(
	cors({
		origin: [
			"http://localhost:3000",
			"https://fav-tv.vercel.app",
		],
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
		credentials: true,
		optionsSuccessStatus: 200,
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
		// Additional auth check (redundant but explicit)
		if (!req.user?.id) {
			const errorResponse = createErrorResponse(
				"User not authenticated",
				"USER_NOT_AUTHENTICATED",
				"Authentication required to access entries",
			);
			return res.status(401).json(errorResponse);
		}

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

		// Check if it's an auth-related error
		if (error instanceof UnauthorizedError || error instanceof AuthError) {
			const errorResponse = createErrorResponse(
				error.message,
				error.code,
				"Authentication failed while fetching entries",
			);
			return res.status(401).json(errorResponse);
		}

		const errorResponse = createErrorResponse(
			"Failed to fetch entries",
			"FETCH_ENTRIES_ERROR",
			"Internal server error while fetching entries",
		);
		res.status(500).json(errorResponse);
	}
});

// Create a new entry
app.post("/entries", async (req, res) => {
	try {
		// Additional auth check
		if (!req.user?.id) {
			const errorResponse = createErrorResponse(
				"User not authenticated",
				"USER_NOT_AUTHENTICATED",
				"Authentication required to create entries",
			);
			return res.status(401).json(errorResponse);
		}

		const parsed = EntrySchema.safeParse(req.body);
		if (!parsed.success) {
			return res.status(400).json({
				error: "Validation failed",
				code: "VALIDATION_ERROR",
				message: "Request data validation failed",
				details: parsed.error.format(),
				timestamp: new Date().toISOString(),
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

		// Check if it's an auth-related error
		if (error instanceof UnauthorizedError || error instanceof AuthError) {
			const errorResponse = createErrorResponse(
				error.message,
				error.code,
				"Authentication failed while creating entry",
			);
			return res.status(401).json(errorResponse);
		}

		const errorResponse = createErrorResponse(
			"Failed to create entry",
			"CREATE_ENTRY_ERROR",
			"Internal server error while creating entry",
		);
		res.status(500).json(errorResponse);
	}
});

// Update an existing entry
app.put("/entries/:id", async (req, res) => {
	try {
		// Additional auth check
		if (!req.user?.id) {
			const errorResponse = createErrorResponse(
				"User not authenticated",
				"USER_NOT_AUTHENTICATED",
				"Authentication required to update entries",
			);
			return res.status(401).json(errorResponse);
		}

		const id = parseInt(req.params.id);
		if (Number.isNaN(id)) {
			const errorResponse = createErrorResponse(
				"Invalid entry ID format",
				"INVALID_ENTRY_ID",
				"Entry ID must be a valid number",
			);
			return res.status(400).json(errorResponse);
		}

		const parsed = EntrySchema.safeParse(req.body);
		if (!parsed.success) {
			return res.status(400).json({
				error: "Validation failed",
				code: "VALIDATION_ERROR",
				message: "Request data validation failed",
				details: parsed.error.format(),
				timestamp: new Date().toISOString(),
			});
		}

		// First verify the entry exists and belongs to the user
		const [existingEntry] = await db
			.select()
			.from(entries)
			.where(and(eq(entries.id, id), eq(entries.userId, req.user.id)))
			.limit(1);

		if (!existingEntry) {
			const errorResponse = createErrorResponse(
				"Entry not found or access denied",
				"ENTRY_NOT_FOUND_OR_UNAUTHORIZED",
				"The requested entry does not exist or you don't have permission to access it",
			);
			return res.status(404).json(errorResponse);
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

		// Check if it's an auth-related error
		if (error instanceof UnauthorizedError || error instanceof AuthError) {
			const errorResponse = createErrorResponse(
				error.message,
				error.code,
				"Authentication failed while updating entry",
			);
			return res.status(401).json(errorResponse);
		}

		const errorResponse = createErrorResponse(
			"Failed to update entry",
			"UPDATE_ENTRY_ERROR",
			"Internal server error while updating entry",
		);
		res.status(500).json(errorResponse);
	}
});

// Delete an entry
app.delete("/entries/:id", async (req, res) => {
	try {
		// Additional auth check
		if (!req.user?.id) {
			const errorResponse = createErrorResponse(
				"User not authenticated",
				"USER_NOT_AUTHENTICATED",
				"Authentication required to delete entries",
			);
			return res.status(401).json(errorResponse);
		}

		const id = parseInt(req.params.id);
		if (Number.isNaN(id)) {
			const errorResponse = createErrorResponse(
				"Invalid entry ID format",
				"INVALID_ENTRY_ID",
				"Entry ID must be a valid number",
			);
			return res.status(400).json(errorResponse);
		}

		// First verify the entry exists and belongs to the user
		const [existingEntry] = await db
			.select()
			.from(entries)
			.where(and(eq(entries.id, id), eq(entries.userId, req.user.id)))
			.limit(1);

		if (!existingEntry) {
			const errorResponse = createErrorResponse(
				"Entry not found or access denied",
				"ENTRY_NOT_FOUND_OR_UNAUTHORIZED",
				"The requested entry does not exist or you don't have permission to access it",
			);
			return res.status(404).json(errorResponse);
		}

		await db
			.delete(entries)
			.where(and(eq(entries.id, id), eq(entries.userId, req.user.id)));

		res.status(204).send();
	} catch (error) {
		console.error("Error deleting entry:", error);

		// Check if it's an auth-related error
		if (error instanceof UnauthorizedError || error instanceof AuthError) {
			const errorResponse = createErrorResponse(
				error.message,
				error.code,
				"Authentication failed while deleting entry",
			);
			return res.status(401).json(errorResponse);
		}

		const errorResponse = createErrorResponse(
			"Failed to delete entry",
			"DELETE_ENTRY_ERROR",
			"Internal server error while deleting entry",
		);
		res.status(500).json(errorResponse);
	}
});

app.listen(PORT, () =>
	console.log(`Server running on port ${PORT}: http://localhost:${PORT}`),
);
