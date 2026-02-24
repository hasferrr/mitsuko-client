import axios from "axios"
import { requestSignedUrl, notifyUploadComplete } from "./uploads"
import type { UploadProgress } from "@/types/uploads"

export const uploadFile = async (
  file: File,
  onProgress?: (progress: UploadProgress) => void,
  duration = 0
): Promise<string> => {
  try {
    // Step 1: Request signed URL from server
    const { postPolicy, uploadId } = await requestSignedUrl({
      fileName: file.name,
      contentType: file.type,
    })

    // Step 2: Create form data with signed post policy fields
    const formData = new FormData()

    // Add all fields from the signed post policy
    Object.entries(postPolicy.fields).forEach(([key, value]) => {
      formData.append(key, value)
    })

    // Add the file last
    formData.append('file', file)

    // Step 3: Upload file to cloud storage
    await axios.post(postPolicy.url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress: UploadProgress = {
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total),
          }
          onProgress(progress)
        }
      },
    })

    // Step 4: Notify server that upload is complete
    await notifyUploadComplete({
      uploadId,
      size: file.size,
      duration,
      contentType: file.type,
    })

    return uploadId
  } catch (error: unknown) {
    // Attempt to surface a user-friendly message from the server
    let message = 'Failed to upload file'

    if (axios.isAxiosError(error)) {
      // AxiosError with possible response from backend
      const respData = error.response?.data as { message?: string; error?: string }
      if (respData?.message) message = respData.message
      else if (respData?.error) message = respData.error
      else if (error.message) message = error.message
    } else if (error instanceof Error) {
      message = error.message
    }

    console.error('Upload failed:', error)
    throw new Error(message)
  }
}
