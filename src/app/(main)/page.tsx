import SubtitleTranslator from "@/components/subtitle-translator"
import { DEPLOYMENT_URL } from "@/constants/external-links"
import { Metadata } from "next"

export const metadata: Metadata = {
  alternates: {
    canonical: DEPLOYMENT_URL + '/',
  },
}

export default function Home() {
  return <SubtitleTranslator />
}
