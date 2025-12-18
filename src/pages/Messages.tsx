import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, ArrowLeft, Phone, Star, User } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import WorkerRatingModal from '../components/WorkerRatingModal';
import RatingBadge from '../components/RatingBadge';
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

  // Handle pending conversation from URL params
  useEffect(() => {
    if (pendingJobId && pendingEmployerId && user) {
      // Fetch employer profile to get name
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
        
        // Clear selected conversation since we're in pending mode
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

        // Format conversations
        const formattedConvs = await Promise.all(
          (convData || []).map(async (conv: any) => {
            const otherUserId = conv.employer_id === user.id ? conv.worker_id : conv.employer_id;
            
            // Fetch other user's profile with rating
            const { data: profile } = await supabase
              .from('profiles')
              .select('name, average_worker_rating, total_worker_reviews, average_employer_rating, total_employer_reviews')
              .eq('user_id', otherUserId)
              .single();

            const lastMsg = conv.messages?.[conv.messages.length - 1];
            const initials = profile?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U';

            // Determine which rating to show based on user's role in this conversation
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
        // Find job completions where user is the worker and hasn't rated the employer yet
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

        // Check which completions don't have a worker-to-employer rating
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
            // Fetch employer name
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

    // Subscribe to new messages
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
          
          // Prevent duplicate messages (from optimistic update or realtime)
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Please sign in to view messages</h1>
          <Link to="/" className="text-orange-500 hover:text-orange-600">
            Go back to home
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const selectedConv = conversations.find(c => c.id === selectedConversation);
  
  // Ref for scrolling to bottom
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mobileMessagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    mobileMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check if we're in a pending conversation state (no selectedConversation but have pending params)
  const isInPendingConversation = !selectedConversation && pendingConversation;

  const handleSelectConversation = (convId: string) => {
    // Clear pending conversation when selecting an existing one
    setPendingConversation(null);
    setSelectedConversation(convId);
    // Update URL without pending params
    setSearchParams({ conversation: convId });
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
    setPendingConversation(null);
    setMessages([]);
    // Clear all URL params
    setSearchParams({});
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !session) return;

    const messageContent = newMessage.trim();
    const tempId = `temp-${Date.now()}`;

    // Handle pending conversation (create conversation with first message)
    if (isInPendingConversation && pendingConversation) {
      // Optimistically add message to UI immediately
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
          // Add the new conversation to the list
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
          
          // Switch to the real conversation
          setSelectedConversation(result.conversationId);
          setPendingConversation(null);
          
          // Update URL
          setSearchParams({ conversation: result.conversationId });
          
          toast({ title: "Message sent", description: "Conversation started successfully" });
        } else {
          // Remove optimistic message on error
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

    // Handle existing conversation
    if (!selectedConversation) return;
    
    // Optimistically add message to UI immediately
    const optimisticMessage: Message = {
      id: tempId,
      sender_id: user.id,
      content: messageContent,
      created_at: new Date().toISOString(),
      senderId: 'me',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage(''); // Clear input immediately
    
    // Update conversation list with new message
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
      
      // Replace temp message with real one (keep existing, just update id)
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? { ...msg, id: data.id } : msg
      ));
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  // Get current chat header info (either from selected conversation or pending)
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

  // Show chat view if we have a conversation selected OR if we're in pending mode
  const showChatView = selectedConversation || isInPendingConversation;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      {/* Pending Ratings Banner */}
      {pendingRatings.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-b border-orange-200">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-orange-600" />
                <p className="text-sm font-medium text-orange-900">
                  You have {pendingRatings.length} pending employer rating{pendingRatings.length > 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedRating(pendingRatings[0]);
                  setShowRatingModal(true);
                }}
                className="text-sm font-semibold text-orange-600 hover:text-orange-700 underline"
              >
                Rate Now
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Desktop: Back Button */}
      <div className="hidden md:block max-w-6xl mx-auto px-4 pt-8 w-full">
        <Link 
          to="/"
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block max-w-6xl mx-auto px-4 pb-8 w-full flex-1">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ height: '600px' }}>
          <div className="flex h-full">
            {/* Conversations List */}
            <div className="w-1/3 border-r border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Messages
                </h2>
              </div>
              
              <div className="overflow-y-auto h-full">
                {isLoading ? (
                  <div className="p-4 text-center text-gray-500">Loading conversations...</div>
                ) : conversations.length === 0 && !isInPendingConversation ? (
                  <div className="p-4 text-center text-gray-500">No conversations yet</div>
                ) : (
                  <>
                    {/* Show pending conversation at top if exists */}
                    {isInPendingConversation && pendingConversation && (
                      <div
                        className="p-4 border-b border-gray-100 bg-orange-50 border-orange-200"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {pendingConversation.employerAvatar}
                            </span>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-gray-800 truncate">
                                {pendingConversation.employerName}
                              </span>
                              <span className="text-xs text-orange-600 font-medium">New</span>
                            </div>
                            
                            <p className="text-xs text-orange-600 mb-1 truncate">
                              {pendingConversation.jobTitle}
                            </p>
                            
                            <p className="text-sm text-gray-500 italic">
                              Start typing to send a message...
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => handleSelectConversation(conversation.id)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                        selectedConversation === conversation.id ? 'bg-orange-50 border-orange-200' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {conversation.otherUser.avatar}
                          </span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <Link 
                              to={`/user/${conversation.otherUser.id}`}
                              className="text-sm font-semibold text-gray-800 truncate hover:text-orange-600"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {conversation.otherUser.name}
                            </Link>
                            <span className="text-xs text-gray-500">
                              {conversation.lastMessageTime}
                            </span>
                          </div>
                          
                          {conversation.otherUser.rating && (
                            <div className="mb-1">
                              <RatingBadge 
                                rating={conversation.otherUser.rating} 
                                reviewCount={conversation.otherUser.reviewCount}
                                size="sm"
                              />
                            </div>
                          )}
                          
                          <p className="text-xs text-orange-600 mb-1 truncate">
                            {conversation.jobTitle}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600 truncate">
                              {conversation.lastMessage}
                            </p>
                            {conversation.unread > 0 && (
                              <span className="bg-orange-500 text-white text-xs rounded-full px-2 py-1 ml-2">
                                {conversation.unread}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Chat Area - Desktop */}
            <div className="flex-1 flex flex-col">
              {showChatView && currentChatInfo ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {currentChatInfo.avatar}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{currentChatInfo.name}</p>
                        <p className="text-sm text-orange-600">{currentChatInfo.jobTitle}</p>
                      </div>
                    </div>
                    
                    <button className="p-2 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-lg">
                      <Phone className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 mt-8">
                        {isInPendingConversation 
                          ? "Type a message below to start the conversation!"
                          : "No messages yet. Start the conversation!"}
                      </div>
                    ) : (
                      messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.senderId === 'me'
                              ? 'bg-orange-500 text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.senderId === 'me' ? 'text-orange-100' : 'text-gray-500'
                            }`}
                          >
                            {message.timestamp}
                          </p>
                        </div>
                      </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      />
                      <button
                        onClick={sendMessage}
                        disabled={isSending || !newMessage.trim()}
                        className="bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex-1 flex flex-col bg-white">
        {!showChatView ? (
          /* Conversations List - Mobile */
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
              <Link 
                to="/"
                className="flex items-center text-gray-600 hover:text-gray-800 mb-3"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <MessageCircle className="h-5 w-5 mr-2" />
                Messages
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">Loading conversations...</div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No conversations yet</div>
              ) : (
                conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => handleSelectConversation(conversation.id)}
                  className="p-4 border-b border-gray-100 active:bg-gray-50"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold">
                        {conversation.otherUser.avatar}
                      </span>
                    </div>
                    
                     <div className="flex-1 min-w-0">
                       <div className="flex items-center justify-between mb-1">
                         <Link 
                           to={`/user/${conversation.otherUser.id}`}
                           className="text-base font-semibold text-gray-800 truncate hover:text-orange-600"
                           onClick={(e) => e.stopPropagation()}
                         >
                           {conversation.otherUser.name}
                         </Link>
                         <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                           {conversation.lastMessageTime}
                         </span>
                       </div>
                       
                       {conversation.otherUser.rating && (
                         <div className="mb-1">
                           <RatingBadge 
                             rating={conversation.otherUser.rating} 
                             reviewCount={conversation.otherUser.reviewCount}
                             size="sm"
                           />
                         </div>
                       )}
                       
                       <p className="text-sm text-orange-600 mb-1 truncate">
                         {conversation.jobTitle}
                       </p>
                       
                       <p className="text-sm text-gray-600 truncate">
                         {conversation.lastMessage}
                       </p>
                     </div>
                  </div>
                </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* Chat View - Mobile */
          <div className="flex-1 flex flex-col h-full">
            {/* Chat Header - Mobile */}
            <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <button 
                  onClick={handleBackToList}
                  className="p-2 -ml-2 text-gray-600 hover:text-gray-800 active:bg-gray-100 rounded-lg"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                
                {currentChatInfo && (
                  <div className="flex items-center space-x-3 flex-1 ml-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {currentChatInfo.avatar}
                      </span>
                     </div>
                     <div className="flex-1 min-w-0">
                       <Link 
                         to={`/user/${currentChatInfo.userId}`}
                         className="font-semibold text-gray-800 truncate hover:text-orange-600 block"
                       >
                         {currentChatInfo.name}
                       </Link>
                       {currentChatInfo.rating && (
                         <div className="mt-1 mb-1">
                           <RatingBadge 
                             rating={currentChatInfo.rating} 
                             reviewCount={currentChatInfo.reviewCount}
                             size="sm"
                           />
                         </div>
                       )}
                       <p className="text-sm text-orange-600 truncate">{currentChatInfo.jobTitle}</p>
                     </div>
                   </div>
                )}
               </div>
             </div>

            {/* Messages - Mobile with bottom padding for fixed input */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  {isInPendingConversation 
                    ? "Type a message below to start the conversation!"
                    : "No messages yet. Start the conversation!"}
                </div>
              ) : (
                messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2 rounded-lg ${
                      message.senderId === 'me'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm break-words">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.senderId === 'me' ? 'text-orange-100' : 'text-gray-500'
                      }`}
                    >
                      {message.timestamp}
                    </p>
                  </div>
                </div>
                ))
              )}
              <div ref={mobileMessagesEndRef} />
            </div>

            {/* Message Input - Fixed at bottom on mobile */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 safe-area-bottom">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base"
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                />
                <button
                  onClick={sendMessage}
                  disabled={isSending || !newMessage.trim()}
                  className="bg-orange-500 text-white px-4 py-3 rounded-lg hover:bg-orange-600 active:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[56px] flex items-center justify-center"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
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
