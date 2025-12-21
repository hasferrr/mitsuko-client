export function formatReasoning(text: string): string {
  let isFirst = true
  return text.replace(/(\*\*[^*]+\*\*)\n\n/g, (match) => {
    if (isFirst) {
      isFirst = false
      return match
    }
    return '\n\n' + match
  })
}
