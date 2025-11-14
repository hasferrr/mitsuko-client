"use client"

import { useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import type { BatchFile } from "@/types/batch"
import type { BasicSettings, AdvancedSettings } from "@/types/project"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"
import { useExtractionDataStore } from "@/stores/data/use-extraction-data-store"
import { useSettingsStore } from "@/stores/settings/use-settings-store"
import { useAdvancedSettingsStore } from "@/stores/settings/use-advanced-settings-store"
import { ListChecks, ListX, Loader2 } from "lucide-react"

interface CopySharedSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  operationMode: 'translation' | 'extraction'
  translationBatchFiles: BatchFile[]
  extractionBatchFiles: BatchFile[]
  sharedBasicSettingsId: string
  sharedAdvancedSettingsId: string
}

type BasicKey = keyof Omit<BasicSettings, 'id' | 'createdAt' | 'updatedAt'>
type AdvancedKey = keyof Omit<AdvancedSettings, 'id' | 'createdAt' | 'updatedAt'>

const BASIC_KEYS = [
  { key: 'sourceLanguage', label: 'Source Language' },
  { key: 'targetLanguage', label: 'Target Language' },
  { key: 'modelDetail', label: 'Model' },
  { key: 'isUseCustomModel', label: 'Use Custom Model' },
  { key: 'contextDocument', label: 'Context Document' },
  { key: 'customInstructions', label: 'Custom Instructions' },
  { key: 'fewShot', label: 'Few Shot' },
] as const

type BasicKeyInList = (typeof BASIC_KEYS)[number]['key']
type MissingBasicKey = Exclude<BasicKey, BasicKeyInList>
const _assertAllBasicKeysPresent: MissingBasicKey extends never ? true : never = true
void _assertAllBasicKeysPresent

const ADVANCED_KEYS = [
  { key: 'temperature', label: 'Temperature' },
  { key: 'splitSize', label: 'Split Size' },
  { key: 'startIndex', label: 'Start Index' },
  { key: 'endIndex', label: 'End Index' },
  { key: 'isMaxCompletionTokensAuto', label: 'Auto Max Completion Tokens' },
  { key: 'maxCompletionTokens', label: 'Max Completion Tokens' },
  { key: 'isUseStructuredOutput', label: 'Structured Output' },
  { key: 'isUseFullContextMemory', label: 'Full Context Memory' },
  { key: 'isBetterContextCaching', label: 'Minimal Context Memory' },
] as const

type AdvancedKeyInList = (typeof ADVANCED_KEYS)[number]['key']
type MissingAdvancedKey = Exclude<AdvancedKey, AdvancedKeyInList>
const _assertAllAdvancedKeysPresent: MissingAdvancedKey extends never ? true : never = true
void _assertAllAdvancedKeysPresent

