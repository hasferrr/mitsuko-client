import { Metadata } from "next"
import { SolutionsLandingPage } from "@/components/landing/solutions-landing-page"
import { SOLUTIONS_LANDING_PAGES } from "@/constants/solutions-pages"
import { createSolutionsLandingMetadata } from "@/lib/solutions-page-metadata"

const page = SOLUTIONS_LANDING_PAGES["audio-to-subtitles"]

export const metadata: Metadata = createSolutionsLandingMetadata(page)

export default function AudioToSubtitlesPage() {
  return <SolutionsLandingPage page={page} />
}
