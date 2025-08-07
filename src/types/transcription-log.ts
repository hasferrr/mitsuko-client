export interface TranscriptionLogItem {
  _id: string
  userId: string
  metadata: {
    originalname: string
    mimetype: string
    size: number
  }
  creditsConsumed?: number
  reqModels: string
  createdAt: string
}

export interface TranscriptionLogListResponse {
  data: TranscriptionLogItem[]
  totalPages: number
  currentPage: number
}

export interface TranscriptionLogResultResponse {
  result: string
}