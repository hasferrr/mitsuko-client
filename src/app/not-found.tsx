import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import Navbar from '@/components/landing/navbar'

export default function NotFound() {
  return (
    <div className="min-h-screen text-gray-900 dark:text-white flex flex-col items-center">
      <Navbar />
      <div className="flex-1 flex flex-col gap-4 items-center justify-center px-4 pb-12">
        <h1 className="text-4xl font-semibold">404</h1>
        <p className="text-muted-foreground">This page could not be found.</p>
        <Link href="/" className="inline-flex items-center gap-2 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Go back home
        </Link>
      </div>
    </div>
  )
}