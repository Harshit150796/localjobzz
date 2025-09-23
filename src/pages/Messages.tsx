import React, { useState } from 'react';
import { MessageCircle, Send, ArrowLeft, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Mock data for demonstration
const mockConversations = [
  {
    id: '1',
    otherUser: { name: 'Rajesh Kumar', avatar: 'RK' },
    lastMessage: 'When can you start the cleaning work?',
    lastMessageTime: '2m ago',
    unread: 2,
    jobTitle: 'House Cleaning - Urgent Need'
  },
  {
    id: '2',
    otherUser: { name: 'Priya Sharma', avatar: 'PS' },
    lastMessage: 'The delivery address is correct?',
    lastMessageTime: '1h ago',
    unread: 0,
    jobTitle: 'Food Delivery Partner'
  },
  {
    id: '3',
    otherUser: { name: 'Mohammed Ali', avatar: 'MA' },
    lastMessage: 'Thank you for the great work!',
    lastMessageTime: '3h ago',
    unread: 0,
    jobTitle: 'Construction Helper Required'
  }
];

const mockMessages = [
  {
    id: '1',
    senderId: 'other',
    text: 'Hi! I saw your job post for house cleaning.',
    timestamp: '10:30 AM'
  },
  {
    id: '2',
    senderId: 'me',
    text: 'Hello! Yes, I need someone to clean my 2BHK apartment.',
    timestamp: '10:32 AM'
  },
  {
    id: '3',
    senderId: 'other',
    text: 'When can you start the cleaning work?',
    timestamp: '10:35 AM'
  }
];

const Messages: React.FC = () => {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

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

  const selectedConv = mockConversations.find(c => c.id === selectedConversation);

  const sendMessage = () => {
    if (newMessage.trim()) {
      // In real app, send message to backend
      console.log('Sending message:', newMessage);
      setNewMessage('');
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
                {mockConversations.map((conversation) => (
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
                ))}
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
                    {mockMessages.map((message) => (
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
                          <p className="text-sm">{message.text}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.senderId === 'me' ? 'text-orange-100' : 'text-gray-500'
                            }`}
                          >
                            {message.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
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
                        className="bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 transition-colors"
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