import { Metadata } from "next"
import { DEPLOYMENT_URL } from "@/constants/external-links"
import { MigratePage } from "@/components/dashboard/migrate-page"

export const metadata: Metadata = {
  alternates: {
    canonical: DEPLOYMENT_URL + '/',
  },
}

export default function Home() {
  return (
    <MigratePage />
  )
}
