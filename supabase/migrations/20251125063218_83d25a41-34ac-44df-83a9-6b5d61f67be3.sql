-- Clean up jobs with null user_id and then make user_id required
DELETE FROM jobs WHERE user_id IS NULL;

-- Now make user_id required to prevent anonymous job posts
ALTER TABLE jobs 
ALTER COLUMN user_id SET NOT NULL;