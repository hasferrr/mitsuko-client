"use client"

import { useEffect, useEffectEvent, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Trash, Archive, ArchiveRestore, Upload, X, CheckCircle2, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface CardGridSelectionBarProps {
  open: boolean
  selectedCount: number
  activeSelectedCount: number
  archivedSelectedCount: number
  isProcessing: boolean
  allSelected: boolean
  hasActiveItems: boolean
  hasArchivedItems: boolean
  onDelete: () => void
  onArchive: () => void
  onUnarchive: () => void
  onExport: () => void
  onSelectAllToggle: () => void
  onSelectActiveOnly: () => void
  onSelectArchivedOnly: () => void
  onCancel: () => void
}

export function CardGridSelectionBar({
  open,
  selectedCount,
  activeSelectedCount,
  archivedSelectedCount,
  isProcessing,
  allSelected,
  hasActiveItems,
  hasArchivedItems,
  onDelete,
  onArchive,
  onUnarchive,
  onExport,
  onSelectAllToggle,
  onSelectActiveOnly,
  onSelectArchivedOnly,
  onCancel,
}: CardGridSelectionBarProps) {
  const [mounted, setMounted] = useState(false)
  const [exiting, setExiting] = useState(false)
  const [selectMenuOpen, setSelectMenuOpen] = useState(false)
  const hasBothSections = hasActiveItems && hasArchivedItems

  const startCloseTransition = useEffectEvent(() => {
    if (mounted) {
      setExiting(true)
      const timer = setTimeout(() => {
        setMounted(false)
        setExiting(false)
      }, 200)
      return () => clearTimeout(timer)
    }
  })

  useEffect(() => {
    if (open) {
      setExiting(false)
      setMounted(true)
      return
    }

    return startCloseTransition()
  }, [open])

  const renderSelectMenu = () => {
    if (allSelected) {
      return (
        <Button variant="ghost" size="sm" onClick={onSelectAllToggle}>
          <CheckCircle2 data-icon="inline-start" />
          Deselect All
        </Button>
      )
    }

    if (!hasBothSections) {
      return (
        <Button variant="ghost" size="sm" onClick={onSelectAllToggle}>
          <CheckCircle2 data-icon="inline-start" />
          Select All
        </Button>
      )
    }

    return (
      <DropdownMenu open={selectMenuOpen} onOpenChange={setSelectMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <CheckCircle2 data-icon="inline-start" />
            Select All
            <ChevronUp data-icon="inline-end" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" side="top" className="w-fit">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={onSelectAllToggle}>
              <CheckCircle2 />
              {allSelected ? "Deselect All" : "Select All"}
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {hasActiveItems && (
              <DropdownMenuItem onClick={() => { onSelectActiveOnly(); setSelectMenuOpen(false) }}>
                <Archive />
                Select Active Only
              </DropdownMenuItem>
            )}
            {hasArchivedItems && (
              <DropdownMenuItem onClick={() => { onSelectArchivedOnly(); setSelectMenuOpen(false) }}>
                <ArchiveRestore />
                Select Archived Only
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  if (!mounted) return null

  const animationClass = exiting
    ? "animate-out slide-out-to-bottom-4 fade-out duration-200"
    : "animate-in slide-in-from-bottom-4 fade-in duration-200"

  if (selectedCount === 0) {
    return (
      <div
        className={cn(
          "fixed bottom-4 left-1/2 -translate-x-1/2 z-50",
          "bg-card ring-1 ring-foreground/10 rounded-xl shadow-lg",
          "px-4 py-2.5 flex items-center gap-3",
          animationClass
        )}
      >
        <span className="text-sm font-medium text-muted-foreground">0 selected</span>
        <div className="h-4 w-px bg-border" />
        {renderSelectMenu()}
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="size-4" />
          Cancel
        </Button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 -translate-x-1/2 z-50",
        "bg-card ring-1 ring-foreground/10 rounded-xl shadow-lg",
        "px-4 py-2.5 flex items-center gap-3",
        animationClass
      )}
    >
      <span className="text-sm font-medium tabular-nums text-nowrap">
        {selectedCount} selected
      </span>
      <div className="h-4 w-px bg-border" />
      <Button variant="destructive" size="sm" onClick={onDelete} disabled={isProcessing}>
        <Trash className="size-4" />
        Delete
      </Button>
      {activeSelectedCount > 0 && (
        <Button variant="outline" size="sm" onClick={onArchive} disabled={isProcessing}>
          <Archive className="size-4" />
          Archive ({activeSelectedCount})
        </Button>
      )}
      {archivedSelectedCount > 0 && (
        <Button variant="outline" size="sm" onClick={onUnarchive} disabled={isProcessing}>
          <ArchiveRestore className="size-4" />
          Unarchive ({archivedSelectedCount})
        </Button>
      )}
      <Button variant="outline" size="sm" onClick={onExport} disabled={isProcessing}>
        <Upload className="size-4" />
        Export
      </Button>
      <div className="h-4 w-px bg-border" />
      {renderSelectMenu()}
      <Button variant="ghost" size="sm" onClick={onCancel}>
        <X className="size-4" />
        Cancel
      </Button>
    </div>
  )
}
