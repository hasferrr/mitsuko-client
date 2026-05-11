"use client"

import { Info, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLocalSettingsStore } from "@/stores/settings/use-local-settings-store"

const MAINTENANCE_KEY = "maintenance-2026-05-13"
const MAINTENANCE_END = new Date("2026-05-13T16:00:00+07:00")

export function MaintenanceBanner() {
  const dismissedDialogs = useLocalSettingsStore(state => state.dismissedDialogs)
  const dismissDialog = useLocalSettingsStore(state => state.dismissDialog)

  if (dismissedDialogs[MAINTENANCE_KEY] || new Date() > MAINTENANCE_END) {
    return null
  }

  return (
    <div className="relative flex h-8 shrink-0 items-center justify-center bg-primary/10 text-xs text-sidebar-primary">
      <Info className="size-3.5 shrink-0" />
      <span className="ml-2">Scheduled maintenance on May 13, 2:00 PM – 4:00 PM (UTC+7)</span>
      <Button
        variant="ghost"
        size="xs"
        className="absolute right-2 text-muted-foreground hover:text-foreground"
        onClick={() => dismissDialog(MAINTENANCE_KEY)}
      >
        <X className="size-3" />
        <span className="text-[10px] leading-3">Don&apos;t show again</span>
      </Button>
    </div>
  )
}
