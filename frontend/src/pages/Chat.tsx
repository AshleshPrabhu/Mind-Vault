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
  rewarded?: boolean;
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
  replies?: ChatMessage[];
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
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState<Record<number, boolean>>({});

  const { setCurrentChatType } = useChatContext();
  const { user } = useWallet();
  const { socket, isConnected, joinRoom, sendMessage, joinPrivateChat, validateMessage, unvalidateMessage } = useSocket();

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

  const fetchPrivateChats = async () => {
    if (!user?.walletAddress) return [];
    
    try {
      const response = await axios.post(`${API_BASE_URL}/user/private-chats`, {
        address: user.walletAddress
      });
      if (response.data.success) {
        const chats = response.data.chatrooms || [];
        return chats.map((chat: ChatRoom) => {
          if (chat.type === 'PRIVATE') {
            const otherParticipant = chat.participants.find(p => p.walletAddress !== user.walletAddress);
            return {
              ...chat,
              participantAddress: otherParticipant?.walletAddress || 'Unknown',
              roomName: chat.roomName.includes(' & ') 
                ? chat.roomName.split(' & ').find(name => name !== user.username) || chat.roomName
                : otherParticipant?.username || 'Private Chat'
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

  useEffect(() => {
    const initializeChats = async () => {
      if (!user) return;

      setIsLoadingRooms(true);
      try {
        const [globalChat, privateChats] = await Promise.all([
          fetchGlobalChat(),
          fetchPrivateChats()
        ]);

        const allChats: ChatRoom[] = [];
        
        if (globalChat) {
          allChats.push(globalChat);
        }
        
        allChats.push(...privateChats);

        setChatRooms(allChats);
        
        if (allChats.length > 0) {
          setActiveChat(allChats[0]);
        }
      } catch (err) {
        console.error('Error initializing chats:', err);
      } finally {
        setIsLoadingRooms(false);
      }
    };

    initializeChats();
  }, [user]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewMessage = async (message: any) => {
      console.log('New message received:', message);
      console.log('Message replyToId:', message.replyToId);
      
      try {
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
          } : undefined,
          replies: message.replies ? message.replies.map((reply: any) => ({
            id: reply.messageId,
            senderId: reply.senderId,
            senderName: reply.sender?.username || 'Unknown',
            content: reply.content,
            timestamp: new Date(reply.createdAt),
            createdAt: reply.createdAt,
            isMe: reply.senderId === user?.id,
            isEncrypted: reply.isEncrypted || false,
            decrypted: true, sender: reply.sender,
            isValidated: reply.isValidated || false,
            rewarded: reply.rewarded || false
          })) : []
        };

        setChatMessages(prev => {
          const roomMessages = prev[message.roomId] || [];
          
          if (message.replyToId) {
            console.log(`Processing reply for message ID: ${message.replyToId}`);
            const updatedMessages = roomMessages.map(msg => {
              if (msg.id === message.replyToId) {
                const replyMessage = {
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
                  isValidated: message.isValidated || false,
                  rewarded: message.rewarded || false
                };
                
                return {
                  ...msg,
                  replies: [...(msg.replies || []), replyMessage]
                };
              }
              return msg;
            });
            
            return {
              ...prev,
              [message.roomId]: updatedMessages
            };
          }
          
          return {
            ...prev,
            [message.roomId]: [...roomMessages, chatMessage]
          };
        });
      } catch (error) {
        console.error('Error handling new message:', error);
      }
    };

    const handleMessageValidated = (data: { messageId: number; validatedBy: number; message: any }) => {
      console.log('Message validated:', data);
      setChatMessages(prev => {
        const roomId = data.message.roomId;
        const roomMessages = prev[roomId] || [];
        return {
          ...prev,
          [roomId]: roomMessages.map(msg => {
            if (msg.id === data.messageId) {
              return { ...msg, isValidated: true };
            }
            if (msg.replies && msg.replies.length > 0) {
              const updatedReplies = msg.replies.map(reply => 
                reply.id === data.messageId 
                  ? { ...reply, isValidated: true }
                  : reply
              );
              return { ...msg, replies: updatedReplies };
            }
            return msg;
          })
        };
      });
    };

    const handleMessageUnvalidated = (data: { messageId: number; unvalidatedBy: number; message: any }) => {
      console.log('Message unvalidated:', data);
      setChatMessages(prev => {
        const roomId = data.message.roomId;
        const roomMessages = prev[roomId] || [];
        return {
          ...prev,
          [roomId]: roomMessages.map(msg => {
            if (msg.id === data.messageId) {
              return { ...msg, isValidated: false };
            }
            if (msg.replies && msg.replies.length > 0) {
              const updatedReplies = msg.replies.map(reply => 
                reply.id === data.messageId 
                  ? { ...reply, isValidated: false }
                  : reply
              );
              return { ...msg, replies: updatedReplies };
            }
            return msg;
          })
        };
      });
    };

    socket.on('new_message', handleNewMessage);
    socket.on('message_validated', handleMessageValidated);
    socket.on('message_unvalidated', handleMessageUnvalidated);
    
    const handlePrivateRoomCreated = async (data: any) => {
      console.log('Private room created event received in Chat.tsx:', data);
      
      try {
        const [globalChat, privateChats] = await Promise.all([
          fetchGlobalChat(),
          fetchPrivateChats()
        ]);

        const allChats: ChatRoom[] = [];
        
        if (globalChat) {
          allChats.push(globalChat);
        }
        
        allChats.push(...privateChats);
        setChatRooms(allChats);
        
        const newPrivateChat = privateChats.find((chat: ChatRoom) => 
          chat.type === 'PRIVATE' && 
          (chat.participants.some(p => p.id === data.userId) || 
           chat.participants.some(p => p.id === data.peerId))
        );
        
        if (newPrivateChat) {
          console.log(' Auto-switching to new private chat:', newPrivateChat.roomName);
          setActiveChat(newPrivateChat);
          setSidebarOpen(false);
        }
      } catch (error) {
        console.error(' Error handling private room created event:', error);
      }
    };
    
    socket.on('private_room_created', handlePrivateRoomCreated);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('message_validated', handleMessageValidated);
      socket.off('message_unvalidated', handleMessageUnvalidated);
      socket.off('private_room_created', handlePrivateRoomCreated);
    };
  }, [socket, isConnected, user?.id]);

  useEffect(() => {
    if (activeChat && user && isConnected) {
      joinRoom(activeChat.roomId);
    }
  }, [activeChat, user, isConnected, joinRoom]);

  const fetchMessagesForRoom = async (roomId: number): Promise<ChatMessage[]> => {
    setIsLoadingMessages(prev => ({ ...prev, [roomId]: true }));
    try {
      const response = await axios.get(`${API_BASE_URL}/message/room/${roomId}?page=1&limit=50`);
      if (response.data.success) {
        const messages = response.data.data || [];
        
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
          isValidated: msg.isValidated || false,
          rewarded: msg.rewarded || false,
          replyTo: msg.replyTo ? {
            id: msg.replyTo.messageId.toString(),
            senderName: msg.replyTo.sender?.username || 'Unknown',
            content: msg.replyTo.content
          } : undefined,
          replies: msg.replies ? msg.replies.map((reply: any) => ({
            id: reply.messageId,
            senderId: reply.sender.id,
            senderName: reply.sender.username,
            content: reply.content,
            timestamp: new Date(reply.createdAt),
            createdAt: reply.createdAt,
            isMe: reply.sender.id === user?.id,
            isEncrypted: reply.isEncrypted || false,
            decrypted: reply.decrypted || true,
            decryptionError: reply.decryptionError,
            sender: reply.sender,
            isValidated: reply.isValidated || false,
            rewarded: reply.rewarded || false
          })) : []
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    } finally {
      setIsLoadingMessages(prev => ({ ...prev, [roomId]: false }));
    }
  };

  useEffect(() => {
    const loadAndDecryptMessages = async () => {
      if (!activeChat || !user?.walletAddress) return;

      const chatType = activeChat.type === 'GLOBAL' ? 'public' : 'private';
      setCurrentChatType(chatType);
      
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

  const addMessage = (chatId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>, encrypted: boolean = false) => {
    const chatIdNum = parseInt(chatId);
    
    if (!user?.id || !isConnected) {
      console.error('User not connected or socket not available');
      return;
    }

    const replyToId = message.replyTo ? parseInt(message.replyTo.id) : undefined;

    sendMessage(chatIdNum, message.content, replyToId, encrypted);
  };

  const createPrivateChat = async (senderName: string, senderId: string) => {
    const senderIdNum = parseInt(senderId);
    
    console.log(' Starting createPrivateChat with:', { senderName, senderId, senderIdNum });
    console.log(' Current user:', user);
    console.log(' Socket connected:', isConnected);
    console.log(' Current chatRooms:', chatRooms);
    
    if (!user?.id || !isConnected) {
      console.error(' User not connected or socket not available');
      console.error('User ID:', user?.id);
      console.error('Socket connected:', isConnected);
      return;
    }

    const existingChat = chatRooms.find(chat => 
      chat.type === 'PRIVATE' && 
      chat.participants.some(p => p.id === senderIdNum)
    );

    console.log(' Checking for existing chat:', existingChat);

    if (existingChat) {
      console.log(' Found existing chat, switching to it:', existingChat.roomName);
      setActiveChat(existingChat);
      setSidebarOpen(false);
      return;
    }

    console.log(' Emitting joinPrivateChat with peerId:', senderIdNum);
    joinPrivateChat(senderIdNum, 'PRIVATE');
    console.log(' joinPrivateChat called successfully');
    
    console.log(' Waiting 2 seconds for backend to process...');
    setTimeout(async () => {
      try {
        console.log(' Refetching chats after private chat creation...');
        
        const [globalChat, privateChats] = await Promise.all([
          fetchGlobalChat(),
          fetchPrivateChats()
        ]);

        console.log(' Fetched globalChat:', globalChat);
        console.log(' Fetched privateChats:', privateChats);

        const allChats: ChatRoom[] = [];
        
        if (globalChat) {
          allChats.push(globalChat);
        }
        
        allChats.push(...privateChats);

        console.log(' Updated allChats:', allChats);
        setChatRooms(allChats);
        
        const newPrivateChat = privateChats.find((chat: ChatRoom) => 
          chat.type === 'PRIVATE' && 
          chat.participants.some(p => p.id === senderIdNum)
        );
        
        console.log(' Looking for new private chat with participant ID:', senderIdNum);
        console.log(' Found new private chat:', newPrivateChat);
        
        if (newPrivateChat) {
          console.log(' Switching to new private chat:', newPrivateChat.name);
          setActiveChat(newPrivateChat);
          setSidebarOpen(false);
        } else {
          console.warn(' New private chat not found yet. Available private chats:');
          privateChats.forEach((chat: ChatRoom, index: number) => {
            console.log(`  ${index + 1}. ${chat.roomName} (ID: ${chat.roomId}) - Participants:`, 
              chat.participants.map(p => ({ id: p.id, name: p.username }))
            );
          });
        }
        
      } catch (error) {
        console.error(' Error refreshing chats after creating private chat:', error);
      }
    }, 2000); 
  };

  const handleValidateMessage = async (messageId: number) => {
    console.log('handleValidateMessage called with messageId:', messageId);
    console.log('Current user:', user);
    console.log('User role:', user?.role);
    console.log('Is connected:', isConnected);
    
    if (!user?.id) {
      console.error('User not available');
      return;
    }
    
    if (user.role !== 'VALIDATOR') {
      console.error('Only validators can validate messages');
      return;
    }

    console.log('Calling validateMessage with messageId:', messageId);
    await validateMessage(messageId);
    
    if (activeChat) {
      console.log('Refreshing messages after validation');
      const updatedMessages = await fetchMessagesForRoom(activeChat.roomId);
      setChatMessages(prev => ({
        ...prev,
        [activeChat.roomId]: updatedMessages
      }));
    }
  };

  const handleUnvalidateMessage = async (messageId: number) => {
    console.log('handleUnvalidateMessage called with messageId:', messageId);
    console.log('Note: Unvalidation is not available - validation is permanent');
    
    await unvalidateMessage(messageId);
  };

  const handleChatSelect = (chat: ChatRoom) => {
    setActiveChat(chat);
    setSidebarOpen(false); 
  };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

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
          isLoadingRooms={isLoadingRooms}
        />
      </div>

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
            isLoadingMessages={isLoadingMessages[activeChat.roomId] || false}
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