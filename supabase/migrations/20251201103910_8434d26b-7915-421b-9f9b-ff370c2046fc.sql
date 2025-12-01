-- Create job_completions table
CREATE TABLE job_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  employer_id UUID NOT NULL,
  completion_type TEXT NOT NULL CHECK (completion_type IN ('platform_worker', 'external', 'no_longer_needed')),
  completed_by_user_id UUID,
  external_source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE job_completions ENABLE ROW LEVEL SECURITY;

-- RLS policies for job_completions
CREATE POLICY "Users can view completions for their jobs"
ON job_completions FOR SELECT
USING (
  employer_id = auth.uid() OR 
  completed_by_user_id = auth.uid()
);

CREATE POLICY "Employers can create completions for their jobs"
ON job_completions FOR INSERT
WITH CHECK (employer_id = auth.uid());

-- Create ratings table
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_completion_id UUID NOT NULL REFERENCES job_completions(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  rater_id UUID NOT NULL,
  rated_user_id UUID NOT NULL,
  rating_type TEXT NOT NULL CHECK (rating_type IN ('employer_to_worker', 'worker_to_employer')),
  stars INTEGER NOT NULL CHECK (stars >= 1 AND stars <= 5),
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, rater_id, rated_user_id)
);

-- Enable RLS
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- RLS policies for ratings
CREATE POLICY "Anyone can view ratings"
ON ratings FOR SELECT
USING (true);

CREATE POLICY "Users can create ratings for their jobs"
ON ratings FOR INSERT
WITH CHECK (
  auth.uid() = rater_id AND
  (
    EXISTS (
      SELECT 1 FROM job_completions 
      WHERE id = job_completion_id 
      AND employer_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM job_completions 
      WHERE id = job_completion_id 
      AND completed_by_user_id = auth.uid()
    )
  )
);

-- Add rating aggregate columns to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS total_jobs_posted INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_jobs_completed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_employer_rating DECIMAL(3,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS average_worker_rating DECIMAL(3,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS total_employer_reviews INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_worker_reviews INTEGER DEFAULT 0;

-- Function to update profile rating stats
CREATE OR REPLACE FUNCTION update_user_rating_stats()
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
    )
  WHERE user_id = NEW.rated_user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to update stats on new rating
CREATE TRIGGER on_rating_created
  AFTER INSERT ON ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_rating_stats();

-- Function to update jobs posted count
CREATE OR REPLACE FUNCTION update_jobs_posted_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles 
  SET total_jobs_posted = (
    SELECT COUNT(*) FROM jobs WHERE user_id = NEW.user_id
  )
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to update jobs posted count
CREATE TRIGGER on_job_created
  AFTER INSERT ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_jobs_posted_count();