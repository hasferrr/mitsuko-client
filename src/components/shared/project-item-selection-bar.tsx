"use client"

import { useEffect, useEffectEvent, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Trash, SquareArrowOutUpRight, X, CheckCircle2, ChevronUp, Globe, Headphones, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { ItemType } from "@/hooks/project/use-project-item-selection"

interface ProjectItemSelectionBarProps {
  open: boolean
  selectedCount: number
  isProcessing: boolean
  allSelected: boolean
  hasActiveOperations: boolean
  currentTab: string
  hasTranslations: boolean
  hasTranscriptions: boolean
  hasExtractions: boolean
  onDelete: () => void
  onMove: () => void
  onSelectAllToggle: () => void
  onSelectTypeOnly: (type: ItemType) => void
  onCancel: () => void
}

const typeIcons: Record<ItemType, React.ReactNode> = {
  translation: <Globe className="size-4" />,
  transcription: <Headphones className="size-4" />,
  extraction: <FileText className="size-4" />,
}

const typeLabels: Record<ItemType, string> = {
  translation: "Translations",
  transcription: "Transcriptions",
  extraction: "Extractions",
}

export function ProjectItemSelectionBar({
  open,
  selectedCount,
  isProcessing,
  allSelected,
  hasActiveOperations,
  currentTab,
  hasTranslations,
  hasTranscriptions,
  hasExtractions,
  onDelete,
  onMove,
  onSelectAllToggle,
  onSelectTypeOnly,
  onCancel,
}: ProjectItemSelectionBarProps) {
  const [mounted, setMounted] = useState(false)
  const [exiting, setExiting] = useState(false)
  const [selectMenuOpen, setSelectMenuOpen] = useState(false)

  const visibleTypeCount = [hasTranslations, hasTranscriptions, hasExtractions].filter(Boolean).length
  const hasMultipleTypes = currentTab === "overview" && visibleTypeCount > 1

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

  const renderSelectAllButton = () => {
    if (allSelected) {
      return (
        <Button variant="ghost" size="sm" onClick={onSelectAllToggle}>
          <CheckCircle2 className="size-4" />
          Deselect All
        </Button>
      )
    }

    if (!hasMultipleTypes) {
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
            {hasTranslations && (
              <DropdownMenuItem onClick={() => { onSelectTypeOnly("translation"); setSelectMenuOpen(false) }}>
                {typeIcons.translation}
                Select {typeLabels.translation} Only
              </DropdownMenuItem>
            )}
            {hasTranscriptions && (
              <DropdownMenuItem onClick={() => { onSelectTypeOnly("transcription"); setSelectMenuOpen(false) }}>
                {typeIcons.transcription}
                Select {typeLabels.transcription} Only
              </DropdownMenuItem>
            )}
            {hasExtractions && (
              <DropdownMenuItem onClick={() => { onSelectTypeOnly("extraction"); setSelectMenuOpen(false) }}>
                {typeIcons.extraction}
                Select {typeLabels.extraction} Only
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
      <Button
        variant="destructive"
        size="sm"
        onClick={onDelete}
        disabled={isProcessing || hasActiveOperations}
      >
        <Trash className="size-4" />
        Delete
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onMove}
        disabled={isProcessing || hasActiveOperations}
      >
        <SquareArrowOutUpRight className="size-4" />
        Move
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
