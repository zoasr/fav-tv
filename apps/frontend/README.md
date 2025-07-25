# Favorite Movies & TV Shows Frontend

A modern React-based frontend application for managing favorite movies and TV shows.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm package manager

### 1. Environment Setup

Create `.env` file in the frontend directory:

```env
VITE_API_BASE_URL="http://localhost:3241"
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Start Development Server

```bash
pnpm dev
```

The frontend will be available at `http://localhost:3000`

## 🛠️ Tech Stack

- **Framework**: TanStack Start (React)
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: TanStack Query

## 📁 Project Structure

```
apps/frontend/
├── src/
│   ├── components/          # UI Components
│   ├── routes/              # Route definitions
│   ├── lib/                 # Shared utilities
│   └── styles/              # Global styles
├── public/                  # Static assets
├── package.json
└── vite.config.ts
```

## 🚀 Deployment (Vercel)

### Quick Deploy to Vercel

1. **Connect Repository**
    - Visit [Vercel](https://vercel.com)
    - Click "New Project"
    - Select your repository

2. **Configure Project**
    - Framework Preset: Other
    - Root Directory: `apps/frontend`

3. **Build & Output Settings**
    - Build Command: `pnpm install && pnpm build`
    - Output Directory: `.output/public`
    - Install Command: `pnpm install`

4. **Add Environment Variables**

    ```env
    VITE_API_BASE_URL=https://your-backend-url.railway.app
    ```

5. **Deploy**
    - Click "Deploy" and Vercel will handle the rest

### Custom Domain Setup

1. Add your custom domain in Vercel settings
2. Update DNS records as instructed by Vercel

## 🔧 Troubleshooting

### Build Errors

- Ensure Node.js version is 18+
- Verify `VITE_API_BASE_URL` is set correctly

### Common Issues

- If CORS issues arise, ensure backend allows requests from Vercel's domain

For further help, check [Vercel's Documentation](https://vercel.com/docs).

## 📋 Available Scripts

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## 🎨 UI Components

This app uses Shadcn UI components with TailwindCSS for styling:

- Modern, accessible component library
- Consistent design system
- Responsive by default
- Dark/light mode ready

## 🔗 Integration with Backend

The frontend communicates with the backend API through:

- RESTful API calls using TanStack Query
- Cookie-based authentication
- Real-time data synchronization
- Optimistic updates for better UX

## 📝 Features

- ✅ User Authentication (Sign up/Sign in/Sign out)
- ✅ CRUD operations for movies/TV shows
- ✅ Infinite scroll with pagination
- ✅ Responsive design
- ✅ Form validation
- ✅ Error handling
- ✅ Loading states

## 🌐 Production Environment Variables

For production deployment, ensure these environment variables are set:

```env
VITE_API_BASE_URL="https://your-production-backend-url.railway.app"
```

## 📚 Learn More

- [TanStack Start Documentation](https://tanstack.com/start)
- [TanStack Router](https://tanstack.com/router)
- [TanStack Query](https://tanstack.com/query)
- [Vite Documentation](https://vitejs.dev/)
- [TailwindCSS](https://tailwindcss.com/)
