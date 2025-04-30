import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { Button } from "./ui/button"
import { List } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { transcriptionInstructionPresets } from "@/constants/custom-instructions"
import { useTranscriptionDataStore } from "@/stores/data/use-transcription-data-store"
import { Transcription } from "@/types/project"

const languages = [
  { value: "auto", label: "Auto-detect" },
]

const models = [
  { value: "free", label: "Mitsuko (Free Limited)" },
  // { value: "premium", label: "Mitsuko (Premium)" },
]

const modes = [
  { value: "clause", label: "Mode 1: Clauses and sentences" },
  { value: "sentence", label: "Mode 2: Sentences" },
]

interface SettingsTranscriptionProps {
  transcriptionId: string
}

export function SettingsTranscription({ transcriptionId }: SettingsTranscriptionProps) {
  const [selectedLanguage, setSelectedLanguage] = useState("auto")
  const [isPresetsDialogOpen, setIsPresetsDialogOpen] = useState(false)

  const saveData = useTranscriptionDataStore((state) => state.saveData)
  const selectedModel = useTranscriptionDataStore((state) => state.getModels())
  const selectedMode = useTranscriptionDataStore((state) => state.getSelectedMode())
  const customInstructions = useTranscriptionDataStore((state) => state.getCustomInstructions())
  const _setModels = useTranscriptionDataStore((state) => state.setModels)
  const _setSelectedMode = useTranscriptionDataStore((state) => state.setSelectedMode)
  const _setCustomInstructions = useTranscriptionDataStore((state) => state.setCustomInstructions)

  const setSelectedModel = (model: Transcription["models"]) => {
    _setModels(transcriptionId, model)
    saveData(transcriptionId)
  }
  const setSelectedMode = (mode: Transcription["selectedMode"]) => {
    _setSelectedMode(transcriptionId, mode)
    saveData(transcriptionId)
  }
  const setCustomInstructions = (instructions: string) => {
    _setCustomInstructions(transcriptionId, instructions)
  }

  const handlePresetSelect = (instruction: string) => {
    setCustomInstructions(instruction)
    setIsPresetsDialogOpen(false)
    const textarea = document.querySelector<HTMLTextAreaElement>("textarea[placeholder='Enter custom instructions for transcription...']")
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }

  return (
    <div className="space-y-4">
      {/* Language Selection */}
      <div>
        <label className="text-sm text-muted-foreground block mb-1">Language</label>
        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a language" />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Model Selection */}
      <div>
        <label className="text-sm text-muted-foreground block mb-1">Model</label>
        <Select value={selectedModel} onValueChange={setSelectedModel}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            {models.map((model) => (
              <SelectItem key={model.value} value={model.value}>
                {model.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Mode Selection */}
      <div>
        <label className="text-sm text-muted-foreground block mb-1">Mode</label>
        <Select value={selectedMode} onValueChange={setSelectedMode}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a mode" />
          </SelectTrigger>
          <SelectContent>
            {modes.map((mode) => (
              <SelectItem key={mode.value} value={mode.value}>
                {mode.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Custom Instructions */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm text-muted-foreground">Custom Instructions</label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPresetsDialogOpen(true)}
            className="h-7 px-2"
          >
            <List className="h-3.5 w-3.5" />
            <span className="ml-1">Presets</span>
          </Button>
        </div>
        <Textarea
          value={customInstructions}
          onChange={(e) => {
            setCustomInstructions(e.target.value)
            e.target.style.height = "auto"
            e.target.style.height = `${Math.min(e.target.scrollHeight, 250)}px`
          }}
          onFocus={(e: React.FocusEvent<HTMLTextAreaElement>) => {
            e.target.style.height = "auto"
            e.target.style.height = `${Math.min(e.target.scrollHeight, 250)}px`
          }}
          onBlur={() => {
            saveData(transcriptionId)
          }}
          placeholder="Enter custom instructions for transcription..."
          className="min-h-[150px] h-[150px] max-h-[250px] resize-none overflow-y-auto"
        />
      </div>

      {/* Preset Dialog */}
      <Dialog open={isPresetsDialogOpen} onOpenChange={setIsPresetsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Select Custom Instruction Preset</DialogTitle>
            <DialogDescription>
              Choose a preset to guide the transcription model.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto">
            <div className="space-y-2 mr-1">
              {transcriptionInstructionPresets.map((preset) => (
                <div
                  key={preset.title}
                  className="p-3 border rounded-md cursor-pointer hover:bg-muted"
                  onClick={() => handlePresetSelect(preset.instruction)}
                >
                  <div className="font-medium">{preset.title}</div>
                  <div className="text-sm text-muted-foreground line-clamp-2">
                    {preset.instruction}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}