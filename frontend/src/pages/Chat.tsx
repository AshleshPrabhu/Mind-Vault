import React, { useState, useEffect } from 'react';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatMain from '../components/chat/ChatMain';
import { useChatContext } from '../contexts/ChatContext';
import { useWallet } from '../contexts/WalletContext';
import { useSocket } from '../contexts/SocketContext';
import { API_BASE_URL } from '../config';
import axios from 'axios';
import { decryptMessage, decryptMessages, type DecryptedMessage } from '../lib/messageUtils';

export interface ChatMessage {
  id: number;
  senderId: number;
  senderName: string;
  content: string;
  timestamp: Date;
  createdAt: string;
  isMe: boolean;
  isValidated?: boolean;
  isEncrypted?: boolean;
  decrypted?: boolean;
  decryptionError?: string;
  sender: {
    id: number;
    username: string;
    profilePicture?: string | null;
  };
  replyTo?: {
    id: string;
    senderName: string;
    content: string;
  };
}

export interface ChatRoom {
  roomId: number;
  roomName: string;
  type: 'GLOBAL' | 'PRIVATE' | 'AI';
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount?: number;
  participantAddress?: string; 
  participants: Array<{
    id: number;
    username: string;
    profilePicture: string;
    walletAddress: string;
  }>;
  messages: ChatMessage[];
  _count: {
    messages: number;
    participants: number;
  };
}

