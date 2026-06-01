# JerseyDek

A clean, minimal marketplace for buying and selling university jerseys in Thailand — think Shopee, but only for jerseys.

## What's inside
- **Browse & search** jerseys on the homepage
- **Listing detail** page with seller contact
- **User accounts** (sign up / log in)
- **Sell page** to post a jersey with a photo
- **My listings** to mark sold or delete

## Tech
- Next.js 14 (App Router) + Tailwind CSS — the website
- Supabase — database, logins, and photo storage

## Start here
1. `SETUP-and-go-live.md` — how to run it, deploy it, and connect a real domain (step by step).
2. `COOKBOOK-grow-business.md` — how to get your first users and grow with social media.
3. `supabase-schema.sql` — the database setup (run once in Supabase).

## Run locally (quick version)
```
npm install
# create .env.local from .env.local.example and add your Supabase keys
npm run dev
```
Open http://localhost:3000

Full details, including domain setup, are in `SETUP-and-go-live.md`.

## Project map
```
app/                 pages (home, jersey/[id], sell, login, profile)
components/           Navbar, JerseyCard, buttons
lib/supabase/        connection to Supabase (browser + server)
supabase-schema.sql  database + storage setup
middleware.ts        keeps login sessions fresh
```
