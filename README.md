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
- pnpm 8+
- PostgreSQL 16+
- Docker (optional, for local database)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

4. Set up the database:
   ```bash
   # Start PostgreSQL with Docker (optional)
   docker run --name masterbet-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=masterbet -p 5432:5432 -d postgres:16

   # Generate Drizzle schemas
   pnpm run db:generate

   # Run migrations
   pnpm run db:migrate
   ```

5. Start development servers:
   ```bash
   pnpm run dev
   ```

   - Frontend: http://localhost:5173
   - Backend API: http://localhost:4000

## Development

### Available Scripts

- `pnpm run dev` - Start all apps in development mode
- `pnpm run build` - Build all apps for production
- `pnpm run lint` - Lint all packages
- `pnpm run format` - Format code with Prettier
- `pnpm run db:generate` - Generate Drizzle schema
- `pnpm run db:migrate` - Run database migrations
- `pnpm run db:studio` - Open Drizzle Studio

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

See [SDD documentation](/.claude/plans/typed-herding-twilight.md) for detailed deployment strategies.

### Recommended Stack
- **Frontend**: Vercel
- **Backend**: Railway or Render
- **Database**: Neon or Supabase

## License

Proprietary - All rights reserved

## Contributing

This is a private project. Please contact the project owner for contribution guidelines.
