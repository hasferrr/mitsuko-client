import { useEffect } from "react"
import { useUnsavedChangesStore } from "@/stores/use-unsaved-changes-store"

export const useBeforeUnload = () => {
  const hasChangesRef = useUnsavedChangesStore((state) => state.hasChangesRef)
  const setHasChanges = useUnsavedChangesStore((state) => state.setHasChanges)

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (hasChangesRef.current) {
        event.preventDefault()
        event.returnValue = ""
      }
    }

    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [hasChangesRef.current])

  return { setHasChanges }
}
