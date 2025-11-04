-- Create pending_registrations table to store unverified signups
CREATE TABLE IF NOT EXISTS public.pending_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  password_hash text NOT NULL,
  phone text,
  otp_code text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  verified_at timestamptz,
  attempts int DEFAULT 0
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_pending_registrations_email ON public.pending_registrations(email);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_otp ON public.pending_registrations(otp_code);

-- Enable Row Level Security
ALTER TABLE public.pending_registrations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for signup)
CREATE POLICY "Allow public insert on pending_registrations" 
ON public.pending_registrations
FOR INSERT 
TO anon 
WITH CHECK (true);

-- Allow anyone to read pending registrations (needed for OTP verification)
CREATE POLICY "Allow public select on pending_registrations" 
ON public.pending_registrations
FOR SELECT 
TO anon 
USING (true);

-- Allow service role to update (for verification)
CREATE POLICY "Allow service role update on pending_registrations" 
ON public.pending_registrations
FOR UPDATE 
TO service_role
USING (true);

-- Create function to clean up expired pending registrations (run periodically)
CREATE OR REPLACE FUNCTION public.cleanup_expired_pending_registrations()
RETURNS void AS $$
BEGIN
  DELETE FROM public.pending_registrations
  WHERE expires_at < now() - interval '1 day';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;