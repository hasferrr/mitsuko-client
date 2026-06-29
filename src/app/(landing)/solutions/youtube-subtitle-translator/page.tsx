import { Metadata } from "next"
import { SolutionsLandingPage } from "@/components/landing/solutions-landing-page"
import { SOLUTIONS_LANDING_PAGES } from "@/constants/solutions-pages"
import { createSolutionsLandingMetadata } from "@/lib/solutions-page-metadata"

const page = SOLUTIONS_LANDING_PAGES["youtube-subtitle-translator"]

export const metadata: Metadata = createSolutionsLandingMetadata(page)

export default function YoutubeSubtitleTranslatorPage() {
  return <SolutionsLandingPage page={page} />
}
