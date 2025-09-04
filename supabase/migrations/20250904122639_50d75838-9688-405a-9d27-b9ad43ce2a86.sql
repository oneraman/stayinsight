-- Fix security linter warning: set search_path for function
CREATE OR REPLACE FUNCTION public.update_session_last_message_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.data_chat_sessions
  SET last_message_at = NEW.created_at, updated_at = now()
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;