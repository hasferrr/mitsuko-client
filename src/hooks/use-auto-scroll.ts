import { useEffect, RefObject } from 'react'

export const useAutoScroll = <T extends HTMLElement>(dependency: unknown, ref: RefObject<T | null>) => {
  useEffect(() => {
    if (ref.current) {
      const { scrollTop, scrollHeight, clientHeight } = ref.current
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 200

      if (isAtBottom) {
        ref.current.scrollTop = scrollHeight
      }
    }
  }, [dependency, ref])
}
