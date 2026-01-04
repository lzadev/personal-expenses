'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ExpenseFilter, ExpenseFormData } from '@/lib/types/expense'
import { uploadAttachment, deleteAttachment } from '@/lib/utils/attachments'

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

  // Handle attachment upload if present
  let attachmentData = {}
  if (formData.attachment) {
    const { url, name, type } = await uploadAttachment(formData.attachment, user.id, supabase)
    attachmentData = {
      attachment_url: url,
      attachment_name: name,
      attachment_type: type,
    }
  }

  const { attachment, ...expenseData } = formData

  const { error } = await supabase.from('expenses').insert({
    user_id: user.id,
    ...expenseData,
    ...attachmentData,
  })

  if (error) throw error
  
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateExpense(id: string, formData: ExpenseFormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get existing expense to check for old attachment
  const { data: existingExpense } = await supabase
    .from('expenses')
    .select('attachment_url')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  // Handle attachment upload if present
  let attachmentData: any = {}
  
  // If user wants to remove existing attachment
  if (formData.removeAttachment && existingExpense?.attachment_url) {
    await deleteAttachment(existingExpense.attachment_url, supabase)
    attachmentData = {
      attachment_url: null,
      attachment_name: null,
      attachment_type: null,
    }
  }
  // If user is uploading a new attachment
  else if (formData.attachment) {
    // Delete old attachment if exists
    if (existingExpense?.attachment_url) {
      await deleteAttachment(existingExpense.attachment_url, supabase)
    }
    
    const { url, name, type } = await uploadAttachment(formData.attachment, user.id, supabase)
    attachmentData = {
      attachment_url: url,
      attachment_name: name,
      attachment_type: type,
    }
  }

  const { attachment, removeAttachment, ...expenseData } = formData

  const { error } = await supabase
    .from('expenses')
    .update({
      ...expenseData,
      ...attachmentData,
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

  // Get expense to check for attachment
  const { data: expense } = await supabase
    .from('expenses')
    .select('attachment_url')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  // Delete attachment if exists
  if (expense?.attachment_url) {
    await deleteAttachment(expense.attachment_url, supabase)
  }

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  
  revalidatePath('/dashboard')
  return { success: true }
}
