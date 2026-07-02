export type Frontmatter = {
  title?: string
  description?: string
  date?: string
  updated?: string
  slug?: string
  tags?: string[]
  keywords?: string[]
  image?: string
  imageAlt?: string
  author?: string
  draft?: boolean
}

function parseArrayValue(raw: string, lines: string[], iRef: { i: number }) {
  const trimmed = raw.trim()
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    const inner = trimmed.slice(1, -1)
    return inner.split(',').map(s => s.trim()).filter(Boolean)
  }
  const out: string[] = []
  let i = iRef.i + 1
  while (i < lines.length) {
    const line = lines[i]
    if (!/^\s*-\s+/.test(line)) break
    out.push(line.replace(/^\s*-\s+/, '').trim())
    i += 1
  }
  iRef.i = i - 1
  return out
}

function stripQuotes(v: string) {
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) return v.slice(1, -1)
  return v
}

export function parseFrontmatter(raw: string): { data: Partial<Frontmatter>, content: string } {
  const text = raw.replace(/^\uFEFF/, '')
  const lines = text.split(/\r?\n/)
  if (lines[0] !== '---') {
    return { data: {}, content: text }
  }
  let end = -1
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === '---') {
      end = i
      break
    }
  }
  if (end === -1) {
    return { data: {}, content: text }
  }
  const fmLines = lines.slice(1, end)
  const content = lines.slice(end + 1).join('\n')
  const data: Partial<Frontmatter> = {}
  for (let i = 0; i < fmLines.length; i++) {
    const line = fmLines[i]
    if (!line.trim()) continue
    const idx = line.indexOf(':')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    const valueRaw = line.slice(idx + 1).trim()
    switch (key) {
      case 'tags': {
        const ref = { i }
        data.tags = parseArrayValue(valueRaw, fmLines, ref)
        i = ref.i
        break
      }
      case 'keywords': {
        const ref = { i }
        data.keywords = parseArrayValue(valueRaw, fmLines, ref)
        i = ref.i
        break
      }
      case 'draft':
        data.draft = valueRaw === 'true'
        break
      case 'date':
        if (/^\d{4}-\d{2}-\d{2}/.test(valueRaw)) data.date = valueRaw
        break
      case 'updated':
        if (/^\d{4}-\d{2}-\d{2}/.test(valueRaw)) data.updated = valueRaw
        break
      case 'title':
        data.title = stripQuotes(valueRaw)
        break
      case 'description':
        data.description = stripQuotes(valueRaw)
        break
      case 'slug':
        data.slug = stripQuotes(valueRaw)
        break
      case 'image':
        data.image = stripQuotes(valueRaw)
        break
      case 'imageAlt':
        data.imageAlt = stripQuotes(valueRaw)
        break
      case 'author':
        data.author = stripQuotes(valueRaw)
        break
      default:
        break
    }
  }
  return { data, content }
}
