-- Create only the missing INSERT policy for jobs table
-- This is the critical policy needed to enable authenticated job posting

-- Drop existing INSERT policy if it exists (in case there's a broken one)
DROP POLICY IF EXISTS "Users can insert their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Authenticated users can insert their own jobs" ON public.jobs;

-- Create INSERT Policy: Only authenticated users can insert their own jobs
CREATE POLICY "Users can insert their own jobs"
ON public.jobs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Ensure SELECT policy exists for public job viewing
DROP POLICY IF EXISTS "Anyone can view active jobs" ON public.jobs;
CREATE POLICY "Anyone can view active jobs"
ON public.jobs
FOR SELECT
USING (status = 'active');