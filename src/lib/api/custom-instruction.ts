import { supabase } from '@/lib/supabase'
import {
  PublicCustomInstruction,
  PublicCustomInstructionShort,
} from '@/types/public-custom-instruction'

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

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await supabase
    .from('custom_instructions')
    .select<string, PublicCustomInstructionShort>('id, user_id, name, preview, created_at', { count: 'exact' })
    .or(`and(is_public.eq.true,force_hide.eq.false),user_id.eq.${session.user.id}`)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    throw error
  }

  return {
    data: data || [],
    totalPages: Math.ceil((count || 0) / limit),
    currentPage: page
  }
}

export async function getPublicCustomInstruction(id: string): Promise<PublicCustomInstruction> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('custom_instructions')
    .select('id, user_id, name, preview, content, created_at')
    .eq('id', id)
    .or(`and(is_public.eq.true,force_hide.eq.false),user_id.eq.${session.user.id}`)
    .maybeSingle<PublicCustomInstruction>()

  if (error) {
    throw error
  }

  if (!data) {
    throw new Error('Custom instruction not found')
  }

  return data
}