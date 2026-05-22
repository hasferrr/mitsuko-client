import { Metadata } from "next"
import { SeoLandingPage } from "@/components/landing/seo-landing-page"
import { SEO_LANDING_PAGES } from "@/constants/seo-pages"
import { createSeoLandingMetadata } from "@/lib/seo-page-metadata"

const page = SEO_LANDING_PAGES["batch-subtitle-translation"]

export const metadata: Metadata = createSeoLandingMetadata(page)

export default function BatchSubtitleTranslationPage() {
  return <SeoLandingPage page={page} />
}
