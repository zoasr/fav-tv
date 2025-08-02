# Backend API - Favorite Movies & TV Shows

A RESTful API built with Express.js, TypeScript, and Drizzle ORM for managing favorite movies and TV shows with user authentication.

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MySQL with Drizzle ORM
- **Movie Database**: The Movie Database (TMDB)
- **Authentication**: better-auth (cookie-based sessions)
- **Validation**: Zod schemas
- **Development**: tsx for hot reloading

## Quick Start

### Prerequisites

- Node.js 18+ installed
- pnpm package manager
- MySQL database instance

### 1. Environment Setup

Create `.env` file in the backend directory:

```env
BETTER_AUTH_SECRET="your-32-character-secret-key-here"
BETTER_AUTH_URL="http://localhost:3241"
TMDB_API_KEY="your-tmdb-api-key-here"
DATABASE_URL="mysql://user:password@host:port/database"
PORT=3241
```

### 2. Install Dependencies

```bash
cd apps/backend
pnpm install
```

### 3. Database Setup

```bash
# Generate database migrations
pnpm db:generate

# Run migrations
pnpm db:migrate
```

### 4. Start Development Server

```bash
pnpm dev
```

The API will be available at `http://localhost:3241`

## Project Structure

```
apps/backend/
├── src/
│   ├── auth.ts              # better-auth configuration
│   ├── index.ts             # Main Express server
│   └── db/
│       ├── index.ts         # Database connection
│       └── schema/
│           ├── auth-schema.ts    # Authentication tables
│           └── schema.ts         # Application tables
├── drizzle/                 # Database migrations
├── auth-client.ts           # Shared auth client
├── drizzle.config.ts        # Drizzle ORM configuration
├── package.json
└── tsconfig.json
```

## Authentication

### Overview

This API uses [better-auth](https://github.com/better-auth/better-auth) for secure authentication with:

- Cookie-based sessions (HTTP-only, secure)
- Email/password authentication
- Automatic session management
- CSRF protection
- Type-safe client/server integration

### Authentication Endpoints

#### Sign Up

```http
POST /api/auth/sign-up/email
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**

```json
{
	"user": {
		"id": "user_123",
		"email": "user@example.com",
		"name": "John Doe",
		"createdAt": "2024-01-01T00:00:00.000Z"
	},
	"session": {
		"id": "session_123",
		"userId": "user_123",
		"expiresAt": "2024-02-01T00:00:00.000Z"
	}
}
```

#### Sign In

```http
POST /api/auth/sign-in/email
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Session

```http
GET /api/auth/session
Cookie: better-auth-session=session_token
```

#### Sign Out

```http
POST /api/auth/sign-out
Cookie: better-auth-session=session_token
```

## API Reference

### Base URL

- Development: `http://localhost:3241`
- Production: `https://your-backend.railway.app`

### Authentication Required

All `/entries/*` endpoints require authentication via session cookie.

### Entries Endpoints

#### Get Entries (with pagination)

```http
GET /entries?cursor=<cursor>&limit=<limit>
Cookie: better-auth-session=session_token
```

**Query Parameters:**

- `cursor` (optional): Cursor for pagination
- `limit` (optional): Number of items (default: 10, max: 50)

**Response:**

```json
{
	"entries": [
		{
      "id": 18,
      "title": "Community",
      "type": "TV Show",
      "director": "Dan Harmon",
      "budget": "$120M",
      "location": "United States of America",
      "duration": "30m/ep",
      "yearTime": "2009"
    },
	],
	"nextCursor": "next_cursor_value",
	"hasMore": true
}
```

#### Create Entry

```http
POST /entries
Content-Type: application/json
Cookie: better-auth-session=session_token

{
  "title": "The Matrix",
  "type": "movie",
  "director": "The Wachowskis",
  "budget": "$65M",
  "location": "United States of America",
  "duration": "136m",
  "yearTime": "1999"
}
```

**Response:**

```json
{
  message: "Entry created successfully",
}
```

#### Update Entry

```http
PUT /entries/:id
Content-Type: application/json
Cookie: better-auth-session=session_token

{
  "title": "The Matrix Reloaded",
  "director": "The Wachowskis",
  "budget": "$65M",
  "location": "United States of America",
  "duration": "136m",
  "yearTime": "1999"
}
```

**Response:**

```json
{
  message: "Entry updated successfully"
}
```

#### Delete Entry

```http
DELETE /entries/:id
Cookie: better-auth-session=session_token
```

**Response:**

```curl
HTTP/1.1 204 No Content
```

### Error Responses

The API returns consistent error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "message": "Error message",
  "timestamp": "2025-08-02T14:46:03.496Z"
}
```

**Common HTTP Status Codes:**

- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (not authorized)
- `404` - Not Found
- `500` - Internal Server Error

## Development

### Available Scripts

```bash
# Development with hot reload
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Generate database migrations
pnpm db:generate

