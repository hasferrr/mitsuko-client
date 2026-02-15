'use client'

import { useUploadStore } from '@/stores/use-upload-store'
import { Card, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Loader2 } from 'lucide-react'

export function UploadIndicator() {
  const uploadProgress = useUploadStore(state => state.uploadProgress)
  const isUploading = useUploadStore(state => state.isUploading)

  if (!isUploading || !uploadProgress) return null

  return (
    <div className="fixed bottom-4 right-4 w-[300px] z-50">
      <Card>
        <CardHeader className="py-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading file...
              </span>
              <span className="text-sm text-muted-foreground">
                {uploadProgress.percentage}%
              </span>
            </div>
            <Progress value={uploadProgress.percentage} className="w-full" />
          </div>
        </CardHeader>
      </Card>
    </div>
  )
}
