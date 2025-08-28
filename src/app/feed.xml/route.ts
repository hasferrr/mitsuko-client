import { DEPLOYMENT_URL } from '@/constants/external-links'
import { getAllPostsMeta } from '@/lib/blog'

export async function GET() {
  const posts = await getAllPostsMeta()
  const items = posts
    .map(p => {
      const link = `${DEPLOYMENT_URL}/blog/${p.slug}`
      const pub = new Date(p.date).toUTCString()
      const mod = p.updated ? new Date(p.updated).toUTCString() : pub
      const desc = `<![CDATA[${p.description}]]>`
      return `\n    <item>\n      <title>${escapeXml(p.title)}</title>\n      <link>${link}</link>\n      <guid>${link}</guid>\n      <pubDate>${pub}</pubDate>\n      <description>${desc}</description>\n      <lastBuildDate>${mod}</lastBuildDate>\n    </item>`
    })
    .join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>Mitsuko Blog</title>\n    <link>${DEPLOYMENT_URL}/blog</link>\n    <description>Guides, tips, and product updates for AI subtitle translation and transcription.</description>\n    <language>en-us</language>\n    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}\n  </channel>\n</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 's-maxage=600, stale-while-revalidate=86400'
    }
  })
}

function escapeXml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
