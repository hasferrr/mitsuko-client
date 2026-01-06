"use client"

import { useCallback, useEffect, useState } from "react"
import { useSessionStore } from "@/stores/use-session-store"
import { ProductId } from "@/types/product"

export function useLemonSqueezyCache() {
  const session = useSessionStore((state) => state.session)
  const [cache, setCache] = useState<Map<string, string>>(() => new Map())

  useEffect(() => {
    if (!session) {
      setCache(new Map())
    }
  }, [session])

  const get = useCallback((key: string) => cache.get(key), [cache])

  const set = useCallback((productId: ProductId, inputQuantity: number, value: string) => {
    const key = `${productId}-${inputQuantity}`
    setCache((prev) => {
      const next = new Map(prev)
      next.set(key, value)
      return next
    })
  }, [])

  const remove = useCallback((key: string) => {
    setCache((prev) => {
      if (!prev.has(key)) return prev
      const next = new Map(prev)
      next.delete(key)
      return next
    })
  }, [])

  const clear = useCallback(() => {
    setCache(new Map())
  }, [])

  return {
    get,
    set,
    remove,
    clear,
    size: cache.size,
  }
}
