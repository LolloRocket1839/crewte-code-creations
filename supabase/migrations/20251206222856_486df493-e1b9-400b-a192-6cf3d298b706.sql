-- Create bucket for expense receipts
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('expense-receipts', 'expense-receipts', true, 10485760);

-- Policy: authenticated users can upload to their own folder
CREATE POLICY "Users can upload receipts" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'expense-receipts' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Policy: authenticated users can update their own files
CREATE POLICY "Users can update own receipts" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'expense-receipts' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Policy: authenticated users can delete their own files
CREATE POLICY "Users can delete own receipts" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'expense-receipts' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Policy: public read access for expense receipts
CREATE POLICY "Public read access for receipts" ON storage.objects
FOR SELECT
USING (bucket_id = 'expense-receipts');