export interface Subtitle {
  index: number
  startTime: string
  endTime: string
  content: string
  translated: string
}

export type UpdateSubtitle = (
  index: number,
  field: keyof Subtitle,
  value: string | number,
) => void
