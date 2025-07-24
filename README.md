# Favorite Movies & TV Shows App

A full-stack web application to manage a personal list of favorite movies and TV shows.

## ✨ Tech Stack
- **Frontend**: Tanstack start (React) + Vite + TypeScript + TailwindCSS + Shadcn UI
- **Backend**: Node.js + Express + Drizzle ORM + Zod
- **Auth**: [better-auth](https://github.com/mieszko4/better-auth) - Zero-config, modern, cookie-based auth for full-stack apps
- **Database**: Railway (MySQL)
- **Package Manager**: pnpm

## 📦 Setup Instructions

### 1. Clone Repo
```bash
git clone <your-repo-url>
cd favorite-tv
```

### 2. Setup MySQL (on Railway)
- Go to [https://railway.app](https://railway.app) and create a new MySQL database plugin in your project.
- After it's provisioned, click **Connect** → copy the connection string.
- Paste it into your `.env` file as `DATABASE_URL`.

### 3. Install Dependencies
Use [pnpm](https://pnpm.io/) for fast installs:
```bash
pnpm install
```

### 4. Run Backend
```bash
cd apps/backend
pnpm dev
```

### 5. Run Frontend
```bash
cd apps/frontend
pnpm dev
```


OR run them both together in the root directory (thanks to turborepo):
```bash
pnpm dev # in the root directory
```

## 🔐 Auth Setup (better-auth)
- Auth is already pre-wired using [better-auth](https://github.com/mieszko4/better-auth).
- Uses cookie-based sessions, JWT, and built-in email/password flows.
- Example routes:
  - `POST /auth/signup` - Register a new user
  - `POST /auth/login` - Login and get cookie session
  - `GET /auth/me` - Fetch user profile (session-aware)
  - `POST /auth/logout` - End session
- You can protect routes by checking `req.user` after middleware.

> Tip: better-auth supports middleware with Express, Next.js, etc. easily. Perfect for server routes like `/entries`.

## ✅ Features
- Add, edit, delete entries
- Infinite scroll using cursor-based pagination
- Fully responsive UI with clean table display
- Authenticated routes via better-auth

## 🚀 Deploy
- **Frontend**: Deploy via [Vercel](https://vercel.com)
- **Backend**: Deploy via [Railway](https://railway.app)
- **Database**: MySQL hosted on [Railway](https://railway.app) (Free tier available)



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
