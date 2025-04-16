import { Metadata } from "next"
import { DEPLOYMENT_URL } from "@/constants/external-links"
import { Privacy } from "@/components/privacy"
import fs from "fs/promises"
import path from "path"

export const metadata: Metadata = {
  alternates: {
    canonical: DEPLOYMENT_URL + '/privacy',
  },
}

export default async function PrivacyPage() {
  const privacyFilePath = path.join(process.cwd(), 'src', 'constants', 'privacy.md')
  const privacy = await fs.readFile(privacyFilePath, 'utf-8')

  return (
    <Privacy privacy={privacy} />
  )
}
