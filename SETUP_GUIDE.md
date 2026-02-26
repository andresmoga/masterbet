# Masterbet Platform - Setup Guide

## ✅ Phase 1 Complete: Infrastructure & Boilerplate

The Masterbet monorepo structure has been successfully created with all the foundational components.

## 📁 Project Structure

```
masterbet/
├── apps/
│   ├── web/                    ✅ React + Vite + TypeScript
│   │   ├── src/
│   │   │   ├── components/     (Organized folders for UI, layout, search, odds, bets, ai)
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   ├── pages/
│   │   │   ├── services/
│   │   │   ├── store/
│   │   │   └── styles/         ✅ Tailwind CSS with Orange theme configured
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   └── server/                 ✅ Express + TypeScript
│       ├── src/
│       │   ├── config/         (env, database)
│       │   ├── controllers/
│       │   ├── middleware/     (auth, token-limiter, error-handler)
│       │   ├── routes/
│       │   ├── services/
│       │   │   └── scraper/
│       │   ├── jobs/
│       │   ├── utils/          (logger, validators)
│       │   ├── app.ts
│       │   └── server.ts
│       └── package.json
│
├── packages/
│   ├── database/               ✅ Drizzle ORM with complete schema
│   │   ├── src/
│   │   │   ├── schema/
│   │   │   │   ├── users.ts
│   │   │   │   ├── teams.ts
│   │   │   │   ├── matches.ts
│   │   │   │   ├── scraped-odds.ts
│   │   │   │   ├── bets.ts
│   │   │   │   ├── subscriptions.ts
│   │   │   │   ├── token-usage.ts
│   │   │   │   └── scraper-logs.ts
│   │   │   ├── client.ts
│   │   │   └── migrate.ts
│   │   └── drizzle.config.ts
│   │
│   ├── ui/                     (To be populated with Shadcn components)
│   ├── typescript-config/      ✅ Shared TS configs (base, react, node)
│   └── eslint-config/          ✅ Shared ESLint configs (base, react)
│
├── .env.example                ✅ Environment variables template
├── .gitignore                  ✅ Comprehensive ignore rules
├── package.json                ✅ Root package with Turborepo
├── pnpm-workspace.yaml         ✅ Workspace configuration
├── turbo.json                  ✅ Turborepo pipeline config
└── README.md                   ✅ Project documentation
```

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 20 or higher
- **pnpm**: 8 or higher
- **PostgreSQL**: 16 or higher
- **Docker** (optional, for local database)

### Step 1: Install Dependencies

```bash
cd ~/Documents/masterbet
pnpm install
```

### Step 2: Set Up Environment Variables

```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your actual values
# At minimum, you need:
# - DATABASE_URL (PostgreSQL connection string)
# - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)
# - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET (from Google Cloud Console)
```

### Step 3: Set Up PostgreSQL Database

#### Option A: Using Docker (Recommended for Development)

```bash
# Start PostgreSQL container
docker run --name masterbet-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=masterbet \
  -p 5432:5432 \
  -d postgres:16

# Your DATABASE_URL will be:
# postgresql://postgres:password@localhost:5432/masterbet
```

#### Option B: Using Existing PostgreSQL Installation

Create a database named `masterbet` and update your `.env` file with the connection string.

### Step 4: Generate and Run Database Migrations

```bash
# Generate Drizzle schema
pnpm run db:generate

# Run migrations to create tables
pnpm run db:migrate

# (Optional) Open Drizzle Studio to view your database
pnpm run db:studio
```

### Step 5: Start Development Servers

```bash
# Start both frontend and backend in parallel
pnpm run dev
```

This will start:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000

### Step 6: Verify Setup

1. Open http://localhost:5173 in your browser
2. You should see the Masterbet landing page
3. Check the API health: http://localhost:4000/health

## 🎨 Theme Configuration

The Tailwind CSS theme is configured with the Masterbet brand colors:

