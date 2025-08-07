import HistoryView from '@/components/history/history-view'
import { DEPLOYMENT_URL } from '@/constants/external-links'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: {
    canonical: DEPLOYMENT_URL + '/history',
  },
}

export default function Page() {
  return <HistoryView />
}