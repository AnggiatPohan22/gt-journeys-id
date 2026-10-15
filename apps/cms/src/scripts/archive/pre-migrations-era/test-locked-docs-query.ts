// Reproduce the exact login-time query to confirm the schema is now
// consistent. If this succeeds, /admin login should pass.
import { createClient } from '@libsql/client'
import path from 'path'
import { fileURLToPath } from 'url'
const dirname = path.dirname(fileURLToPath(import.meta.url))
const c = createClient({ url: `file:${path.resolve(dirname, '../../cms.db')}` })

const sql = `select "id", "global_slug", "updated_at", (select coalesce(json_group_array(json_array("order", "path", "pages_id", "service_types_id", "destinations_id", "destination_types_id", "categories_id", "testimonials_id", "tours_id", "accommodations_id", "water_activities_id", "yachts_id", "restaurants_id", "venues_id", "rentals_id", "spa_id", "menus_id", "media_id", "users_id", "newsletter_subscribers_id")), json_array()) as "data" from (select * from "payload_locked_documents_rels" "payload_locked_documents__rels" where "payload_locked_documents__rels"."parent_id" = "payload_locked_documents"."id" order by "payload_locked_documents__rels"."order" asc) "payload_locked_documents__rels") as "_rels" from "payload_locked_documents" "payload_locked_documents" where "payload_locked_documents"."global_slug" is not null order by "payload_locked_documents"."created_at" desc`

try {
  const r = await c.execute(sql)
  console.log(`✓ Query OK — ${r.rows.length} row(s).`)
  process.exit(0)
} catch (e: any) {
  console.error('✗ Query failed:', e?.message ?? e)
  if (e?.cause) console.error('cause:', e.cause?.message ?? e.cause)
  process.exit(1)
}