export function CopySharedSettingsDialog({
  open,
  onOpenChange,
  operationMode,
  translationBatchFiles,
  extractionBatchFiles,
  sharedBasicSettingsId,
  sharedAdvancedSettingsId,
}: CopySharedSettingsDialogProps) {
  const translationIds = useMemo(() => translationBatchFiles.map(b => b.id), [translationBatchFiles])
  const extractionIds = useMemo(() => extractionBatchFiles.map(b => b.id), [extractionBatchFiles])

  // Stores
  const getTranslationsDb = useTranslationDataStore(s => s.getTranslationsDb)
  const translationStore = useTranslationDataStore(s => s.data)
  const getExtractionsDb = useExtractionDataStore(s => s.getExtractionsDb)
  const extractionStore = useExtractionDataStore(s => s.data)
  const copyBasicSettingsKeys = useSettingsStore(s => s.copyBasicSettingsKeys)
  const copyAdvancedSettingsKeys = useAdvancedSettingsStore(s => s.copyAdvancedSettingsKeys)

  // Local selection states
  const [tBasicSel, setTBasicSel] = useState<Set<BasicKey>>(new Set())
  const [tAdvSel, setTAdvSel] = useState<Set<AdvancedKey>>(new Set())
  const [eBasicSel, setEBasicSel] = useState<Set<BasicKey>>(new Set())
  const [eAdvSel, setEAdvSel] = useState<Set<AdvancedKey>>(new Set())

  const [isLoading, setIsLoading] = useState(false)
  const [isApplying, setIsApplying] = useState(false)

  // Initialize and ensure data is loaded when opening
  useEffect(() => {
    if (!open) return
    let cancelled = false
    const load = async () => {
      try {
        setIsLoading(true)
        if (operationMode === 'translation') {
          await getTranslationsDb(translationIds)
        } else {
          await getExtractionsDb(extractionIds)
        }
        if (cancelled) return
        // default: no selection
        setTBasicSel(new Set())
        setTAdvSel(new Set())
        setEBasicSel(new Set())
        setEAdvSel(new Set())
      } catch (e) {
        console.error("Failed to load items for Copy Shared Settings dialog", e)
        toast.error("Failed to load items")
      } finally {
        setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, operationMode, translationIds.join("|"), extractionIds.join("|")])

  // Helpers
  const toggleKey = <T,>(set: React.Dispatch<React.SetStateAction<Set<T>>>, key: T) => {
    set(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const setAll = <T,>(set: React.Dispatch<React.SetStateAction<Set<T>>>, keys: readonly T[], checked: boolean) => {
    set(checked ? new Set(keys) : new Set())
  }

  const handleApply = async () => {
    const tBasicKeys = Array.from(tBasicSel) as BasicKey[]
    const tAdvKeys = Array.from(tAdvSel) as AdvancedKey[]
    const eBasicKeys = Array.from(eBasicSel) as BasicKey[]
    const eAdvKeys = Array.from(eAdvSel) as AdvancedKey[]

    if (operationMode === 'translation') {
      if (tBasicKeys.length === 0 && tAdvKeys.length === 0) {
        toast.message("Nothing selected")
        return
      }
    } else {
      if (eBasicKeys.length === 0 && eAdvKeys.length === 0) {
        toast.message("Nothing selected")
        return
      }
    }

    setIsApplying(true)
    try {
      let tApplied = 0
      let eApplied = 0
      const ops: Promise<void>[] = []

      // Apply to translations
      if (operationMode === 'translation') {
        for (const tId of translationIds) {
          const translation = translationStore[tId]
          if (!translation) continue
          let touched = false
          if (tBasicKeys.length > 0) {
            ops.push(copyBasicSettingsKeys(sharedBasicSettingsId, translation.basicSettingsId, tBasicKeys))
            touched = true
          }
          if (tAdvKeys.length > 0) {
            ops.push(copyAdvancedSettingsKeys(sharedAdvancedSettingsId, translation.advancedSettingsId, tAdvKeys))
            touched = true
          }
          if (touched) tApplied += 1
        }
      }

      // Apply to extractions
      if (operationMode === 'extraction') {
        for (const eId of extractionIds) {
          const extraction = extractionStore[eId]
          if (!extraction) continue
          let touched = false
          if (eBasicKeys.length > 0) {
            ops.push(copyBasicSettingsKeys(sharedBasicSettingsId, extraction.basicSettingsId, eBasicKeys))
            touched = true
          }
          if (eAdvKeys.length > 0) {
            ops.push(copyAdvancedSettingsKeys(sharedAdvancedSettingsId, extraction.advancedSettingsId, eAdvKeys))
            touched = true
          }
          if (touched) eApplied += 1
        }
      }

      await Promise.all(ops)

      if (tApplied + eApplied > 0) {
        const parts: string[] = []
        if (tApplied > 0) parts.push(`${tApplied} translation${tApplied === 1 ? '' : 's'}`)
        if (eApplied > 0) parts.push(`${eApplied} extraction${eApplied === 1 ? '' : 's'}`)
        toast.success(`Copied settings to ${parts.join(' and ')}`)
        onOpenChange(false)
      } else {
        toast.message("Nothing to apply")
      }
    } catch (e) {
      console.error(e)
      toast.error("Failed to copy settings")
    } finally {
      setIsApplying(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-full">
        <DialogHeader>
          <DialogTitle>Copy Shared Settings to All Files</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {operationMode === 'translation' && (
            <>
              {/* Translation - Basic */}
              <div className="border rounded-md p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold">Translation — Basic Settings</p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setAll(setTBasicSel, BASIC_KEYS.map(k => k.key) as readonly BasicKey[], true)} disabled={isLoading}>
                      <ListChecks className="h-4 w-4" />
                      Select All
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setAll(setTBasicSel, [], false)} disabled={isLoading}>
                      <ListX className="h-4 w-4" />
                      Clear
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {BASIC_KEYS.map(({ key, label }) => (
                    <label key={`t-b-${key}`} className="flex items-center gap-2 text-sm">
                      <Checkbox checked={tBasicSel.has(key)} onCheckedChange={() => toggleKey(setTBasicSel, key)} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Translation - Advanced */}
              <div className="border rounded-md p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold">Translation — Advanced Settings</p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setAll(setTAdvSel, ADVANCED_KEYS.map(k => k.key) as readonly AdvancedKey[], true)} disabled={isLoading}>
                      <ListChecks className="h-4 w-4" />
                      Select All
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setAll(setTAdvSel, [], false)} disabled={isLoading}>
                      <ListX className="h-4 w-4" />
                      Clear
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {ADVANCED_KEYS.map(({ key, label }) => (
                    <label key={`t-a-${key}`} className="flex items-center gap-2 text-sm">
                      <Checkbox checked={tAdvSel.has(key)} onCheckedChange={() => toggleKey(setTAdvSel, key)} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {operationMode === 'extraction' && (
            <>
              {/* Extraction - Basic */}
              <div className="border rounded-md p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold">Extraction — Basic Settings</p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setAll(setEBasicSel, BASIC_KEYS.map(k => k.key) as readonly BasicKey[], true)} disabled={isLoading}>
                      <ListChecks className="h-4 w-4" />
                      Select All
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setAll(setEBasicSel, [], false)} disabled={isLoading}>
                      <ListX className="h-4 w-4" />
                      Clear
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {BASIC_KEYS.map(({ key, label }) => (
                    <label key={`e-b-${key}`} className="flex items-center gap-2 text-sm">
                      <Checkbox checked={eBasicSel.has(key)} onCheckedChange={() => toggleKey(setEBasicSel, key)} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Extraction - Advanced */}
              <div className="border rounded-md p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold">Extraction — Advanced Settings</p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setAll(setEAdvSel, ADVANCED_KEYS.map(k => k.key) as readonly AdvancedKey[], true)} disabled={isLoading}>
                      <ListChecks className="h-4 w-4" />
                      Select All
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setAll(setEAdvSel, [], false)} disabled={isLoading}>
                      <ListX className="h-4 w-4" />
                      Clear
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {ADVANCED_KEYS.map(({ key, label }) => (
                    <label key={`e-a-${key}`} className="flex items-center gap-2 text-sm">
                      <Checkbox checked={eAdvSel.has(key)} onCheckedChange={() => toggleKey(setEAdvSel, key)} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isApplying}>
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={isApplying || isLoading || (operationMode === 'translation' ? translationIds.length === 0 : extractionIds.length === 0)}>
            {isApplying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Applying...
              </>
            ) : (
              "Apply"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
