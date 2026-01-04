-- Create the receipts storage bucket manually
-- Run this if the bucket wasn't created by the migration

-- Create bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for receipts bucket
-- Allow users to upload to their own folder
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Users can upload their own receipts'
    ) THEN
        CREATE POLICY "Users can upload their own receipts"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (
          bucket_id = 'receipts' AND
          (storage.foldername(name))[1] = auth.uid()::text
        );
    END IF;
END $$;

-- Allow users to read their own receipts
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Users can view their own receipts'
    ) THEN
        CREATE POLICY "Users can view their own receipts"
        ON storage.objects FOR SELECT
        TO authenticated
        USING (
          bucket_id = 'receipts' AND
          (storage.foldername(name))[1] = auth.uid()::text
        );
    END IF;
END $$;

-- Allow users to delete their own receipts
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Users can delete their own receipts'
    ) THEN
        CREATE POLICY "Users can delete their own receipts"
        ON storage.objects FOR DELETE
        TO authenticated
        USING (
          bucket_id = 'receipts' AND
          (storage.foldername(name))[1] = auth.uid()::text
        );
    END IF;
END $$;
