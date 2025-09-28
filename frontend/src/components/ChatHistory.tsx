import React, { useState, useMemo } from 'react';
import { format, isToday, isYesterday, startOfDay, differenceInDays } from 'date-fns';
import { Search, Clock, MessageCircle, ChevronDown, ChevronRight } from 'lucide-react';

interface ChatMessage {
  id: number;
  senderId: number;
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

interface ChatHistoryProps {
  messages: ChatMessage[];
  onMessageClick?: (messageId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface GroupedMessage {
  date: string;
  messages: ChatMessage[];
  displayDate: string;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ 
  messages, 
  onMessageClick, 
  isOpen, 
  onClose 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set(['today', 'yesterday']));

  const userMessages = useMemo(() => {
    return messages.filter(msg => msg.isMe);
  }, [messages]);

  const groupedMessages = useMemo(() => {
    const filtered = searchTerm.length === 0 
      ? userMessages 
      : userMessages.filter(msg => 
          msg.content.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const groups: { [key: string]: ChatMessage[] } = {};
    
    filtered.forEach(message => {
      const messageDate = startOfDay(message.timestamp);
      const dateKey = messageDate.toISOString();
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });

    return Object.entries(groups)
      .map(([dateKey, msgs]): GroupedMessage => {
        const date = new Date(dateKey);
        let displayDate: string;
        
        if (isToday(date)) {
          displayDate = 'Today';
        } else if (isYesterday(date)) {
          displayDate = 'Yesterday';
        } else {
          const daysAgo = differenceInDays(new Date(), date);
          if (daysAgo <= 7) {
            displayDate = format(date, 'EEEE'); // Day name
          } else {
            displayDate = format(date, 'MMM dd, yyyy');
          }
        }

        return {
          date: dateKey,
          messages: msgs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
          displayDate
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [userMessages, searchTerm]);

  const toggleDayExpansion = (dateKey: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dateKey)) {
      newExpanded.delete(dateKey);
    } else {
      newExpanded.add(dateKey);
    }
    setExpandedDays(newExpanded);
  };

  const handleMessageClick = (messageId: number) => {
    if (onMessageClick) {
      onMessageClick(messageId.toString());
      onClose();
    }
  };

  const formatTime = (date: Date) => {
    return format(date, 'HH:mm');
  };

  const truncateMessage = (content: string, maxLength: number = 80) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/10 backdrop-blur-[1px] z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      <div className={`
        fixed right-0 top-0 h-full w-96 bg-white border-l border-gray-200 
        transform transition-all duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        flex flex-col shadow-xl
      `}>
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-[#197067]/5 to-[#197067]/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#197067] rounded-lg flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Your History</h3>
                <p className="text-xs text-gray-500">Messages in public chat</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/80 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#197067]/20 focus:border-[#197067] outline-none text-sm"
            />
          </div>
          
          {userMessages.length > 0 && (
            <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
              <span>{userMessages.length} message{userMessages.length !== 1 ? 's' : ''}</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Live</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {groupedMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6">
              {searchTerm ? (
                <>
                  <Search className="w-12 h-12 mb-3 text-gray-300" />
                  <p className="text-center">No messages found for "{searchTerm}"</p>
                </>
              ) : (
                <>
                  <MessageCircle className="w-12 h-12 mb-3 text-gray-300" />
                  <p className="text-center">You haven't sent any messages in this chat yet</p>
                </>
              )}
            </div>
          ) : (
            <div className="p-3">
              {groupedMessages.map((group) => {
                const isExpanded = expandedDays.has(group.date) || 
                                 expandedDays.has(group.displayDate.toLowerCase());
                
                return (
                  <div key={group.date} className="mb-4">
                    <button
                      onClick={() => toggleDayExpansion(group.date)}
                      className="w-full flex items-center justify-between p-3 hover:bg-white/50 rounded-xl transition-colors group border border-gray-100"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-1.5 rounded-lg transition-colors ${
                          isExpanded ? 'bg-[#197067] text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-[#197067]/10 group-hover:text-[#197067]'
                        }`}>
                          {isExpanded ? (
                            <ChevronDown className="w-3 h-3" />
                          ) : (
                            <ChevronRight className="w-3 h-3" />
                          )}
                        </div>
                        <span className="text-sm font-semibold text-gray-800">
                          {group.displayDate}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full group-hover:bg-[#197067]/10 group-hover:text-[#197067] transition-colors font-medium">
                          {group.messages.length}
                        </span>
                      </div>
                    </button>

                    <div className={`ml-4 space-y-2 overflow-hidden transition-all duration-300 ${
                      isExpanded ? 'max-h-none opacity-100 mt-2' : 'max-h-0 opacity-0'
                    }`}>
                      {group.messages.map((message) => (
                        <div
                          key={message.id}
                          onClick={() => handleMessageClick(message.id)}
                          className="p-3 bg-gradient-to-r from-[#197067]/5 to-[#197067]/10 hover:from-[#197067]/10 hover:to-[#197067]/15 rounded-xl border border-[#197067]/10 hover:border-[#197067]/20 cursor-pointer transition-all duration-200 hover:shadow-sm group"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-3 h-3 text-[#197067]/60" />
                              <span className="text-xs text-gray-600 font-medium">
                                {formatTime(message.timestamp)}
                              </span>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <svg className="w-3 h-3 text-[#197067]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                          
                          {message.replyTo && (
                            <div className="mb-2 p-2 bg-white/60 rounded-lg border-l-3 border-[#197067]">
                              <div className="text-xs text-[#197067] mb-1 font-medium">
                                ↳ {message.replyTo.senderName}
                              </div>
                              <div className="text-xs text-gray-600 italic leading-relaxed">
                                "{truncateMessage(message.replyTo.content, 35)}"
                              </div>
                            </div>
                          )}
                          
                          <div className="text-sm text-gray-800 leading-relaxed">
                            {truncateMessage(message.content, 75)}
                          </div>
                          
                          {message.content.length > 75 && (
                            <div className="text-xs text-[#197067] mt-2 font-medium flex items-center space-x-1">
                              <span>View full message</span>
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-[#197067] rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-600 font-medium">
              Public chat messages only
            </span>
          </div>
          <div className="text-center text-xs text-gray-500 mt-1">
            Click any message to navigate in chat
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatHistory;