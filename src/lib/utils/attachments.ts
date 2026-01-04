import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Upload attachment to Supabase Storage
 * Note: Image should already be compressed on client-side before calling this
 */
export async function uploadAttachment(
  file: File,
  userId: string,
  supabase: SupabaseClient
): Promise<{
  url: string
  name: string
  type: string
}> {
  // Generate unique filename
  const timestamp = Date.now()
  const extension = file.name.split('.').pop()
  const filename = `${timestamp}.${extension}`
  const filePath = `${userId}/${filename}`

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('expenses-receipts')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error('Error uploading file:', error)
    throw new Error('Failed to upload attachment')
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('expenses-receipts')
    .getPublicUrl(data.path)

  return {
    url: publicUrl,
    name: file.name,
    type: file.type,
  }
}

/**
 * Delete attachment from Supabase Storage
 */
export async function deleteAttachment(url: string, supabase: SupabaseClient): Promise<void> {
  // Extract path from URL
  const urlParts = url.split('/expenses-receipts/')
  if (urlParts.length < 2) return

  const filePath = urlParts[1]

  const { error } = await supabase.storage
    .from('expenses-receipts')
    .remove([filePath])

  if (error) {
    console.error('Error deleting file:', error)
    throw new Error('Failed to delete attachment')
  }
}
