export interface ExtractedErrorJson {
  prefix: string
  json: unknown
}

function matchBrackets(s: string, start: number): string | null {
  const open = s[start]
  const close = open === "{" ? "}" : "]"
  let depth = 0
  let inString = false
  let escaped = false
  for (let j = start; j < s.length; j++) {
    const c = s[j]
    if (escaped) {
      escaped = false
      continue
    }
    if (c === "\\") {
      escaped = true
      continue
    }
    if (c === '"') {
      inString = !inString
      continue
    }
    if (inString) continue
    if (c === open) {
      depth++
    } else if (c === close) {
      depth--
      if (depth === 0) return s.slice(start, j + 1)
    }
  }
  return null
}

function cleanPrefix(prefix: string): string {
  return prefix
    .replace(/^\[\s*/, "")
    .replace(/[\s:,\-]+$/, "")
    .trim()
}

export function extractErrorJson(message: string): ExtractedErrorJson | null {
  for (let i = 0; i < message.length; i++) {
    const ch = message[i]
    if (ch !== "{" && ch !== "[") continue
    const candidate = matchBrackets(message, i)
    if (candidate === null) continue
    try {
      const json = JSON.parse(candidate)
      return { prefix: cleanPrefix(message.slice(0, i)), json }
    } catch {
      continue
    }
  }
  return null
}
