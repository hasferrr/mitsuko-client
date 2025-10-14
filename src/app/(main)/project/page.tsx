import { Project } from "@/components/project/project"
import { DEPLOYMENT_URL } from "@/constants/external-links"
import { Metadata } from "next"

export const metadata: Metadata = {
  alternates: {
    canonical: DEPLOYMENT_URL + '/project',
  },
  title: 'Projects - Mitsuko',
  description: 'Create a new project to manage your subtitle translations. Organize, edit, and track all your work in one place.'
}

export default function ProjectPage() {
  return (
    <>
      <h1 className="sr-only">Translation & Transcription</h1>
      <p className="sr-only">
        Create a new project to manage your subtitle translations. Organize, edit, and track all your work in one place.
      </p>
      <Project />
    </>
  )
}
