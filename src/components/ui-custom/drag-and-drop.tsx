"use client"

import { useState, DragEvent, PropsWithChildren } from "react"
import { cn } from "@/lib/utils"

interface DragAndDropProps extends PropsWithChildren {
  onDropFiles: (files: FileList) => void
  disabled?: boolean
}

export const DragAndDrop: React.FC<DragAndDropProps> = ({
  children,
  onDropFiles,
  disabled = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (event: DragEvent) => {
    if (!disabled && event.dataTransfer.types.includes("Files")) {
      event.preventDefault()
      event.stopPropagation()
      if (!isDragOver) {
        setIsDragOver(true)
      }
    }
  }

  const handleDragLeave = (event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (event: DragEvent) => {
    if (!disabled && event.dataTransfer.types.includes("Files")) {
      event.preventDefault()
      event.stopPropagation()
      setIsDragOver(false)
      onDropFiles(event.dataTransfer.files)
    }
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "p-0 border-2 border-dashed rounded-md ",
        isDragOver ? "border-primary" : "border-transparent",
      )}
    >
      {children}
    </div>
  )
}

