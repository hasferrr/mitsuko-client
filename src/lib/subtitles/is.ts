export function isASS(content: string): boolean {
  return content.trim().startsWith('[Script Info]')
}

export function isSRT(content: string): boolean {
  const lines = content.trim().split('\n', 2)
  const firstLine = lines[0]
  const secondLine = lines[1]
  return !isNaN(Number(firstLine)) && secondLine?.includes(' --> ')
}

export function isVTT(content: string): boolean {
  return content.trim().toLowerCase().startsWith('webvtt')
}
