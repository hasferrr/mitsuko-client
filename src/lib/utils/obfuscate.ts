function rot47(x: string): string {
  const s = []
  for (let i = 0; i < x.length; i++) {
    const j = x.charCodeAt(i)
    if ((j >= 33) && (j <= 126)) {
      s.push(String.fromCharCode(33 + ((j + 14) % 94)))
    } else {
      s.push(String.fromCharCode(j))
    }
  }
  return s.join('')
}

function rot13(str: string): string {
  const result: string[] = []
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i)
    if (code >= 65 && code <= 90) {
      result.push(String.fromCharCode(((code - 65 + 13) % 26) + 65))
    } else if (code >= 97 && code <= 122) {
      result.push(String.fromCharCode(((code - 97 + 13) % 26) + 97))
    } else {
      result.push(str[i])
    }
  }
  return result.join('')
}

function reverse(str: string): string {
  const result: string[] = []
  for (let i = str.length - 1; i >= 0; i--) {
    result.push(str[i])
  }
  return result.join('')
}

export function obfuscate(x: string): string {
  return reverse(rot13(rot47(x)))
}