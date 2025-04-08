import { Project } from "@/components/project/project"
import { DEPLOYMENT_URL } from "@/constants/external-links"
import { Metadata } from "next"

export const metadata: Metadata = {
  alternates: {
    canonical: DEPLOYMENT_URL + '/project',
  },
}

export default function ProjectPage() {
  return <Project />
}
