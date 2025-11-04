-- Fix search_path for cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_expired_pending_registrations()
RETURNS void AS $$
BEGIN
  DELETE FROM public.pending_registrations
  WHERE expires_at < now() - interval '1 day';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;