import Batch from "@/components/batch/batch"
import { DEPLOYMENT_URL } from "@/constants/external-links"
import { Metadata } from "next"

export const metadata: Metadata = {
  alternates: {
    canonical: DEPLOYMENT_URL + '/batch',
  },
  description: 'Create subtitle batch translation projects to translate multiple subtitle files at once. Translate SRT, VTT, and ASS files with a single click.'
}

export default function BatchPage() {
  return (
    <>
      <h1 className="sr-only">Subtitle Batch Translation</h1>
      <p className="sr-only">
        Create a new batch to translate multiple subtitles at once. Translate SRT, VTT, and ASS files with a single click.
      </p>
      <Batch />
    </>
  )
}
