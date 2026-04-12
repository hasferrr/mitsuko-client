"use client"

import { useState, useEffect, useRef, PropsWithChildren } from "react"
import { Dialog as ShadCNDialog } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface DialogCustomProps extends PropsWithChildren {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  modal?: boolean
  overlayClassName?: string
}

export const DialogCustom: React.FC<DialogCustomProps> = ({
  isOpen,
  onOpenChange,
  modal = true,
  children,
  overlayClassName,
}) => {
  const [isOverlayMounted, setIsOverlayMounted] = useState(false)
  const [isOverlayFadedIn, setIsOverlayFadedIn] = useState(false)

  useEffect(() => {
    if (modal === false && isOpen) {
      setIsOverlayMounted(true)
      const frameId = requestAnimationFrame(() => {
        setIsOverlayFadedIn(true)
      })
      return () => cancelAnimationFrame(frameId)
    } else if (modal === false && !isOpen) {
      setIsOverlayFadedIn(false)
      const timer = setTimeout(() => {
        setIsOverlayMounted(false)
      }, 100)
      return () => clearTimeout(timer)
    } else if (modal !== false) {
      setIsOverlayMounted(false)
      setIsOverlayFadedIn(false)
    }
  }, [isOpen, modal])

  // Prevent outer (body) scroll when dialog is open
  const originalBodyStylesRef = useRef<{ overflow: string; paddingRight: string } | null>(null)
  useEffect(() => {
    if (typeof window === "undefined") return
    const body = document.body
    if (isOpen && modal === false) {
      if (!originalBodyStylesRef.current) {
        originalBodyStylesRef.current = {
          overflow: body.style.overflow,
          paddingRight: body.style.paddingRight,
        }
      }
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      body.style.overflow = "hidden"
      if (scrollbarWidth > 0) {
        body.style.paddingRight = `${scrollbarWidth}px`
      }
      return () => {
        const original = originalBodyStylesRef.current
        if (original) {
          body.style.overflow = original.overflow
          body.style.paddingRight = original.paddingRight
          originalBodyStylesRef.current = null
        }
      }
    } else {
      const original = originalBodyStylesRef.current
      if (original) {
        body.style.overflow = original.overflow
        body.style.paddingRight = original.paddingRight
        originalBodyStylesRef.current = null
      }
    }
  }, [isOpen, modal])

  return (
    <>
      {modal === false && isOverlayMounted && (
        <div
          className={cn(
            "fixed inset-0 isolate z-50 bg-black/10 supports-backdrop-filter:backdrop-blur-xs transition-opacity duration-100",
            isOverlayFadedIn ? "opacity-100" : "opacity-0",
            overlayClassName
          )}
          aria-hidden="true"
        />
      )}
      <ShadCNDialog open={isOpen} onOpenChange={onOpenChange} modal={modal}>
        {children}
      </ShadCNDialog>
    </>
  )
}