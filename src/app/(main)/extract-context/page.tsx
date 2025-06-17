import { ContextExtractor } from "@/components/extract-context/context-extractor"
import { DEPLOYMENT_URL } from "@/constants/external-links"
import { Metadata } from "next"

export const metadata: Metadata = {
  alternates: {
    canonical: DEPLOYMENT_URL + '/extract-context',
  },
}

export default function ExtractionPage() {
  return <ContextExtractor />
}
