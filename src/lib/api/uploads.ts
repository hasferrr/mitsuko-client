import axios from "axios"
import { supabase } from "../supabase"
import {
  UPLOADS_SIGNED_URL,
  UPLOADS_COMPLETE_URL,
  UPLOADS_LIST_URL,
  UPLOADS_DELETE_URL,
} from "@/constants/api"
import {
  SignedUrlRequest,
  SignedUrlResponse,
  CompleteUploadRequest,
  UploadFileMeta,
} from "@/types/uploads"

const authHeader = async (): Promise<{ Authorization: string }> => {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  if (!token) throw new Error("User not authenticated")
  return { Authorization: `Bearer ${token}` }
}

export const requestSignedUrl = async (params: SignedUrlRequest): Promise<SignedUrlResponse> => {
  const headers = await authHeader()
  const { data } = await axios.post<SignedUrlResponse>(UPLOADS_SIGNED_URL, params, { headers })
  return data
}

export const notifyUploadComplete = async (params: CompleteUploadRequest): Promise<void> => {
  const headers = await authHeader()
  await axios.post(UPLOADS_COMPLETE_URL, params, { headers })
}

export const listUploads = async (): Promise<UploadFileMeta[]> => {
  const headers = await authHeader()
  const { data } = await axios.get<{ files: UploadFileMeta[] }>(UPLOADS_LIST_URL, { headers })
  return data.files
}

export const deleteUpload = async (uploadId: string): Promise<void> => {
  const headers = await authHeader()
  await axios.post(UPLOADS_DELETE_URL, { uploadId }, { headers })
}
