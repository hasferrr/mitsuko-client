"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export const FeaturesPrefetcher = () => {
  const router = useRouter()

  useEffect(() => {
    router.prefetch('/translate')
    router.prefetch('/transcribe')
    router.prefetch('/extract-context')
  }, [router])

  return null
}
