import { Metadata } from "next"
import { DEPLOYMENT_URL } from "@/constants/external-links"
import { META_TITLE } from "@/constants/metadata"
import Pricing from "@/components/pricing/pricing"

export const metadata: Metadata = {
  title: `Pricing - ${META_TITLE}`,
  alternates: {
    canonical: DEPLOYMENT_URL + '/pricing',
  },
}

export default async function PricingPage() {
  return (
    <Pricing />
  )
}
