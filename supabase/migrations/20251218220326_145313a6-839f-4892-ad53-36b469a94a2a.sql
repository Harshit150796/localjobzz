-- Add unique constraint to prevent duplicate conversations for same job/employer/worker combo
ALTER TABLE conversations 
ADD CONSTRAINT unique_conversation 
UNIQUE (job_id, employer_id, worker_id);

-- Enable REPLICA IDENTITY FULL for better realtime updates
ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER TABLE conversations REPLICA IDENTITY FULL;