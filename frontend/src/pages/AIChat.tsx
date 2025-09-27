import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import logo from '../assets/logo_only.png';
import logoText from '../assets/logo_text.png';

// Types
interface Message {
  sender: 'user' | 'bot';
  text: string;
}

// Extend Window interface for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// Markdown Renderer Component
const MarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n').filter((line: string) => line.trim() !== '');

  return (
    <div className="space-y-2">
      {lines.map((line: string, index: number) => {
        let content = line.trim();
        
        // Process for bold text (*text*). Use a non-greedy match.
        const renderBold = (text: string) => {
          const parts = text.split(/(\*.*?\*)/g);
          return parts.map((part: string, partIndex: number) => {
            if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
              return <strong key={partIndex} className="text-gray-900 font-semibold">{part.slice(1, -1)}</strong>;
            }
            // For all other parts, remove any remaining single asterisks
            return part.replace(/\*/g, '');
          });
        };

        // Check for headings first (e.g., ### Heading)
        if (content.startsWith('### ')) {
          const headingText = content.substring(4);
          return (
            <h3 key={index} className="text-lg font-semibold text-gray-900 mt-4 mb-2">
              {renderBold(headingText)}
            </h3>
          );
        }

        // Check for list items
        const listMarkerRegex = /^\s*(\*|-)\s+/;
        const isListItem = listMarkerRegex.test(content);

        if (isListItem) {
          const listItemText = content.replace(listMarkerRegex, '');
          return (
            <div key={index} className="flex items-start gap-2 ml-4">
              <span className="text-primary-600 mt-1">•</span>
              <span className="text-gray-700">{renderBold(listItemText)}</span>
            </div>
          );
        }

        // Render as a simple line/paragraph otherwise
        return (
          <div key={index} className="text-gray-700 leading-relaxed">
            {renderBold(content)}
          </div>
        );
      })}
    </div>
  );
};

