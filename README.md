# Slate

A headless CMS for any website. Add one snippet to your site's `<head>`, then manage pages, blog posts, and service pages from a clean app — on web, iOS, or Android.

Works with WordPress, Webflow, Squarespace, Ghost, static sites, or any custom setup.

---

## How it works

1. Sign up and add your site's domain
2. Copy the generated snippet into your site's `<head>`
3. Create pages and posts in the block editor
4. Content appears on your live site automatically

---

## Tech stack

- **App** — [Expo](https://expo.dev) + Expo Router (web + iOS + Android from one codebase)
- **Styling** — [NativeWind](https://nativewind.dev) v4 + Tailwind CSS v3
- **Backend** — [Supabase](https://supabase.com) (auth, PostgreSQL, storage, edge functions)
- **Editor** — Custom block-based editor (no third-party dependency)
- **Snippet** — `snippet/slate.js` — vanilla JS, injected into the client's site

---

## Prerequisites

- [Node.js](https://nodejs.org) 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/) — `npm install -g expo-cli`
- A [Supabase](https://supabase.com) account (free tier works)
- [Expo Go](https://expo.dev/go) app on your phone (for native testing)

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/cadenburleson/slate.git
cd slate
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once created, go to **Settings → API** and copy:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **Anon / public key**

### 3. Run the database migration

1. In your Supabase project, open the **SQL Editor**
2. Paste the contents of `supabase/migrations/001_initial.sql` and click **Run**

This creates all tables, constraints, and row-level security policies.

### 4. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Update the snippet URL

Open `snippet/slate.js` and replace the `API` constant near the top:

```js
var API = "https://YOUR_SUPABASE_URL/functions/v1";
```

Replace `YOUR_SUPABASE_URL` with your actual Supabase project URL.

### 6. Run the app

**Web (recommended for development):**
```bash
npm run web
```

**iOS simulator:**
```bash
npm run ios
```

**Android emulator:**
```bash
npm run android
```

**Physical device:** Install [Expo Go](https://expo.dev/go) and scan the QR code shown after `npm start`.

---

## Project structure

```
slate/
├── app/                          # Expo Router screens
│   ├── index.tsx                 # Landing page (web) / login prompt (native)
│   ├── (auth)/                   # Login, signup, accept-invite
│   └── (dashboard)/              # Authenticated app
│       ├── index.tsx             # Sites list
│       ├── add-site.tsx          # Add a new site
│       └── [siteId]/             # Per-site screens
│           ├── index.tsx         # Site overview
│           ├── snippet.tsx       # Snippet code + install guide
│           ├── pages/            # Page list, new page, block editor
│           ├── posts/            # Post list, new post, block editor
│           ├── team.tsx          # Invite collaborators
│           └── settings.tsx      # Site config + danger zone
├── components/
│   └── BlockEditor.tsx           # Custom block editor component
├── lib/
│   ├── auth.tsx                  # AuthContext + AuthProvider
│   ├── supabase.ts               # Supabase client
│   └── db/                       # DB abstraction layer
│       ├── sites.ts
│       ├── pages.ts
│       ├── posts.ts
│       ├── members.ts
│       └── types.ts              # TypeScript types + Database schema
├── snippet/
│   └── slate.js                  # Vanilla JS snippet for client sites
├── supabase/
│   └── migrations/
│       └── 001_initial.sql       # Full schema + RLS policies
├── global.css                    # Tailwind base styles
├── tailwind.config.js
├── babel.config.js
└── metro.config.js
```

---

## Installing the snippet on a site

After adding a site in the app, go to **Snippet** and copy the code. Paste it into the `<head>` of every page on the site.

**WordPress** — Appearance → Theme Editor → `header.php` → paste before `</head>`

**Webflow** — Project Settings → Custom Code → Head Code → paste snippet

**Squarespace** — Settings → Advanced → Code Injection → Header

**Ghost** — Settings → Code injection → Site header

**Any HTML site** — paste before `</head>` in your template file

---

## Block types

The editor supports these block types:

| Block | Description |
|---|---|
| Heading | H1, H2, or H3 |
| Paragraph | Plain text |
| List | Ordered or unordered |
| Quote | Block quote |
| Image | Image with caption *(upload coming soon)* |
| Divider | Horizontal rule |
| Service | Stripe payment link card *(coming in Phase 2)* |

---

## User roles

Each site has two roles:

- **Owner** — full access, can invite others, can delete the site
- **Editor** — can create and edit content, cannot change site settings

Invite collaborators from the **Team** screen inside any site.

---

## Deploying the web app to Cloudflare Pages

The Expo web target builds a static SPA that drops cleanly onto Cloudflare Pages. Push to `main` triggers a fresh build.

### One-time setup in the Cloudflare dashboard

1. [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → select `cadenburleson/slate`.
2. Project settings:
   - **Framework preset:** None
   - **Build command:** `npx expo export -p web`
   - **Build output directory:** `dist`
   - **Root directory:** _(leave blank)_
3. **Environment variables** (Settings → Environment variables → add for both *Production* and *Preview*):
   - `EXPO_PUBLIC_SUPABASE_URL` = `https://<your-project-ref>.supabase.co`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY` = `<your anon JWT>`

`public/_redirects` ships an SPA fallback so dynamic routes like `/[siteId]/pages` resolve correctly on direct loads and refreshes. `public/_headers` sets long-cache headers for the `/_expo/` and `/assets/` bundles.

---

## Roadmap

- [x] Supabase Edge Functions for the snippet API (`/manifest`, `/content`)
- [ ] Accept-invite screen for email invites
- [ ] Media uploads (image block)
- [ ] Stripe Connect integration for service pages
- [ ] Sitemap auto-detection for existing site content

---

## Contributing

Pull requests welcome. Open an issue first for significant changes.
