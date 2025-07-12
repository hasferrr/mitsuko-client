import { supabase } from '@/lib/supabase'
import { CUSTOM_INSTRUCTIONS_URL } from '@/constants/api'
import {
  PublicCustomInstruction,
  PublicCustomInstructionShort,
} from '@/types/public-custom-instruction'
import axios from 'axios'

export interface PaginatedInstructions {
  data: PublicCustomInstructionShort[]
  totalPages: number
  currentPage: number
}

export async function getPublicCustomInstructionsPaged(
  page: number = 1,
  limit: number = 10
): Promise<PaginatedInstructions> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    throw new Error('User not authenticated')
  }

  const response = await axios.get(`${CUSTOM_INSTRUCTIONS_URL}/paged`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    params: {
      page,
      limit,
    },
  })

  return response.data
}

export async function getPublicCustomInstructions(): Promise<PublicCustomInstructionShort[]> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    throw new Error('User not authenticated')
  }

  const response = await axios.get(CUSTOM_INSTRUCTIONS_URL, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  })

  return response.data
}

export async function getPublicCustomInstruction(id: string): Promise<PublicCustomInstruction> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    throw new Error('User not authenticated')
  }

  const response = await axios.get(`${CUSTOM_INSTRUCTIONS_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  })

  return response.data
}