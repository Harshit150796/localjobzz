-- Clean up existing self-conversations
DELETE FROM conversations WHERE employer_id = worker_id;

-- Add database constraint to prevent future self-conversations
ALTER TABLE conversations 
ADD CONSTRAINT no_self_conversations 
CHECK (employer_id != worker_id);