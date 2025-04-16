import { Metadata } from "next"
import { DEPLOYMENT_URL } from "@/constants/external-links"
import { Terms } from "@/components/terms"
import fs from "fs/promises"
import path from "path"

export const metadata: Metadata = {
  alternates: {
    canonical: DEPLOYMENT_URL + '/terms',
  },
}

export default async function TermsPage() {
  const termsFilePath = path.join(process.cwd(), 'src', 'constants', 'terms.md')
  const terms = await fs.readFile(termsFilePath, 'utf-8')

  return (
    <Terms terms={terms} />
  )
}
