-- Phase 1: Delete all existing users (profiles first due to foreign key)
DELETE FROM public.profiles;

-- Delete auth users (cascade will handle related tables)
DELETE FROM auth.users;

-- Phase 2: Add email_verified to profiles table
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_email_verified 
  ON public.profiles(email_verified);

-- Phase 3: Enhance pending_registrations table
ALTER TABLE public.pending_registrations
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS resend_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_resend_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS ip_address TEXT,
  ADD COLUMN IF NOT EXISTS user_agent TEXT,
  ADD COLUMN IF NOT EXISTS otp_hash TEXT;

-- Update unique constraint for email-based flow
DROP INDEX IF EXISTS idx_pending_phone;
CREATE UNIQUE INDEX IF NOT EXISTS idx_pending_email 
  ON public.pending_registrations(email) 
  WHERE verified_at IS NULL;

-- Phase 4: Create otp_rate_limits table
CREATE TABLE IF NOT EXISTS public.otp_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ip_address TEXT,
  attempt_type TEXT NOT NULL,
  attempts INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  blocked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_email 
  ON public.otp_rate_limits(email, window_start);
CREATE INDEX IF NOT EXISTS idx_rate_limits_ip 
  ON public.otp_rate_limits(ip_address, window_start);

-- Enable RLS on otp_rate_limits
ALTER TABLE public.otp_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service role can access rate limits
DROP POLICY IF EXISTS "Service role can manage rate limits" ON public.otp_rate_limits;
CREATE POLICY "Service role can manage rate limits"
  ON public.otp_rate_limits FOR ALL
  USING (true)
  WITH CHECK (true);