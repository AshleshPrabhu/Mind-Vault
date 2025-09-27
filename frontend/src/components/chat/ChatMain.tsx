import React, { useState, useRef, useEffect } from 'react';
import { History, CheckCircle, Bot, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ChatHistory from '../ChatHistory';
import type { ChatMessage, ChatRoom } from '../../pages/Chat';

interface ChatMainProps {
  activeChat: ChatRoom;
  messages: ChatMessage[];
  onMenuClick: () => void;
  onSendMessage: (chatId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  onStartPrivateChat?: (senderName: string, senderId: string) => void;
}

const ChatMain: React.FC<ChatMainProps> = ({ activeChat, messages, onMenuClick, onSendMessage, onStartPrivateChat }) => {
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState('');
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeMessageMenu, setActiveMessageMenu] = useState<string | null>(null);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [validatedMessages, setValidatedMessages] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close message menu when clicking outside
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
    if (!newMessage.trim()) return;

    // Create the message object to send
    const messageToSend = {
      senderId: 'me',
      senderName: 'You',
      content: newMessage.trim(),
      isMe: true,
      ...(replyTo && {
        replyTo: {
          id: replyTo.id,
          senderName: replyTo.senderName,
          content: replyTo.content
        }
      })
    };

    // Call the parent function to add the message to state
    onSendMessage(activeChat.id, messageToSend);

    // Reset form state
    setNewMessage('');
    setReplyTo(null);
    setShowEmojiPicker(false);
    
    // Focus back to textarea for continuous typing
    textareaRef.current?.focus();
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    setNewMessage(textarea.value);
    
    // Auto-resize textarea
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
      onStartPrivateChat(message.senderName, message.senderId);
    }
    setActiveMessageMenu(null);
  };

  const handleValidateMessage = (messageId: string) => {
    setValidatedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId); // Remove validation if already validated
        console.log(`Removed validation for message ID: ${messageId}`);
      } else {
        newSet.add(messageId); // Add validation
        console.log(`Added validation for message ID: ${messageId}`);
      }
      return newSet;
    });
    setActiveMessageMenu(null);
  };

  const handleMessageNavigation = (messageId: string) => {
    // Find the message element and scroll to it
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      
      // Highlight the message temporarily
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
    // Generate a consistent profile color based on sender name
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
      className={`flex ${message.isMe ? 'justify-end' : 'justify-start'} mb-4 transition-colors duration-300 rounded-lg p-1 group`}
    >
      {/* Profile Picture - Only for non-user messages in public chats */}
      {!message.isMe && activeChat.type === 'public' && (
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

      <div className={`max-w-[75%] sm:max-w-[70%] ${message.isMe ? 'order-2' : 'order-1'} ${!message.isMe && activeChat.type === 'public' ? 'max-w-[calc(75%-2.5rem)] sm:max-w-[calc(70%-3.5rem)]' : ''}`}>
        {/* Reply Context */}
        {message.replyTo && (
          <div className={`
            mb-1 p-2 border-l-4 bg-gray-100 rounded text-xs
            ${message.isMe ? 'border-primary-600' : 'border-gray-400'}
          `}>
            <div className="font-semibold text-gray-700">{message.replyTo.senderName}</div>
            <div className="text-gray-600 truncate">{message.replyTo.content}</div>
          </div>
        )}
        
        {/* Message Bubble */}
        <div
          className={`
            relative px-4 py-3 rounded-2xl shadow-sm group cursor-pointer transition-all duration-200
            ${message.isMe 
              ? 'bg-primary-600 text-white rounded-br-md hover:shadow-md' 
              : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md hover:shadow-md hover:border-gray-300'
            }
          `}
          onClick={() => !message.isMe && setReplyTo(message)}
        >
          {/* Sender name for group/public chats */}
          {!message.isMe && activeChat.type === 'public' && (
            <div className="flex items-center space-x-2 mb-2">
              <div className="text-xs font-semibold text-primary-600">
                {message.senderName}
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="text-xs text-gray-500">
                {formatMessageTime(message.timestamp)}
              </div>
            </div>
          )}
          
          {/* Message content */}
          <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </div>
          
          {/* Validation Indicator - Only for the main message, not replies */}
          {!message.isMe && validatedMessages.has(message.id) && (
            <div 
              className="flex items-center space-x-1 mt-2 pt-2 border-t border-green-100 text-green-600 bg-green-50/30 rounded px-2 py-1"
              onClick={(e) => e.stopPropagation()} // Prevent triggering reply when clicking validation indicator
            >
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs font-medium">Validated</span>
            </div>
          )}
          
          {/* Message time - Only show for user messages or private chats */}
          {(message.isMe || activeChat.type === 'private') && (
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

          {/* Message Actions - Reply and Menu */}
          {!message.isMe && (
            <div className={`absolute -right-12 sm:-right-16 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col space-y-1 z-10`}>
              {/* Reply Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setReplyTo(message);
                  textareaRef.current?.focus();
                  setActiveMessageMenu(null);
                }}
                className="bg-white/90 backdrop-blur-sm hover:bg-gray-100 rounded-full p-1.5 sm:p-2 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 border border-gray-200"
                title="Reply"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </button>

              {/* More Actions Menu */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMessageMenu(activeMessageMenu === message.id ? null : message.id);
                  }}
                  className="bg-white/90 backdrop-blur-sm hover:bg-gray-100 rounded-full p-1.5 sm:p-2 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 border border-gray-200"
                  title="More actions"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {activeMessageMenu === message.id && (
                  <div className="absolute right-0 top-full mt-2 border border-gray-200 rounded-xl shadow-xl py-2 min-w-52 z-20 backdrop-blur-lg bg-white/95 animate-in slide-in-from-top-2 duration-200">
                    {/* Start Private Chat */}
                    <button
                      onClick={() => handleStartPrivateChat(message)}
                      className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-all duration-150 hover:translate-x-1 rounded-xl"
                    >
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium">Start private chat</div>
                        {/* <div className="text-xs text-gray-500">Create 1-on-1 conversation</div> */}
                      </div>
                    </button>

                    {/* Validate Message */}
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleValidateMessage(message.id);
                        }}
                        className={`w-full px-4 py-3 text-left rounded-xl text-sm hover:bg-gray-50 flex items-center space-x-3 transition-all duration-150 hover:translate-x-1 ${
                          validatedMessages.has(message.id) 
                            ? 'text-green-600 bg-green-50/50' 
                            : 'text-gray-700'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          validatedMessages.has(message.id) 
                            ? 'bg-green-50' 
                            : 'bg-gray-50'
                        }`}>
                          <CheckCircle className={`w-4 h-4 ${
                            validatedMessages.has(message.id) ? 'text-green-600' : 'text-gray-500'
                          }`} />
                        </div>
                        <div>
                          <div className="font-medium">
                            {validatedMessages.has(message.id) ? 'Remove Validation' : 'Validate'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {validatedMessages.has(message.id) ? 'Unmark as verified' : 'Mark as verified content'}
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    );
  };

  const emojis = ['😊', '😂', '❤️', '👍', '👎', '😢', '😡', '🤗', '🙏', '💪', '🌟', '🔥'];

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Chat Header */}
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

          {/* Chat Avatar */}
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white
            ${activeChat.type === 'public' ? 'bg-primary-600' : 'bg-gray-600'}
          `}>
            {activeChat.type === 'public' ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
            ) : (
              activeChat.name.charAt(0).toUpperCase()
            )}
          </div>

          {/* Chat Info */}
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">{activeChat.name}</h2>
            <p className="text-sm text-gray-500">
              {activeChat.type === 'public' ? 'Public support group' : 'Private conversation'}
            </p>
          </div>

          {/* Header Actions */}
          <div className="flex items-center space-x-2">
            {/* History Button - Only show for public chats (replaces call icon) */}
            {activeChat.type === 'public' && (
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

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-lg font-medium">No messages yet</p>
              <p className="text-sm">Start a conversation!</p>
            </div>
          </div>
        ) : (
          messages.map(message => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Preview */}
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

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          {/* Emoji Picker Button */}
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Emoji Picker */}
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

          {/* Message Input */}
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

          {/* Send Button */}
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

      {/* Chat History Sidebar */}
      <ChatHistory
        messages={messages}
        onMessageClick={handleMessageNavigation}
        isOpen={showChatHistory}
        onClose={() => setShowChatHistory(false)}
      />

      {/* AI Assistant Bubble - Fixed Position */}
      <div className="fixed top-3 right-18 z-50">
        <button
          onClick={() => navigate('/app/ai-chat')}
          className="
            group relative bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600
            text-white p-4 rounded-full shadow-lg hover:shadow-xl
            transform transition-all duration-300 hover:scale-110 active:scale-95
            ring-4 ring-primary-100 hover:ring-primary-200
            hover:animate-none
          "
          title="Chat with AI Assistant"
        >
          
          <div className="relative flex items-center justify-center">
            <Bot className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
            <Sparkles className="w-2 h-2 absolute -top-1 -right-1 opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          
          {/* Tooltip */}
          <div className="
            absolute bottom-full right-0 mb-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg
            opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0
            whitespace-nowrap pointer-events-none
          ">
            <div className="relative">
              AI Companion
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default ChatMain;