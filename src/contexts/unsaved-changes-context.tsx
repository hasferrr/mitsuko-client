"use client"

import { createContext, PropsWithChildren, useContext, useEffect, useRef } from 'react'

interface UnsavedChangesType {
  hasChangesRef: React.RefObject<boolean>
  setHasChanges: (hasChanges: boolean) => void
}

const UnsavedChangesContext = createContext<UnsavedChangesType | undefined>(undefined)

export default function UnsavedChangesProvider({ children }: PropsWithChildren) {
  const hasChangesRef = useRef(false)
  const setHasChanges = (hasChanges: boolean) => hasChangesRef.current = hasChanges

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (hasChangesRef.current) {
        event.preventDefault()
        event.returnValue = ""
      }
    }

    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasChangesRef.current])

  return (
    <UnsavedChangesContext.Provider value={{ hasChangesRef, setHasChanges }}>
      {children}
    </UnsavedChangesContext.Provider>
  )
}

export function useUnsavedChanges() {
  const context = useContext(UnsavedChangesContext)
  if (!context) {
    throw new Error("useUnsavedChanges must be used within a UnsavedChangesProvider")
  }
  return context
}

export function useSetUnsavedChanges() {
  const { setHasChanges } = useUnsavedChanges()
  return setHasChanges
}
