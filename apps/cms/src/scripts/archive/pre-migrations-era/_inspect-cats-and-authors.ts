import { createClient } from '@libsql/client'
import path from 'path'
import { fileURLToPath } from 'url'
const dirname = path.dirname(fileURLToPath(import.meta.url))
const c = createClient({ url: `file:${path.resolve(dirname, '../../cms.db')}` })

const catSql = await c.execute(`SELECT sql FROM sqlite_master WHERE type='table' AND name='categories'`)
console.log('categories CREATE TABLE:')
console.log(catSql.rows[0]?.sql)
console.log('\n---')

const authors = await c.execute(`SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%author%'`)
console.log('authors tables:', authors.rows.map((r: any) => r.name))

const authorIdx = await c.execute(`SELECT name FROM sqlite_master WHERE type='index' AND (name LIKE '%author%' OR tbl_name LIKE '%author%')`)
console.log('authors indexes:', authorIdx.rows.map((r: any) => r.name))

process.exit(0)
