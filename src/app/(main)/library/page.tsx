import LibraryView from '@/components/library/library-view'
import { DEPLOYMENT_URL } from '@/constants/external-links'
import { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: {
    canonical: DEPLOYMENT_URL + '/library',
  },
}

export default function LibraryPage() {
  return <LibraryView />
}