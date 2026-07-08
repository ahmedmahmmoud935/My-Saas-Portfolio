# ViralPX — Deploy to Hostinger VPS + Coolify

Stack: Next.js 16 (standalone) + Payload 3 + PostgreSQL + Cloudflare R2.
The app is a single container (built from the `Dockerfile`); Postgres runs beside
it in Coolify; media lives on R2.

## 1. VPS + Coolify
1. Hostinger VPS (**KVM 2** recommended: 2 vCPU / 8 GB). Ubuntu 22.04+.
2. Install Coolify (one line): `curl -fsSL https://cdn.coolify.io/v4/install.sh | bash`
3. Open Coolify, create a **Project** (e.g. `viralpx`).

## 2. PostgreSQL (in Coolify)
1. In the project → **+ New Resource → Database → PostgreSQL 16**.
2. Deploy it. Copy the **internal connection string** (looks like
   `postgres://postgres:<pw>@<service>:5432/postgres`). Use the *internal* host so
   the app talks to the DB over Coolify's private network.

## 3. Cloudflare R2 (media)
1. Cloudflare dashboard → R2 → create bucket `viralpx-media`.
2. Create an **R2 API token** (Object Read & Write) → note Access Key ID + Secret.
3. Note the S3 endpoint `https://<account_id>.r2.cloudflarestorage.com`.
4. Enable a public URL / custom domain for the bucket (e.g. `cdn.viralpx.com`) → `R2_PUBLIC_URL`.

## 4. App (in Coolify)
1. **+ New Resource → Application → Public/Private Git repo** → pick the GitHub repo.
2. Build pack: **Dockerfile** (auto-detected). Port: **3000**.
3. Add the environment variables below.
4. Deploy. First boot: Payload pushes the schema automatically (dev push) — for
   production migrations later use `payload migrate` (see note).
5. Add your domain(s) in Coolify → the app. For per-client custom domains, point
   each domain's DNS to the VPS and add it to the app (middleware resolves host→tenant).

## 5. Environment variables (set in Coolify)
```
DATABASE_URI=postgres://postgres:<pw>@<internal-host>:5432/postgres
PAYLOAD_SECRET=<generate: openssl rand -hex 32>
NEXT_PUBLIC_SERVER_URL=https://your-domain.com

R2_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
R2_BUCKET=viralpx-media
R2_ACCESS_KEY_ID=<key>
R2_SECRET_ACCESS_KEY=<secret>
R2_PUBLIC_URL=https://cdn.viralpx.com

RESEND_API_KEY=<optional, for contact form / notifications>
RESEND_FROM=ViralPX <noreply@your-domain.com>
```

## 6. First run
- Visit `/admin` → create the first user, then mark it **owner** (isOwner) so it can
  manage all tenants. (Or run the seed route in a non-prod env.)
- Create a tenant + a client user; the client logs into `/dashboard`.

## Notes
- **Schema**: dev uses Payload's auto-push. For prod, generate migrations locally
  (`pnpm payload migrate:create`) and run `pnpm payload migrate` on deploy once data matters.
- **sharp** is shipped explicitly in the image (Debian base) for WebP + thumbnails.
- Health: the container listens on `0.0.0.0:3000`.
