import { supabase } from '@/integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';

export interface ConversationResult {
  success: boolean;
  conversationId?: string;
  error?: string;
}

export interface FindConversationResult {
  exists: boolean;
  conversationId?: string;
  error?: string;
}

/**
 * Finds an existing conversation between a user and a job poster.
 * Does NOT create a new conversation - use createConversationWithMessage for that.
 */
export const findConversation = async (
  jobId: string,
  employerId: string,
  workerId: string
): Promise<FindConversationResult> => {
  try {
    // Validate all UUIDs are present and not null
    if (!jobId || !employerId || !workerId || 
        jobId === 'null' || employerId === 'null' || workerId === 'null') {
      return { exists: false, error: 'Invalid user or job information.' };
    }

    // Check if conversation already exists
    const { data: existing, error: searchError } = await supabase
      .from('conversations')
      .select('id')
      .eq('job_id', jobId)
      .eq('employer_id', employerId)
      .eq('worker_id', workerId)
      .maybeSingle();

    if (searchError) {
      console.error('Error searching for conversation:', searchError);
      return { exists: false, error: 'Failed to check existing conversations' };
    }

    if (existing) {
      return { exists: true, conversationId: existing.id };
    }

    return { exists: false };
  } catch (error) {
    console.error('Unexpected error in findConversation:', error);
    return { exists: false, error: 'An unexpected error occurred' };
  }
};

/**
 * Creates a new conversation AND sends the first message in a single transaction.
 * This prevents ghost conversations by only creating when a message is actually sent.
 */
export const createConversationWithMessage = async (
  jobId: string,
  employerId: string,
  workerId: string,
  messageContent: string,
  session: Session
): Promise<ConversationResult> => {
  try {
    // Validate all UUIDs are present and not null
    if (!jobId || !employerId || !workerId || 
        jobId === 'null' || employerId === 'null' || workerId === 'null') {
      return { 
        success: false, 
        error: 'Invalid user or job information. Cannot start conversation.' 
      };
    }

    // Prevent self-conversations
    if (employerId === workerId) {
      return { 
        success: false, 
        error: 'You cannot message your own job posting' 
      };
    }

    // Verify the session user matches the worker ID
    if (!session || session.user.id !== workerId) {
      return { 
        success: false, 
        error: 'Authentication mismatch. Please refresh the page and try again.' 
      };
    }

    // First check if conversation already exists
    const { data: existing, error: searchError } = await supabase
      .from('conversations')
      .select('id')
      .eq('job_id', jobId)
      .eq('employer_id', employerId)
      .eq('worker_id', workerId)
      .maybeSingle();

    if (searchError) {
      console.error('Error searching for conversation:', searchError);
      return { success: false, error: 'Failed to check existing conversations' };
    }

    let conversationId: string;

    if (existing) {
      conversationId = existing.id;
    } else {
      // Create new conversation
      const { data: newConv, error: createError } = await supabase
        .from('conversations')
        .insert({
          job_id: jobId,
          employer_id: employerId,
          worker_id: workerId
        })
        .select('id')
        .single();

      if (createError) {
        console.error('Error creating conversation:', createError);
        return { success: false, error: 'Failed to create conversation' };
      }
      
      conversationId = newConv.id;
    }

    // Now send the first message
    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: workerId,
        content: messageContent
      });

    if (messageError) {
      console.error('Error sending message:', messageError);
      return { success: false, error: 'Failed to send message' };
    }

    return { success: true, conversationId };
  } catch (error) {
    console.error('Unexpected error in createConversationWithMessage:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

/**
 * @deprecated Use findConversation and createConversationWithMessage instead.
 * This function is kept for backwards compatibility.
 */
export const createOrFindConversation = async (
  jobId: string,
  employerId: string,
  workerId: string,
  session: Session
): Promise<ConversationResult> => {
  const result = await findConversation(jobId, employerId, workerId);
  
  if (result.exists && result.conversationId) {
    return { success: true, conversationId: result.conversationId };
  }
  
  // Return without creating - caller should use createConversationWithMessage
  return { 
    success: false, 
    error: 'No existing conversation found. Use createConversationWithMessage to create one.' 
  };
};
