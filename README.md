# Favorite Movies & TV Shows App

A full-stack web application to manage a personal list of favorite movies and TV shows with user authentication and a modern UI.

## Tech Stack

### Frontend
- **Framework**: [TanStack Start](https://tanstack.com/start) (React-based)
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: TailwindCSS + Shadcn UI components
- **State Management**: TanStack Query for server state
- **Routing**: TanStack Router

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database ORM**: Drizzle ORM
- **Validation**: Zod schemas
- **Authentication**: [better-auth](https://github.com/better-auth/better-auth)

### Database & Infrastructure
- **Database**: MySQL (hosted on Railway)
- **Package Manager**: pnpm
- **Monorepo**: Turborepo for workspace management
- **Code Quality**: Biome for linting and formatting

## Quick Start

### Prerequisites
- Node.js 18+ installed
- pnpm package manager
- MySQL database (we'll use Railway)

### 1. Clone the Repository
```bash
git clone https://github.com/zoasr/fav-tv.git
cd favorite-tv
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Database Setup (Railway)
1. Visit [Railway](https://railway.app) and create a new project
2. Add a MySQL database service to your project
3. Copy the connection string from the MySQL service
4. Create environment files (see Environment Configuration below)

### 4. Environment Configuration

#### Backend Environment Variables
Create `apps/backend/.env`:
```env
BETTER_AUTH_SECRET="your-32-character-secret-key-here"
BETTER_AUTH_URL="http://localhost:3241"
TMDB_ACCESS_TOKEN="[YOUR_ACCESS_TOKEN]"
TMDB_API_KEY="[YOUR_API_KEY]"
DATABASE_URL="mysql://user:password@host:port/database"
PORT=3241
```

#### Frontend Environment Variables
Create `apps/frontend/.env`:
```env
VITE_API_BASE_URL="http://localhost:3241"
```

### 5. Database Migration
```bash
pnpm migrate:backend
```

### 6. Start Development Servers

Option A - Start both services together:
```bash
pnpm dev
```

Option B - Start services individually:
```bash
# Terminal 1 - Backend
cd apps/backend
pnpm dev

# Terminal 2 - Frontend
cd apps/frontend
pnpm dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3241

## Authentication System

This app uses [better-auth](https://github.com/better-auth/better-auth) for secure, modern authentication:

### Features:
- Cookie-based sessions (secure, HTTP-only)
- Email/password authentication
- Session management with automatic renewal
- CSRF protection built-in
- Type-safe client and server integration

### API Endpoints:
- `POST /api/auth/sign-up` - User registration
- `POST /api/auth/sign-in` - User login
- `GET /api/auth/session` - Get current session
- `POST /api/auth/sign-out` - User logout

### Protected Routes:
- All `/api/entries/*` endpoints require authentication
- Frontend automatically redirects to sign-in for protected routes

## Features

### Core Functionality
- ✅ **CRUD Operations**: Add, edit, delete favorite movies/TV shows
- ✅ **Infinite Scroll**: Cursor-based pagination for performance
- ✅ **Responsive Design**: Works seamlessly on desktop and mobile
- ✅ **Real-time Updates**: Optimistic updates with TanStack Query
- ✅ **Form Validation**: Client and server-side validation with Zod
- ✅ **Error Handling**: Comprehensive error boundaries and user feedback

### User Experience
- Modern, clean interface with Shadcn UI components
- Smooth animations and transitions
- Loading states and skeleton screens
- Toast notifications for user actions
- Accessible design patterns

## Development

### Available Scripts

#### Root Level Commands
```bash
pnpm dev              # Start all services in development
pnpm build            # Build all apps and packages
pnpm lint             # Lint all code
pnpm format           # Format code with Prettier
pnpm check-types      # Type check all TypeScript code
```

#### Backend Specific
```bash
pnpm build:backend    # Build backend only
pnpm start:backend    # Start production backend
pnpm migrate:backend  # Run database migrations
```

#### Frontend Specific
```bash
pnpm build:frontend   # Build frontend only
```

### Project Structure
```
favorite-tv/
├── apps/
│   ├── backend/           # Express.js API server
│   │   ├── src/
│   │   │   ├── auth.ts    # Authentication setup
│   │   │   ├── db/        # Database configuration and schema
│   │   │   └── index.ts   # Main server file
│   │   └── drizzle/       # Database migrations
│   └── frontend/          # TanStack Start React app
│       ├── src/
│       │   ├── components/ # Reusable UI components
│       │   ├── routes/     # Application routes
│       │   ├── lib/        # Utilities and API client
│       │   └── auth/       # Authentication client
│       └── public/         # Static assets
├── packages/
│   └── biome-config/      # Shared linting configuration
└── turbo.json             # Turborepo configuration
```

## Deployment

### Production Deployment Guide

This application is designed to be deployed with:
- **Frontend**: Vercel (recommended) or Netlify
- **Backend**: Railway (recommended) or any Node.js hosting
- **Database**: Railway MySQL or any MySQL-compatible service

### Backend Deployment (Railway)

#### Step 1: Setup Railway Project
1. Visit [Railway](https://railway.app) and sign in with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your forked repository
4. Railway will automatically detect the monorepo structure

#### Step 2: Configure Backend Service
1. In Railway dashboard, you'll see your project
2. Click "+ New" → "Database" → "MySQL" to add a database
3. Click "+ New" → "GitHub Repo" → Select your repo again for the backend service
4. In the backend service settings:
   - **Root Directory**: `apps/backend`
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `pnpm start`
   - **Node Version**: 18+ (set in Railway settings)

#### Step 3: Environment Variables (Backend)
In Railway backend service, add these environment variables:
```env
BETTER_AUTH_SECRET=your-super-secret-32-character-key-here
BETTER_AUTH_URL=https://your-backend-url.railway.app
DATABASE_URL=${{MySQL.DATABASE_URL}}  # Railway auto-fills this
PORT=${{PORT}}  # Railway auto-fills this
```

#### Step 4: Deploy Backend
1. Railway will automatically deploy when you push to your main branch
2. Monitor the build logs in Railway dashboard
3. Once deployed, note your backend URL (e.g., `https://your-app.railway.app`)

#### Step 5: Run Database Migrations
After deployment, run migrations via Railway CLI or in the Railway console:
```bash
# Install Railway CLI locally
npm install -g @railway/cli

# Login and link to your project
railway login
railway link

# Run migrations
railway run pnpm migrate:backend
```

### Frontend Deployment (Vercel)

#### Step 1: Setup Vercel Project
1. Visit [Vercel](https://vercel.com) and sign in with GitHub
2. Click "New Project" → Import your repository
3. Vercel will auto-detect the framework

#### Step 2: Configure Build Settings
In Vercel project settings:
- **Framework Preset**: Other (or Custom)
- **Root Directory**: `apps/frontend`
- **Build Command**: `pnpm install && pnpm build`
- **Output Directory**: `.output/public`
- **Install Command**: `pnpm install`
- **Node.js Version**: 18.x

#### Step 3: Environment Variables (Frontend)
In Vercel project settings → Environment Variables:
```env
VITE_API_BASE_URL=https://your-backend-url.railway.app
```

#### Step 4: Deploy Frontend
1. Click "Deploy" - Vercel will build and deploy automatically
2. Your frontend will be available at `https://your-app.vercel.app`
3. Set up automatic deployments for your main branch

### Custom Domain Setup (Optional)

#### For Backend (Railway)
1. In Railway dashboard → Backend service → Settings → Domains
2. Add your custom domain (e.g., `api.yourapp.com`)
3. Update DNS records as instructed by Railway
4. Update `BETTER_AUTH_URL` environment variable to use custom domain

#### For Frontend (Vercel)
1. In Vercel dashboard → Project → Settings → Domains
2. Add your custom domain (e.g., `yourapp.com`)
3. Update DNS records as instructed by Vercel
4. Update `VITE_API_BASE_URL` if using custom backend domain

### Production Environment Variables

#### Backend Production Variables
```env
# Generate a secure 32-character secret
BETTER_AUTH_SECRET="use-openssl-rand-hex-32-to-generate"

# Your production backend URL
BETTER_AUTH_URL="https://your-backend.railway.app"

# Railway provides this automatically
DATABASE_URL="mysql://user:pass@host:port/db"

# Railway provides this automatically
PORT="3000"

# Optional: Enable production optimizations
NODE_ENV="production"
```

#### Frontend Production Variables
```env
# Your production backend URL
VITE_API_BASE_URL="https://your-backend.railway.app"
```

### Troubleshooting Deployment

#### Common Issues:

**Backend Build Fails**
- Ensure Node.js version is 18+ in Railway settings
- Check that all dependencies are in `package.json`
- Verify build command is correct: `pnpm install && pnpm build`

**Database Connection Issues**
- Verify `DATABASE_URL` is correctly set to `${{MySQL.DATABASE_URL}}`
- Ensure database migrations have been run
- Check MySQL service is running in Railway

**Frontend Build Fails**
- Ensure `VITE_API_BASE_URL` points to deployed backend
- Check Node.js version is 18+ in Vercel settings
- Verify build output directory is `.output/public`

**CORS Issues**
- Update backend CORS configuration to include frontend domain
- Ensure `BETTER_AUTH_URL` matches actual backend URL

**Authentication Issues**
- Verify `BETTER_AUTH_SECRET` is set and consistent
- Check `BETTER_AUTH_URL` matches backend deployment URL
- Ensure cookies are configured for production domain

### Continuous Deployment

#### Automatic Deployments
Both Railway and Vercel support automatic deployments:

1. **Railway**: Automatically deploys on push to main branch
2. **Vercel**: Automatically deploys on push to main branch
3. **Preview Deployments**: Both platforms create preview deployments for pull requests

#### Deployment Workflow
1. Push changes to a feature branch
2. Create pull request → get preview deployments
3. Merge to main → automatic production deployment
4. Monitor deployment logs in respective dashboards

### Monitoring & Analytics

#### Railway Backend Monitoring
- View logs in Railway dashboard
- Monitor resource usage and performance
- Set up alerts for downtime or errors

#### Vercel Frontend Analytics
- Enable Vercel Analytics for performance insights
- Monitor Core Web Vitals
- Track deployment success rates



----


# Turborepo stuff

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

#### apps
- `frontend`: a [Tanstack start](https://tanstack.com/start) frontend
- `backend`: an express backend
### packages

- ~~not yet adedd~~


Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities
- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [Biome](https://biomejs.dev/) for code linting and formatting


### Build

To build all apps and packages, run the following command:

```bash
cd favorite-tv
pnpm install
pnpm exec turbo build
```

You can build a specific package by using a [filter](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters):

```bash
pnpm exec turbo build --filter=frontend
```

### Develop

To develop all apps and packages, run the following command:

```bash
cd favorite-tv
pnpm exec turbo dev
```

You can develop a specific package by using a [filter](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters):

```bash
pnpm exec turbo dev --filter=web
```
