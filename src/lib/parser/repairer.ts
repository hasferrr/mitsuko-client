export function isEscaped(str: string, index: number): boolean {
  let backslashes = 0
  for (let i = index - 1; i >= 0 && str[i] === '\\'; i--) {
    backslashes++
  }
  return backslashes > 0 && backslashes % 2 !== 0
}

function isWhitespace(char: string): boolean {
  return char === " " || char === "\n" || char === "\t" || char === "\r"
}

function escapeUnescapedQuotes(input: string): string {
  let result = ""
  let inString = false
  let inKey = false
  let colonAfterKey = false

  for (let i = 0; i < input.length; i++) {
    const char = input[i]

    if (char === '"' && !isEscaped(input, i)) {
      if (!inString) {
        inString = true
        inKey = !colonAfterKey
        result += char
        continue
      }

      if (inKey) {
        inString = false
        inKey = false
        result += char
        continue
      }

      // We're in a value string, check if this quote is ending the value
      let j = i + 1
      while (j < input.length && isWhitespace(input[j])) {
        j++
      }

      const nextChar = input[j]
      if (nextChar === ',' || nextChar === '}' || nextChar === ']') {
        // This is a legitimate string ending
        inString = false
        colonAfterKey = false
        result += char
      } else {
        // This is an unescaped quote inside the string, escape it
        result += '\\"'
      }
      continue
    }

    if (!inString && char === ':') {
      colonAfterKey = true
    } else if (!inString && (char === ',' || char === '{' || char === '[')) {
      colonAfterKey = false
    }

    result += char
  }

  return result
}

function removeTrailingCommas(input: string): string {
  let result = ""
  let inString = false

  for (let i = 0; i < input.length; i++) {
    const char = input[i]

    if (char === '"' && !isEscaped(input, i)) {
      inString = !inString
      result += char
      continue
    }

    if (!inString && char === ",") {
      let j = i + 1
      while (j < input.length && isWhitespace(input[j])) {
        j++
      }

      if (j < input.length && (input[j] === "]" || input[j] === "}")) {
        continue
      }
    }

    result += char
  }

  return result
}

function removeTrailingComments(input: string): string {
  const lines = input.split("\n").map((line) => {
    let prev: string | null = null
    for (let i = line.length - 1; i >= 0; i--) {
      if (prev === '/' && line[i] === '/') {
        return line.substring(0, i - 1)
      }
      prev = line[i]
    }
    return line
  })
  return lines.join("\n")
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

  input = escapeUnescapedQuotes(input)

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

  return removeTrailingCommas(removeTrailingComments(input))
}
