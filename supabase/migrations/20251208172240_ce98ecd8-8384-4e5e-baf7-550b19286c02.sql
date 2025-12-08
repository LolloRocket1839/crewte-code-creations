-- Fix storage security: Remove public read access and add authenticated owner-only policies

-- Drop existing public read policy
DROP POLICY IF EXISTS "Public read access for receipts" ON storage.objects;

-- Drop any other existing policies on expense-receipts bucket (to recreate properly)
DROP POLICY IF EXISTS "Users can upload their own receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own receipts" ON storage.objects;

-- Create authenticated SELECT policy (users can only view their own files)
CREATE POLICY "Authenticated users can view their own receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'expense-receipts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create INSERT policy (users can only upload to their own folder)
CREATE POLICY "Authenticated users can upload their own receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'expense-receipts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create UPDATE policy (users can only update their own files)
CREATE POLICY "Authenticated users can update their own receipts"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'expense-receipts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create DELETE policy (users can only delete their own files)
CREATE POLICY "Authenticated users can delete their own receipts"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'expense-receipts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Make the bucket private
UPDATE storage.buckets SET public = false WHERE id = 'expense-receipts';