-- Create magic_tokens table for magic link authentication
CREATE TABLE IF NOT EXISTS public.magic_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_magic_tokens_token ON public.magic_tokens(token);
CREATE INDEX IF NOT EXISTS idx_magic_tokens_user_id ON public.magic_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_magic_tokens_email ON public.magic_tokens(email);

-- Enable Row Level Security
ALTER TABLE public.magic_tokens ENABLE ROW LEVEL SECURITY;

-- Users can read their own tokens
CREATE POLICY "Users can read own tokens"
  ON public.magic_tokens
  FOR SELECT
  USING (auth.uid() = user_id OR email = auth.jwt()->>'email');

-- Allow inserting tokens (used by edge functions with service role)
CREATE POLICY "Service role can insert tokens"
  ON public.magic_tokens
  FOR INSERT
  WITH CHECK (true);

-- Allow updating tokens (used by edge functions with service role)
CREATE POLICY "Service role can update tokens"
  ON public.magic_tokens
  FOR UPDATE
  USING (true);

-- Enable realtime for magic_tokens table
ALTER TABLE public.magic_tokens REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.magic_tokens;