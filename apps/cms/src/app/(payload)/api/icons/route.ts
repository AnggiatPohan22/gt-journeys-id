import { NextResponse } from 'next/server'
import mdiIcons from '@iconify-json/mdi/icons.json'
import lucideIcons from '@iconify-json/lucide/icons.json'

interface IconSet {
  prefix: string
  width?: number
  height?: number
  icons: Record<string, { body: string; width?: number; height?: number }>
}

const SETS: IconSet[] = [mdiIcons as unknown as IconSet, lucideIcons as unknown as IconSet]

export async function GET(req: Request) {
  const url = new URL(req.url)
  const q = (url.searchParams.get('q') ?? '').toLowerCase().trim()
  const prefixFilter = url.searchParams.get('prefix') ?? ''
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '48', 10) || 48, 200)

  const results: Array<{
    id: string
    prefix: string
    name: string
    body: string
    width: number
    height: number
  }> = []

  const activeSets = prefixFilter
    ? SETS.filter((s) => s.prefix === prefixFilter)
    : SETS

  for (const set of activeSets) {
    const defaultW = set.width ?? 24
    const defaultH = set.height ?? 24
    for (const [name, data] of Object.entries(set.icons)) {
      if (results.length >= limit) break
      if (q && !name.includes(q)) continue
      results.push({
        id: `${set.prefix}:${name}`,
        prefix: set.prefix,
        name,
        body: data.body,
        width: data.width ?? defaultW,
        height: data.height ?? defaultH,
      })
    }
    if (results.length >= limit) break
  }

  return NextResponse.json(results)
}
