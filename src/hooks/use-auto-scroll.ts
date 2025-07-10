import { useEffect, RefObject } from 'react'

export const useAutoScroll = <T extends HTMLElement>(
  dependency: unknown,
  ref: RefObject<T | null>,
  offset = 200,
) => {
  useEffect(() => {
    if (ref.current) {
      const { scrollTop, scrollHeight, clientHeight } = ref.current
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + offset

      if (isAtBottom) {
        ref.current.scrollTop = scrollHeight
      }
    }
  }, [dependency, ref])
}
