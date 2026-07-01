"use client"

import { useMemo, useState } from "react"
import { AlertCircle, ChevronDown, ChevronRight } from "lucide-react"
import { cn, extractErrorJson } from "@/lib/utils"

interface ErrorContentProps {
  message: string
  className?: string
}

const MAX_DEPTH = 20

function tryParseJsonObject(value: string): unknown | null {
  const trimmed = value.trim()
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return null
  try {
    const parsed = JSON.parse(trimmed)
    if (typeof parsed === "object" && parsed !== null) return parsed
  } catch {
    return null
  }
  return null
}

function JsonValue({ value, depth }: { value: unknown; depth: number }) {
  if (value === null) return <span className="text-muted-foreground">null</span>
  if (typeof value === "boolean") return <span className="text-foreground">{String(value)}</span>
  if (typeof value === "number") return <span className="text-foreground">{value}</span>
  if (typeof value === "string") {
    if (depth < MAX_DEPTH) {
      const nested = tryParseJsonObject(value)
      if (nested !== null) return <JsonNode data={nested} depth={depth} />
    }
    return <span className="text-foreground whitespace-pre-wrap">&quot;{value}&quot;</span>
  }
  return <JsonNode data={value} depth={depth} />
}

function JsonNode({ data, keyLabel, depth }: { data: unknown; keyLabel?: string; depth: number }) {
  const [collapsed, setCollapsed] = useState(false)
  const isArray = Array.isArray(data)
  const isObject = typeof data === "object" && data !== null

  const prefix = keyLabel ? (
    <>
      <span className="text-foreground font-semibold">&quot;{keyLabel}&quot;</span>
      <span className="text-muted-foreground">: </span>
    </>
  ) : null

  if (!isObject) {
    return (
      <div className="flex flex-wrap items-start gap-0.5">
        {prefix}
        <JsonValue value={data} depth={depth} />
      </div>
    )
  }

  const entries: [string, unknown][] = isArray
    ? (data as unknown[]).map((v, i) => [String(i), v])
    : Object.entries(data as Record<string, unknown>)
  const open = isArray ? "[" : "{"
  const close = isArray ? "]" : "}"

  if (entries.length === 0) {
    return (
      <div className="flex items-start gap-0.5">
        {prefix}
        <span className="text-muted-foreground">{open}{close}</span>
      </div>
    )
  }

  if (collapsed) {
    return (
      <div className="flex items-start gap-0.5">
        {prefix}
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="inline-flex items-center gap-0.5 text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="size-3 shrink-0" />
          <span>{open}{close}</span>
          <span className="text-muted-foreground/70">{entries.length} {isArray ? "items" : "keys"}</span>
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-start gap-0.5">
        {prefix}
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          className="inline-flex items-center gap-0.5 text-muted-foreground hover:text-foreground"
        >
          <ChevronDown className="size-3 shrink-0" />
          <span>{open}</span>
        </button>
      </div>
      <div className="pl-4 flex flex-col">
        {entries.map(([key, value]) => (
          <JsonNode
            key={key}
            keyLabel={isArray ? undefined : key}
            data={value}
            depth={depth + 1}
          />
        ))}
      </div>
      <div className="text-muted-foreground">{close}</div>
    </div>
  )
}

function stripBrackets(s: string): string {
  return s.replace(/^\[\s*/, "").replace(/\s*\]$/, "").trim()
}

export const ErrorContent = ({ message, className }: ErrorContentProps) => {
  const extracted = useMemo(() => extractErrorJson(message), [message])

  if (extracted) {
    return (
      <div className={cn("bg-destructive/10 border border-destructive/30 rounded-lg p-3 flex flex-col gap-2", className)}>
        <div className="flex items-center gap-1.5 text-destructive font-medium text-sm">
          <AlertCircle className="size-4 shrink-0" />
          <span className="wrap-break-word">{extracted.prefix || "Error"}</span>
        </div>
        <div className="overflow-x-auto rounded bg-muted/50 p-2 text-sm font-mono wrap-break-word">
          <JsonNode data={extracted.json} depth={0} />
        </div>
      </div>
    )
  }

  return (
    <div className={cn("bg-destructive/10 border border-destructive/30 rounded-lg p-3 flex items-start gap-1.5 text-destructive text-sm", className)}>
      <AlertCircle className="size-4 shrink-0 mt-0.5" />
      <span className="wrap-break-word">{stripBrackets(message)}</span>
    </div>
  )
}
