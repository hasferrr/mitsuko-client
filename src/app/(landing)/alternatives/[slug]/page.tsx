import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { AlternativeContentPage } from "@/components/landing/alternative-content-page"
import { ALTERNATIVES_LANDING_PAGES, ALTERNATIVES_PAGE_SLUGS } from "@/constants/alternatives-pages"
import { createAlternativeLandingMetadata } from "@/lib/alternatives-page-metadata"
import { getAlternativeContent } from "@/lib/alternatives-content"

export const dynamic = "force-static"

export function generateStaticParams() {
  return ALTERNATIVES_PAGE_SLUGS.map(slug => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const content = await getAlternativeContent(slug)
  if (!content) return {}
  return createAlternativeLandingMetadata(slug, {
    title: content.title,
    description: content.description,
    keywords: content.keywords,
  })
}

export default async function AlternativePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const shell = ALTERNATIVES_LANDING_PAGES[slug]
  const content = await getAlternativeContent(slug)
  if (!shell || !content) return notFound()

  return (
    <AlternativeContentPage
      shell={shell}
      meta={{
        slug: content.slug,
        title: content.title,
        description: content.description,
        keywords: content.keywords,
        updated: content.updated,
      }}
      content={content.content}
    />
  )
}
