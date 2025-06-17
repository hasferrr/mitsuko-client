import { Metadata } from "next"
import { DEPLOYMENT_URL } from "@/constants/external-links"
import { Privacy } from "@/components/privacy/privacy"
import fs from "fs/promises"
import path from "path"
import { META_TITLE } from "@/constants/metadata"

export const metadata: Metadata = {
  title: `Privacy Policy - ${META_TITLE}`,
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
