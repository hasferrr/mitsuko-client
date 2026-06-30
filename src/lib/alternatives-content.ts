import fs from "fs/promises"
import path from "path"
import { ALTERNATIVES_PAGE_SLUGS } from "@/constants/alternatives-pages"
import { parseFrontmatter } from "@/lib/blog"

export type AlternativeContentMeta = {
  slug: string
  title: string
  description: string
  keywords: string[]
  updated?: string
}

export type AlternativeContent = AlternativeContentMeta & {
  content: string
}

const ALTERNATIVES_DIR = path.join(process.cwd(), "content", "alternatives")

export function getAlternativeSlugs(): string[] {
  return ALTERNATIVES_PAGE_SLUGS
}

export async function getAlternativeContent(slug: string): Promise<AlternativeContent | null> {
  if (!ALTERNATIVES_PAGE_SLUGS.includes(slug)) return null
  const filePath = path.join(ALTERNATIVES_DIR, `${slug}.md`)
  let raw: string
  try {
    raw = await fs.readFile(filePath, "utf8")
  } catch {
    return null
  }
  const { data, content } = parseFrontmatter(raw)
  return {
    slug,
    title: typeof data.title === "string" ? data.title : slug,
    description: typeof data.description === "string" ? data.description : "",
    keywords: Array.isArray(data.keywords) ? data.keywords : [],
    updated: typeof data.updated === "string" ? data.updated : undefined,
    content,
  }
}

export async function getAllAlternativeContent(): Promise<AlternativeContent[]> {
  const entries = await Promise.all(
    ALTERNATIVES_PAGE_SLUGS.map(slug => getAlternativeContent(slug)),
  )
  return entries.filter((entry): entry is AlternativeContent => entry !== null)
}
