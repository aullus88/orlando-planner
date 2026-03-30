# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Orlando 2026 family trip planner — a single-page client-side app for managing an 11-day Orlando itinerary. Written in Portuguese (UI and content). Travelers: Aulus, Patrícia (pregnant), and Malu (1-year-old, 87cm tall).

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
```

No test framework, linter, or formatter is configured.

## Tech Stack

- **Next.js 15** (App Router) + React 19 — JavaScript, no TypeScript
- **Tailwind CSS 4** via PostCSS
- **Supabase** (PostgreSQL) — all data access is client-side via `@supabase/supabase-js`
- **Vercel** — auto-deploys from `main`

## Architecture

This is a **client-side SPA** with no API routes. All CRUD operations go directly from the browser to Supabase.

### Key files

- `src/components/App.js` — Monolithic component (~700 lines) containing all UI, state, and business logic. Houses 5 tab sections (Roteiro, Parques, Custos, Voos, Malu) plus reusable primitives (Badge, Card, Modal, Input, Btn).
- `src/lib/supabase.js` — Supabase client init + hardcoded `TRIP_ID` constant.
- `src/app/globals.css` — Theme variables (midnight/navy/accent colors), custom fonts (Playfair Display, DM Sans, JetBrains Mono), animations.
- `src/app/layout.js` — Root layout with metadata and font setup.
- `src/app/page.js` — Renders the App component.

### Data flow

1. On mount, `fetchAll()` loads all 6 tables in parallel via `Promise.all()`
2. After any mutation (add/edit/delete), `refresh()` re-fetches everything
3. No real-time subscriptions active — uses fetch-on-write pattern

### Database tables (Supabase)

All scoped to a single `TRIP_ID`:
- `trip_days` — Daily itinerary (day_number, date, emoji, crowd_level)
- `day_items` — Activities per day (time_slot, status: planned/done, is_highlight, is_warning)
- `parks` — Theme parks (name, icon, color, rating)
- `attractions` — Rides/shows per park (type, min_height_cm, pregnant_ok, has_child_swap, indoor, thrill_level)
- `trip_costs` — Budget items (category, amount, is_paid)
- `trip_flights` — Flight details (direction: outbound/return, class, booking_ref)

## Environment Variables

Required (both public, safe for browser):
```
NEXT_PUBLIC_SUPABASE_URL=<supabase_project_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase_anon_key>
```

See `.env.example` for reference. Local values in `.env.local` (gitignored).

## Path Alias

`@/*` maps to `./src/*` (configured in `jsconfig.json`).

## Design Conventions

- Dark theme: navy background (#0B1120), orange accent (#FF6B3D), glass-morphism cards
- Mobile-first with bottom-sheet modals on small screens
- Heavy emoji usage for visual hierarchy
- All UI text is in Brazilian Portuguese
