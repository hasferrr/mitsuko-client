import {
  TranscriptionLogListResponse,
  TranscriptionLogResultResponse,
} from '@/types/transcription-log'
import { TRANSCRIPTION_LOG_LIST_URL, TRANSCRIPTION_LOG_RESULT_URL } from '@/constants/api'
import { supabase } from '@/lib/supabase'

export async function getTranscriptionLogs(page: number, pageSize: number = 10): Promise<TranscriptionLogListResponse> {
  const { data: { session } } = await supabase.auth.getSession()
  const accessToken = session?.access_token
  if (!accessToken) {
    throw new Error('No access token found')
  }

  const res = await fetch(TRANSCRIPTION_LOG_LIST_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ page, pageSize })
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch transcription logs: ${res.status}`)
  }

  return await res.json()
}

export async function getTranscriptionLogResult(id: string): Promise<TranscriptionLogResultResponse> {
  const { data: { session } } = await supabase.auth.getSession()
  const accessToken = session?.access_token
  if (!accessToken) {
    throw new Error('No access token found')
  }

  const res = await fetch(TRANSCRIPTION_LOG_RESULT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ id })
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch transcription result: ${res.status}`)
  }

  return await res.json()
}