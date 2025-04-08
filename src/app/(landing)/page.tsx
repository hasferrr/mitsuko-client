import { Metadata } from "next"
import { DEPLOYMENT_URL } from "@/constants/external-links"
import MainLandingPage from "@/components/landing/main"

export const metadata: Metadata = {
  alternates: {
    canonical: DEPLOYMENT_URL + '/',
  },
}

export default function Home() {
  return (
    <MainLandingPage />
  )
}
