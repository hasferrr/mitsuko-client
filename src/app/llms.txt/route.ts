import { DEPLOYMENT_URL } from '@/constants/external-links'
import { META_TITLE, META_DESCRIPTION } from '@/constants/metadata'
import { getAllAlternativeContent } from '@/lib/content/alternatives'
import { getAllPostsMeta } from '@/lib/content/blog'

export const dynamic = 'force-static'

export async function GET() {
  const posts = await getAllPostsMeta()
  const alternatives = await getAllAlternativeContent()
  const alternativesList = alternatives
    .map(page => `- [${page.title}](${DEPLOYMENT_URL}/alternatives/${page.slug}): ${page.description}`)
    .join('\n')
  const blogList = posts.map(p => `- [${p.title}](${DEPLOYMENT_URL}/blog/${p.slug}.md): ${p.description}`).join('\n')
  const content = `# ${META_TITLE}

> ${META_DESCRIPTION}

## Articles

${blogList || '- No posts available yet'}

## Alternatives

${alternativesList || '- No alternatives available yet'}
`

  return new Response(content, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400'
    }
  })
}
