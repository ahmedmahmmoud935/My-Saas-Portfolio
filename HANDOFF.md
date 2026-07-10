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

### Seeding prod (historical — routes removed)
- Prod is already seeded via the real data migration (§3). The old `/api/seed`, `/api/bootstrap`, and `/api/migrate`
  routes + `legacy-data.json` + `scripts/export-legacy.py` have been **removed** from the repo (2026-07-10).
- If you ever need to bulk-import again, they're in git history (last present at commit `9367cce`). They were
  guarded by `ENABLE_SEED_ROUTES=true`; that env var is no longer used.
- **R2 bug fixes already applied (still relevant):** (a) migration `add_r2_storage` adds `media.prefix` (was missing
  because the initial migration was generated with R2 off); (b) `payload.config.ts` s3 config sets
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
- Deploy: live on Coolify. ~96% overall (landing + public testimonials + llms.txt + seed guard + **full data
  migration of all 4 tenants** done 2026-07-10).

## 4. Status — TODO (priority order)
1. **Point `viralpx.com` + SSL** (user will move DNS off the old site). In Coolify add the domain to the app;
   set `NEXT_PUBLIC_SERVER_URL=https://viralpx.com` + rebuild. Coolify auto-issues Let's Encrypt. **[needs user: DNS]**
2. **Custom-domain middleware** — built (`src/middleware.ts` + `/api/domains`); verify with a real client domain
   (set `tenants.domain` in the owner Users tab, point DNS → VPS). **[needs user: a real client domain]**
3. Polish: **dynamic OG images** (`@vercel/og`/Satori at `/og-image/<slug>.png`), and add EN to the few
   single-locale editors (testimonials/achievements/articles).
5. **Optional — make the landing owner-editable**: the landing (`src/app/(frontend)/page.tsx`) currently reads its
   copy from an in-file `COPY` map + live tenants for the showcase. To make it CMS-managed, add a `Landing` global
   (spec/05 `DEFAULT_LANDING`) + a dashboard tab, and generate a migration (set R2_* inline — see §2 gotcha).

### DONE in this pass (2026-07-10)
- **Data migration (Phase 5) — COMPLETE & live.** Imported the old Flask SQLite (`db_portfolio_*.db`) for all 4
  tenants: **ahmed** (25 projects, owner), **kamal** (12 projects, 1 article), **omar** + **adventures** (settings +
  achievements). Totals restored with **zero errors**: 37 projects, 16 achievements, 3 logos, 7 testimonials, 1
  article, + full per-tenant site-settings (bilingual content, sections, navbar, colors, brand media, highlights).
  The demo `ahmed` seed data was wiped and replaced. One CDN file (`u1_bh_1778249131069.webp`) was 404/gone → its one
  image block was pruned; everything else migrated. Dashboard logins created: `ahmed@viralpx.test` (owner) +
  `omar@ / adventures@ / kamal@ viralpx.test`, all password `password123`.
  Mechanism: `scripts/export-legacy.py` → `legacy-data.json` → guarded `/api/migrate` (incremental: re-uploads media
  from the CDN to R2, generic AR→EN two-pass restores localization). **Route since removed** from the repo (in git
  history at `9367cce`). Gotcha found: Payload converts image uploads to `.webp`, so match media by the extensionless hash.
- **Landing page** (`/`) — real bilingual (AR/EN, `?lang=`) marketing site: sticky nav, hero, features, how-it-works,
  live-portfolio showcase (pulls newest tenants), pricing, FAQ (+FAQPage JSON-LD), CTA, footer. Own scoped `<style>`,
  brand orange. Replaces the Phase-0 placeholder. Verified: 200, AR+EN, showcase links to real tenants.
- **Public testimonial submit** — page `src/app/(frontend)/testimonial/[username]/page.tsx` (tenant-branded via
  `tenantCssVars`, AR/EN, `noindex`) + client `TestimonialForm` → `POST /api/testimonial` → creates
  `source='public', approved=false` (moderation). Linked from each portfolio's Testimonials section
  (`submitHref`/`submitLabel` props). Verified end-to-end: submit → `ok`, stays hidden until approved, unknown
  tenant → 404, missing fields → 400.
- **`llms.txt`** — `src/app/llms.txt/route.ts` (site summary + tenant list). Verified.
- **Removed the seed/bootstrap/migrate routes** (+ `legacy-data.json`, `scripts/export-legacy.py`) now that the
  migration is done — no bulk-import endpoints ship to production. In git history at `9367cce` if needed again.
- Local preview note: `.claude/launch.json` runs `next dev`; embedded PG via `pnpm db:local` (:5432).

## 5. Access (secrets provided separately in chat)
- Coolify API token, app uuid `pan0o2z2oop82i4pk9ohlnad`, Postgres uuid, server uuid `pwmq9ab728vjapjfkr08ab67`,
  project uuid `ojey45nxoqznmpwrzdmjjgr6`, env `production`.
- R2 keys, Resend key, demo login. GitHub push uses the machine's cached credentials.
