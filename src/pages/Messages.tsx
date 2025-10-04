import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, ArrowLeft, Phone } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Conversation {
  id: string;
  job_id: string;
  employer_id: string;
  worker_id: string;
  otherUser: {
    name: string;
    avatar: string;
  };
  jobTitle: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
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
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const conversationIdFromUrl = searchParams.get('conversation');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(conversationIdFromUrl);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  // Fetch conversations
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
            
            // Fetch other user's profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('name')
              .eq('user_id', otherUserId)
              .single();

            const lastMsg = conv.messages?.[conv.messages.length - 1];
            const initials = profile?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U';

            return {
              id: conv.id,
              job_id: conv.job_id,
              employer_id: conv.employer_id,
              worker_id: conv.worker_id,
              otherUser: {
                name: profile?.name || 'Unknown User',
                avatar: initials
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

    fetchConversations();
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
          const formattedMsg: Message = {
            id: newMsg.id,
            sender_id: newMsg.sender_id,
            content: newMsg.content,
            created_at: newMsg.created_at,
            senderId: (newMsg.sender_id === user.id ? 'me' : 'other') as 'me' | 'other',
            timestamp: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [...prev, formattedMsg]);
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

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    setIsSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation,
          sender_id: user.id,
          content: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link 
          to="/"
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

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
                ) : conversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No conversations yet</div>
                ) : (
                  conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
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
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {conversation.otherUser.name}
                          </p>
                          <span className="text-xs text-gray-500">
                            {conversation.lastMessageTime}
                          </span>
                        </div>
                        
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
                  ))
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {selectedConv?.otherUser.avatar}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{selectedConv?.otherUser.name}</p>
                        <p className="text-sm text-orange-600">{selectedConv?.jobTitle}</p>
                      </div>
                    </div>
                    
                    <button className="p-2 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-lg">
                      <Phone className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 mt-8">No messages yet. Start the conversation!</div>
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
      
      <Footer />
    </div>
  );
};

export default Messages;