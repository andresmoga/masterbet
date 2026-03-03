# Masterbet Platform

Sports betting comparison and performance tracking platform for the Colombian market.

## Overview

Masterbet aggregates real-time odds from 7 major Colombian bookmakers, identifies the best value bets, and provides AI-powered insights for performance tracking.

### Features

- **Real-Time Odds Comparison**: Scrapes 7 bookmakers every 5 minutes
- **Best Value Detection**: Automatically highlights the highest odds
- **Performance Tracking**: Manual entry + OCR-based bet slip scanning
- **AI Recommendations**: LLM-powered betting insights (Master tier)

### Tech Stack

- **Frontend**: React + Vite + TypeScript + Shadcn UI + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **Authentication**: NextAuth.js (Google OAuth)
- **Scraping**: Playwright
- **OCR**: Tesseract.js
- **AI**: OpenAI/Claude API
- **Monorepo**: Turborepo + pnpm

## Project Structure

```
masterbet/
├── apps/
│   ├── web/          # React frontend
│   └── server/       # Express API server
├── packages/
│   ├── database/     # Drizzle ORM schemas
│   ├── ui/           # Shared Shadcn UI components
│   ├── typescript-config/
│   └── eslint-config/
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+ — `npm install -g pnpm`
- PostgreSQL 16+
  - Mac: `brew install postgresql && brew services start postgresql`
  - Windows/Linux: [Download PostgreSQL](https://www.postgresql.org/download/)
  - Or use Docker (see below)

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/your-org/masterbet.git
cd masterbet
```

**2. Install dependencies**

```bash
pnpm install
```

**3. Set up environment variables**

```bash
cp .env.example .env
```

Open `.env` and fill in at minimum:

```env
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/masterbet
NEXTAUTH_SECRET=your-secret   # generate with: openssl rand -base64 32
```

**4. Set up the database**

Option A — Local PostgreSQL:

```bash
psql -U postgres -c "CREATE DATABASE masterbet;"
pnpm run db:migrate
```

Option B — Docker:

```bash
docker run --name masterbet-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=masterbet \
  -p 5432:5432 -d postgres:16

pnpm run db:migrate
```

> Migrations are in `packages/database/migrations/` and are already tracked in the repo — collaborators never need to run `db:generate`, only `db:migrate`.

### Sharing real data with collaborators

If you want collaborators to work with actual data (e.g. sample odds), you can export and share a dump privately.

**Export (run on your machine):**

```bash
pg_dump masterbet > dump.sql
```

**Import (run on collaborator's machine):**

```bash
psql -U postgres masterbet < dump.sql
```

> Do **not** commit `dump.sql` to GitHub, especially if it contains real user data. Share it via a private channel (Slack, email, etc.).

**5. Start development servers**

```bash
pnpm run dev
```

| App | URL |
|-----|-----|
| Frontend (React) | http://localhost:5173 |
| Backend API | http://localhost:4000 |
| Health check | http://localhost:4000/health |

## Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start all apps in development mode |
| `pnpm run build` | Build all apps for production |
| `pnpm run lint` | Lint all packages |
| `pnpm run format` | Format code with Prettier |
| `pnpm run db:migrate` | Run pending database migrations |
| `pnpm run db:generate` | Generate a new migration from schema changes |
| `pnpm run db:studio` | Open Drizzle Studio (visual DB browser) |

### Subscription Tiers

1. **Entrepreneur (Free)**
   - 1,000 tokens/month
   - Comparison dashboard

2. **Pro ($15/month)**
   - Unlimited tokens
   - Performance tracking & analytics

3. **Master ($30/month)**
   - Everything in Pro
   - AI Bet Assistant
   - Portfolio optimization

## Bookmakers Supported

- Wplay (wplay.co)
- BetPlay (betplay.com.co)
- Betsson (betsson.co)
- bwin (bwin.co)
- Rushbet (rushbet.co)
- Codere (codere.com.co)
- Betano (betano.com)

## Architecture

### Module A: Web Scraper Service
- Runs every 5 minutes
- Playwright-based scraping
- Team name normalization with fuzzy matching
- Stores odds in PostgreSQL

### Module B: Comparison & Search
- Global search with autocomplete
- Real-time odds comparison
- Master Recommendation algorithm (highlights best odds)

### Module C: Performance Tracking & AI
- Manual bet entry
- OCR bet slip scanning (Tesseract.js)
- AI insights for betting strategy (OpenAI/Claude)
- Token-based rate limiting

## Deployment

### Recommended Stack
- **Frontend**: Vercel
- **Backend**: Railway or Render
- **Database**: Neon or Supabase

## License

Proprietary - All rights reserved

## Contributing

This is a private project. Please contact the project owner for contribution guidelines.
