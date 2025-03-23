import { Dashboard } from "@/components/dashboard/dashboard"
import { DEPLOYMENT_URL } from "@/constants/external-links"
import { Metadata } from "next"

export const metadata: Metadata = {
  alternates: {
    canonical: DEPLOYMENT_URL + '/project',
  },
}

export default function ProjectPage() {
  return <Dashboard />
}
