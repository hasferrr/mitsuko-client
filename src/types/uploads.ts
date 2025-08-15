export interface SignedUrlRequest {
  fileName: string
  contentType: string
}

export interface SignedUrlResponse {
  postPolicy: {
    url: string
    fields: { [key: string]: string }
  }
  uploadId: string
}

export interface CompleteUploadRequest {
  uploadId: string
  size: number
  duration: number
  contentType: string
}

export type UploadState = "pending" | "completed" | "revoked"

export interface UploadFileMeta {
  uploadId: string
  fileName: string
  size: number
  duration: number
  contentType: string
  state: UploadState
  createdAt: string
}
