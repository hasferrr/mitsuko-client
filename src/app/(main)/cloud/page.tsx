import CloudWrapper from '@/components/cloud/cloud-wrapper'
import { DEPLOYMENT_URL } from '@/constants/external-links'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: {
    canonical: DEPLOYMENT_URL + '/cloud',
  },
}

export default function Page() {
  return <CloudWrapper />
}