-- RUN THIS IN YOUR SUPABASE SQL EDITOR
-- This adds attachment support to your expenses table

-- Step 1: Add attachment columns to expenses table
ALTER TABLE expenses
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS attachment_name TEXT,
ADD COLUMN IF NOT EXISTS attachment_type TEXT;

-- Step 2: Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_expenses_attachment 
ON expenses(attachment_url) 
WHERE attachment_url IS NOT NULL;

-- Step 3: Update bucket to be public (if it exists)
UPDATE storage.buckets 
SET public = true 
WHERE id = 'expenses-receipts';

-- Step 4: Drop existing policies (if they exist)
DROP POLICY IF EXISTS "Users can upload their own receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own receipts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload receipts" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view receipts" ON storage.objects;

-- Step 5: Create simplified policies
CREATE POLICY "Authenticated users can upload receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'expenses-receipts');

CREATE POLICY "Anyone can view receipts"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'expenses-receipts');

CREATE POLICY "Users can delete their own receipts"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'expenses-receipts' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
