import { DEPLOYMENT_URL } from '@/constants/external-links'
import { META_TITLE, META_DESCRIPTION } from '@/constants/metadata'
import { getAllPostsMeta } from '@/lib/blog'

export const dynamic = 'force-static'

export async function GET() {
  const posts = await getAllPostsMeta()
  const blogList = posts.map(p => `- [${p.title}](${DEPLOYMENT_URL}/blog/${p.slug}): ${p.description}`).join('\n')
  const content = `# ${META_TITLE}

> ${META_DESCRIPTION}

## Articles

${blogList || '- No posts available yet'}
`

  return new Response(content, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400'
    }
  })
}
