-- Create missing triggers for automatic profile updates

-- Trigger to update rating stats when a new rating is inserted
CREATE TRIGGER on_rating_insert
  AFTER INSERT ON public.ratings
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_user_rating_stats();

-- Trigger to update jobs posted count when a new job is inserted
CREATE TRIGGER on_job_insert
  AFTER INSERT ON public.jobs
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_jobs_posted_count();

-- Update the existing update_user_rating_stats function to also update total_jobs_completed
CREATE OR REPLACE FUNCTION public.update_user_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles SET 
    average_worker_rating = (
      SELECT AVG(stars)::DECIMAL(3,2)
      FROM ratings 
      WHERE rated_user_id = NEW.rated_user_id 
      AND rating_type = 'employer_to_worker'
    ),
    total_worker_reviews = (
      SELECT COUNT(*) 
      FROM ratings 
      WHERE rated_user_id = NEW.rated_user_id 
      AND rating_type = 'employer_to_worker'
    ),
    average_employer_rating = (
      SELECT AVG(stars)::DECIMAL(3,2)
      FROM ratings 
      WHERE rated_user_id = NEW.rated_user_id 
      AND rating_type = 'worker_to_employer'
    ),
    total_employer_reviews = (
      SELECT COUNT(*) 
      FROM ratings 
      WHERE rated_user_id = NEW.rated_user_id 
      AND rating_type = 'worker_to_employer'
    ),
    total_jobs_completed = (
      SELECT COUNT(*) 
      FROM job_completions 
      WHERE completed_by_user_id = NEW.rated_user_id
      AND completion_type = 'platform_worker'
    )
  WHERE user_id = NEW.rated_user_id;
  
  -- Also update the rater's profile (employer)
  IF NEW.rating_type = 'worker_to_employer' THEN
    UPDATE profiles SET 
      average_employer_rating = (
        SELECT AVG(stars)::DECIMAL(3,2)
        FROM ratings 
        WHERE rated_user_id = NEW.rater_id 
        AND rating_type = 'worker_to_employer'
      ),
      total_employer_reviews = (
        SELECT COUNT(*) 
        FROM ratings 
        WHERE rated_user_id = NEW.rater_id 
        AND rating_type = 'worker_to_employer'
      )
    WHERE user_id = NEW.rater_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update Jobs RLS policy to allow viewing completed jobs
DROP POLICY IF EXISTS "Anyone can view active jobs" ON public.jobs;

CREATE POLICY "Anyone can view active jobs" 
  ON public.jobs 
  FOR SELECT 
  USING (status = 'active' OR status = 'completed');

-- Add policy for users to view their own jobs regardless of status
CREATE POLICY "Users can view their own jobs" 
  ON public.jobs 
  FOR SELECT 
  USING (auth.uid() = user_id);