import Tools from "@/components/tools/tools"
import { DEPLOYMENT_URL } from "@/constants/external-links"
import { Metadata } from "next"

export const metadata: Metadata = {
  alternates: {
    canonical: DEPLOYMENT_URL + '/tools',
  },
}

export default function ToolsPage() {
  return (
    <Tools />
  )
}