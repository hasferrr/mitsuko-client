import { keepOnlyWrapped } from '@/lib/parser/cleaner'
import { TERMS_LINK } from '@/constants/external-links'

export const fetchTerms = async () => {
  const res = await fetch(TERMS_LINK)
  if (!res.ok) {
    throw new Error('Network response was not ok')
  }
  const text = await res.text()
  const b64 = keepOnlyWrapped(text, "[[", "]]")
  try {
    const mail = Buffer.from(b64, "base64").toString("utf-8")
    return text.replace(b64, mail)
  } catch (error) {
    console.error("Error decoding base64 string:", error)
    return text
  }
}