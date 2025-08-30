"use client"

import { createContext, PropsWithChildren, useEffect } from "react"

const StoragePersistenceContext = createContext(undefined)

export default function StoragePersistenceProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    let cancelled = false

    async function ensurePersistentStorage() {
      if (typeof navigator === "undefined" || !navigator.storage) return
      try {
        if (navigator.storage.persist) {
          await navigator.storage.persist()
        }
      } catch { }
      try {
        if (navigator.storage.estimate) {
          const estimate = await navigator.storage.estimate()
          if (estimate?.usage && estimate?.quota) {
            const usageMB = (estimate.usage / 1024 / 1024).toFixed(2)
            const quotaMB = (estimate.quota / 1024 / 1024).toFixed(2)
            const usagePercentage = (estimate.usage / estimate.quota) * 100
            console.log(`Storage usage: ${usageMB}MB of ${quotaMB}MB (${usagePercentage.toFixed(2)}%)`)
          }
        }
      } catch { }
    }

    const run = async () => {
      if (cancelled) return
      await ensurePersistentStorage()
    }

    run()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <StoragePersistenceContext.Provider value={undefined}>
      {children}
    </StoragePersistenceContext.Provider>
  )
}
