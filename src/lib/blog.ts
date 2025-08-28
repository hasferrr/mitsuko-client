import fs from 'fs/promises'
import path from 'path'

export type PostMeta = {
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

export type PostData = PostMeta & {
  content: string
}

export type Frontmatter = {
  title?: string
  description?: string
  date?: string
  updated?: string
  slug?: string
  tags?: string[]
  image?: string
  imageAlt?: string
  author?: string
  draft?: boolean
}

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')

function toSlug(name: string) {
  return name
    .replace(/\\.mdx?$/i, '')
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

function parseArrayValue(raw: string, lines: string[], iRef: { i: number }) {
  const trimmed = raw.trim()
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    const inner = trimmed.slice(1, -1)
    return inner.split(',').map(s => s.trim()).filter(Boolean)
  }
  const out: string[] = []
  let i = iRef.i + 1
  while (i < lines.length) {
    const line = lines[i]
    if (!/^\s*-\s+/.test(line)) break
    out.push(line.replace(/^\s*-\s+/, '').trim())
    i += 1
  }
  iRef.i = i - 1
  return out
}

function stripQuotes(v: string) {
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) return v.slice(1, -1)
  return v
}

export function parseFrontmatter(raw: string): { data: Partial<Frontmatter>, content: string } {
  const text = raw.replace(/^\uFEFF/, '')
  const lines = text.split(/\r?\n/)
  if (lines[0] !== '---') {
    return { data: {}, content: text }
  }
  let end = -1
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === '---') {
      end = i
      break
    }
  }
  if (end === -1) {
    return { data: {}, content: text }
  }
  const fmLines = lines.slice(1, end)
  const content = lines.slice(end + 1).join('\n')
  const data: Partial<Frontmatter> = {}
  for (let i = 0; i < fmLines.length; i++) {
    const line = fmLines[i]
    if (!line.trim()) continue
    const idx = line.indexOf(':')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    const valueRaw = line.slice(idx + 1).trim()
    switch (key) {
      case 'tags': {
        const ref = { i }
        data.tags = parseArrayValue(valueRaw, fmLines, ref)
        i = ref.i
        break
      }
      case 'draft':
        data.draft = valueRaw === 'true'
        break
      case 'date':
        if (/^\d{4}-\d{2}-\d{2}/.test(valueRaw)) data.date = valueRaw
        break
      case 'updated':
        if (/^\d{4}-\d{2}-\d{2}/.test(valueRaw)) data.updated = valueRaw
        break
      case 'title':
        data.title = stripQuotes(valueRaw)
        break
      case 'description':
        data.description = stripQuotes(valueRaw)
        break
      case 'slug':
        data.slug = stripQuotes(valueRaw)
        break
      case 'image':
        data.image = stripQuotes(valueRaw)
        break
      case 'imageAlt':
        data.imageAlt = stripQuotes(valueRaw)
        break
      case 'author':
        data.author = stripQuotes(valueRaw)
        break
      default:
        break
    }
  }
  return { data, content }
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
