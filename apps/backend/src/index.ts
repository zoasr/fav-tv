import { and, eq, lt } from 'drizzle-orm';
import { type Context, Hono } from 'hono';
import { cors } from 'hono/cors';
import {
	type Genre,
	MovieDb,
	type ProductionCompany,
	type ShowResponse,
	type SimplePerson,
} from 'moviedb-promise';
import { z } from 'zod';
import { auth } from './auth';
import { db } from './db/index';
import { entries } from './db/schema/schema';
import { AppError, sendError } from './errors/error';

let moviedb: MovieDb | undefined;
if (process.env.TMDB_API_KEY) {
	moviedb = new MovieDb(process.env.TMDB_API_KEY);
}

type MovieResult = Exclude<
	Awaited<ReturnType<MovieDb['searchMovie']>>['results'],
	undefined
>[number];
type TVResult = Exclude<
	Awaited<ReturnType<MovieDb['searchTv']>>['results'],
	undefined
>[number];

// Enhanced SearchResult with detailed information for form filling
export type SearchResult = (MovieResult | TVResult) & {
	backdrop: string | null;
	// Additional fields for form auto-fill
	director?: string;
	runtime?: number; // in minutes
	budget?: number;
	status?: string;
	production_countries?: ProductionCompany[];
	genres?: Genre[];
	number_of_seasons?: number;
	number_of_episodes?: number;
	episode_run_time?: number[];
	created_by?: SimplePerson[];
};

const corsOptions = {
	origin: [
		'http://localhost:3000',
		'https://fav-tv.vercel.app',
		process.env.BETTER_AUTH_URL,
	].filter(Boolean) as string[],
	credentials: true,
};

const app = new Hono().use('*', cors(corsOptions));

// better-auth reads Web Standard Request/Response directly, so it mounts
// without an adapter. Registered before any other route.
app.all('/api/auth/*', (c) => auth.handler(c.req.raw));

type Session = typeof auth.$Infer.Session;

type Authed = { session: Session; error?: never };
type Unauthed = { session?: never; error: Response };

const requireSession = async (c: Context): Promise<Authed | Unauthed> => {
	const headers = c.req.raw.headers;
	if (!headers.get('cookie') && !headers.get('authorization')) {
		return { error: sendError(c, 'AUTH_REQUIRED') };
	}

	const session = await auth.api.getSession({ headers });
	if (!session?.user?.id) {
		return {
			error: sendError(c, 'AUTH_INVALID', 'Invalid or expired session'),
		};
	}
	return { session };
};

const EntrySchema = z.object({
	title: z.string().min(1, 'Title is required'),
	type: z.enum(['Movie', 'TV Show']),
	director: z.string().min(1, 'Director is required'),
	budget: z.string().optional(),
	location: z.string().optional(),
	duration: z.string().optional(),
	yearTime: z.string().min(1, 'Year/Time is required'),
	poster: z.string().optional(),
});

app.get('/entries', async (c) => {
	const authed = await requireSession(c);
	if ('error' in authed) return authed.error;
	const userId = authed.session.user.id;
	// ponytail: int4 max — Postgres binds this param as `integer` (column type),
	// so a Date.now() sentinel overflows. serial ids can't exceed it anyway.
	const cursor =
		Number.parseInt(c.req.query('cursor') ?? '', 10) || 2_147_483_647;
	const limit = 20;

	try {
		const results = await db
			.select({
				id: entries.id,
				title: entries.title,
				type: entries.type,
				director: entries.director,
				budget: entries.budget,
				location: entries.location,
				duration: entries.duration,
				yearTime: entries.yearTime,
				poster: entries.poster,
			})
			.from(entries)
			.where(and(eq(entries.userId, userId), lt(entries.id, cursor)))
			.orderBy(entries.id)
			.limit(limit + 1);

		const hasMore = results.length > limit;
		const entriesToReturn = hasMore ? results.slice(0, -1) : results;
		const nextCursor = hasMore
			? entriesToReturn[entriesToReturn.length - 1]?.id
			: null;

		return c.json({
			entries: entriesToReturn,
			pagination: {
				nextCursor,
				hasMore,
			},
		});
	} catch {
		return sendError(c, 'SERVER_ERROR');
	}
});

app.post('/entries', async (c) => {
	const authed = await requireSession(c);
	if ('error' in authed) return authed.error;
	const userId = authed.session.user.id;

	const parsed = EntrySchema.safeParse(await c.req.json());
	if (!parsed.success) {
		return sendError(c, 'VALIDATION_FAILED', parsed.error.message);
	}

	try {
		await db.insert(entries).values({ ...parsed.data, userId });
		return c.json({ message: 'Entry created successfully' }, 201);
	} catch {
		return sendError(c, 'SERVER_ERROR', 'Failed to create entry');
	}
});

