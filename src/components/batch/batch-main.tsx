"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Trash,
  ArrowLeft,
  FileText,
  Languages,
  Layers,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useProjectStore } from "@/stores/data/use-project-store"
import { useLocalSettingsStore } from "@/stores/use-local-settings-store"
import Link from "next/link"
import { BatchTranslationView } from "./batch-translation-view"
import { BatchExtractionView } from "./batch-extraction-view"

interface BatchMainProps {
  basicSettingsId: string
  advancedSettingsId: string
}

export default function BatchMain({ basicSettingsId, advancedSettingsId }: BatchMainProps) {
  const [operationMode, setOperationMode] = useState<"translation" | "extraction">("translation")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Project Store
  const currentProject = useProjectStore((state) => state.currentProject)
  const deleteProject = useProjectStore((state) => state.deleteProject)
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject)
  const renameProject = useProjectStore((state) => state.renameProject)

  const isSeparateSettingsEnabled = useLocalSettingsStore((state) => state.isSeparateSettingsEnabled)

  const translationBasicSettingsId = isSeparateSettingsEnabled
    ? currentProject?.defaultTranslationBasicSettingsId || basicSettingsId
    : basicSettingsId
  const translationAdvancedSettingsId = isSeparateSettingsEnabled
    ? currentProject?.defaultTranslationAdvancedSettingsId || advancedSettingsId
    : advancedSettingsId

  const extractionBasicSettingsId = isSeparateSettingsEnabled
    ? currentProject?.defaultExtractionBasicSettingsId || basicSettingsId
    : basicSettingsId
  const extractionAdvancedSettingsId = isSeparateSettingsEnabled
    ? currentProject?.defaultExtractionAdvancedSettingsId || advancedSettingsId
    : advancedSettingsId

  const handleBatchNameChange = (value: string) => {
    if (currentProject?.id && value.trim()) {
      renameProject(currentProject.id, value)
    }
  }

  const handleDeleteBatch = async () => {
    if (currentProject?.id) {
      await deleteProject(currentProject.id)
      setIsDeleteDialogOpen(false)
      setCurrentProject(null)
    }
  }

  if (!currentProject) {
    return <div className="p-8 text-center">No project selected.</div>
  }

  return (
    <div className="flex flex-col gap-4 max-w-5xl mx-auto container py-4 px-4 mb-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4 mb-2">
        <div className="flex-1 min-w-40 flex items-center gap-2">
          <Button
            variant="ghost"
            className="h-10 w-10 flex-shrink-0"
            onClick={() => setCurrentProject(null)}
            title="Go back to batch selection"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Input
            defaultValue={currentProject.name || (operationMode === 'translation' ? "Batch Translation" : "Batch Extraction")}
            className="text-xl font-semibold h-12"
            onChange={(e) => handleBatchNameChange(e.target.value)}
          />
        </div>
        <Select value={operationMode} onValueChange={(value: "translation" | "extraction") => setOperationMode(value)}>
          <SelectTrigger className="w-fit h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="translation">
              <div className="flex items-center gap-2 pr-1">
                <div className="h-4 w-4">
                  <Languages className="h-4 w-4" />
                </div>
                Translation
              </div>
            </SelectItem>
            <SelectItem value="extraction">
              <div className="flex items-center gap-2 pr-1">
                <div className="h-4 w-4">
                  <Layers className="h-4 w-4" />
                </div>
                Extraction
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <Link href="/project">
          <Button variant="outline" className="h-10">
            <FileText className="h-5 w-5" />
            See as Project
          </Button>
        </Link>
        <Button
          variant="outline"
          className="h-10"
          onClick={() => setIsDeleteDialogOpen(true)}
        >
          <Trash className="h-5 w-5" />
        </Button>
      </div>

      {/* Main Content */}
      {operationMode === 'translation' ? (
        <BatchTranslationView
          basicSettingsId={translationBasicSettingsId}
          advancedSettingsId={translationAdvancedSettingsId}
        />
      ) : (
        <BatchExtractionView
          basicSettingsId={extractionBasicSettingsId}
          advancedSettingsId={extractionAdvancedSettingsId}
        />
      )}

      {/* Delete Batch Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Batch</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this batch? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBatch}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
