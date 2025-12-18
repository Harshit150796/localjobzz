-- Clean up existing ghost conversations (conversations with no messages)
DELETE FROM conversations c
WHERE NOT EXISTS (
  SELECT 1 FROM messages m WHERE m.conversation_id = c.id
);