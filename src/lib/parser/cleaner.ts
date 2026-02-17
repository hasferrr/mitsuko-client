export function keepOnlyWrapped(text: string, a: string, b: string): string {
  const startA = text.indexOf(a)
  if (startA === -1) return ''
  const startB = text.indexOf(b, startA + a.length)
  if (startB === -1) return ''
  return text.substring(startA, startB + b.length)
}

export function removeWrapped(text: string, a: string, b: string): string {
  const startA = text.indexOf(a)
  if (startA === -1) return text
  const startB = text.indexOf(b, startA + a.length)
  if (startB === -1) return text
  return text.substring(0, startA) + text.substring(startB + b.length)
}

export function cleanUpJsonResponse(response: string): string {
  const a = '```json'
  const b = '```'
  const removedError = removeWrapped(response, '<error>', '</error>')
  const removedThink = removeWrapped(removedError, '<think>', '</think>')
  const jsonString = keepOnlyWrapped(removedThink, a, b).replace(a, '').replace(b, '')
    || keepOnlyWrapped(removedThink, b, b).replaceAll(b, '')

  if (jsonString) {
    return jsonString
  }

  const jsonStringArr = removedThink.split("\n")
  while (jsonStringArr.length > 0) {
    if (jsonStringArr[0].startsWith(b)) {
      jsonStringArr.shift()
      break
    } else {
      jsonStringArr.shift()
    }
  }

  return jsonStringArr.join("\n")
    || removedThink.replaceAll(a, '').replaceAll(b, '')
    || `{"subtitles":[]}`
}
