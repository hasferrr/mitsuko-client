'use client'

import Link from 'next/link'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { useEffect } from 'react'
import Navbar from '@/components/landing/navbar'
import * as Sentry from '@sentry/nextjs'
import posthog from 'posthog-js'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
    Sentry.captureException(error)
    posthog.captureException(error)
  }, [error])

  return (
    <div className="min-h-screen text-gray-900 dark:text-white flex flex-col items-center">
      <Navbar />
      <div className="flex-1 flex flex-col gap-4 items-center justify-center px-4 pb-12">
        <h1 className="text-4xl font-semibold">Something went wrong!</h1>
        <p className="text-muted-foreground">
          {error.message || 'An unexpected error occurred'}
        </p>
        <div className="flex gap-6 mt-4">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 transition-colors hover:text-primary"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
          <Link href="/" className="inline-flex items-center gap-2 transition-colors hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Go back home
          </Link>
        </div>
      </div>
    </div>
  )
}