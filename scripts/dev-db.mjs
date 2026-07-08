// Local dev Postgres — no Docker/Homebrew needed.
// Downloads a real Postgres binary on first run, then starts it on :5432.
// Data persists in ./.postgres. Swap DATABASE_URI in .env to use another DB.
import EmbeddedPostgres from 'embedded-postgres'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const databaseDir = path.join(root, '.postgres')

const pg = new EmbeddedPostgres({
  databaseDir,
  user: 'postgres',
  password: 'postgres',
  port: 5432,
  persistent: true,
})

const firstRun = !existsSync(databaseDir)

async function main() {
  if (firstRun) {
    console.log('› Initialising a fresh local Postgres cluster (first run only)…')
    await pg.initialise()
  }
  await pg.start()

  try {
    await pg.createDatabase('viralpx')
    console.log('› Created database "viralpx".')
  } catch {
    // Already exists — fine.
  }

  console.log('\n✅ Local Postgres is running on postgres://postgres:postgres@localhost:5432/viralpx')
  console.log('   Leave this running, then in another terminal:  pnpm dev')
  console.log('   Press Ctrl+C to stop.\n')
}

async function shutdown() {
  console.log('\n› Stopping local Postgres…')
  try {
    await pg.stop()
  } catch {}
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

main().catch((err) => {
  console.error('Failed to start local Postgres:', err)
  process.exit(1)
})
