const DONE_TAG_REGEX = /\s*<done>\s*$/

export function hasDoneTag(text: string): boolean {
  return DONE_TAG_REGEX.test(text)
}

export function removeDoneTag(text: string): string {
  return text.replace(DONE_TAG_REGEX, "")
}

export function addDoneTag(text: string): string {
  if (hasDoneTag(text)) return text
  return text ? `${text}\n\n<done>` : "<done>"
}
