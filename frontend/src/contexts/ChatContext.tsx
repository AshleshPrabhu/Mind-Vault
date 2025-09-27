import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface ChatContextType {
  currentChatType: 'public' | 'private' | null;
  setCurrentChatType: (type: 'public' | 'private' | null) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentChatType, setCurrentChatType] = useState<'public' | 'private' | null>(null);

  return (
    <ChatContext.Provider value={{ currentChatType, setCurrentChatType }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};