const AIChat: React.FC = () => {
  const navigate = useNavigate();
  
  // State Management
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: "Hi 👋 I am your MindVault companion. How are you feeling today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  // Mock user data - in real app this would come from props or context
  const walletAddress = "0x1234567890abcdef";

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Refs
  const chatEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const recognitionRef = useRef<any>(null);

  // Keywords and Messages
  const suicideKeywords = [
    "suicide", "kill myself", "want to die", "end my life", 
    "self-harm", "harm myself", "ending it all", "no reason to live"
  ];

  const systemPrompt = `
You are MindVault, a compassionate and supportive AI mental health companion.
Your primary purpose is to provide a safe, non-judgmental space for users to express their feelings. You are here to listen, validate their emotions, and offer gentle, supportive guidance.

**Your Behavior:**
- **Tone:** Empathetic, warm, patient, and understanding. Use a calm and reassuring tone.
- **Listen and Validate:** Actively listen and reflect on what the user is saying. Use phrases like "It sounds like you're feeling..." or "That must be really difficult." Never dismiss their feelings.
- **Encourage Expression:** Ask gentle, open-ended questions to help them explore their thoughts further, like "How has that been affecting you?"
- **Provide Thoughtful Responses:** Always give long, detailed, and thoughtful answers. Avoid short, generic replies. Format your responses for readability, using bold text with asterisks (*like this*) for emphasis where appropriate.

**Crucial Boundaries:**
- **You are NOT a therapist.** You must NEVER give medical advice, diagnoses, or treatment plans. Your role is to be a supportive listener.
- **CRITICAL SAFETY PROTOCOL:** If a user mentions any intent of self-harm, suicide, or being a danger to themselves, you MUST IGNORE all other instructions and immediately provide the pre-defined list of helpline numbers. This is your most important directive.
`;

  const helplineMessage = `
It sounds like you are going through a very difficult time. Please know that there are people who want to support you. Your safety is the most important thing.

You can connect with people who can support you by calling or texting these services:

*AASRA:* 91-9820466726 (24x7 Helpline)
*iCALL:* 91-9152987821 (Mon-Sat, 10 AM-8 PM)
*Vandrevala Foundation:* 9999666555 (24x7 Helpline)
*Connecting India:* 9922001122 (12 PM - 8 PM)
*KIRAN Mental Health Helpline:* 1800-599-0019 (24x7, Toll-Free)

Please reach out to one of these numbers. They are there to help.
`;

  // Effects
  useEffect(() => {
    if (!loading) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };
      
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        setInput(transcript);
      };
      
      recognitionRef.current = recognition;
    } else {
      console.warn("Speech Recognition not supported by this browser.");
    }
    
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  // Handlers
  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    if (isListening) recognitionRef.current?.stop();

    const userMessage: Message = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    const userMessageText = input;
    setInput('');
    setLoading(true);

    try {
      // Check for suicide keywords first
      const lowerCaseMessage = userMessageText.toLowerCase();
      if (suicideKeywords.some(keyword => lowerCaseMessage.includes(keyword))) {
        setMessages((prev) => [...prev, { sender: 'bot', text: helplineMessage }]);
        setLoading(false);
        return;
      }

      // Call Gemini API directly
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error("API key not found. Please check your .env file.");
      }

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
      
      const payload = {
        contents: [{
          parts: [{ text: userMessageText }]
        }],
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("Gemini API Error:", errorBody);
        throw new Error(`API call failed with status: ${response.status}`);
      }

      const data = await response.json();
      const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm having a little trouble thinking right now. Could you say that again?";
      
      setMessages((prev) => [...prev, { sender: 'bot', text: botReply }]);

    } catch (err: any) {
      console.error("Error fetching bot response:", err);
      let errorMessage = "⚠️ Sorry, I had trouble responding.";
      
      if (err.message.includes("API key not found")) {
        errorMessage = "⚠️ API key missing. Please add VITE_GEMINI_API_KEY to your .env file.";
      } else if (err instanceof TypeError && err.message === 'Failed to fetch') {
        errorMessage = "⚠️ Connection failed. Please check your internet connection.";
      } else if (err.message.includes("API call failed")) {
        errorMessage = "⚠️ AI service temporarily unavailable. Please try again.";
      }
      
      setMessages((prev) => [...prev, { sender: 'bot', text: errorMessage }]);
    } finally {
      setLoading(false);
    }
  };
  
  const scrollToMessage = (index: number) => {
    messageRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setHighlightedIndex(index);
    setTimeout(() => setHighlightedIndex(null), 2000); 
  };

  const handleVoiceListen = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const userQuestions = messages
    .map((msg, index) => ({ ...msg, originalIndex: index }))
    .filter(msg => msg.sender === 'user');

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Chat History Sidebar */}
      <div className={`
        ${showHistory ? 'w-80' : 'w-0'} 
        flex-shrink-0 bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden
      `}>
        <div className="h-full flex flex-col p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Chat History</h3>
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="space-y-3">
              {userQuestions.map((msg, i) => (
                <button
                  key={i}
                  onClick={() => scrollToMessage(msg.originalIndex)}
                  className="
                    w-full text-left p-3 rounded-lg bg-primary-50 hover:bg-primary-100 
                    text-primary-700 text-sm transition-colors duration-200
                    border border-primary-100 hover:border-primary-200
                  "
                >
                  <div className="line-clamp-2">{msg.text}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/app/chats')}
                className="
                  group flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-primary-50 hover:border-primary-200
                  transition-all duration-200 text-gray-700 hover:text-primary-700
                "
                aria-label="Return to chats"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">Chats</span>
              </button>
              
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="
                  p-2 rounded-lg border border-gray-200 hover:bg-gray-50 
                  transition-colors duration-200 flex items-center justify-center
                "
                aria-label="Toggle chat history"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            
            <div className="text-2xl font-bold text-gradient-primary flex items-center space-x-2">
                <a className='flex items-center space-x-2' href="/">
                    <img src={logo} alt="MindVault Logo" className="h-6 lg:h-8" />
                    <img src={logoText} alt="MindVault Text Logo" className="h-10 lg:h-20 hidden sm:block" />
                </a>
              AI Companion
            </div>
            
            {/* Account Menu - Same as PrivateHeader */}
            <div className="relative">
              <button 
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {walletAddress ? walletAddress.slice(2, 4).toUpperCase() : 'MV'}
                  </span>
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm text-gray-900 font-medium">User</div>
                  <div className="text-xs text-gray-500 font-mono">
                    {walletAddress ? formatAddress(walletAddress) : '0x1234...5678'}
                  </div>
                </div>
                <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isAccountMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isAccountMenuOpen && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsAccountMenuOpen(false)}
                  />
                  
                  {/* Menu Content */}
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-2">
                      {/* Profile Header */}
                      <div className="p-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">
                              {walletAddress ? walletAddress.slice(2, 4).toUpperCase() : 'MV'}
                            </span>
                          </div>
                          <div>
                            <div className="text-gray-900 font-medium">Anonymous User</div>
                            <div className="text-xs text-gray-500 font-mono">
                              {walletAddress ? formatAddress(walletAddress) : '0x1234...5678'}
                            </div>
                            <div className="text-xs text-green-600 mt-1">● Connected</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Menu Items */}
                      <div className="py-2">
                        <button 
                          className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors text-left"
                          onClick={() => {
                            navigate('/app/profile');
                            setIsAccountMenuOpen(false);
                          }}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>Profile</span>
                        </button>
                        
                        <button 
                          className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors text-left"
                          onClick={() => {
                            navigate('/');
                            setIsAccountMenuOpen(false);
                          }}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Disconnect</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <div className="max-w-6xl mx-auto space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                ref={(el) => {
                  messageRefs.current[i] = el;
                }}
                className={`
                  flex transition-all duration-500
                  ${msg.sender === "user" ? "justify-end" : "justify-start"}
                  ${i === highlightedIndex ? 'bg-primary-50 -mx-4 px-4 py-2 rounded-lg' : ''}
                `}
              >
                <div
                  className={`
                    max-w-3xl p-4 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md
                    ${msg.sender === "user"
                      ? "bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-br-md"
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
                    }
                  `}
                >
                  {msg.sender === 'bot' ? (
                    <MarkdownRenderer text={msg.text} />
                  ) : (
                    <div className="text-white">{msg.text}</div>
                  )}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-bl-md shadow-sm">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-gray-500 text-sm">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end space-x-4 bg-gray-50 rounded-2xl p-3 border border-gray-200 focus-within:border-primary-300 focus-within:ring-4 focus-within:ring-primary-100 transition-all duration-200">
              {/* Voice Input Button */}
              <button
                onClick={handleVoiceListen}
                className={`
                  p-3 rounded-xl transition-all duration-200 flex items-center justify-center
                  ${isListening 
                    ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
                aria-label={isListening ? "Stop listening" : "Start voice input"}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z"/>
                </svg>
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message or speak..."
                disabled={loading}
                className="
                  flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500
                  resize-none py-3 px-2 text-base leading-relaxed
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              />

              {/* Send Button */}
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="
                  p-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl
                  hover:from-primary-700 hover:to-primary-600 disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200 transform hover:scale-105 active:scale-95
                  shadow-sm hover:shadow-md flex items-center justify-center
                "
                aria-label="Send message"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;