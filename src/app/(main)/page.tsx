import { WelcomeView } from "@/components/welcome-view"
import { DEPLOYMENT_URL } from "@/constants/external-links"
import { Metadata } from "next"

export const metadata: Metadata = {
  alternates: {
    canonical: DEPLOYMENT_URL + '/',
  },
}

export default function Home() {
  return (
    <div className="container">
      <WelcomeView />
    </div>
  )
}
