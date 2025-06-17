import SubtitleTranslator from "@/components/translate/subtitle-translator"
import { DEPLOYMENT_URL } from "@/constants/external-links"
import { Metadata } from "next"

export const metadata: Metadata = {
  alternates: {
    canonical: DEPLOYMENT_URL + '/translate',
  },
}

export default function Home() {
  return <SubtitleTranslator />
}
