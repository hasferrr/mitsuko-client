import { WelcomeView } from "@/components/dashboard/welcome-view"
import { DEPLOYMENT_URL } from "@/constants/external-links"
import { Metadata } from "next"

export const metadata: Metadata = {
  alternates: {
    canonical: DEPLOYMENT_URL + '/dashboard',
  },
}

export default function DashboardPage() {
  return (
    <div className="container">
      <WelcomeView />
    </div>
  )
}