const Chat: React.FC = () => {
  const [activeChat, setActiveChat] = useState<ChatRoom | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Record<number, ChatMessage[]>>({});
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);

  const { setCurrentChatType } = useChatContext();
  const { user } = useWallet();
  const { socket, isConnected, joinRoom, sendMessage, joinPrivateChat, validateMessage, unvalidateMessage } = useSocket();

  // Fetch global chat room
  const fetchGlobalChat = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/chatroom/1`);
      if (response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching global chat:', error);
      return null;
    }
  };

  // Fetch private chat rooms for user
  const fetchPrivateChats = async () => {
    if (!user?.walletAddress) return [];
    
    try {
      const response = await axios.post(`${API_BASE_URL}/user/private-chats`, {
        address: user.walletAddress
      });
      if (response.data.success) {
        const chats = response.data.chatrooms || [];
        // Add participantAddress for private chats (the other participant's wallet address)
        return chats.map((chat: ChatRoom) => {
          if (chat.type === 'PRIVATE') {
            const otherParticipant = chat.participants.find(p => p.walletAddress !== user.walletAddress);
            return {
              ...chat,
              participantAddress: otherParticipant?.walletAddress || 'Unknown'
            };
          }
          return chat;
        });
      }
      return [];
    } catch (error) {
      console.error('Error fetching private chats:', error);
      return [];
    }
  };

  // Initialize chat rooms from API
  useEffect(() => {
    const initializeChats = async () => {
      if (!user) return;

      try {
        // Fetch global chat and private chats concurrently
        const [globalChat, privateChats] = await Promise.all([
          fetchGlobalChat(),
          fetchPrivateChats()
        ]);

        const allChats: ChatRoom[] = [];
        
        // Add global chat if available
        if (globalChat) {
          allChats.push(globalChat);
        }
        
        // Add private chats
        allChats.push(...privateChats);

        setChatRooms(allChats);
        
        // Set first available chat as active
        if (allChats.length > 0) {
          setActiveChat(allChats[0]);
        }
      } catch (err) {
        console.error('Error initializing chats:', err);
      }
    };

    initializeChats();
  }, [user]);

  // WebSocket event listeners for real-time messaging
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Handle new messages
    const handleNewMessage = async (message: any) => {
      console.log('New message received:', message);
      
      try {
        // Decrypt the message if it's encrypted
        let decryptedMessage: DecryptedMessage | null = null;
        
        if (message.isEncrypted && user?.walletAddress) {
          try {
            decryptedMessage = await decryptMessage(message, user.walletAddress);
          } catch (error) {
            console.error('Failed to decrypt incoming message:', error);
          }
        }

        const chatMessage: ChatMessage = {
          id: message.messageId,
          senderId: message.senderId,
          senderName: message.sender?.username || 'Unknown',
          content: decryptedMessage ? decryptedMessage.content : message.content,
          timestamp: new Date(message.createdAt),
          createdAt: message.createdAt,
          isMe: message.senderId === user?.id,
          isEncrypted: message.isEncrypted || false,
          decrypted: decryptedMessage ? decryptedMessage.decrypted : true,
          decryptionError: decryptedMessage?.decryptionError,
          sender: message.sender,
          replyTo: message.replyTo ? {
            id: message.replyTo.messageId.toString(),
            senderName: message.replyTo.sender?.username || 'Unknown',
            content: message.replyTo.content
          } : undefined
        };

        setChatMessages(prev => ({
          ...prev,
          [message.roomId]: [...(prev[message.roomId] || []), chatMessage]
        }));
      } catch (error) {
        console.error('Error handling new message:', error);
      }
    };

    // Handle message validation
    const handleMessageValidated = (data: { messageId: number; validatedBy: number; message: any }) => {
      console.log('Message validated:', data);
      setChatMessages(prev => {
        const roomId = data.message.roomId;
        const roomMessages = prev[roomId] || [];
        return {
          ...prev,
          [roomId]: roomMessages.map(msg => 
            msg.id === data.messageId 
              ? { ...msg, isValidated: true }
              : msg
          )
        };
      });
    };

    // Handle message unvalidation
    const handleMessageUnvalidated = (data: { messageId: number; unvalidatedBy: number; message: any }) => {
      console.log('Message unvalidated:', data);
      setChatMessages(prev => {
        const roomId = data.message.roomId;
        const roomMessages = prev[roomId] || [];
        return {
          ...prev,
          [roomId]: roomMessages.map(msg => 
            msg.id === data.messageId 
              ? { ...msg, isValidated: false }
              : msg
          )
        };
      });
    };

    // Register event listeners
    socket.on('new_message', handleNewMessage);
    socket.on('message_validated', handleMessageValidated);
    socket.on('message_unvalidated', handleMessageUnvalidated);

    // Cleanup on unmount
    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('message_validated', handleMessageValidated);
      socket.off('message_unvalidated', handleMessageUnvalidated);
    };
  }, [socket, isConnected, user?.id]);

  // Join room when active chat changes
  useEffect(() => {
    if (activeChat && user && isConnected) {
      joinRoom(activeChat.roomId);
    }
  }, [activeChat, user, isConnected, joinRoom]);

  // Function to fetch messages for a specific chat room
  const fetchMessagesForRoom = async (roomId: number): Promise<ChatMessage[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/message/room/${roomId}?page=1&limit=50`);
      if (response.data.success) {
        const messages = response.data.data || [];
        
        // Decrypt messages if needed
        const decryptedMessages = user?.walletAddress 
          ? await decryptMessages(messages, user.walletAddress)
          : messages.map((msg: any) => ({ ...msg, decrypted: true }));
        
        return decryptedMessages.map((msg: any) => ({
          id: msg.messageId,
          senderId: msg.sender.id,
          senderName: msg.sender.username,
          content: msg.content,
          timestamp: new Date(msg.createdAt),
          createdAt: msg.createdAt,
          isMe: msg.sender.id === user?.id,
          isEncrypted: msg.isEncrypted || false,
          decrypted: msg.decrypted || true,
          decryptionError: msg.decryptionError,
          sender: msg.sender,
          replyTo: msg.replyTo ? {
            id: msg.replyTo.messageId.toString(),
            senderName: msg.replyTo.sender?.username || 'Unknown',
            content: msg.replyTo.content
          } : undefined
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  };

  // Update chat type when active chat changes and load messages
  useEffect(() => {
    const loadAndDecryptMessages = async () => {
      if (!activeChat || !user?.walletAddress) return;

      // Convert API types to expected types
      const chatType = activeChat.type === 'GLOBAL' ? 'public' : 'private';
      setCurrentChatType(chatType);
      
      // Fetch messages for the active chat room
      try {
        const messages = await fetchMessagesForRoom(activeChat.roomId);
        setChatMessages(prev => ({
          ...prev,
          [activeChat.roomId]: messages
        }));
      } catch (error) {
        console.error('Failed to load messages for room:', error);
      }
    };

    loadAndDecryptMessages();
  }, [activeChat, setCurrentChatType, user?.id, user?.walletAddress]);

  // Function to add a new message to the chat via WebSocket
  const addMessage = (chatId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>, encrypted: boolean = false) => {
    const chatIdNum = parseInt(chatId);
    
    if (!user?.id || !isConnected) {
      console.error('User not connected or socket not available');
      return;
    }

    // Extract reply ID if present
    const replyToId = message.replyTo ? parseInt(message.replyTo.id) : undefined;

    // Send message via WebSocket (encryption handled in SocketContext)
    sendMessage(chatIdNum, message.content, replyToId, encrypted);
    
    // Note: We don't update local state here because the server will send back 
    // the message via 'new_message' event which we handle in the useEffect above
  };

  // Function to create and open a new private chat
  const createPrivateChat = (senderName: string, senderId: string) => {
    const senderIdNum = parseInt(senderId);
    
    if (!user?.id || !isConnected) {
      console.error('User not connected or socket not available');
      return;
    }

    // Check if private chat already exists
    const existingChat = chatRooms.find(chat => 
      chat.type === 'PRIVATE' && 
      chat.participants.some(p => p.id === senderIdNum)
    );

    if (existingChat) {
      // If chat exists, just switch to it
      setActiveChat(existingChat);
      setSidebarOpen(false);
      return;
    }

    // Create new private chat via WebSocket
    joinPrivateChat(senderIdNum, 'PRIVATE');
    console.log('Creating new private chat with:', senderName, senderId);
  };

  // Message validation functions (only for validators)
  const handleValidateMessage = (messageId: number) => {
    if (!user?.id || !isConnected) {
      console.error('User not connected or socket not available');
      return;
    }
    
    // Check if user is a validator (this should be checked on the server too)
    if (user.role !== 'VALIDATOR') {
      console.error('Only validators can validate messages');
      return;
    }

    validateMessage(messageId);
  };

  const handleUnvalidateMessage = (messageId: number) => {
    if (!user?.id || !isConnected) {
      console.error('User not connected or socket not available');
      return;
    }

    // Check if user is a validator (this should be checked on the server too)
    if (user.role !== 'VALIDATOR') {
      console.error('Only validators can unvalidate messages');
      return;
    }

    unvalidateMessage(messageId);
  };

  const handleChatSelect = (chat: ChatRoom) => {
    setActiveChat(chat);
    setSidebarOpen(false); // Close sidebar on mobile after selecting
  };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-30 w-80 bg-white border-r border-gray-200
        transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        transition-transform duration-300 ease-in-out
      `}>
        <ChatSidebar
          chatRooms={chatRooms}
          activeChat={activeChat}
          onChatSelect={handleChatSelect}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeChat ? (
          <ChatMain
            activeChat={activeChat}
            messages={(chatMessages[activeChat.roomId] || []).sort((a, b) => 
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            )}
            onMenuClick={() => setSidebarOpen(true)}
            onSendMessage={addMessage}
            onStartPrivateChat={createPrivateChat}
            onValidateMessage={handleValidateMessage}
            onUnvalidateMessage={handleUnvalidateMessage}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;