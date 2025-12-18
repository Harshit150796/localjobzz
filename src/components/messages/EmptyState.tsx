import React from 'react';
import { MessageCircle, MessagesSquare } from 'lucide-react';

interface EmptyStateProps {
  type: 'no-selection' | 'no-messages' | 'no-conversations' | 'pending';
}

const EmptyState: React.FC<EmptyStateProps> = ({ type }) => {
  const content = {
    'no-selection': {
      icon: MessagesSquare,
      title: 'Select a conversation',
      description: 'Choose a conversation from the list to start messaging',
    },
    'no-messages': {
      icon: MessageCircle,
      title: 'No messages yet',
      description: 'Start the conversation by sending a message below',
    },
    'no-conversations': {
      icon: MessageCircle,
      title: 'No conversations yet',
      description: 'When you message someone about a job, it will appear here',
    },
    'pending': {
      icon: MessageCircle,
      title: 'Start a new conversation',
      description: 'Type a message below to begin chatting',
    },
  };

  const { icon: Icon, title, description } = content[type];

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-xs">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-50 
                        flex items-center justify-center shadow-sm">
          <Icon className="h-8 w-8 text-orange-500" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

export default EmptyState;
