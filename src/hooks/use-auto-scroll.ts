"use client"

import { type RefObject, useEffect, useRef } from "react"

const isAtBottom = (element: HTMLElement) =>
  Math.abs(
    element.scrollHeight - element.clientHeight - element.scrollTop,
  ) <= 25

interface AutoScrollOptions {
  isProcessing: boolean
  resetKey: unknown
}

export const useAutoScroll = <T extends HTMLElement>(
  dependency: unknown,
  ref: RefObject<T | null>,
  { isProcessing, resetKey }: AutoScrollOptions,
) => {
  const isAutoScrollEnabledRef = useRef(isProcessing)
  const scrollElementRef = useRef<T | null>(null)
  const processingRef = useRef(isProcessing)
  const resetKeyRef = useRef(resetKey)

  useEffect(() => {
    const element = ref.current
    const hasElementChanged = scrollElementRef.current !== element
    const hasResetKeyChanged = !Object.is(resetKeyRef.current, resetKey)
    const hasStartedProcessing = isProcessing && !processingRef.current

    processingRef.current = isProcessing
    resetKeyRef.current = resetKey

    if (hasElementChanged || hasResetKeyChanged) {
      scrollElementRef.current = element
      isAutoScrollEnabledRef.current = isProcessing
    } else if (hasStartedProcessing) {
      isAutoScrollEnabledRef.current = true
    }

    if (!element) return

    const handleScroll = () => {
      isAutoScrollEnabledRef.current = isAtBottom(element)
    }

    element.addEventListener("scroll", handleScroll, { passive: true })

    return () => element.removeEventListener("scroll", handleScroll)
  })

  useEffect(() => {
    const element = ref.current
    if (!element || !isAutoScrollEnabledRef.current) return

    element.scrollTop = element.scrollHeight
  }, [dependency, isProcessing, ref, resetKey])
}
