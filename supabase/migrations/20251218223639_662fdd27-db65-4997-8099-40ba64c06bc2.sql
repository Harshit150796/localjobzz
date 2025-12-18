-- Create password_reset_requests table for forgot password flow
CREATE TABLE public.password_reset_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  verified_at TIMESTAMP WITH TIME ZONE,
  used_at TIMESTAMP WITH TIME ZONE,
  attempts INTEGER DEFAULT 0,
  resend_count INTEGER DEFAULT 0,
  last_resend_at TIMESTAMP WITH TIME ZONE,
  ip_address TEXT,
  user_agent TEXT,
  reset_token TEXT
);

-- Enable RLS
ALTER TABLE public.password_reset_requests ENABLE ROW LEVEL SECURITY;

-- Service role can manage password resets
CREATE POLICY "Service role can manage password resets"
  ON public.password_reset_requests FOR ALL
  USING (true) WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_password_reset_email ON public.password_reset_requests(email);
CREATE INDEX idx_password_reset_token ON public.password_reset_requests(reset_token);