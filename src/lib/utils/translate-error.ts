const TRANSLATION_ERROR_PATTERNS = [
  "Failed to execute 'removeChild' on 'Node'",
  "Failed to execute 'insertBefore' on 'Node'",
  "The node to be removed is not a child of this node",
  "The node before which the new node is to be inserted is not a child of this node",
]

export function isBrowserTranslationError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? "")
  return TRANSLATION_ERROR_PATTERNS.some((pattern) => message.includes(pattern))
}
