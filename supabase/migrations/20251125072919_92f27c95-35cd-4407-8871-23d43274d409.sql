-- PERMANENT FIX: Remove role restriction from RLS policies
-- This allows policies to work even when rate limiting causes role fallback
-- Security is maintained by checking auth.uid() IS NOT NULL

-- Fix INSERT policy: Remove TO authenticated, check auth.uid() instead
DROP POLICY IF EXISTS "Users can insert their own jobs" ON public.jobs;
CREATE POLICY "Users can insert their own jobs"
ON public.jobs
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id
);

-- Fix UPDATE policy: Same approach for consistency
DROP POLICY IF EXISTS "Users can update their own jobs" ON public.jobs;
CREATE POLICY "Users can update their own jobs"
ON public.jobs
FOR UPDATE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Fix DELETE policy: Same approach for consistency
DROP POLICY IF EXISTS "Users can delete their own jobs" ON public.jobs;
CREATE POLICY "Users can delete their own jobs"
ON public.jobs
FOR DELETE
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Keep SELECT policy as-is (allows public viewing of active jobs)
DROP POLICY IF EXISTS "Anyone can view active jobs" ON public.jobs;
CREATE POLICY "Anyone can view active jobs"
ON public.jobs
FOR SELECT
USING (status = 'active');