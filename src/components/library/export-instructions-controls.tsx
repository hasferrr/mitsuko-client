'use client'

import { Button } from '@/components/ui/button'
import { Download, X } from 'lucide-react'
import { CustomInstruction } from '@/types/custom-instruction'

interface ExportInstructionsControlsProps {
  isSelectionMode: boolean
  selectedIds: Set<string>
  onEnterSelectionMode: () => void
  onCancelSelectionMode: () => void
  hasInstructions: boolean
  customInstructions: CustomInstruction[]
}

export function ExportInstructionsControls({
  isSelectionMode,
  selectedIds,
  onEnterSelectionMode,
  onCancelSelectionMode,
  hasInstructions,
  customInstructions,
}: ExportInstructionsControlsProps) {

  const handleExport = () => {
    const itemsToExport = customInstructions.filter(item => selectedIds.has(item.id))
    const exportObject = { customInstruction: itemsToExport }
    const dataStr = JSON.stringify(exportObject, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'custom-instructions.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    onCancelSelectionMode()
  }

  if (isSelectionMode) {
    return (
      <>
        <Button variant="outline" onClick={handleExport} disabled={selectedIds.size === 0}>
          <Download size={18} />
          Export {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
        </Button>
        <Button variant="ghost" onClick={onCancelSelectionMode}>
          <X size={18} />
          Cancel
        </Button>
      </>
    )
  }

  if (hasInstructions) {
    return (
      <Button variant="outline" onClick={onEnterSelectionMode}>
        <Download size={18} />
        Export
      </Button>
    )
  }

  return null
}