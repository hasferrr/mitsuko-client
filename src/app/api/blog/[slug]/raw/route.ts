import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { parseFrontmatter, toSlug } from '@/lib/blog'
import { DEPLOYMENT_URL } from '@/constants/external-links'

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')

async function findMarkdownFile(slug: string): Promise<string | null> {
  const names = await fs.readdir(BLOG_DIR).catch(() => [])
  const files = names.filter(n => /\.(md|mdx)$/i.test(n))

  for (const file of files) {
    const fullPath = path.join(BLOG_DIR, file)
    const raw = await fs.readFile(fullPath, 'utf8')
    const { data } = parseFrontmatter(raw)
    const fileSlug = toSlug(file)
    const fmSlug = typeof data.slug === 'string' && data.slug.trim() ? data.slug.trim() : fileSlug
    if (fmSlug === slug) {
      return fullPath
    }
  }
  return null
}

function rewriteBlogLinks(content: string): string {
  return content.replace(/(\[.*?\]\(|href=")(\/[^)\s"]*)/g, (match, prefix, path) => {
    if (path.endsWith('.md')) {
      return match
    }
    if (path === '/') {
      return `${prefix}${DEPLOYMENT_URL}/`
    }
    if (path.startsWith('/blog/')) {
      return `${prefix}${DEPLOYMENT_URL}${path}.md`
    }
    return match
  })
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const filePath = await findMarkdownFile(slug)

  if (!filePath) {
    return new NextResponse('Not found', { status: 404 })
  }

  const rawContent = await fs.readFile(filePath, 'utf8')
  const processedContent = rewriteBlogLinks(rawContent)

  return new NextResponse(processedContent, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  })
}