# Run database migrations
pnpm db:migrate

# Generate better-auth schema
pnpm auth:generate

# Run better-auth migrations
pnpm auth:migrate
```

### Environment Variables

#### Required Variables

- `BETTER_AUTH_SECRET`: 32-character secret for auth encryption
- `BETTER_AUTH_URL`: Base URL where auth endpoints are accessible
- `TMDB_API_KEY`: Your API key for The Movie Database (TMDB).
- `DATABASE_URL`: MySQL connection string
- `PORT`: Server port (default: 3241)

##### Getting a TMDB API Key

1.  Create an account on the [TMDB website](https://www.themoviedb.org/signup).
2.  Go to your account settings and click on the "API" tab.
3.  Request an API key. You will need to provide some basic information about your application.
4.  Once you have your API key, add it to your `.env` file in this directory (`apps/backend/.env`).

#### Optional Variables

- `NODE_ENV`: Environment mode (development/production)
- `CORS_ORIGIN`: Allowed CORS origins (default: frontend URL)

### Database Migrations

When you modify the database schema:

1. Update schema files in `src/db/schema/`
2. Generate migration: `pnpm db:generate`
3. Review generated migration in `drizzle/` folder
4. Apply migration: `pnpm db:migrate`

### Adding New Endpoints

1. Create route handler in `src/index.ts`
2. Add Zod validation schemas
3. Implement database queries using Drizzle ORM
4. Add proper error handling
5. Update this documentation

Example:

```typescript
// Add to src/index.ts
app.get("/api/stats", requireAuth, async (req, res) => {
	try {
		const userId = req.user!.id;

		const stats = await db
			.select({
				totalEntries: count(entries.id),
				avgRating: avg(entries.rating),
			})
			.from(entries)
			.where(eq(entries.userId, userId));

		res.json(stats[0]);
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch stats" });
	}
});
```

## Deployment (Railway)

### Quick Deploy to Railway

1. **Connect Repository**

```bash
# Push your code to GitHub
git push origin main
```

2. **Create Railway Project**
    - Visit [Railway](https://railway.app)
    - Click "Deploy from GitHub repo"
    - Select your repository

3. **Configure Service**
    - Root Directory: `apps/backend`
    - Build Command: `npm run db:migrate`
    - Start Command: `npm run start`

4. **Add Database**
    - In Railway dashboard: Add MySQL database
    - Note the connection details

5. **Environment Variables**

```env
BETTER_AUTH_SECRET=your-production-secret-32-chars
BETTER_AUTH_URL=https://your-backend.railway.app
DATABASE_URL=${{MySQL.DATABASE_URL}}
PORT=${{PORT}}
NODE_ENV=production
```

6. **Run Migrations**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and connect
railway login
railway link

# Run migrations
railway run npm db:migrate
```

### Production Considerations

#### Security

- Use strong `BETTER_AUTH_SECRET` (32+ characters)
- Enable HTTPS in production
- Configure CORS properly
- Set secure cookie options
- Use environment variables for all secrets

#### Performance

- Enable database connection pooling
- Add request rate limiting
- Implement caching for frequently accessed data
- Monitor database query performance

#### Monitoring

- Set up health check endpoint: `GET /health`
- Monitor error rates and response times
- Set up log aggregation
- Configure alerts for downtime

### Health Check Endpoint

The API includes a health check endpoint:

```http
GET /health
```

**Response:**

```json
{
	"status": "healthy",
	"timestamp": "2024-01-01T00:00:00.000Z",
	"uptime": 12345,
	"database": "connected"
}
```

## Troubleshooting

### Common Issues

#### Database Connection Errors

```
Error: connect ECONNREFUSED
```

- Check `DATABASE_URL` format
- Verify MySQL service is running
- Ensure network connectivity to database

#### Authentication Errors

```
Error: Invalid session
```

- Verify `BETTER_AUTH_SECRET` is set correctly
- Check `BETTER_AUTH_URL` matches deployment URL
- Ensure cookies are being sent with requests

#### Migration Errors

```
Error applying migration
```

- Check database permissions
- Verify migration syntax
- Review database logs

#### Build Errors

```
TypeScript compilation errors
```

- Run `pnpm build` locally to check for errors
- Verify all dependencies are listed in `package.json`
- Check TypeScript configuration

### Debugging

Enable debug logging:

```bash
# Development
DEBUG=* pnpm dev

# Production
NODE_ENV=development pnpm start
```

### Getting Help

- Check [better-auth documentation](https://better-auth.com)
- Review [Drizzle ORM docs](https://orm.drizzle.team)
- Check [Railway deployment guides](https://docs.railway.app)
- Open an issue in the project repository

## 📝 License

This project is licensed under the ISC License.
