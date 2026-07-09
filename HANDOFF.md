# ViralPX — Handoff / Continuation Guide

A **multi-tenant portfolio-builder SaaS** (rewrite of an old Flask app). This doc
lets a fresh session continue the work. Read `spec/00`→`spec/05` + `BUILD_PROMPT.md`
for the product brief (extracted from the real old app — **don't invent features**).

## 1. Stack & where things are
- **Next.js 16 (App Router) + React 19 + TypeScript**, **Payload CMS 3.85** (admin+API inside Next),
  **PostgreSQL** (`@payloadcms/db-postgres`), **Cloudflare R2** (`@payloadcms/storage-s3`),
  **multi-tenant plugin**, localization `ar`(RTL,default)+`en`. Package manager **pnpm**.
- Local path: `/Users/apple/Downloads/ViralPX-SaaS/`. Git remote: `github.com/ahmedmahmmoud935/My-Saas-Portfolio` (branch `main`).
- pnpm is installed in `~/.local/bin` (via corepack) — add to PATH: `export PATH="$HOME/.local/bin:$PATH"`.

### Route groups (`src/app/`)
- `(frontend)/` — public site: `page.tsx` (placeholder landing), `[username]/page.tsx` (portfolio SSR),
  `[username]/project/[id]`, `[username]/articles` + `[slug]`. Own root layout (Cairo+Montserrat, `globals.css`).
- `(dashboard)/` — custom client dashboard: `login/`, `dashboard/` (gated) with `[tab]` fallback + explicit tabs.
  Own root layout (RTL, `dashboard.css`, admin accent always orange).
- `(payload)/` — Payload admin at `/admin` + all API routes (`/api/...`), incl. custom routes:
  `seed`, `bootstrap`, `track`, `contact`, `domains`.
- `src/middleware.ts` — custom-domain host→tenant rewrite. `src/robots.ts`, `src/sitemap.ts`.

### Collections (`src/collections/`) + `src/globals/SiteSettings.ts`
`users`(auth,isOwner), `tenants`(slug/domain/quota), `media`(webp thumb/card + storage hooks),
`projects`(modules Blocks + images), `articles`, `logos`, `testimonials`, `achievements`, `visits`.
`site-settings` = per-tenant global via multi-tenant plugin `isGlobal:true` (all spec/01 keys, organised in tabs).
Migrations in `src/migrations/` — **prod uses migrations**, dev uses push.

### Key patterns (follow these)
- **Dashboard tab** = server `page.tsx` (reads via `getDashboardContext()` from `src/lib/dashboard.ts`) →
  client editor component → **Next server action** in `src/lib/*-actions.ts` (tenant-guarded).
- **Client components must NOT import from `dashboard.ts`** (it imports payload → leaks server code → build
  error). Import client-safe constants from `dashboard-nav.ts`.
- **Localized-field editing** (bilingual): two-pass — update `locale:'ar'` → re-read to get array-row ids →
  update `locale:'en'` matched by index. Read both via `payload.find({locale:'all'})`. See `content-actions.ts`, `navbar`.
- **Uploads**: `uploadProjectMedia` (FormData→local API) or REST `/api/media`. `MediaUploader.tsx` on client.

## 2. Deployment (live now)
- **Host:** Hostinger VPS (KVM2, IP `200.97.164.79`) + **Coolify** at `http://200.97.164.79:8000`.
- **App** built from the GitHub repo via `Dockerfile` (Debian, runs `pnpm migrate && pnpm start`).
- **Postgres** runs as a Coolify resource on the same VPS (internal network).
- **R2** = Cloudflare bucket `viralpx-media`, endpoint `https://3bb5a80dbef12be713f8635c0e32d5e1.r2.cloudflarestorage.com`,
  public `https://cdn.viralpx.com`.
- **Temp public URL** (until `viralpx.com` is pointed): `http://pan0o2z2oop82i4pk9ohlnad.200.97.164.79.sslip.io`.
- **Deploy = push to `main`, then trigger** via Coolify API:
  `curl -H "Authorization: Bearer <COOLIFY_TOKEN>" "http://200.97.164.79:8000/api/v1/deploy?uuid=pan0o2z2oop82i4pk9ohlnad&force=true"`
  then poll `GET /api/v1/deployments/<deployment_uuid>` until `finished`.
- Env vars live in Coolify (DATABASE_URI, PAYLOAD_SECRET, R2_*, RESEND_*, NEXT_PUBLIC_SERVER_URL).
  `.env.example` documents them. (Secrets are provided to you separately — never commit them.)

### Run locally
```
export PATH="$HOME/.local/bin:$PATH"
pnpm db:local     # embedded Postgres on :5432 (data in ./.postgres)
pnpm dev          # http://localhost:3000  (admin /admin, dashboard /login)
```
Local uses R2-off (disk media). Demo login: `ahmed@viralpx.test` / `password123`.

### Seeding prod (IMPORTANT gotchas)
- Prod DB is separate + empty on first boot. Don't use `/api/seed` in prod (40 uploads → times out behind
  Coolify proxy on the slow India→R2 path).
