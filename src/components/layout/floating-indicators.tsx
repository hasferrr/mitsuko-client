import { UploadIndicator } from "@/components/layout/upload-indicator"
import { ProcessingIndicator } from "@/components/layout/processing-indicator"

export function FloatingIndicators() {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      <UploadIndicator />
      <ProcessingIndicator />
    </div>
  )
}
