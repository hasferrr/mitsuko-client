import BatchTranslator from "@/components/batch/batch-translator"
import { DEPLOYMENT_URL } from "@/constants/external-links"
import { Metadata } from "next"

export const metadata: Metadata = {
  alternates: {
    canonical: DEPLOYMENT_URL + '/batch',
  },
}

export default function BatchPage() {
  return <BatchTranslator />
}
