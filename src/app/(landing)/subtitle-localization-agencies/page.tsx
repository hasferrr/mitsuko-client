import { Metadata } from "next"
import { SeoLandingPage } from "@/components/landing/seo-landing-page"
import { SEO_LANDING_PAGES } from "@/constants/seo-pages"
import { createSeoLandingMetadata } from "@/lib/seo-page-metadata"

const page = SEO_LANDING_PAGES["subtitle-localization-agencies"]

export const metadata: Metadata = createSeoLandingMetadata(page)

export default function SubtitleLocalizationAgenciesPage() {
  return <SeoLandingPage page={page} />
}
