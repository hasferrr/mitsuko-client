import { useEffect, RefObject } from 'react'

export const useAutoScroll = (dependency: unknown, ref: RefObject<HTMLTextAreaElement | null>) => {
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
