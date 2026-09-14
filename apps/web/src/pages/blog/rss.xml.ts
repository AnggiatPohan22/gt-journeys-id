import type { APIRoute } from 'astro'
import { getPosts } from '@lib/payload'
import { isBlogFlagEnabled } from '@lib/features'
import { SITE_URL, absUrl } from '@lib/structuredData'
import type { Media } from '@shared/types/payload-types'

// RSS 2.0 feed for the blog. Hand-rolled (no @astrojs/rss dep) —
// the payload is small and the escaping rules are simple. Feed URL
// is announced via a <link rel="alternate"> in /blog/[slug].astro.

const escapeXml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')

const rfc822 = (d?: string | null) => {
  if (!d) return ''
  try { return new Date(d).toUTCString() } catch { return '' }
}

const asMedia = (v: unknown): Media | null => (v && typeof v === 'object' ? (v as Media) : null)

export const GET: APIRoute = async ({ site }) => {
  const enabled = await isBlogFlagEnabled('enabled').catch(() => true)
  const base = (site?.href ?? SITE_URL).replace(/\/$/, '')

  const feedTitle = 'DN Journeys Bali — Travel Stories'
  const feedDescription = 'Latest travel guides, tips, and stories from Bali.'
  const feedLink = `${base}/blog`
  const feedSelf = `${base}/blog/rss.xml`

  if (!enabled) {
    return xmlResponse(buildFeed(feedTitle, feedDescription, feedLink, feedSelf, []))
  }

  const { docs } = await getPosts({ limit: 50, sort: '-publishedAt' }).catch(() => ({ docs: [] as any[] }))

  const items = docs.map((post: any) => {
    const link = absUrl(`/blog/${post.slug}`, base)
    const category = typeof post.category === 'object' ? post.category?.name : ''
    const img = asMedia(post.featuredImage)
    const imgUrl = img?.url ? absUrl(img.url, base) : ''
    const description = post.excerpt ?? ''
    return {
      title: post.title,
      link,
      description,
      pubDate: rfc822(post.publishedAt ?? post.createdAt),
      category,
      imgUrl,
      imgType: img?.mimeType ?? 'image/jpeg',
    }
  })

  return xmlResponse(buildFeed(feedTitle, feedDescription, feedLink, feedSelf, items))
}

interface Item {
  title: string
  link: string
  description: string
  pubDate: string
  category?: string
  imgUrl?: string
  imgType?: string
}

function buildFeed(title: string, description: string, link: string, self: string, items: Item[]): string {
  const parts: string[] = []
  parts.push('<?xml version="1.0" encoding="UTF-8"?>')
  parts.push('<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">')
  parts.push('<channel>')
  parts.push(`<title>${escapeXml(title)}</title>`)
  parts.push(`<link>${escapeXml(link)}</link>`)
  parts.push(`<description>${escapeXml(description)}</description>`)
  parts.push(`<language>en-us</language>`)
  parts.push(`<atom:link href="${escapeXml(self)}" rel="self" type="application/rss+xml" />`)

  for (const it of items) {
    parts.push('<item>')
    parts.push(`<title>${escapeXml(it.title)}</title>`)
    parts.push(`<link>${escapeXml(it.link)}</link>`)
    parts.push(`<guid isPermaLink="true">${escapeXml(it.link)}</guid>`)
    if (it.description) parts.push(`<description>${escapeXml(it.description)}</description>`)
    if (it.pubDate) parts.push(`<pubDate>${escapeXml(it.pubDate)}</pubDate>`)
    if (it.category) parts.push(`<category>${escapeXml(it.category)}</category>`)
    if (it.imgUrl) parts.push(`<enclosure url="${escapeXml(it.imgUrl)}" type="${escapeXml(it.imgType ?? 'image/jpeg')}" />`)
    parts.push('</item>')
  }

  parts.push('</channel>')
  parts.push('</rss>')
  return parts.join('\n')
}

function xmlResponse(xml: string): Response {
  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800',
    },
  })
}
