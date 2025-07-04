import SubtitleViewer from "@/components/tools/subtitle-viewer"
import { DEPLOYMENT_URL } from "@/constants/external-links"
import { Metadata } from "next"

export const metadata: Metadata = {
  alternates: {
    canonical: DEPLOYMENT_URL + '/tools',
  },
}

export default function ToolsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Tools</h1>
      <SubtitleViewer />
    </div>
  )
}