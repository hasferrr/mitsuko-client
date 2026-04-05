import { useCallback } from "react"

export const useScrollToTop = () => {
  return useCallback((delay = 300) => {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }, delay)
  }, [])
}