- Use **`GET /api/bootstrap?key=viralpx-init`** — INCREMENTAL (one upload per call, idempotent). Call it ~7×
  to create tenant + owner user + settings + 4 projects + achievements + logo + testimonial.
- **R2 bug fixes already applied:** (a) migration `add_r2_storage` adds `media.prefix` (was missing because
  the initial migration was generated with R2 off); (b) `payload.config.ts` s3 config sets
  `requestChecksumCalculation/responseChecksumValidation: 'WHEN_REQUIRED'` (AWS SDK default checksums hang on R2).
  **When generating new migrations, set R2_* env inline so the schema matches prod.**

## 3. Status — DONE (live & verified)
- Phase 0-1: scaffold + full data model. ✅
- Phase 2 (public site) ~95%: all sections; project detail (grid/free/stacked) + module blocks + lightbox;
  designs/reels/videos tabs + vertical reels player; story highlights (circles + 9:16 viewer); articles pages
  + SEO/OG/JSON-LD + sitemap/robots; mobile bar + WhatsApp float; **AR/EN toggle** (`?lang=`); **working
  contact form** (`/api/contact` → Resend); visit tracking (`/api/track`).
- Phase 3 (dashboard) **100%** — all 14 tabs working (projects+upload+module builder, design w/ wireframe
  pickers, content, categories, sections, navbar, mobilebar, highlights, logos, achievements, testimonials,
  articles, social, analytics, owner users). Design matched to the original screenshots (SVG line icons).
- Deploy: live on Coolify. ~87% overall.

## 4. Status — TODO (priority order)
1. **Point `viralpx.com` + SSL** (user will move DNS off the old site). In Coolify add the domain to the app;
   set `NEXT_PUBLIC_SERVER_URL=https://viralpx.com` + rebuild. Coolify auto-issues Let's Encrypt.
2. **Custom-domain middleware** — built (`src/middleware.ts` + `/api/domains`); verify with a real client domain
   (set `tenants.domain` in the owner Users tab, point DNS → VPS).
3. **Landing page** (Phase 4) — owner marketing site at `/` (currently placeholder). Config under a landing
   global / tenant 0 (spec/05 `DEFAULT_LANDING`).
4. **Data migration** (Phase 5) — import the old Flask **SQLite** (`portfolio.db`) + R2 media into the new
   collections. **User must provide the old DB export.** Media already in the same R2 bucket → easier.
5. Public **testimonial submit** page `/testimonial/<username>` (approved=false → moderation).
6. Polish: dynamic OG images (`@vercel/og`), `llms.txt`, add EN to the few single-locale editors
   (testimonials/achievements/articles), and **remove/guard `/api/seed` + `/api/bootstrap` before real launch**.

## 5. Access (secrets provided separately in chat)
- Coolify API token, app uuid `pan0o2z2oop82i4pk9ohlnad`, Postgres uuid, server uuid `pwmq9ab728vjapjfkr08ab67`,
  project uuid `ojey45nxoqznmpwrzdmjjgr6`, env `production`.
- R2 keys, Resend key, demo login. GitHub push uses the machine's cached credentials.
