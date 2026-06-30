import fs from "fs/promises"
import path from "path"
import { SOLUTIONS_LANDING_PAGE_SLUGS } from "@/constants/solutions-pages"
import { parseFrontmatter } from "@/lib/blog"

export type SolutionContentMeta = {
  slug: string
  title: string
  description: string
  keywords: string[]
}

export type SolutionContent = SolutionContentMeta & {
  content: string
}

const SOLUTIONS_DIR = path.join(process.cwd(), "content", "solutions")

export function getSolutionSlugs(): string[] {
  return SOLUTIONS_LANDING_PAGE_SLUGS
}

export async function getSolutionContent(slug: string): Promise<SolutionContent | null> {
  if (!SOLUTIONS_LANDING_PAGE_SLUGS.includes(slug)) return null
  const filePath = path.join(SOLUTIONS_DIR, `${slug}.md`)
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
    content,
  }
}

export async function getAllSolutionContent(): Promise<SolutionContent[]> {
  const entries = await Promise.all(
    SOLUTIONS_LANDING_PAGE_SLUGS.map(slug => getSolutionContent(slug)),
  )
  return entries.filter((entry): entry is SolutionContent => entry !== null)
}
