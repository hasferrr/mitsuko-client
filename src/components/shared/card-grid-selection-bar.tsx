"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

  useEffect(() => {
    if (open) {
      setExiting(false)
      setMounted(true)
    } else if (mounted) {
      setExiting(true)
      const timer = setTimeout(() => {
        setMounted(false)
        setExiting(false)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [open])

  const renderSelectAllButton = () => {
    if (allSelected) {
      return (
        <Button variant="ghost" size="sm" onClick={onSelectAllToggle}>
          <CheckCircle2 className="size-4" />
          Deselect All
        </Button>
      )
    }

    if (!hasBothSections) {
      return (
        <Button variant="ghost" size="sm" onClick={onSelectAllToggle}>
          <CheckCircle2 className="size-4" />
          Select All
        </Button>
      )
    }

    return (
      <div className="flex">
        <Button
          variant="ghost"
          size="sm"
          onClick={onSelectAllToggle}
          className="rounded-r-none pr-1.5"
        >
          <CheckCircle2 className="size-4" />
          Select All
        </Button>
        <DropdownMenu open={selectMenuOpen} onOpenChange={setSelectMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-l-none border-l px-1.5"
            >
              <ChevronUp className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" side="top" className="w-fit">
            {hasActiveItems && (
              <DropdownMenuItem onClick={() => { onSelectActiveOnly(); setSelectMenuOpen(false) }}>
                <Archive className="size-4" />
                Select Active Only
              </DropdownMenuItem>
            )}
            {hasArchivedItems && (
              <DropdownMenuItem onClick={() => { onSelectArchivedOnly(); setSelectMenuOpen(false) }}>
                <ArchiveRestore className="size-4" />
                Select Archived Only
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
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
        {renderSelectAllButton()}
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
      {renderSelectAllButton()}
      <Button variant="ghost" size="sm" onClick={onCancel}>
        <X className="size-4" />
        Cancel
      </Button>
    </div>
  )
}
