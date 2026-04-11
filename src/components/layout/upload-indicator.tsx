'use client'

import { useMemo } from 'react'
import { useUploadStore } from '@/stores/ui/use-upload-store'
import { Card, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Loader2 } from 'lucide-react'

export function UploadIndicator() {
  const uploadMap = useUploadStore(state => state.uploadMap)
  const isUploadingMap = useUploadStore(state => state.isUploadingMap)

  const activeUploads = useMemo(() => {
    return Object.entries(uploadMap)
      .filter(([id]) => isUploadingMap[id])
      .map(([id, upload]) => ({ id, upload }))
  }, [uploadMap, isUploadingMap])

  if (activeUploads.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 w-[300px] z-50 space-y-2">
      {activeUploads.map(({ id, upload }) => (
        <Card key={id}>
          <CardHeader>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2 truncate">
                  <Loader2 className="size-4 animate-spin shrink-0" />
                  <span className="truncate">{upload?.fileName || 'Uploading...'}</span>
                </span>
                <span className="text-sm text-muted-foreground shrink-0">
                  {upload?.progress.percentage}%
                </span>
              </div>
              <Progress value={upload?.progress.percentage} className="w-full" />
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
