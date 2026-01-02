'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ExpenseFormData, ExpenseFilter } from '@/lib/types/expense'

export async function getExpenses(filter?: ExpenseFilter) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  let query = supabase
    .from('expenses')
    .select('*, category:categories(*)')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  if (filter?.categoryId) {
    query = query.eq('category_id', filter.categoryId)
  }

  if (filter?.currency) {
    query = query.eq('currency', filter.currency)
  }

  if (filter?.startDate) {
    query = query.gte('date', filter.startDate)
  }

  if (filter?.endDate) {
    query = query.lte('date', filter.endDate)
  }

  if (filter?.search) {
    query = query.ilike('description', `%${filter.search}%`)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function createExpense(formData: ExpenseFormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('expenses').insert({
    user_id: user.id,
    ...formData,
  })

  if (error) throw error
  
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateExpense(id: string, formData: ExpenseFormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('expenses')
    .update({
      ...formData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteExpense(id: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  
  revalidatePath('/dashboard')
  return { success: true }
}
