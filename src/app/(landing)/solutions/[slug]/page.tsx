import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { SolutionsContentPage } from "@/components/landing/solutions-content-page"
import { SOLUTIONS_LANDING_PAGES, SOLUTIONS_LANDING_PAGE_SLUGS } from "@/constants/solutions-pages"
import { createSolutionsLandingMetadata, getSolutionContent } from "@/lib/content/solutions"

export const dynamic = "force-static"

export function generateStaticParams() {
  return SOLUTIONS_LANDING_PAGE_SLUGS.map(slug => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const content = await getSolutionContent(slug)
  if (!content) return {}
  return createSolutionsLandingMetadata(slug, {
    title: content.title,
    description: content.description,
    keywords: content.keywords,
  })
}

export default async function SolutionPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const shell = SOLUTIONS_LANDING_PAGES[slug]
  const content = await getSolutionContent(slug)
  if (!shell || !content) return notFound()

  return (
    <SolutionsContentPage
      shell={shell}
      meta={{ slug: content.slug, title: content.title, description: content.description, keywords: content.keywords }}
      content={content.content}
    />
  )
}
