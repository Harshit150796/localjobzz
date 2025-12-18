import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, ArrowLeft, Star } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import WorkerRatingModal from '../components/WorkerRatingModal';
import ConversationListItem from '../components/messages/ConversationListItem';
import ChatBubble from '../components/messages/ChatBubble';
import ChatHeader from '../components/messages/ChatHeader';
import ChatInput from '../components/messages/ChatInput';
import EmptyState from '../components/messages/EmptyState';
import ConversationSkeleton from '../components/messages/ConversationSkeleton';
import DateSeparator from '../components/messages/DateSeparator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { createConversationWithMessage } from '../utils/messageHelpers';

interface Conversation {
  id: string;
  job_id: string;
  employer_id: string;
  worker_id: string;
  otherUser: {
    id: string;
    name: string;
    avatar: string;
    rating: number | null;
    reviewCount: number;
  };
  jobTitle: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
}

interface PendingConversation {
  jobId: string;
  employerId: string;
  jobTitle: string;
  employerName: string;
  employerAvatar: string;
}

interface PendingRating {
  job_completion_id: string;
  job_id: string;
  employer_id: string;
  employer_name: string;
  job_title: string;
}

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  senderId: 'me' | 'other';
  timestamp: string;
}

// Helper to format date for separators
const formatMessageDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }
};

// Helper to check if two dates are different days
const isDifferentDay = (date1: string, date2: string): boolean => {
  return new Date(date1).toDateString() !== new Date(date2).toDateString();
};

