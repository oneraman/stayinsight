/*
  # Create Upload Sessions Table

  1. New Tables
    - `upload_sessions`: Tracks file upload and processing sessions
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `file_name` (text, not null)
      - `file_size` (bigint, not null)
      - `total_rows` (integer)
      - `processed_rows` (integer)
      - `status` (text)
      - `error_message` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  2. Security
    - Enable RLS on `upload_sessions` table
    - Add policies for authenticated users to manage their own upload sessions
*/

-- Create upload_sessions table
CREATE TABLE IF NOT EXISTS upload_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_size bigint NOT NULL,
  total_rows integer DEFAULT 0,
  processed_rows integer DEFAULT 0,
  status text DEFAULT 'uploading',
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT upload_sessions_status_check CHECK (status = ANY (ARRAY['uploading'::text, 'processing'::text, 'completed'::text, 'failed'::text]))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_upload_sessions_user_id ON public.upload_sessions USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_upload_sessions_status ON public.upload_sessions USING btree (status);
CREATE INDEX IF NOT EXISTS idx_upload_sessions_created_at ON public.upload_sessions USING btree (created_at DESC);

-- Enable Row Level Security
ALTER TABLE upload_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own upload sessions"
  ON upload_sessions
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create trigger for updated_at
CREATE TRIGGER update_upload_sessions_updated_at
  BEFORE UPDATE ON upload_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();