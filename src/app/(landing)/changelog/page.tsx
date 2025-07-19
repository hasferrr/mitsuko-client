import { Metadata } from "next"
import { DEPLOYMENT_URL } from "@/constants/external-links"
import fs from "fs/promises"
import path from "path"
import { META_TITLE } from "@/constants/metadata"
import { Changelog } from "@/components/changelog/changelog"

export const metadata: Metadata = {
  title: `Changelog - ${META_TITLE}`,
  alternates: {
    canonical: DEPLOYMENT_URL + '/changelog',
  },
}

export default async function ChangelogPage() {
  const changelogFilePath = path.join(process.cwd(), 'CHANGELOG.md')
  const changelog = await fs.readFile(changelogFilePath, 'utf-8')

  return (
    <Changelog changelog={changelog} />
  )
}