"use client"

import { useState, useEffect, PropsWithChildren } from "react"
import { Dialog as ShadCNDialog } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface DialogCustomProps extends PropsWithChildren {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  modal?: boolean
  overlayClassName?: string
  fadeDuration?: number
}

export const DialogCustom: React.FC<DialogCustomProps> = ({
  isOpen,
  onOpenChange,
  modal = true,
  children,
  overlayClassName,
  fadeDuration = 50,
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
      }, fadeDuration)
      return () => clearTimeout(timer)
    } else if (modal !== false) {
      setIsOverlayMounted(false)
      setIsOverlayFadedIn(false)
    }
  }, [isOpen, modal, fadeDuration])

  return (
    <>
      {modal === false && isOverlayMounted && (
        <div
          className={cn(
            "fixed inset-0 bg-black/80 z-50 transition-opacity ease-in-out",
            isOverlayFadedIn ? "opacity-100" : "opacity-0",
            overlayClassName
          )}
          style={{ transitionDuration: `${fadeDuration}ms` }}
          aria-hidden="true"
        />
      )}
      <ShadCNDialog open={isOpen} onOpenChange={onOpenChange} modal={modal}>
        {children}
      </ShadCNDialog>
    </>
  )
}