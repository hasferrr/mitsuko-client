"use client"

import { memo } from "react"
import { Textarea } from "@/components/ui/textarea"
import { useUnsavedChanges } from "@/contexts/unsaved-changes-context"

export const SystemPromptInput = memo(() => {
  const prompt = ""
  const setPrompt = (val: string) => console.log(val)
  const { setHasChanges } = useUnsavedChanges()

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHasChanges(true)
    setPrompt(e.target.value)
    e.target.style.height = "auto"
    e.target.style.height = `${Math.min(e.target.scrollHeight, 900)}px`
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">System Prompt</label>
      <Textarea
        disabled
        value={prompt}
        onChange={handlePromptChange}
        className="min-h-[150px] h-[150px] max-h-[80vh] bg-background dark:bg-muted/30 resize-none overflow-y-auto"
        placeholder="Enter translation instructions..."
        onFocus={(e) => (e.target.style.height = `${Math.min(e.target.scrollHeight, 900)}px`)}
      />
    </div>
  )
})