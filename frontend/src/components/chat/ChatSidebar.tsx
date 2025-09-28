import React from 'react';
import type { ChatRoom } from '../../pages/Chat';
import publicLogo from '../../assets/public.png';

const generateProfilePicture = (identifier: string): string => {
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    const char = identifier.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; 
  }

  const seed = Math.abs(hash);
  
  const avatarServices = [
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${identifier}`,
    `https://api.dicebear.com/7.x/personas/svg?seed=${identifier}`,
    `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${identifier}`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=${identifier}`,
    `https://api.dicebear.com/7.x/identicon/svg?seed=${identifier}`,
  ];
  
  
  return avatarServices[seed % avatarServices.length];
};


interface ChatSidebarProps {
  chatRooms: ChatRoom[];
  activeChat: ChatRoom | null;
  onChatSelect: (chat: ChatRoom) => void;
  onClose: () => void;
  isLoadingRooms?: boolean;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  chatRooms,
  activeChat,
  onChatSelect,
  onClose,
  isLoadingRooms = false
}) => {
  const publicChats = chatRooms.filter(chat => chat.type === 'GLOBAL');
  const privateChats = chatRooms.filter(chat => chat.type === 'PRIVATE');

  const formatLastMessageTime = (time?: Date) => {
    if (!time) return '';
    
    const now = new Date();
    const diff = now.getTime() - time.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const ChatRoomItem: React.FC<{ chat: ChatRoom }> = ({ chat }) => (
    <div
      onClick={() => onChatSelect(chat)}
      className={`
        p-4 cursor-pointer transition-all duration-200 border-l-4 hover:bg-primary-50
        ${activeChat?.roomId === chat.roomId 
          ? 'bg-primary-50 border-primary-600' 
          : 'border-transparent hover:border-primary-200'
        }
      `}
    >
      <div className="flex items-center space-x-3">
        <div className={`
          w-12 h-12 rounded-full flex items-center justify-center font-semibold text-white overflow-hidden
          ${chat.type === 'GLOBAL' ? 'bg-primary-50' : 'bg-gray-200'}
        `}>
          {chat.type === 'GLOBAL' ? (
            <img src={publicLogo} alt="public" className="w-full h-full object-cover" />
          ) : (
            <img 
              src={generateProfilePicture(chat.roomName + chat.roomId)} 
              alt={chat.roomName}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                const container = target.parentElement;
                if (container) {
                  container.innerHTML = `
                    <div class="w-full h-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center">
                      <span class="text-white font-semibold text-lg">${chat.roomName.charAt(0).toUpperCase()}</span>
                    </div>
                  `;
                }
              }}
            />
          )}
        </div>


        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className={`
              text-sm font-semibold truncate
              ${activeChat?.roomId === chat.roomId ? 'text-primary-700' : 'text-gray-900'}
            `}>
              {chat.roomName}
            </h3>
            {chat.lastMessageTime && (
              <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                {formatLastMessageTime(chat.lastMessageTime)}
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 truncate">
              {chat.lastMessage || ''}
            </p>
            {chat.unreadCount && chat.unreadCount > 0 && (
              <span className="bg-primary-600 text-white text-xs rounded-full px-2 py-1 ml-2 flex-shrink-0">
                {chat.unreadCount}
              </span>
            )}
          </div>

          {chat.type === 'PRIVATE' && chat.participantAddress && (
            <p className="text-xs text-gray-400 mt-1 truncate">
              {chat.participantAddress}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-white">

      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Messages</h1>
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>


      <div className="flex-1 overflow-y-auto">

        <div className="border-b border-gray-100">
          <div className="px-4 py-3 bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Public Chats
            </h2>
          </div>
          {isLoadingRooms ? (
            <div className="p-4">
              <div className="animate-pulse flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ) : (
            publicChats.map(chat => (
              <ChatRoomItem key={chat.roomId} chat={chat} />
            ))
          )}
        </div>


        <div>
          <div className="px-4 py-3 bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Recent Chats
            </h2>
          </div>
          {isLoadingRooms ? (
            <>  
              <div className="p-4">
                <div className="animate-pulse flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="animate-pulse flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            </>
          ) : privateChats.length > 0 ? (
            privateChats.map(chat => (
              <ChatRoomItem key={chat.roomId} chat={chat} />
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              <p className="text-sm">No private chats yet</p>
              <p className="text-xs mt-1">Start a conversation with someone!</p>
            </div>
          )}
        </div>
      </div>

      {/* <div className="p-4 border-t border-gray-200 bg-white">
        <button className="w-full btn btn-primary text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Start New Chat
        </button>
      </div> */}
    </div>
  );
};

export default ChatSidebar;