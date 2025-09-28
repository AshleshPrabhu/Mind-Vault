import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import type { ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useWallet } from './WalletContext';
import litProtocolService, { type EncryptedData } from '../lib/litProtocol';
import { API_BASE_URL } from '../config';

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
  typingUsers: Map<number, number[]>; 
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
  
  const currentUserIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!user?.id || currentUserIdRef.current === user.id) return;
    
    currentUserIdRef.current = user.id;

    console.log('Connecting socket for user:', user.id);

    const newSocket: Socket<ServerToClientEvents, ClientToServerEvents> = io('https://mind-vault-2lwh.onrender.com', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      forceNew: true,
      autoConnect: true,
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      console.log('Connected to socket server:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected from socket server:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    newSocket.on('user_joined', (data) => {
      console.log('User joined room:', data);
      setOnlineUsers(prev => new Set(prev).add(data.userId));
    });

    newSocket.on('new_message', (message) => {
      console.log('New message received:', message);
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

    newSocket.on('private_room_created', (data) => {
      console.log('Private room created event received:', data);
    });

    setSocket(newSocket);

    return () => {
      console.log('Cleaning up socket connection');
      newSocket.removeAllListeners();
      newSocket.disconnect();
      setIsConnected(false);
    };
  }, [user?.id]); 
  const joinRoom = React.useCallback((roomId: number) => {
    if (socket && user?.id && isConnected) {
      console.log('Joining room:', roomId);
      socket.emit('join_room', { roomId, userId: user.id });
    }
  }, [socket, user?.id, isConnected]);

  const leaveRoom = React.useCallback((roomId: number) => {
    if (socket && isConnected) {
      console.log('Leaving room:', roomId);
      socket.emit('leave_room' as any, { roomId });
    }
  }, [socket, isConnected]);

  const sendMessage = React.useCallback(async (roomId: number, content: string, replyToId?: number, encrypted: boolean = false) => {
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

      if (encrypted) {
        try {
          const encryptedData = await litProtocolService.encryptMessage(
            content, 
            roomId, 
            user.walletAddress
          );
          
          messageData = {
            ...messageData,
            content: "[Encrypted Message]", 
            isEncrypted: true,
            encryptedData
          };
        } catch (encryptionError) {
          console.error("Failed to encrypt message:", encryptionError);
         
          console.log("Falling back to unencrypted message");
        }
      }

      socket.emit('send_message', messageData);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }, [socket, user?.id, user?.walletAddress, isConnected]);

  const joinPrivateChat = React.useCallback((peerId: number, type: 'PRIVATE' | 'AI' = 'PRIVATE') => {
    if (socket && user?.id && isConnected) {
      socket.emit('join_private', { 
        userId: user.id, 
        peerId, 
        type 
      });
    }
  }, [socket, user?.id, isConnected]);

  const startTyping = React.useCallback((roomId: number) => {
    if (socket && user?.id && isConnected) {
      socket.emit('typing_start', { roomId, userId: user.id });
    }
  }, [socket, user?.id, isConnected]);

  const stopTyping = React.useCallback((roomId: number) => {
    if (socket && user?.id && isConnected) {
      socket.emit('typing_stop', { roomId, userId: user.id });
    }
  }, [socket, user?.id, isConnected]);

  const validateMessage = React.useCallback(async (messageId: number) => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/message/${messageId}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ validatorId: user.id }),
      });
      
      const data = await response.json();
      if (data.success) {
        console.log('Message validated successfully:', data);
      } else {
        console.error('Validation failed:', data.message);
      }
    } catch (error) {
      console.error('Error validating message:', error);
    }
  }, [user?.id]);

  const unvalidateMessage = React.useCallback(async (_messageId: number) => {
    console.log('Unvalidate not implemented via API yet');
  }, []);

  const value = React.useMemo<SocketContextType>(() => ({
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
  }), [
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
  ]);

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};