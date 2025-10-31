"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function useRoutePrefetch() {
  const router = useRouter()

  useEffect(() => {
    router.prefetch('/translate')
    router.prefetch('/transcribe')
    router.prefetch('/extract-context')
  }, [router])
}
