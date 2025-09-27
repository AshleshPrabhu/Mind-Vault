import React, { useState } from 'react';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatMain from '../components/chat/ChatMain';
import { useChatContext } from '../contexts/ChatContext';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  isMe: boolean;
  replyTo?: {
    id: string;
    senderName: string;
    content: string;
  };
}

export interface ChatRoom {
  id: string;
  name: string;
  type: 'public' | 'private';
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount?: number;
  participantAddress?: string;
}

const Chat: React.FC = () => {
  const [activeChat, setActiveChat] = useState<ChatRoom>({
    id: 'public',
    name: 'Public Mental Health Support',
    type: 'public'
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const { setCurrentChatType } = useChatContext();

  // Initialize dummy chat rooms
  React.useEffect(() => {
    const initialChatRooms: ChatRoom[] = [
      {
        id: 'public',
        name: 'Public Mental Health Support',
        type: 'public',
        lastMessage: 'Thanks for the support everyone! 💚',
        lastMessageTime: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        unreadCount: 3
      },
      {
        id: 'private-1',
        name: 'Alex Thompson',
        type: 'private',
        participantAddress: '0x1234...5678',
        lastMessage: 'How are you feeling today?',
        lastMessageTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        unreadCount: 0
      },
      {
        id: 'private-2',
        name: 'Sarah Chen',
        type: 'private',
        participantAddress: '0xabcd...efgh',
        lastMessage: 'That meditation technique really helped!',
        lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        unreadCount: 0
      },
      {
        id: 'private-3',
        name: 'Michael Brown',
        type: 'private',
        participantAddress: '0x9876...4321',
        lastMessage: 'Thanks for listening yesterday',
        lastMessageTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        unreadCount: 0
      }
    ];
    setChatRooms(initialChatRooms);
  }, []);

  // Initialize messages with dummy data
  React.useEffect(() => {
    setChatMessages(getInitialMessages());
  }, []);

  // Update chat type when active chat changes
  React.useEffect(() => {
    setCurrentChatType(activeChat.type);
  }, [activeChat.type, setCurrentChatType]);

  // Function to add a new message to the chat
  const addMessage = (chatId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    setChatMessages(prev => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), newMessage]
    }));
  };

  // Function to create and open a new private chat
  const createPrivateChat = (senderName: string, senderId: string) => {
    // Check if private chat already exists
    const existingChat = chatRooms.find(chat => 
      chat.type === 'private' && chat.participantAddress === senderId
    );

    if (existingChat) {
      // If chat exists, just switch to it
      setActiveChat(existingChat);
      setSidebarOpen(false);
      return;
    }

    // Create new private chat
    const newChatId = `private-${senderId.slice(-4)}-${Date.now()}`;
    const newPrivateChat: ChatRoom = {
      id: newChatId,
      name: senderName,
      type: 'private',
      participantAddress: senderId,
      lastMessage: '',
      lastMessageTime: new Date(),
      unreadCount: 0
    };

    // Add to chat rooms (we'll need to make chatRooms dynamic)
    setChatRooms(prev => [...prev, newPrivateChat]);
    
    // Initialize empty messages for this chat
    setChatMessages(prev => ({
      ...prev,
      [newChatId]: []
    }));

    // Switch to the new chat
    setActiveChat(newPrivateChat);
    setSidebarOpen(false);
  };

  // Dummy messages for different chats - converted to initial state
  const getInitialMessages = (): Record<string, ChatMessage[]> => {
    return {
      'public': [
        // Day 1 - Initial conversation
        {
          id: '1',
          senderId: '0xuser1...1234',
          senderName: 'Anonymous User',
          content: 'Hi everyone! I\'m new here and looking for some support with anxiety.',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000), // 3 days + 2 hours ago
          isMe: false
        },
        {
          id: '2',
          senderId: 'me',
          senderName: 'You',
          content: 'Welcome to the community! You\'re definitely in the right place. What specific triggers have you noticed?',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 - 115 * 60 * 1000), // 3 days + 1h55m ago
          isMe: true
        },
        {
          id: '3',
          senderId: '0xuser2...5678',
          senderName: 'Mindful Mike',
          content: 'This is such a supportive space. @You great question about triggers!',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 - 110 * 60 * 1000), // 3 days + 1h50m ago
          isMe: false
        },
        {
          id: '4',
          senderId: 'me',
          senderName: 'You',
          content: 'I find that crowded places and public speaking are my biggest challenges. Started using grounding techniques recently.',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 - 100 * 60 * 1000), // 3 days + 1h40m ago
          isMe: true
        },
        
        // Day 2 - Different topic discussion  
        {
          id: '5',
          senderId: '0xuser3...9012',
          senderName: 'Calm Catherine',
          content: 'Good morning everyone! Has anyone tried the new meditation app recommendations?',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 3 * 60 * 60 * 1000), // 2 days + 3 hours ago
          isMe: false
        },
        {
          id: '6',
          senderId: 'me',
          senderName: 'You',
          content: 'Yes! I\'ve been using Headspace for sleep stories. Really helps with my insomnia.',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 170 * 60 * 1000), // 2 days + 2h50m ago
          isMe: true
        },
        {
          id: '7',
          senderId: 'me',
          senderName: 'You',
          content: 'The body scan sessions are incredible for anxiety too. Anyone else tried those?',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 165 * 60 * 1000), // 2 days + 2h45m ago
          isMe: true
        },
        
        // Day 2 - Later in the day
        {
          id: '8',
          senderId: '0xuser4...3456',
          senderName: 'Zen Master',
          content: '@You Body scans changed my life! The awareness it builds is incredible.',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 8 * 60 * 60 * 1000), // 2 days + 8 hours ago
          isMe: false
        },
        {
          id: '9',
          senderId: 'me',
          senderName: 'You',
          content: 'Exactly! It\'s amazing how much tension we carry without realizing it. 🧘‍♀️',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 7 * 60 * 60 * 1000), // 2 days + 7 hours ago
          isMe: true
        },
        
        // Yesterday - Evening discussion
        {
          id: '10',
          senderId: '0xuser5...7890',
          senderName: 'Peaceful Pat',
          content: 'Rough day today... work stress is really getting to me',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000), // Yesterday + 4 hours ago
          isMe: false
        },
        {
          id: '11',
          senderId: 'me',
          senderName: 'You',
          content: 'I hear you Pat. Work stress is so draining. Have you been able to set any boundaries?',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 - 230 * 60 * 1000), // Yesterday + 3h50m ago
          isMe: true
        },
        {
          id: '12',
          senderId: 'me',
          senderName: 'You',
          content: 'Also, that progressive muscle relaxation technique we discussed might help after tough workdays.',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 - 225 * 60 * 1000), // Yesterday + 3h45m ago
          isMe: true
        },
        
        // Today - Recent conversation
        {
          id: '13',
          senderId: '0xuser6...2468',
          senderName: 'Gentle Grace',
          content: 'Morning check-in: How is everyone feeling today? 🌅',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
          isMe: false
        },
        {
          id: '14',
          senderId: 'me',
          senderName: 'You',
          content: 'Starting the day with gratitude journaling! Three things I\'m grateful for today ✨',
          timestamp: new Date(Date.now() - 150 * 60 * 1000), // 2.5 hours ago
          isMe: true
        },
        
        // Current active conversation
        {
          id: '15',
          senderId: '0xuser1...1234',
          senderName: 'Anonymous User',
          content: 'I struggle with social anxiety, especially in work meetings.',
          timestamp: new Date(Date.now() - 50 * 60 * 1000),
          isMe: false
        },
        {
          id: '16',
          senderId: '0xuser3...9012',
          senderName: 'Calm Catherine',
          content: 'I totally understand that feeling. Have you tried any breathing exercises?',
          timestamp: new Date(Date.now() - 45 * 60 * 1000),
          isMe: false,
          replyTo: {
            id: '15',
            senderName: 'Anonymous User',
            content: 'I struggle with social anxiety, especially in work meetings.'
          }
        },
        {
          id: '17',
          senderId: 'me',
          senderName: 'You',
          content: 'The 4-7-8 breathing technique works wonders for me before meetings. Hold for 4, breathe for 7, exhale for 8.',
          timestamp: new Date(Date.now() - 40 * 60 * 1000),
          isMe: true,
          replyTo: {
            id: '16',
            senderName: 'Calm Catherine',
            content: 'I totally understand that feeling. Have you tried any breathing exercises?'
          }
        },
        {
          id: '18',
          senderId: '0xuser4...3456',
          senderName: 'Zen Master',
          content: '@You That\'s exactly the technique I use! Consistency is key with breathing exercises.',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          isMe: false
        },
        {
          id: '19',
          senderId: '0xuser1...1234',
          senderName: 'Anonymous User',
          content: 'Thank you all for the support! I\'ll definitely try the breathing techniques 💚',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          isMe: false
        }
      ],
      'private-1': [
        {
          id: 'p1-1',
          senderId: '0x1234...5678',
          senderName: 'Alex Thompson',
          content: 'Hey! How are you feeling today?',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          isMe: false
        },
        {
          id: 'p1-2',
          senderId: 'me',
          senderName: 'You',
          content: 'Much better than yesterday, thanks for checking in!',
          timestamp: new Date(Date.now() - 25 * 60 * 1000),
          isMe: true
        }
      ],
      'private-2': [
        {
          id: 'p2-1',
          senderId: '0xabcd...efgh',
          senderName: 'Sarah Chen',
          content: 'That meditation technique really helped!',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          isMe: false
        }
      ],
      'private-3': [
        {
          id: 'p3-1',
          senderId: '0x9876...4321',
          senderName: 'Michael Brown',
          content: 'Thanks for listening yesterday',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          isMe: false
        }
      ]
    };
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
        <ChatMain
          activeChat={activeChat}
          messages={chatMessages[activeChat.id] || []}
          onMenuClick={() => setSidebarOpen(true)}
          onSendMessage={addMessage}
          onStartPrivateChat={createPrivateChat}
        />
      </div>
    </div>
  );
};

export default Chat;