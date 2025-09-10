-- Create storage bucket for uploaded files
INSERT INTO storage.buckets (id, name, public) VALUES ('uploaded-files', 'uploaded-files', false);

-- Add file storage columns to upload_sessions table
ALTER TABLE public.upload_sessions 
ADD COLUMN file_path TEXT,
ADD COLUMN file_url TEXT,
ADD COLUMN storage_bucket TEXT DEFAULT 'uploaded-files';

-- Create RLS policies for the uploaded-files bucket
CREATE POLICY "Users can view their own uploaded files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'uploaded-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'uploaded-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own uploaded files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'uploaded-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own uploaded files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'uploaded-files' AND auth.uid()::text = (storage.foldername(name))[1]);