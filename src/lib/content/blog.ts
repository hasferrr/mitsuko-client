import fs from 'fs/promises'
import path from 'path'
import { parseFrontmatter } from "@/lib/content/frontmatter"

type PostMeta = {
  slug: string
  title: string
  description: string
  date: string
  updated?: string
  tags: string[]
  image?: string
  imageAlt?: string
  author?: string
  draft?: boolean
  readingTimeMinutes: number
  words: number
}

type PostData = PostMeta & {
  content: string
}

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')

export function toSlug(name: string) {
  return name
    .replace(/\.mdx?$/i, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-_]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

async function listMarkdownFiles() {
  const names = await fs.readdir(BLOG_DIR)
  return names.filter(n => /\.(md|mdx)$/i.test(n))
}

function computeReadingStats(content: string) {
  const words = content.split(/\s+/).filter(Boolean).length
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200))
  return { words, readingTimeMinutes }
}

export async function getAllPostsMeta(): Promise<PostMeta[]> {
  const files = await listMarkdownFiles()
  const posts: PostMeta[] = []
  for (const file of files) {
    const full = path.join(BLOG_DIR, file)
    const raw = await fs.readFile(full, 'utf8')
    const { data, content } = parseFrontmatter(raw)
    const baseSlug = toSlug(file)
    const slug = typeof data.slug === 'string' && data.slug.trim() ? data.slug.trim() : baseSlug
    const { words, readingTimeMinutes } = computeReadingStats(content)
    const title = typeof data.title === 'string' ? data.title : baseSlug
    const description = typeof data.description === 'string' ? data.description : content.slice(0, 180).replace(/\n/g, ' ')
    const date = typeof data.date === 'string' ? data.date : new Date().toISOString().slice(0, 10)
    const updated = typeof data.updated === 'string' ? data.updated : undefined
    const tags = Array.isArray(data.tags) ? data.tags : []
    const image = typeof data.image === 'string' ? data.image : undefined
    const imageAlt = typeof data.imageAlt === 'string' ? data.imageAlt : undefined
    const author = typeof data.author === 'string' ? data.author : undefined
    const draft = typeof data.draft === 'boolean' ? data.draft : false
    if (draft) continue
    posts.push({ slug, title, description, date, updated, tags, image, imageAlt, author, draft, words, readingTimeMinutes })
  }
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  return posts
}

export async function getPostBySlug(slug: string): Promise<PostData | null> {
  const files = await listMarkdownFiles()
  for (const file of files) {
    const baseSlug = toSlug(file)
    const full = path.join(BLOG_DIR, file)
    const raw = await fs.readFile(full, 'utf8')
    const { data, content } = parseFrontmatter(raw)
    const fmSlug = typeof data.slug === 'string' && data.slug.trim() ? data.slug.trim() : baseSlug
    if (fmSlug !== slug) continue
    const { words, readingTimeMinutes } = computeReadingStats(content)
    const title = typeof data.title === 'string' ? data.title : baseSlug
    const description = typeof data.description === 'string' ? data.description : content.slice(0, 180).replace(/\n/g, ' ')
    const date = typeof data.date === 'string' ? data.date : new Date().toISOString().slice(0, 10)
    const updated = typeof data.updated === 'string' ? data.updated : undefined
    const tags = Array.isArray(data.tags) ? data.tags : []
    const image = typeof data.image === 'string' ? data.image : undefined
    const imageAlt = typeof data.imageAlt === 'string' ? data.imageAlt : undefined
    const author = typeof data.author === 'string' ? data.author : undefined
    const draft = typeof data.draft === 'boolean' ? data.draft : false
    if (draft) return null
    return { slug: fmSlug, title, description, date, updated, tags, image, imageAlt, author, draft, words, readingTimeMinutes, content }
  }
  return null
}

export async function getAdjacentPosts(slug: string) {
  const all = await getAllPostsMeta()
  const idx = all.findIndex(p => p.slug === slug)
  return {
    prev: idx > 0 ? all[idx - 1] : null,
    next: idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null
  }
}
