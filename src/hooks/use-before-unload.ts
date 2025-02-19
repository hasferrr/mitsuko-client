import { useEffect } from "react"
import { useUnsavedChangesStore } from "@/stores/use-unsaved-changes-store"

export const useBeforeUnload = () => {
  const hasChanges = useUnsavedChangesStore((state) => state.hasChanges)
  const setHasChanges = useUnsavedChangesStore((state) => state.setHasChanges)

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (hasChanges) {
        event.preventDefault()
        event.returnValue = ""
      }
    }

    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [hasChanges])

  return { setHasChanges }
}
