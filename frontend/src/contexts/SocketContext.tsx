import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useWallet } from './WalletContext';
import litProtocolService, { type EncryptedData } from '../lib/litProtocol';

// Define the socket events interface
interface ServerToClientEvents {
  user_joined: (data: { userId: number; roomId: number }) => void;
  new_message: (message: any) => void;
  private_room_created: (data: { userId: number; peerId: number; room: string }) => void;
  user_typing: (data: { userId: number; roomId: number }) => void;
  user_stopped_typing: (data: { userId: number; roomId: number }) => void;
  message_validated: (data: { messageId: number; validatedBy: number; message: any }) => void;
  message_unvalidated: (data: { messageId: number; unvalidatedBy: number; message: any }) => void;
  user_online: (data: { userId: number }) => void;
  user_offline: (data: { userId: number }) => void;
}

interface ClientToServerEvents {
  join_room: (data: { roomId: number; userId: number }) => void;
  send_message: (data: { 
    roomId: number; 
    userId: number; 
    content: string; 
    replyToId?: number;
    isEncrypted?: boolean;
    encryptedData?: EncryptedData;
  }) => void;
  join_private: (data: { userId: number; peerId: number; type: 'PRIVATE' | 'AI' }) => void;
  typing_start: (data: { roomId: number; userId: number }) => void;
  typing_stop: (data: { roomId: number; userId: number }) => void;
  validate_message: (data: { messageId: number; validatedBy: number }) => void;
  unvalidate_message: (data: { messageId: number; unvalidatedBy: number }) => void;
}

interface SocketContextType {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  isConnected: boolean;
  joinRoom: (roomId: number) => void;
  leaveRoom: (roomId: number) => void;
  sendMessage: (roomId: number, content: string, replyToId?: number, encrypted?: boolean) => void;
  joinPrivateChat: (peerId: number, type?: 'PRIVATE' | 'AI') => void;
  startTyping: (roomId: number) => void;
  stopTyping: (roomId: number) => void;
  validateMessage: (messageId: number) => void;
  unvalidateMessage: (messageId: number) => void;
  onlineUsers: Set<number>;
  typingUsers: Map<number, number[]>; // roomId -> userId[]
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Map<number, number[]>>(new Map());
  
  const { user } = useWallet();

  useEffect(() => {
    if (!user?.id) return;

    // Initialize socket connection
    const newSocket: Socket<ServerToClientEvents, ClientToServerEvents> = io('http://localhost:3000', {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('Connected to socket server:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from socket server');
      setIsConnected(false);
    });

    // Set up event listeners
    newSocket.on('user_joined', (data) => {
      console.log('User joined room:', data);
      setOnlineUsers(prev => new Set(prev).add(data.userId));
    });

    newSocket.on('new_message', (message) => {
      console.log('New message received:', message);
      // This will be handled by individual chat components
    });

    newSocket.on('user_typing', (data) => {
      setTypingUsers(prev => {
        const newMap = new Map(prev);
        const roomUsers = newMap.get(data.roomId) || [];
        if (!roomUsers.includes(data.userId)) {
          newMap.set(data.roomId, [...roomUsers, data.userId]);
        }
        return newMap;
      });
    });

    newSocket.on('user_stopped_typing', (data) => {
      setTypingUsers(prev => {
        const newMap = new Map(prev);
        const roomUsers = newMap.get(data.roomId) || [];
        newMap.set(data.roomId, roomUsers.filter(id => id !== data.userId));
        return newMap;
      });
    });

    newSocket.on('user_online', (data) => {
      setOnlineUsers(prev => new Set(prev).add(data.userId));
    });

    newSocket.on('user_offline', (data) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user?.id]);

  // Socket action functions
  const joinRoom = (roomId: number) => {
    if (socket && user?.id && isConnected) {
      socket.emit('join_room', { roomId, userId: user.id });
    }
  };

  const leaveRoom = (roomId: number) => {
    if (socket && isConnected) {
      socket.emit('leave_room' as any, { roomId });
    }
  };

  const sendMessage = async (roomId: number, content: string, replyToId?: number, encrypted: boolean = false) => {
    if (!socket || !user?.id || !isConnected || !user?.walletAddress) return;

    try {
      let messageData = {
        roomId, 
        userId: user.id, 
        content,
        replyToId,
        isEncrypted: false,
        encryptedData: undefined as EncryptedData | undefined
      };

      // Encrypt message if requested
      if (encrypted) {
        try {
          const encryptedData = await litProtocolService.encryptMessage(
            content, 
            roomId, 
            user.walletAddress
          );
          
          messageData = {
            ...messageData,
            content: "[Encrypted Message]", // Placeholder text
            isEncrypted: true,
            encryptedData
          };
        } catch (encryptionError) {
          console.error("Failed to encrypt message:", encryptionError);
          // Fall back to unencrypted message
          console.log("Falling back to unencrypted message");
        }
      }

      socket.emit('send_message', messageData);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const joinPrivateChat = (peerId: number, type: 'PRIVATE' | 'AI' = 'PRIVATE') => {
    if (socket && user?.id && isConnected) {
      socket.emit('join_private', { 
        userId: user.id, 
        peerId, 
        type 
      });
    }
  };

  const startTyping = (roomId: number) => {
    if (socket && user?.id && isConnected) {
      socket.emit('typing_start', { roomId, userId: user.id });
    }
  };

  const stopTyping = (roomId: number) => {
    if (socket && user?.id && isConnected) {
      socket.emit('typing_stop', { roomId, userId: user.id });
    }
  };

  const validateMessage = (messageId: number) => {
    if (socket && user?.id && isConnected) {
      socket.emit('validate_message', { messageId, validatedBy: user.id });
    }
  };

  const unvalidateMessage = (messageId: number) => {
    if (socket && user?.id && isConnected) {
      socket.emit('unvalidate_message', { messageId, unvalidatedBy: user.id });
    }
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    joinRoom,
    leaveRoom,
    sendMessage,
    joinPrivateChat,
    startTyping,
    stopTyping,
    validateMessage,
    unvalidateMessage,
    onlineUsers,
    typingUsers
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};