/*
  # Enable Google OAuth Authentication

  1. Configuration
    - This migration sets up the database side for Google OAuth
    - The actual OAuth provider configuration must be done in Supabase Dashboard
    
  2. Instructions for Supabase Dashboard Setup
    - Go to Authentication > Providers in your Supabase Dashboard
    - Enable Google provider
    - Add your Google OAuth Client ID and Client Secret
    - Set redirect URL to: https://your-project.supabase.co/auth/v1/callback
    
  3. Security
    - Ensure RLS policies support OAuth users
    - Update user profile handling for OAuth metadata
*/

-- Ensure the auth schema has proper permissions for OAuth flows
-- This is typically handled by Supabase, but we'll ensure it's set up correctly

-- Create a function to handle OAuth user profile updates
CREATE OR REPLACE FUNCTION public.handle_oauth_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user metadata when OAuth user signs in
  IF NEW.raw_app_meta_data ? 'provider' AND NEW.raw_app_meta_data->>'provider' = 'google' THEN
    -- Extract Google profile information
    NEW.raw_user_meta_data = COALESCE(NEW.raw_user_meta_data, '{}'::jsonb) || 
      jsonb_build_object(
        'avatar_url', COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
        'display_name', COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name')
      );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to handle OAuth user profile updates
DROP TRIGGER IF EXISTS on_oauth_user_created ON auth.users;
CREATE TRIGGER on_oauth_user_created
  BEFORE INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_oauth_user();

-- Ensure customers table policies work with OAuth users
-- (These should already exist from previous migrations, but we'll verify)

-- Update RLS policies to ensure OAuth users can access their data
DO $$
BEGIN
  -- Check if customers table exists and update policies if needed
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers' AND table_schema = 'public') THEN
    
    -- Ensure OAuth users can manage their customer data
    -- These policies should already exist, but we'll recreate them to be safe
    
    DROP POLICY IF EXISTS "OAuth users can view their own customers" ON public.customers;
    CREATE POLICY "OAuth users can view their own customers"
      ON public.customers
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "OAuth users can insert their own customers" ON public.customers;
    CREATE POLICY "OAuth users can insert their own customers"
      ON public.customers
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "OAuth users can update their own customers" ON public.customers;
    CREATE POLICY "OAuth users can update their own customers"
      ON public.customers
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "OAuth users can delete their own customers" ON public.customers;
    CREATE POLICY "OAuth users can delete their own customers"
      ON public.customers
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Ensure upload_sessions table policies work with OAuth users
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'upload_sessions' AND table_schema = 'public') THEN
    
    DROP POLICY IF EXISTS "OAuth users can manage their own upload sessions" ON public.upload_sessions;
    CREATE POLICY "OAuth users can manage their own upload sessions"
      ON public.upload_sessions
      FOR ALL
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Create a helper function to get user display name (works with OAuth)
CREATE OR REPLACE FUNCTION public.get_user_display_name(user_id uuid)
RETURNS text AS $$
DECLARE
  user_record auth.users%ROWTYPE;
  display_name text;
BEGIN
  SELECT * INTO user_record FROM auth.users WHERE id = user_id;
  
  IF user_record.id IS NULL THEN
    RETURN 'Unknown User';
  END IF;
  
  -- Try to get display name from user metadata
  display_name := user_record.raw_user_meta_data->>'display_name';
  
  -- Fallback to name if display_name is not available
  IF display_name IS NULL OR display_name = '' THEN
    display_name := user_record.raw_user_meta_data->>'name';
  END IF;
  
  -- Fallback to full_name if name is not available
  IF display_name IS NULL OR display_name = '' THEN
    display_name := user_record.raw_user_meta_data->>'full_name';
  END IF;
  
  -- Fallback to email username if no name is available
  IF display_name IS NULL OR display_name = '' THEN
    display_name := split_part(user_record.email, '@', 1);
  END IF;
  
  -- Final fallback
  IF display_name IS NULL OR display_name = '' THEN
    display_name := 'User';
  END IF;
  
  RETURN display_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;