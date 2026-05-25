"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { isRoutePrefetchDisabled } from "@/lib/route-prefetch-policy"

export const FeaturesPrefetcher = () => {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isRoutePrefetchDisabled(pathname)) {
      return
    }

    router.prefetch('/translate')
    router.prefetch('/transcribe')
    router.prefetch('/extract-context')
  }, [pathname, router])

  return null
}
