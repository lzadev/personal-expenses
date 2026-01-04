-- Fix storage bucket and policies for expenses-receipts
-- Make the bucket public and simplify policies

-- Update bucket to be public (easier for viewing receipts)
UPDATE storage.buckets 
SET public = true 
WHERE id = 'expenses-receipts';

-- Drop existing policies
DROP POLICY IF EXISTS "Users can upload their own receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own receipts" ON storage.objects;

-- Create simpler policies for public bucket
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'expenses-receipts');

-- Allow everyone to view (since bucket is public)
CREATE POLICY "Anyone can view receipts"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'expenses-receipts');

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete their own receipts"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'expenses-receipts' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
