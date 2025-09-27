import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { useChatContext } from '../contexts/ChatContext';
import logo from '../assets/logo_only.png';
import logoText from '../assets/logo_text.png';

interface PrivateHeaderProps {
  walletAddress?: string;
  onDisconnectWallet?: () => void;
}

const PrivateHeader: React.FC<PrivateHeaderProps> = ({ 
  walletAddress, 
  onDisconnectWallet
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const navigate = useNavigate();
  // const location = useLocation();
  // const { currentChatType } = useChatContext();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Check if we should show history tab (only for public chats)
  // const isOnChatPage = location.pathname.includes('/chat') || location.pathname.includes('/chats');
  // const shouldShowHistory = false; // Removed - history is now in ChatMain header

  const baseNavItems = [
    { name: 'Chats', href: '/app/chats', icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    )},
  ];

  // Use baseNavItems directly (no dynamic history tab)
  const navItems = baseNavItems;

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <nav className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Section */}
          <div className='flex items-center space-x-2'>
            <img src={logo} alt="MindVault Logo" className="h-10 lg:h-12" />
            <img src={logoText} alt="MindVault Text Logo" className="h-6 lg:h-20 hidden sm:block" />
          </div>


          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.filter(item => item && item.href).map((item, index) => (
              <button
                key={index}
                onClick={() => navigate(item.href)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === item.href 
                    ? 'bg-primary-50 text-primary-600 border border-primary-200' 
                    : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-current">
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </button>
            ))}
          </div>

          {/* Right Side - Notifications & Profile */}
          <div className="flex items-center space-x-4">
            
            

            {/* Account Menu - Custom Dropdown */}
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
                            onDisconnectWallet?.();
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

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg"
            >
              <div className="w-6 h-6 relative">
                <span className={`absolute top-1 left-0 w-full h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 top-3' : ''}`}></span>
                <span className={`absolute top-3 left-0 w-full h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`absolute top-5 left-0 w-full h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 top-3' : ''}`}></span>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`lg:hidden transition-all duration-300 overflow-hidden ${
        isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="bg-gray-50 border-t border-gray-200 px-4 py-4 space-y-2">
          {navItems.filter(item => item && item.href).map((item, index) => (
            <button
              key={index}
              onClick={() => {
                navigate(item.href);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 bg-white rounded-lg text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 border border-gray-100"
            >
              {item.icon}
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

export default PrivateHeader;