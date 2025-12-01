import { supabase } from '@/integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';

export interface ConversationResult {
  success: boolean;
  conversationId?: string;
  error?: string;
}

/**
 * Creates a new conversation or finds an existing one between a user and a job poster
 */
export const createOrFindConversation = async (
  jobId: string,
  employerId: string,
  workerId: string,
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
      return { success: false, error: 'Failed to check existing conversations' };
    }

    if (existing) {
      return { success: true, conversationId: existing.id };
    }

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

    return { success: true, conversationId: newConv.id };
  } catch (error) {
    console.error('Unexpected error in createOrFindConversation:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};
