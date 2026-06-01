# JerseyDek — Setup & Go Live Guide

This takes you from zero to a real website on your own domain (like `jerseydek.com`).
Everything here is **free** except the domain (about ฿300–500/year).

Three tools you'll use:
- **Supabase** — your database, user logins, and photo storage. (Free.)
- **Vercel** — hosts the website on the internet. (Free.)
- **A domain registrar** — where you buy your web address. (Cheap.)

---

## STEP 1 — Install the tools on your computer (one time)

1. Install **Node.js** (version 18+): https://nodejs.org → download the "LTS" version → install.
2. Open a terminal (Command Prompt on Windows) in the project folder.
3. Run:
   ```
   npm install
   ```
   This downloads everything the site needs. Wait until it finishes.

---

## STEP 2 — Set up Supabase (your backend)

1. Go to https://supabase.com → sign up (free) → **New project**.
   - Give it a name, a database password (save it), pick a region near Thailand (Singapore).
2. Wait ~2 minutes for it to finish setting up.
3. In the left menu open **SQL Editor** → **New query**.
4. Open the file `supabase-schema.sql` from this project, copy **all** of it, paste into the editor, click **Run**.
   - This creates your tables (jerseys, profiles), the photo storage, and the security rules.
5. Go to **Project Settings** (gear icon) → **API**. Copy these two values:
   - **Project URL**
   - **anon public** key

### Turn off email confirmation (optional, makes testing easier)
Go to **Authentication → Providers → Email** and turn OFF "Confirm email" while testing, so signups work instantly.

> ⚠️ **Turn "Confirm email" back ON before you launch.** With it off, anyone (or a bot) can sign up with fake emails and spam listings. This is your main spam defense.

---

## STEP 3 — Connect the site to Supabase

1. In the project folder, make a copy of `.env.local.example` and rename the copy to `.env.local`.
2. Open `.env.local` and paste your two values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Save the file.

---

## STEP 4 — Run it on your own computer first

In the terminal:
```
npm run dev
```
Open your browser to **http://localhost:3000**.

Try it: sign up, log in, click **+ Sell**, post a jersey with a photo, see it on the homepage, mark it sold, delete it. If this all works, you're ready to put it online.

(If something fails, the terminal prints the error — usually a typo in `.env.local`.)

---

## STEP 5 — Put the code on GitHub

Vercel deploys from GitHub.

1. Make a free account at https://github.com.
2. Create a new **empty** repository called `jerseydek`.
3. In your project terminal, run these one by one (replace YOURNAME):
   ```
   git init
   git add .
   git commit -m "first version"
   git branch -M main
   git remote add origin https://github.com/YOURNAME/jerseydek.git
   git push -u origin main
   ```
   Your code is now on GitHub. (`.env.local` is NOT uploaded — that's on purpose, it's secret.)

---

## STEP 6 — Deploy to the internet with Vercel

1. Go to https://vercel.com → sign up **with your GitHub account**.
2. Click **Add New → Project** → pick your `jerseydek` repo → **Import**.
3. Before deploying, open **Environment Variables** and add the same two keys:
   - `NEXT_PUBLIC_SUPABASE_URL` = your URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
4. Click **Deploy**. Wait ~1 minute.
5. You get a live link like `jerseydek.vercel.app`. Your site is now on the internet!

### Tell Supabase about your new URL
In Supabase → **Authentication → URL Configuration**, set the **Site URL** to your Vercel link (and later your real domain). This makes login work correctly.

---

## STEP 7 — Buy a real domain

1. Go to a registrar: **Namecheap** (https://www.namecheap.com), **GoDaddy**, or a Thai one like **Z.com** / **Hostatom**.
2. Search for the name you want, e.g. `jerseydek.com`.
3. Buy it (usually ฿300–500/year for `.com`). Only the domain — you do NOT need their hosting.

---

## STEP 8 — Connect the domain to your site

1. In **Vercel** → your project → **Settings → Domains** → type your domain (`jerseydek.com`) → **Add**.
2. Vercel shows you DNS records to add (an `A` record and/or `CNAME`).
3. Log into your registrar, find **DNS settings** for the domain, and add exactly the records Vercel shows.
4. Wait. DNS can take from a few minutes up to a few hours.
5. When ready, Vercel auto-adds HTTPS (the padlock). Your site is now live at `https://jerseydek.com`.

6. Go back to **Supabase → Authentication → URL Configuration** and update **Site URL** to your real domain.

---

## You're live. What to do next

- Push updates anytime: change code → `git add . && git commit -m "update" && git push`. Vercel redeploys automatically in ~1 minute.
- See `COOKBOOK-grow-business.md` for how to get your first users.

### Ideas to build next
- Seller ratings/reviews (build trust).
- Categories and filters by university and size.
- Chat between buyer and seller.
- Featured/promoted listings — this can be how you make money later.

---

## Security checklist before launch
- [ ] Ran the latest `supabase-schema.sql` (phone is in a protected table, uploads are images-only/5 MB, price/title validated).
- [ ] **"Confirm email" is ON** in Supabase Auth.
- [ ] Only the **anon public** key is in your code/env — the **service_role** key is never in code, GitHub, or the browser. (It bypasses all security rules.)
- [ ] Site URL in Supabase points to your real domain.
- [ ] You've test-logged-in as a normal user and confirmed you can't edit someone else's listing.

## Quick troubleshooting
- **"Invalid API key"** → check `.env.local` (local) and Vercel env vars (online) match Supabase exactly.
- **Login does nothing** → set the Site URL in Supabase, and (while testing) turn off email confirmation.
- **Image won't upload** → make sure you ran the full `supabase-schema.sql` (it creates the `jerseys` storage bucket).
- **Page says "No jerseys yet"** → that's normal until you post one. Log in → + Sell.