app.put('/entries/:id', async (c) => {
	const authed = await requireSession(c);
	if ('error' in authed) return authed.error;
	const userId = authed.session.user.id;

	const id = Number.parseInt(c.req.param('id'), 10);
	if (Number.isNaN(id)) {
		return sendError(c, 'VALIDATION_FAILED', 'Invalid entry ID');
	}

	const parsed = EntrySchema.safeParse(await c.req.json());
	if (!parsed.success) {
		return sendError(c, 'VALIDATION_FAILED', parsed.error.message);
	}

	try {
		const [existingEntry] = await db
			.select()
			.from(entries)
			.where(and(eq(entries.id, id), eq(entries.userId, userId)))
			.limit(1);

		if (!existingEntry) {
			return sendError(c, 'NOT_FOUND', 'Entry not found');
		}

		await db
			.update(entries)
			.set(parsed.data)
			.where(and(eq(entries.id, id), eq(entries.userId, userId)));

		return c.json({ message: 'Entry updated successfully' });
	} catch {
		return sendError(c, 'SERVER_ERROR', 'Failed to update entry');
	}
});

app.delete('/entries/:id', async (c) => {
	const authed = await requireSession(c);
	if ('error' in authed) return authed.error;
	const userId = authed.session.user.id;

	const id = Number.parseInt(c.req.param('id'), 10);
	if (Number.isNaN(id)) {
		return sendError(c, 'VALIDATION_FAILED', 'Invalid entry ID');
	}

	try {
		const [existingEntry] = await db
			.select()
			.from(entries)
			.where(and(eq(entries.id, id), eq(entries.userId, userId)))
			.limit(1);

		if (!existingEntry) {
			return sendError(c, 'NOT_FOUND', 'Entry not found');
		}

		await db
			.delete(entries)
			.where(and(eq(entries.id, id), eq(entries.userId, userId)));

		return c.body(null, 204);
	} catch {
		return sendError(c, 'SERVER_ERROR', 'Failed to delete entry');
	}
});

// -------------------- MOVIE DB -------------------

const getMovieDirector = async (
	movieId: number,
): Promise<string | undefined> => {
	if (!moviedb) return undefined;
	try {
		const credits = await moviedb.movieCredits({ id: movieId });
		const director = credits.crew?.find((person) => person.job === 'Director');
		return director?.name;
	} catch {
		return undefined;
	}
};

const getTVCreators = (tvShow: ShowResponse): string | undefined => {
	return (
		tvShow.created_by?.map((creator) => creator.name).join(', ') || undefined
	);
};

const searchTMDB = async (query: string) => {
	if (!moviedb) {
		return new AppError('SERVER_ERROR');
	}

	try {
		const config = await moviedb.configuration();
		const searchData = await moviedb.searchMulti({ query: query });

		if (!searchData.results?.length) {
			return new AppError(
				'SEARCH_ERROR',
				`Can't find movies or TV shows for with the name: ${query}`,
			);
		}

		const filteredResults = searchData.results
			.filter((result) => !(result.media_type === 'person'))
			.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
			.slice(0, 10);

		const detailedResults = await Promise.all(
			filteredResults.map(async (result): Promise<SearchResult> => {
				const baseResult = {
					...result,
					backdrop:
						config?.images?.poster_sizes &&
						(result.backdrop_path || result.poster_path)
							? `${config.images.secure_base_url}${config.images.poster_sizes[4]}${result.poster_path || result.backdrop_path}`
							: null,
				};

				if (result.media_type === 'movie') {
					try {
						if (!result.id) return baseResult;
						const movieDetails = await moviedb.movieInfo({ id: result.id });
						const director = await getMovieDirector(result.id);

						return {
							...baseResult,
							director,
							runtime: movieDetails.runtime,
							budget: movieDetails.budget,
							status: movieDetails.status,
							production_countries: movieDetails.production_countries,
							genres: movieDetails.genres,
						};
					} catch {
						// If detailed fetch fails, return basic result
						return baseResult;
					}
				} else if (result.media_type === 'tv') {
					try {
						if (!result.id) return baseResult;
						const tvDetails = await moviedb.tvInfo({ id: result.id });
						const creators = getTVCreators(tvDetails);

						return {
							...baseResult,
							director: creators, // Use creators as "director" for TV shows
							status: tvDetails.status,
							production_countries: tvDetails.production_countries,
							genres: tvDetails.genres,
							number_of_seasons: tvDetails.number_of_seasons,
							number_of_episodes: tvDetails.number_of_episodes,
							episode_run_time: tvDetails.episode_run_time,
							created_by: tvDetails.created_by,
						};
					} catch {
						return baseResult;
					}
				}
				return baseResult;
			}),
		);
		return detailedResults;
	} catch (error) {
		console.error('TMDB search error:', error);
		return new AppError('SERVER_ERROR', 'Failed to search TMDB');
	}
};

app.get('/moviedb/search', async (c) => {
	if (!moviedb) return sendError(c, 'SERVER_ERROR');

	const parsed = z.object({ query: z.string() }).safeParse({
		query: c.req.query('query'),
	});
	if (!parsed.success) {
		return sendError(c, 'VALIDATION_FAILED', 'Invalid query parameters');
	}

	const searchResult = await searchTMDB(parsed.data.query);
	if (searchResult instanceof AppError) {
		return sendError(c, searchResult.errorKey, searchResult.message);
	}
	return c.json(searchResult);
});

app.notFound((c) => sendError(c, 'NOT_FOUND', `Route ${c.req.path} not found`));

app.get('/health', (c) => c.json({ status: 'healthy' }));

export default app;
