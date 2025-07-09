export function isEscaped(str: string, index: number): boolean {
  let backslashes = 0
  for (let i = index - 1; i >= 0 && str[i] === '\\'; i--) {
    backslashes++
  }
  return backslashes > 0 && backslashes % 2 !== 0
}

export function repairJson(input: string): string {
  let startIndex = input.lastIndexOf('{"subtitles"')
  if (startIndex === -1) {
    const subtitlesIndex = input.lastIndexOf('"subtitles"')
    if (subtitlesIndex > -1) {
      startIndex = input.lastIndexOf('{', subtitlesIndex)
    }
  }

  if (startIndex > -1) {
    input = input.substring(startIndex)
  }

  input = input.trim()

  type OpenBracket = "{" | "["
  type CloseBracket = "}" | "]"
  type Index = number

  const stack: [OpenBracket, Index][] = []
  const map = new Map<OpenBracket, CloseBracket>()
  map.set("{", "}")
  map.set("[", "]")

  let lastBalancedIndex = 0
  let inString = false

  for (let i = 0; i < input.length; i++) {
    const char = input[i]

    if (char === '"' && !isEscaped(input, i)) {
      inString = !inString
      continue
    }

    if (inString) continue

    if (char === "{") {
      stack.push([char, i])
    } else if (char === "[") {
      stack.push([char, i])
    } else if (char === "}") {
      if (stack.length > 0 && stack[stack.length - 1][0] === "{") {
        stack.pop()
        lastBalancedIndex = i + 1
      }
    } else if (char === "]") {
      if (stack.length > 0 && stack[stack.length - 1][0] === "[") {
        stack.pop()
        lastBalancedIndex = i + 1
      }
    }
  }

  if (lastBalancedIndex === 0) {
    return `{"subtitles":[]}`
  }

  input = input.slice(0, lastBalancedIndex).trim()

  while (stack.length > 0 && stack[stack.length - 1][1] > lastBalancedIndex) {
    stack.pop()
  }
  while (stack.length > 0) {
    input += map.get(stack.pop()![0])
  }

  return input
}