- **Primary Orange**: `#FF6B00` (Various shades: 50-900)
- **Dark Mode**: Slate-900 background with orange accents
- **Toggle**: Dark mode can be toggled via the `dark` class on the root element

## 📊 Database Schema

The database includes 8 core tables:

1. **users** - User accounts with subscription tiers
2. **subscriptions** - Stripe subscription management
3. **teams** - Team master registry with aliases
4. **matches** - Soccer matches with team references
5. **scraped_odds** - Bookmaker odds (7 sources)
6. **user_bets** - User bet tracking
7. **token_usage** - Rate limiting for Entrepreneur tier
8. **scraper_logs** - Scraper monitoring

All tables use UUIDs as primary keys and include proper indexes for performance.

## 📦 Monorepo Commands

```bash
# Development
pnpm run dev              # Start all apps
pnpm run build            # Build all apps
pnpm run lint             # Lint all packages

# Database
pnpm run db:generate      # Generate Drizzle schema
pnpm run db:migrate       # Run migrations
pnpm run db:studio        # Open Drizzle Studio

# Utilities
pnpm run clean            # Clean build artifacts
pnpm run format           # Format code with Prettier
```

## 🔐 Authentication Setup (Google OAuth)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID and Client Secret to your `.env` file
6. Generate NextAuth secret: `openssl rand -base64 32`

## 🛠️ Next Steps (Phase 2-7)

### Phase 2: Web Scraper Module
- [ ] Install Playwright: `cd apps/server && pnpm add playwright`
- [ ] Create `ScraperOrchestrator` service
- [ ] Implement individual bookmaker scrapers
- [ ] Set up cron job (every 5 minutes)
- [ ] Add team normalization with fuzzy matching

### Phase 3: Comparison & Search API
- [ ] Create `/api/search` endpoint
- [ ] Create `/api/matches/{id}/odds` endpoint
- [ ] Implement Master Recommendation algorithm
- [ ] Build frontend search component

### Phase 4: Performance Tracking
- [ ] Create `/api/bets` CRUD endpoints
- [ ] Build manual bet entry form
- [ ] Integrate Tesseract.js for OCR
- [ ] Create performance dashboard

### Phase 5: AI Assistant
- [ ] Integrate OpenAI or Claude API
- [ ] Create `/api/ai/insights` endpoint
- [ ] Build AI insights UI

### Phase 6: Subscriptions & Tokens
- [ ] Implement token rate limiting middleware
- [ ] Add Stripe integration (optional)
- [ ] Build subscription management UI

### Phase 7: Polish & Deploy
- [ ] Mobile responsive design
- [ ] Error handling improvements
- [ ] Performance optimization
- [ ] CI/CD setup

## 📚 Documentation

- **Full SDD**: [~/.claude/plans/typed-herding-twilight.md](~/.claude/plans/typed-herding-twilight.md)
- **README**: [README.md](README.md)
- **API Docs**: Will be generated in Phase 3

## 🐛 Troubleshooting

### Port already in use
```bash
# Kill process on port 4000 or 5173
lsof -ti:4000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

### Database connection issues
```bash
# Check if PostgreSQL is running
docker ps  # If using Docker
pg_isready  # If using local PostgreSQL

# Verify DATABASE_URL in .env
```

### pnpm install fails
```bash
# Clear pnpm store and reinstall
pnpm store prune
rm -rf node_modules
pnpm install
```

## 💡 Tips

- Use VSCode for the best development experience
- Install recommended extensions: ESLint, Prettier, Tailwind CSS IntelliSense
- Check `apps/server/logs/` for detailed error logs
- Use Drizzle Studio to visualize and edit database records

## 🎯 Current Status

✅ **Phase 1 Complete**: Infrastructure, Database Schema, Frontend/Backend Boilerplate

🚧 **Phase 2 In Progress**: Web Scraper Service (next step)

---

For detailed implementation plans, refer to the [Software Design Document](~/.claude/plans/typed-herding-twilight.md).
