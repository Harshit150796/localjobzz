-- Drop the old policy that allowed anonymous posting
DROP POLICY IF EXISTS "Anyone can insert jobs" ON public.jobs;

-- Create new policy for authenticated users only
CREATE POLICY "Authenticated users can insert their own jobs"
ON public.jobs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);