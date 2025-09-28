import React, { useState, useRef, useEffect, useMemo } from 'react';
import { History, CheckCircle, Search, X } from 'lucide-react';
import ChatHistory from '../ChatHistory';
import type { ChatMessage, ChatRoom } from '../../pages/Chat';
import publicLogo from '../../assets/public.png';
import { useWallet } from '../../contexts/WalletContext';

interface ChatMainProps {
  activeChat: ChatRoom;
  messages: ChatMessage[];
  onMenuClick: () => void;
  onSendMessage: (chatId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>, encrypted?: boolean) => void;
  onStartPrivateChat?: (senderName: string, senderId: string) => void;
  onValidateMessage?: (messageId: number) => void;
  onUnvalidateMessage?: (messageId: number) => void;
  isLoadingMessages?: boolean;
}

const ChatMain: React.FC<ChatMainProps> = ({
  activeChat,
  messages,
  onMenuClick,
  onSendMessage,
  onStartPrivateChat,
  onValidateMessage,
  onUnvalidateMessage,
  isLoadingMessages = false
}) => {
  const { user } = useWallet();
  const [newMessage, setNewMessage] = useState('');
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeMessageMenu, setActiveMessageMenu] = useState<number | null>(null);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [encryptMessage, setEncryptMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const validatedMessages = new Set(
    messages
      .flatMap(msg => [
        ...(msg.isValidated ? [msg.id] : []),
        ...(msg.replies || []).filter(reply => reply.isValidated).map(reply => reply.id)
      ])
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearchToggle = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearchQuery('');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
    searchInputRef.current?.focus();
  };

  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    
    const query = searchQuery.toLowerCase();
    return messages.filter(message => {
      const messageMatch = message.content.toLowerCase().includes(query) ||
                          message.senderName.toLowerCase().includes(query);
      
      const replyMatch = message.replies?.some(reply => 
        reply.content.toLowerCase().includes(query) ||
        reply.senderName.toLowerCase().includes(query)
      );
      
      return messageMatch || replyMatch;
    });
  }, [messages, searchQuery]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = () => {
      if (activeMessageMenu) {
        setActiveMessageMenu(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeMessageMenu]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !user) return;

    const messageToSend = {
      senderId: user.id,
      senderName: user.username,
      content: newMessage.trim(),
      createdAt: new Date().toISOString(),
      isMe: true,
      sender: {
        id: user.id,
        username: user.username,
        profilePicture: user.profilePicture || ''
      },
      ...(replyTo && {
        replyTo: {
          id: replyTo.id.toString(),
          senderName: replyTo.senderName,
          content: replyTo.content
        }
      })
    };

    onSendMessage(activeChat.roomId.toString(), messageToSend, encryptMessage);

    setNewMessage('');
    setReplyTo(null);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    setNewMessage(textarea.value);
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleStartPrivateChat = (message: ChatMessage) => {
    if (onStartPrivateChat) {
      onStartPrivateChat(message.senderName, message.senderId.toString());
    }
    setActiveMessageMenu(null);
  };

  const handleValidateMessage = (messageId: number) => {
    const isCurrentlyValidated = validatedMessages.has(messageId);
    
    if (isCurrentlyValidated) {
      if (onUnvalidateMessage) {
        onUnvalidateMessage(messageId);
      }
    } else {
      if (onValidateMessage) {
        onValidateMessage(messageId);
      }
    }
    
    setActiveMessageMenu(null);
  };

  const handleMessageNavigation = (messageId: string) => {
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      messageElement.classList.add('bg-yellow-100', 'border-2', 'border-yellow-300');
      setTimeout(() => {
        messageElement.classList.remove('bg-yellow-100', 'border-2', 'border-yellow-300');
      }, 3000);
    }
  };

  const formatMessageTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    console.log(`Message ${message.id} replies:`, message.replies);
    console.log('Current user:', user);
    console.log('User role:', user?.role);
    
    const getProfileColor = (name: string) => {
      const colors = [
        'bg-gradient-to-br from-blue-500 to-blue-600',
        'bg-gradient-to-br from-green-500 to-green-600', 
        'bg-gradient-to-br from-purple-500 to-purple-600',
        'bg-gradient-to-br from-pink-500 to-pink-600',
        'bg-gradient-to-br from-indigo-500 to-indigo-600',
        'bg-gradient-to-br from-yellow-500 to-yellow-600',
        'bg-gradient-to-br from-red-500 to-red-600',
        'bg-gradient-to-br from-teal-500 to-teal-600'
      ];
      const hash = name.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      return colors[hash % colors.length];
    };

    const getInitials = (name: string) => {
      return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    return (
      <div 
        id={`message-${message.id}`}
        className={`relative flex ${message.isMe ? 'justify-end' : 'justify-start'} mb-4 transition-colors duration-300 rounded-lg p-1 hover:bg-gray-50/30 ${!message.isMe ? 'pr-16' : ''} group`}
      >
        {!message.isMe && activeChat.type === 'GLOBAL' && (
          <div className="flex-shrink-0 mr-2 sm:mr-3 mt-1">
            <div className={`
              w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm shadow-lg
              ring-2 ring-white ring-offset-1 transition-transform duration-200 hover:scale-105
              ${getProfileColor(message.senderName)}
            `}>
              {getInitials(message.senderName)}
            </div>
          </div>
        )}

        <div className={`max-w-[75%] sm:max-w-[70%] ${message.isMe ? 'order-2' : 'order-1'} ${!message.isMe && activeChat.type === 'GLOBAL' ? 'max-w-[calc(75%-2.5rem)] sm:max-w-[calc(70%-3.5rem)]' : ''}`}>
          {message.replyTo && (
            <div className={`
              mb-1 p-2 border-l-4 bg-gray-100 rounded text-xs
              ${message.isMe ? 'border-primary-600' : 'border-gray-400'}
            `}>
              <div className="font-semibold text-gray-700">{message.replyTo.senderName}</div>
              <div className="text-gray-600 truncate">{message.replyTo.content}</div>
            </div>
          )}
          
          <div
            className={`
              relative px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 group
              ${message.isMe 
                ? 'bg-primary-600 text-white rounded-br-md hover:shadow-md' 
                : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md hover:shadow-md hover:border-gray-300'
              }
            `}
          >
            {!message.isMe && activeChat.type === 'GLOBAL' && (
              <div className="flex items-center space-x-2 mb-2">
                <div className="text-xs font-semibold text-primary-600">
                  {message.senderName}
                </div>
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                <div className="text-xs text-gray-500">
                  {formatMessageTime(message.timestamp)}
                </div>
                {message.isEncrypted && (
                  <>
                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                    <div className={`text-xs flex items-center space-x-1 ${
                      message.decrypted ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      <span>{message.decrypted ? '🔓' : '🔒'}</span>
                      <span>{message.decrypted ? 'Decrypted' : 'Encrypted'}</span>
                    </div>
                  </>
                )}
                {message.replies && message.replies.length > 0 && (
                  <>
                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                    <div className="text-xs text-primary-600 flex items-center space-x-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                      <span>{message.replies.length} {message.replies.length === 1 ? 'reply' : 'replies'}</span>
                    </div>
                  </>
                )}
              </div>
            )}
            
            <div className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${
              message.isEncrypted && !message.decrypted ? 'italic text-gray-500' : ''
            }`}>
              {message.isEncrypted && message.decryptionError && (
                <div className="flex items-center space-x-2 mb-1 text-red-600">
                  <span className="text-xs">🔒</span>
                  <span className="text-xs font-medium">Decryption failed</span>
                </div>
              )}
              {message.content}
            </div>
            

            
            {(message.isMe || activeChat.type === 'PRIVATE') && (
              <div className={`
                text-xs mt-1 flex items-center justify-end space-x-1
                ${message.isMe ? 'text-primary-100' : 'text-gray-500'}
              `}>
                <span>{formatMessageTime(message.timestamp)}</span>
                {message.isMe && (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            )}
            
            {!message.isMe && (
              <div className="absolute top-1/2 -translate-y-1/2 right-[-3.5rem] flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Reply button clicked for message:', message.id);
                    setReplyTo(message);
                    textareaRef.current?.focus();
                    setActiveMessageMenu(null);
                  }}
                  className="bg-white/90 backdrop-blur-sm hover:bg-gray-100 rounded-full p-2 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 border border-gray-200 cursor-pointer"
                  title="Reply"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                </button>

                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('More actions button clicked for message:', message.id);
                      setActiveMessageMenu(activeMessageMenu === message.id ? null : message.id);
                    }}
                    className="bg-white/90 backdrop-blur-sm hover:bg-gray-100 rounded-full p-2 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 border border-gray-200 cursor-pointer"
                    title="More actions"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>

                  {activeMessageMenu === message.id && (
                    <div 
                      className="absolute right-0 top-full mt-2 border border-gray-200 rounded-xl shadow-xl py-2 min-w-52 z-[60] backdrop-blur-lg bg-white/95 animate-in slide-in-from-top-2 duration-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartPrivateChat(message);
                          setActiveMessageMenu(null);
                        }}
                        className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-all duration-150 hover:translate-x-1 rounded-xl"
                      >
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium">Start private chat</div>
                        </div>
                      </button>

                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {message.replies && message.replies.length > 0 && (
            <div className="mt-3 ml-8 space-y-2">
              {message.replies.map(reply => (
                <div key={reply.id} className="relative">
                  <div className="flex items-start space-x-2">
                    <div className="flex-shrink-0">
                      <div className={`
                        w-6 h-6 rounded-full flex items-center justify-center text-white font-semibold text-xs shadow-sm
                        ring-1 ring-white ring-offset-1
                        ${getProfileColor(reply.senderName)}
                      `}>
                        {getInitials(reply.senderName)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs font-semibold text-gray-700">{reply.senderName}</span>
                          <span className="text-xs text-gray-500">{formatMessageTime(reply.timestamp)}</span>
                          {reply.isEncrypted && (
                            <span className={`text-xs flex items-center space-x-1 ${
                              reply.decrypted ? 'text-green-600' : 'text-yellow-600'
                            }`}>
                              <span>{reply.decrypted ? '🔓' : '🔒'}</span>
                              <span>{reply.decrypted ? 'Decrypted' : 'Encrypted'}</span>
                            </span>
                          )}
                        </div>
                        <div className={`text-sm text-gray-800 whitespace-pre-wrap break-words ${
                          reply.isEncrypted && !reply.decrypted ? 'italic text-gray-500' : ''
                        }`}>
                          {reply.isEncrypted && reply.decryptionError && (
                            <div className="flex items-center space-x-2 mb-1 text-red-600">
                              <span className="text-xs">🔒</span>
                              <span className="text-xs font-medium">Decryption failed</span>
                            </div>
                          )}
                          {reply.content}
                        </div>
                        {reply.isValidated && (
                          <div className="flex items-center space-x-1 mt-1 text-green-600">
                            <CheckCircle className="w-3 h-3" />
                            <span className="text-xs font-medium">Validated</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-end mt-1">
                        {user?.role === 'VALIDATOR' && (
                          <div className="relative">
                            {validatedMessages.has(reply.id) ? (
                              <div className="text-xs flex items-center space-x-1 px-2 py-1 rounded text-green-600 bg-green-50">
                                <CheckCircle className="w-3 h-3" />
                                <span>Validated & Rewarded</span>
                              </div>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log('User role:', user?.role);
                                  console.log('Reply ID:', reply.id);
                                  console.log('Is validated:', validatedMessages.has(reply.id));
                                  handleValidateMessage(reply.id);
                                }}
                                className="text-xs flex items-center space-x-1 px-2 py-1 rounded transition-all duration-200 text-gray-500 hover:text-green-600 hover:bg-green-50"
                                title="Validate and reward reply"
                              >
                                <CheckCircle className="w-3 h-3" />
                                <span>Validate</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const emojis = ['😊', '😂', '❤️', '👍', '👎', '😢', '😡', '🤗', '🙏', '💪', '🌟', '🔥'];

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white
            ${activeChat.type === 'GLOBAL' ? 'bg-primary-50' : 'bg-gray-600'}
          `}>
            {activeChat.type === 'GLOBAL' ? (
              <img src={publicLogo} alt="public" />
            ) : (
              activeChat.roomName.charAt(0).toUpperCase()
            )}
          </div>

          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">{activeChat.roomName}</h2>
            <p className="text-sm text-gray-500">
              {activeChat.type === 'GLOBAL' ? 'Public support group' : 'Private conversation'}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSearchToggle}
              className={`p-2 rounded-lg transition-colors ${
                showSearch 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-gray-500 hover:text-primary-600 hover:bg-gray-100'
              }`}
              title="Search messages"
            >
              <Search className="w-5 h-5" />
            </button>
            
            {activeChat.type === 'GLOBAL' && (
              <button 
                onClick={() => setShowChatHistory(true)}
                className="p-2 text-gray-500 hover:text-[#197067] hover:bg-gray-100 rounded-lg transition-colors"
                title="View your message history"
              >
                <History className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {showSearch && (
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              className="
                block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg
                focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                placeholder-gray-400 text-sm
              "
              placeholder={`Search messages in ${activeChat.roomName}...`}
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="mt-2 text-xs text-gray-500">
              {filteredMessages.length} message{filteredMessages.length !== 1 ? 's' : ''} found
            </div>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto overflow-x-visible p-4 space-y-1">
        {isLoadingMessages ? (
          <div className="space-y-4">
            <div className="flex items-start space-x-3 animate-pulse">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="bg-gray-200 rounded-lg p-3 max-w-xs">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-16 mt-1"></div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 animate-pulse justify-end">
              <div className="flex-1">
                <div className="bg-primary-200 rounded-lg p-3 max-w-xs ml-auto">
                  <div className="h-4 bg-primary-300 rounded w-2/3 mb-2"></div>
                  <div className="h-3 bg-primary-300 rounded w-1/3"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-12 mt-1 ml-auto"></div>
              </div>
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            </div>
            
            <div className="flex items-start space-x-3 animate-pulse">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="bg-gray-200 rounded-lg p-3 max-w-sm">
                  <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-5/6 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/3"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-20 mt-1"></div>
              </div>
            </div>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {searchQuery ? (
                  <Search className="w-8 h-8 text-gray-400" />
                ) : (
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                )}
              </div>
              <p className="text-sm">
                {searchQuery ? `No messages found for "${searchQuery}"` : 'Start a conversation!'}
              </p>
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="mt-2 text-xs text-primary-600 hover:text-primary-700 underline"
                >
                  Clear search
                </button>
              )}
            </div>
          </div>
        ) : (
          filteredMessages.map(message => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {replyTo && (
        <div className="bg-gray-100 border-b border-gray-200 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <div className="w-1 h-10 bg-primary-600 rounded"></div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-700">
                  Replying to {replyTo.senderName}
                </div>
                <div className="text-sm text-gray-600 truncate">
                  {replyTo.content}
                </div>
              </div>
            </div>
            <button
              onClick={() => setReplyTo(null)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
              </svg>
            </button>

            {showEmojiPicker && (
              <div className="absolute bottom-full mb-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 grid grid-cols-6 gap-1 min-w-max">
                {emojis.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => {
                      setNewMessage(prev => prev + emoji);
                      setShowEmojiPicker(false);
                      textareaRef.current?.focus();
                    }}
                    className="p-2 hover:bg-gray-100 rounded text-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={handleTextareaChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              rows={1}
              className="w-full px-4 py-2 border border-gray-300 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent max-h-32"
              style={{
                minHeight: '44px',
                height: 'auto'
              }}
            />
          </div>

          <button
            onClick={() => setEncryptMessage(!encryptMessage)}
            className={`
              p-3 rounded-full transition-all duration-200 mr-2
              ${encryptMessage
                ? 'bg-green-100 text-green-600 hover:bg-green-200'
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }
            `}
            title={encryptMessage ? "Encryption ON - Messages will be encrypted" : "Encryption OFF - Messages will be plain text"}
          >
            {encryptMessage ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
            )}
          </button>

          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className={`
              p-3 rounded-full transition-all duration-200
              ${newMessage.trim()
                ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>

      <ChatHistory
        messages={messages}
        onMessageClick={handleMessageNavigation}
        isOpen={showChatHistory}
        onClose={() => setShowChatHistory(false)}
      />
    </div>
  );
};

export default ChatMain;