import { DEPLOYMENT_URL } from '@/constants/external-links'
import { META_TITLE, META_DESCRIPTION } from '@/constants/metadata'
import { SOLUTIONS_LANDING_PAGES } from '@/constants/solutions-pages'
import { getAllPostsMeta } from '@/lib/blog'
import { getAllSolutionContent } from '@/lib/solutions-content'

export const dynamic = 'force-static'

export async function GET() {
  const posts = await getAllPostsMeta()
  const solutions = await getAllSolutionContent()
  const pagesList = solutions
    .map(s => {
      const shell = SOLUTIONS_LANDING_PAGES[s.slug]
      const heading = shell ? shell.h1 : s.title
      return `- [${heading}](${DEPLOYMENT_URL}/solutions/${s.slug}): ${s.description}`
    })
    .join('\n')
  const blogList = posts.map(p => `- [${p.title}](${DEPLOYMENT_URL}/blog/${p.slug}.md): ${p.description}`).join('\n')
  const content = `# ${META_TITLE}

> ${META_DESCRIPTION}

## Pages

${pagesList}

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

