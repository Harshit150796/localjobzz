-- Add otp_code column to magic_tokens table for fallback verification
ALTER TABLE public.magic_tokens
ADD COLUMN otp_code VARCHAR(6);

-- Add index for faster OTP lookups
CREATE INDEX idx_magic_tokens_otp ON public.magic_tokens(otp_code) WHERE otp_code IS NOT NULL;