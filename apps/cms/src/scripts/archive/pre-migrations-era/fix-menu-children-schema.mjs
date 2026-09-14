/**
 * One-shot fix untuk Phase 3.12 menu schema drift.
 *
 * Payload SQLite `push` mode salah handle nested array table:
 *  1. Kolom baru di `menus_items_children` (type, page_id) tidak ter-add
 *  2. Setelah manual ALTER TABLE, push detect "drift" dan mencoba
 *     recreate seluruh schema — tapi index existing tidak di-drop dulu,
 *     jadi CREATE INDEX gagal (`already exists`).
 *
 * Fix: (1) DROP semua index Payload-managed di menus_* tables →
 * Payload push akan recreate saat boot, (2) ALTER TABLE ADD COLUMN
 * yang belum ada, (3) backfill data lama.
 *
 * Idempotent — aman diulang.
 *
 * Jalankan: cd apps/cms && node src/scripts/fix-menu-children-schema.mjs
 */
import { createClient } from '@libsql/client'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dbPath = path.resolve(__dirname, '../../cms.db')

console.log('→ target DB:', dbPath)
const client = createClient({ url: `file:${dbPath}` })

// ─── STEP 1: DROP semua index custom di tabel menus_* ─────────────────
// Payload push akan recreate. Skip sqlite_autoindex_* (auto-managed).
const indexRows = await client.execute({
  sql: `SELECT name, tbl_name FROM sqlite_master
        WHERE type = 'index'
          AND (tbl_name = 'menus' OR tbl_name LIKE 'menus\\_%' ESCAPE '\\')
          AND name NOT LIKE 'sqlite\\_%' ESCAPE '\\'`,
  args: [],
})
console.log(`→ ditemukan ${indexRows.rows.length} custom index di tabel menus_*`)
for (const row of indexRows.rows) {
  const name = row.name
  try {
    await client.execute(`DROP INDEX IF EXISTS "${name}"`)
    console.log(`  ✓ dropped index ${name} (tbl: ${row.tbl_name})`)
  } catch (e) {
    console.log(`  ✗ drop ${name}:`, e?.message ?? e)
  }
}

// ─── STEP 2: ALTER TABLE ADD COLUMN untuk children ────────────────────
// Idempotent — kalau kolom sudah ada, skip.
const alterStmts = [
  `ALTER TABLE menus_items_children ADD COLUMN type text DEFAULT 'custom_url'`,
  `ALTER TABLE menus_items_children ADD COLUMN page_id integer REFERENCES pages(id) ON DELETE SET NULL`,
]
for (const sql of alterStmts) {
  try {
    await client.execute(sql)
    console.log('✓', sql)
  } catch (e) {
    const msg = e?.message ?? String(e)
    if (msg.includes('duplicate column')) {
      console.log('⊘ column already exists —', sql.split('ADD COLUMN')[1]?.trim())
    } else {
      console.log('✗', sql, '\n  →', msg)
    }
  }
}

// ─── STEP 3: Backfill row lama tanpa type ─────────────────────────────
try {
  const res = await client.execute(`UPDATE menus_items_children SET type = 'custom_url' WHERE type IS NULL`)
  console.log(`✓ backfill: ${res.rowsAffected} rows set type='custom_url'`)
} catch (e) {
  console.log('✗ backfill:', e?.message ?? e)
}

await client.close()
console.log('\n✅ done. Sekarang: hapus .next cache + restart CMS.')
console.log('   rm -rf apps/cms/.next  (atau via Explorer)')
console.log('   cd apps/cms && pnpm dev')
