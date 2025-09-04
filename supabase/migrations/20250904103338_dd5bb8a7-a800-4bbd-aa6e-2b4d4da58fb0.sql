-- Create data_chat_sessions and data_chat_messages tables with secure RLS and triggers

-- Table: data_chat_sessions
CREATE TABLE IF NOT EXISTS public.data_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.data_chat_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for sessions
CREATE POLICY IF NOT EXISTS "Users can view their own chat sessions"
ON public.data_chat_sessions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own chat sessions"
ON public.data_chat_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own chat sessions"
ON public.data_chat_sessions
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete their own chat sessions"
ON public.data_chat_sessions
FOR DELETE
USING (auth.uid() = user_id);

-- Table: data_chat_messages
CREATE TABLE IF NOT EXISTS public.data_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.data_chat_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user','ai')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_data_chat_messages_session_id ON public.data_chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_data_chat_messages_session_time ON public.data_chat_messages(session_id, created_at);

-- Enable RLS on messages
ALTER TABLE public.data_chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies for messages using correlated subquery to ensure ownership
CREATE POLICY IF NOT EXISTS "Users can view messages from their sessions"
ON public.data_chat_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.data_chat_sessions s 
    WHERE s.id = session_id AND s.user_id = auth.uid()
  )
);

CREATE POLICY IF NOT EXISTS "Users can insert messages into their sessions"
ON public.data_chat_messages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.data_chat_sessions s 
    WHERE s.id = session_id AND s.user_id = auth.uid()
  ) AND user_id = auth.uid()
);

CREATE POLICY IF NOT EXISTS "Users can delete their own messages"
ON public.data_chat_messages
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.data_chat_sessions s 
    WHERE s.id = session_id AND s.user_id = auth.uid()
  )
);

-- Update timestamp trigger function already exists: public.update_updated_at_column()
-- Create triggers to keep updated_at and last_message_at in sync

DROP TRIGGER IF EXISTS trg_update_data_chat_sessions_updated_at ON public.data_chat_sessions;
CREATE TRIGGER trg_update_data_chat_sessions_updated_at
BEFORE UPDATE ON public.data_chat_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Maintain last_message_at when a new message is inserted
CREATE OR REPLACE FUNCTION public.update_session_last_message_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.data_chat_sessions
  SET last_message_at = NEW.created_at, updated_at = now()
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_session_last_message_at ON public.data_chat_messages;
CREATE TRIGGER trg_update_session_last_message_at
AFTER INSERT ON public.data_chat_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_session_last_message_at();