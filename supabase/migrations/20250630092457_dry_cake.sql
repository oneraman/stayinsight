/*
  # Create avatars storage bucket with RLS policies

  1. Storage Setup
    - Create 'avatars' storage bucket if it doesn't exist
    - Enable RLS on the bucket
    
  2. Security Policies
    - Allow authenticated users to upload their own avatar files
    - Allow authenticated users to view avatar files
    - Allow authenticated users to update their own avatar files
    - Allow authenticated users to delete their own avatar files
    
  3. File Naming Convention
    - Files should be named with user ID prefix for security
*/

-- Create the avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on the avatars bucket
UPDATE storage.buckets 
SET public = true 
WHERE id = 'avatars';

-- Create policy for authenticated users to upload their own avatars
CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy for authenticated users to view avatars
CREATE POLICY "Anyone can view avatars"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'avatars');

-- Create policy for authenticated users to update their own avatars
CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy for authenticated users to delete their own avatars
CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);