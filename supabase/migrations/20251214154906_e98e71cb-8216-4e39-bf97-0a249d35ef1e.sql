-- Delete duplicate job_completions that don't have associated ratings
DELETE FROM job_completions 
WHERE id IN (
  SELECT jc.id 
  FROM job_completions jc
  LEFT JOIN ratings r ON r.job_completion_id = jc.id
  WHERE r.id IS NULL
  AND EXISTS (
    SELECT 1 FROM job_completions jc2 
    WHERE jc2.job_id = jc.job_id 
    AND jc2.employer_id = jc.employer_id 
    AND jc2.id != jc.id
  )
);

-- Add unique constraint to prevent future duplicates (job_id + employer_id should be unique)
ALTER TABLE job_completions 
ADD CONSTRAINT job_completions_job_employer_unique 
UNIQUE (job_id, employer_id);