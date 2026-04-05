import { ContextCompletion } from "@/types/completion"
import { SubtitleNoTime, SubtitleNoTimeNoActorTranslated } from "@/types/subtitles"
import { MINIMAL_CONTEXT_MEMORY_SIZE } from "@/constants/limits"

export type ContextStrategy = "full" | "minimal" | "split"

export function determineContextStrategy(
  isUseFullContextMemory: boolean,
  isBetterContextCaching: boolean
): ContextStrategy {
  if (isUseFullContextMemory) return "full"
  if (!isBetterContextCaching) return "minimal"
  return "split"
}

export interface BuildInitialContextConfig {
  strategy: ContextStrategy
  splitSize: number
}

interface SubtitleWithContext {
  index: number
  actor: string
  content: string
  translated: string
}

export function buildInitialContext(
  subtitles: SubtitleWithContext[],
  adjustedStartIndex: number,
  config: BuildInitialContextConfig
): ContextCompletion[] {
  const context: ContextCompletion[] = []

  const contextStartIndex = calculateContextStartIndex(
    adjustedStartIndex,
    config.strategy,
    config.splitSize
  )

  if (contextStartIndex >= adjustedStartIndex) return context

  const contextSubtitles = subtitles.slice(contextStartIndex, adjustedStartIndex)

  const userSubtitles: SubtitleNoTime[] = contextSubtitles.map((s) => ({
    index: s.index,
    actor: s.actor,
    content: s.content,
  }))

  const assistantSubtitles: SubtitleNoTimeNoActorTranslated[] = contextSubtitles.map((s) => ({
    index: s.index,
    content: s.content,
    translated: s.translated,
  }))

  context.push({
    role: "user",
    content: { subtitles: userSubtitles },
  })

  context.push({
    role: "assistant",
    content: { subtitles: assistantSubtitles },
  })

  return context
}

function calculateContextStartIndex(
  adjustedStartIndex: number,
  strategy: ContextStrategy,
  splitSize: number
): number {
  switch (strategy) {
    case "full":
      return 0
    case "minimal":
      return Math.max(0, adjustedStartIndex - MINIMAL_CONTEXT_MEMORY_SIZE)
    case "split":
      return Math.max(0, adjustedStartIndex - splitSize)
  }
}

export interface UpdateContextConfig {
  strategy: ContextStrategy
  splitSize: number
}

export function updateContextForNextChunk(
  context: ContextCompletion[],
  requestBodySubtitles: SubtitleNoTime[],
  rawResponseContent: string,
  translatedChunk: { index: number; translated: string }[],
  config: UpdateContextConfig
): ContextCompletion[] {
  if (config.strategy === "minimal") {
    return trimContextToMinimal(
      requestBodySubtitles,
      translatedChunk,
      config.splitSize
    )
  }

  const newContext: ContextCompletion[] = [
    {
      role: "user",
      content: { subtitles: requestBodySubtitles },
    },
    {
      role: "assistant",
      content: rawResponseContent,
    },
  ]

  if (config.strategy === "split") {
    return newContext
  }

  return [...context, ...newContext]
}

function trimContextToMinimal(
  requestBodySubtitles: SubtitleNoTime[],
  translatedChunk: { index: number; translated: string }[],
  splitSize: number
): ContextCompletion[] {
  if (splitSize < MINIMAL_CONTEXT_MEMORY_SIZE) {
    console.error(
      "Split size should be greater than or equal to context memory size. " +
      "The code below only takes the last (pair of) context"
    )
  }

  const lastUser: SubtitleNoTime[] = requestBodySubtitles
  const lastAssistant: SubtitleNoTimeNoActorTranslated[] = requestBodySubtitles.map((s, subIndex) => ({
    index: s.index,
    content: s.content,
    translated: translatedChunk[subIndex]?.translated ?? "",
  }))

  return [
    {
      role: "user",
      content: { subtitles: lastUser.slice(-MINIMAL_CONTEXT_MEMORY_SIZE) },
    },
    {
      role: "assistant",
      content: { subtitles: lastAssistant.slice(-MINIMAL_CONTEXT_MEMORY_SIZE) },
    },
  ]
}
