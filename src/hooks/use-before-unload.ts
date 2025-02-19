import { useEffect } from "react"
import { useUnsavedChangesStore } from "@/stores/use-unsaved-changes-store"

export const useBeforeUnload = () => {
  const hasChanges = useUnsavedChangesStore((state) => state.hasChanges)
  const setHasChanges = useUnsavedChangesStore((state) => state.setHasChanges)

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasChanges) event.preventDefault()
    }
    if (hasChanges) {
      window.addEventListener("beforeunload", handleBeforeUnload)
    } else {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [hasChanges])

  return setHasChanges
}
