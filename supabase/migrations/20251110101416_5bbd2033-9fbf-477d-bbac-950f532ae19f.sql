-- Make user_id nullable to allow anonymous job posts
ALTER TABLE public.jobs 
ALTER COLUMN user_id DROP NOT NULL;

-- Update RLS policy for anonymous inserts
DROP POLICY IF EXISTS "Users can insert their own jobs" ON public.jobs;

CREATE POLICY "Anyone can insert jobs"
ON public.jobs
FOR INSERT
WITH CHECK (
  -- Either authenticated user posting their own job
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR 
  -- Or anonymous user (user_id is null)
  (auth.uid() IS NULL AND user_id IS NULL)
);

-- Ensure anonymous jobs are viewable
DROP POLICY IF EXISTS "Anyone can view active jobs" ON public.jobs;

CREATE POLICY "Anyone can view active jobs"
ON public.jobs
FOR SELECT
USING (status = 'active'::text);