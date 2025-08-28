import { DEPLOYMENT_URL } from '@/constants/external-links'
import { getAllPostsMeta } from '@/lib/blog'

export async function GET() {
  const posts = await getAllPostsMeta()
  const feed = {
    version: 'https://jsonfeed.org/version/1',
    title: 'Mitsuko Blog',
    home_page_url: `${DEPLOYMENT_URL}/blog`,
    feed_url: `${DEPLOYMENT_URL}/feed.json`,
    items: posts.map(p => ({
      id: `${DEPLOYMENT_URL}/blog/${p.slug}`,
      url: `${DEPLOYMENT_URL}/blog/${p.slug}`,
      title: p.title,
      summary: p.description,
      date_published: new Date(p.date).toISOString(),
      date_modified: p.updated ? new Date(p.updated).toISOString() : undefined,
      tags: p.tags
    }))
  }
  return new Response(JSON.stringify(feed), {
    headers: {
      'Content-Type': 'application/feed+json; charset=utf-8',
      'Cache-Control': 's-maxage=600, stale-while-revalidate=86400'
    }
  })
}
