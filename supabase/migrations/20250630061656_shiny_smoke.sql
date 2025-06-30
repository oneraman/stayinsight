/*
  # Create upload sessions table for tracking file uploads

  1. New Tables
    - `upload_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `file_name` (text, original file name)
      - `file_size` (bigint, file size in bytes)
      - `total_rows` (integer, total rows in file)
      - `processed_rows` (integer, successfully processed rows)
      - `status` (text, upload status)
      - `error_message` (text, error details if failed)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `upload_sessions` table
    - Add policy for users to manage their own upload sessions
*/

CREATE TABLE IF NOT EXISTS upload_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_size bigint NOT NULL,
  total_rows integer DEFAULT 0,
  processed_rows integer DEFAULT 0,
  status text DEFAULT 'uploading' CHECK (status IN ('uploading', 'processing', 'completed', 'failed')),
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_upload_sessions_user_id ON upload_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_upload_sessions_status ON upload_sessions(status);
CREATE INDEX IF NOT EXISTS idx_upload_sessions_created_at ON upload_sessions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE upload_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own upload sessions
CREATE POLICY "Users can manage their own upload sessions"
  ON upload_sessions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_upload_sessions_updated_at
  BEFORE UPDATE ON upload_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();