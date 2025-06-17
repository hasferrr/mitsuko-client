import Transcription from "@/components/transcribe/transcription"
import { DEPLOYMENT_URL } from "@/constants/external-links"
import { Metadata } from "next"

export const metadata: Metadata = {
  alternates: {
    canonical: DEPLOYMENT_URL + '/transcribe',
  },
}

export default function TranscriptionPage() {
  return <Transcription />
}