const Messages: React.FC = () => {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const conversationIdFromUrl = searchParams.get('conversation');
  const pendingJobId = searchParams.get('pending_job');
  const pendingEmployerId = searchParams.get('pending_employer');
  const pendingJobTitle = searchParams.get('job_title');
  
  const [selectedConversation, setSelectedConversation] = useState<string | null>(conversationIdFromUrl);
  const [pendingConversation, setPendingConversation] = useState<PendingConversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [pendingRatings, setPendingRatings] = useState<PendingRating[]>([]);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState<PendingRating | null>(null);
  const { toast } = useToast();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mobileMessagesEndRef = useRef<HTMLDivElement>(null);

  // Handle pending conversation from URL params
  useEffect(() => {
    if (pendingJobId && pendingEmployerId && user) {
      const fetchEmployerProfile = async () => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('user_id', pendingEmployerId)
          .single();

        const name = profile?.name || 'User';
        const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
        
        setPendingConversation({
          jobId: pendingJobId,
          employerId: pendingEmployerId,
          jobTitle: pendingJobTitle ? decodeURIComponent(pendingJobTitle) : 'Job',
          employerName: name,
          employerAvatar: initials,
        });
        
        setSelectedConversation(null);
        setMessages([]);
      };
      
      fetchEmployerProfile();
    }
  }, [pendingJobId, pendingEmployerId, pendingJobTitle, user]);

  // Fetch conversations and pending ratings
  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      try {
        const { data: convData, error } = await supabase
          .from('conversations')
          .select(`
            id,
            job_id,
            employer_id,
            worker_id,
            jobs (title),
            messages (content, created_at)
          `)
          .or(`employer_id.eq.${user.id},worker_id.eq.${user.id}`)
          .order('updated_at', { ascending: false });

        if (error) throw error;

        const formattedConvs = await Promise.all(
          (convData || []).map(async (conv: any) => {
            const otherUserId = conv.employer_id === user.id ? conv.worker_id : conv.employer_id;
            
            const { data: profile } = await supabase
              .from('profiles')
              .select('name, average_worker_rating, total_worker_reviews, average_employer_rating, total_employer_reviews')
              .eq('user_id', otherUserId)
              .single();

            const lastMsg = conv.messages?.[conv.messages.length - 1];
            const initials = profile?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U';

            const isEmployer = conv.employer_id === user.id;
            const rating = isEmployer ? profile?.average_worker_rating : profile?.average_employer_rating;
            const reviewCount = isEmployer ? profile?.total_worker_reviews : profile?.total_employer_reviews;

            return {
              id: conv.id,
              job_id: conv.job_id,
              employer_id: conv.employer_id,
              worker_id: conv.worker_id,
              otherUser: {
                id: otherUserId,
                name: profile?.name || 'Unknown User',
                avatar: initials,
                rating: rating,
                reviewCount: reviewCount || 0,
              },
              jobTitle: conv.jobs?.title || 'Job',
              lastMessage: lastMsg?.content || 'No messages yet',
              lastMessageTime: lastMsg?.created_at 
                ? new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '',
              unread: 0
            };
          })
        );

        setConversations(formattedConvs);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        toast({ title: "Error", description: "Failed to load conversations", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    const fetchPendingRatings = async () => {
      try {
        const { data: completions, error } = await supabase
          .from('job_completions')
          .select(`
            id,
            job_id,
            employer_id,
            jobs (title)
          `)
          .eq('completed_by_user_id', user.id)
          .eq('completion_type', 'platform_worker');

        if (error) throw error;

        const pendingRatingsData: PendingRating[] = [];
        
        for (const completion of completions || []) {
          const { data: existingRating } = await supabase
            .from('ratings')
            .select('id')
            .eq('job_completion_id', completion.id)
            .eq('rater_id', user.id)
            .eq('rating_type', 'worker_to_employer')
            .maybeSingle();

          if (!existingRating) {
            const { data: employerProfile } = await supabase
              .from('profiles')
              .select('name')
              .eq('user_id', completion.employer_id)
              .single();

            pendingRatingsData.push({
              job_completion_id: completion.id,
              job_id: completion.job_id,
              employer_id: completion.employer_id,
              employer_name: employerProfile?.name || 'Employer',
              job_title: (completion.jobs as any)?.title || 'Job',
            });
          }
        }

        setPendingRatings(pendingRatingsData);
      } catch (error) {
        console.error('Error fetching pending ratings:', error);
      }
    };

    fetchConversations();
    fetchPendingRatings();
  }, [user, toast]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedConversation || !user) return;

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', selectedConversation)
          .order('created_at', { ascending: true });

        if (error) throw error;

        const formattedMsgs = (data || []).map((msg: any): Message => ({
          id: msg.id,
          sender_id: msg.sender_id,
          content: msg.content,
          created_at: msg.created_at,
          senderId: (msg.sender_id === user.id ? 'me' : 'other') as 'me' | 'other',
          timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));

        setMessages(formattedMsgs);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();

    const channel = supabase
      .channel(`messages:${selectedConversation}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversation}`
        },
        (payload) => {
          const newMsg = payload.new as any;
          
          setMessages(prev => {
            const exists = prev.some(m => m.id === newMsg.id);
            if (exists) return prev;
            
            const formattedMsg: Message = {
              id: newMsg.id,
              sender_id: newMsg.sender_id,
              content: newMsg.content,
              created_at: newMsg.created_at,
              senderId: (newMsg.sender_id === user.id ? 'me' : 'other') as 'me' | 'other',
              timestamp: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            return [...prev, formattedMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation, user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    mobileMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Please sign in to view messages</h1>
          <Link to="/" className="text-orange-500 hover:text-orange-600">
            Go back to home
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const selectedConv = conversations.find(c => c.id === selectedConversation);
  const isInPendingConversation = !selectedConversation && pendingConversation;
  const showChatView = selectedConversation || isInPendingConversation;

  const handleSelectConversation = (convId: string) => {
    setPendingConversation(null);
    setSelectedConversation(convId);
    setSearchParams({ conversation: convId });
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
    setPendingConversation(null);
    setMessages([]);
    setSearchParams({});
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !session) return;

    const messageContent = newMessage.trim();
    const tempId = `temp-${Date.now()}`;

    if (isInPendingConversation && pendingConversation) {
      const optimisticMessage: Message = {
        id: tempId,
        sender_id: user.id,
        content: messageContent,
        created_at: new Date().toISOString(),
        senderId: 'me',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages([optimisticMessage]);
      setNewMessage('');
      setIsSending(true);

      try {
        const result = await createConversationWithMessage(
          pendingConversation.jobId,
          pendingConversation.employerId,
          user.id,
          messageContent,
          session
        );

        if (result.success && result.conversationId) {
          const newConv: Conversation = {
            id: result.conversationId,
            job_id: pendingConversation.jobId,
            employer_id: pendingConversation.employerId,
            worker_id: user.id,
            otherUser: {
              id: pendingConversation.employerId,
              name: pendingConversation.employerName,
              avatar: pendingConversation.employerAvatar,
              rating: null,
              reviewCount: 0,
            },
            jobTitle: pendingConversation.jobTitle,
            lastMessage: messageContent,
            lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            unread: 0,
          };
          
          setConversations(prev => [newConv, ...prev]);
          setSelectedConversation(result.conversationId);
          setPendingConversation(null);
          setSearchParams({ conversation: result.conversationId });
          
          toast({ title: "Message sent", description: "Conversation started successfully" });
        } else {
          setMessages([]);
          toast({ title: "Error", description: result.error || "Failed to send message", variant: "destructive" });
        }
      } catch (error) {
        console.error('Error creating conversation:', error);
        setMessages([]);
        toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
      } finally {
        setIsSending(false);
      }
      return;
    }

    if (!selectedConversation) return;
    
    const optimisticMessage: Message = {
      id: tempId,
      sender_id: user.id,
      content: messageContent,
      created_at: new Date().toISOString(),
      senderId: 'me',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');
    
    setConversations(prev => prev.map(conv => 
      conv.id === selectedConversation 
        ? { ...conv, lastMessage: messageContent, lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        : conv
    ));

    setIsSending(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation,
          sender_id: user.id,
          content: messageContent
        })
        .select('id')
        .single();

      if (error) throw error;
      
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? { ...msg, id: data.id } : msg
      ));
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  const currentChatInfo = selectedConv 
    ? {
        name: selectedConv.otherUser.name,
        avatar: selectedConv.otherUser.avatar,
        jobTitle: selectedConv.jobTitle,
        userId: selectedConv.otherUser.id,
        rating: selectedConv.otherUser.rating,
        reviewCount: selectedConv.otherUser.reviewCount,
      }
    : pendingConversation 
    ? {
        name: pendingConversation.employerName,
        avatar: pendingConversation.employerAvatar,
        jobTitle: pendingConversation.jobTitle,
        userId: pendingConversation.employerId,
        rating: null,
        reviewCount: 0,
      }
    : null;

  // Render messages with date separators
  const renderMessages = () => {
    const elements: React.ReactNode[] = [];
    
    messages.forEach((message, index) => {
      // Add date separator if this is first message or different day from previous
      if (index === 0 || isDifferentDay(messages[index - 1].created_at, message.created_at)) {
        elements.push(
          <DateSeparator key={`date-${message.id}`} date={formatMessageDate(message.created_at)} />
        );
      }
      
      elements.push(
        <ChatBubble
          key={message.id}
          content={message.content}
          timestamp={message.timestamp}
          isMe={message.senderId === 'me'}
          isLastInGroup={true}
        />
      );
    });
    
    return elements;
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <Header />
      
      {/* Pending Ratings Banner */}
      {pendingRatings.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-200/50">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-orange-100 rounded-full">
                  <Star className="h-4 w-4 text-orange-600" />
                </div>
                <p className="text-sm font-medium text-orange-900">
                  You have {pendingRatings.length} pending employer rating{pendingRatings.length > 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedRating(pendingRatings[0]);
                  setShowRatingModal(true);
                }}
                className="text-sm font-semibold text-orange-600 hover:text-orange-700 
                           bg-orange-100 hover:bg-orange-200 px-3 py-1.5 rounded-full transition-colors"
              >
                Rate Now
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Desktop Layout */}
      <div className="hidden md:flex flex-1 max-w-6xl mx-auto px-4 py-6 w-full">
        <div className="flex-1 flex flex-col">
          {/* Back Button */}
          <Link 
            to="/"
            className="flex items-center text-muted-foreground hover:text-foreground mb-4 w-fit transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>

          {/* Main Container */}
          <div className="flex-1 bg-card rounded-2xl shadow-xl overflow-hidden border border-border/50">
            <div className="flex h-[calc(100vh-220px)] min-h-[500px]">
              {/* Conversations List */}
              <div className="w-[340px] border-r border-border flex flex-col bg-card">
                <div className="p-4 border-b border-border">
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <MessageCircle className="h-6 w-6 text-foreground" />
                    Messages
                  </h2>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  {isLoading ? (
                    <>
                      <ConversationSkeleton />
                      <ConversationSkeleton />
                      <ConversationSkeleton />
                    </>
                  ) : conversations.length === 0 && !isInPendingConversation ? (
                    <EmptyState type="no-conversations" />
                  ) : (
                    <div className="divide-y divide-border/50">
                      {/* Pending conversation */}
                      {isInPendingConversation && pendingConversation && (
                        <ConversationListItem
                          id="pending"
                          otherUser={{
                            id: pendingConversation.employerId,
                            name: pendingConversation.employerName,
                            avatar: pendingConversation.employerAvatar,
                            rating: null,
                            reviewCount: 0,
                          }}
                          jobTitle={pendingConversation.jobTitle}
                          lastMessage=""
                          lastMessageTime=""
                          unread={0}
                          isSelected={true}
                          isPending={true}
                          onClick={() => {}}
                        />
                      )}
                      
                      {/* Existing conversations */}
                      {conversations.map((conversation) => (
                        <ConversationListItem
                          key={conversation.id}
                          id={conversation.id}
                          otherUser={conversation.otherUser}
                          jobTitle={conversation.jobTitle}
                          lastMessage={conversation.lastMessage}
                          lastMessageTime={conversation.lastMessageTime}
                          unread={conversation.unread}
                          isSelected={selectedConversation === conversation.id}
                          onClick={() => handleSelectConversation(conversation.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 flex flex-col bg-muted/20">
                {showChatView && currentChatInfo ? (
                  <>
                    <ChatHeader
                      name={currentChatInfo.name}
                      avatar={currentChatInfo.avatar}
                      jobTitle={currentChatInfo.jobTitle}
                      userId={currentChatInfo.userId}
                      rating={currentChatInfo.rating}
                      reviewCount={currentChatInfo.reviewCount}
                    />

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                      {messages.length === 0 ? (
                        <EmptyState type={isInPendingConversation ? 'pending' : 'no-messages'} />
                      ) : (
                        renderMessages()
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-card/50 border-t border-border/50">
                      <ChatInput
                        value={newMessage}
                        onChange={setNewMessage}
                        onSend={sendMessage}
                        disabled={isSending}
                      />
                    </div>
                  </>
                ) : (
                  <EmptyState type="no-selection" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex-1 flex flex-col bg-card">
        {!showChatView ? (
          /* Conversations List - Mobile */
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-border bg-card sticky top-0 z-10">
              <Link 
                to="/"
                className="flex items-center text-muted-foreground hover:text-foreground mb-3 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <MessageCircle className="h-6 w-6 text-foreground" />
                Messages
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <>
                  <ConversationSkeleton />
                  <ConversationSkeleton />
                  <ConversationSkeleton />
                </>
              ) : conversations.length === 0 ? (
                <EmptyState type="no-conversations" />
              ) : (
                <div className="divide-y divide-border/50">
                  {conversations.map((conversation) => (
                    <ConversationListItem
                      key={conversation.id}
                      id={conversation.id}
                      otherUser={conversation.otherUser}
                      jobTitle={conversation.jobTitle}
                      lastMessage={conversation.lastMessage}
                      lastMessageTime={conversation.lastMessageTime}
                      unread={conversation.unread}
                      isSelected={false}
                      onClick={() => handleSelectConversation(conversation.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Chat View - Mobile */
          <div className="flex-1 flex flex-col h-full">
            {currentChatInfo && (
              <ChatHeader
                name={currentChatInfo.name}
                avatar={currentChatInfo.avatar}
                jobTitle={currentChatInfo.jobTitle}
                userId={currentChatInfo.userId}
                rating={currentChatInfo.rating}
                reviewCount={currentChatInfo.reviewCount}
                showBackButton={true}
                onBack={handleBackToList}
              />
            )}

            {/* Messages - Mobile */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-28 bg-muted/20">
              {messages.length === 0 ? (
                <EmptyState type={isInPendingConversation ? 'pending' : 'no-messages'} />
              ) : (
                renderMessages()
              )}
              <div ref={mobileMessagesEndRef} />
            </div>

            {/* Input - Fixed at bottom */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t border-border safe-area-bottom">
              <ChatInput
                value={newMessage}
                onChange={setNewMessage}
                onSend={sendMessage}
                disabled={isSending}
              />
            </div>
          </div>
        )}
      </div>
      
      <div className="hidden md:block">
        <Footer />
      </div>

      {/* Worker Rating Modal */}
      {selectedRating && user && (
        <WorkerRatingModal
          open={showRatingModal}
          onOpenChange={setShowRatingModal}
          jobCompletionId={selectedRating.job_completion_id}
          jobId={selectedRating.job_id}
          employerId={selectedRating.employer_id}
          employerName={selectedRating.employer_name}
          jobTitle={selectedRating.job_title}
          workerId={user.id}
          onSuccess={() => {
            setPendingRatings(prev => 
              prev.filter(r => r.job_completion_id !== selectedRating.job_completion_id)
            );
            setSelectedRating(null);
          }}
        />
      )}
    </div>
  );
};

export default Messages;
