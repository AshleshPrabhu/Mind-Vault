import React, { useState, useEffect } from 'react';
import logo from '../assets/logo_only.png';
import logoText from '../assets/logo_text.png';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import WalletModal from './WalletModal';

interface HeaderProps {}

const Header: React.FC<HeaderProps> = () => {
  const { 
    isConnected, 
    address, 
    user,
    openWalletModal, 
    closeWalletModal, 
    isWalletModalOpen, 
    disconnectWallet 
  } = useWallet();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleDisconnect = () => {
    disconnectWallet();
    navigate('/');
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const navItems = [
    { name: 'Features', href: '/#features' },
    { name: 'Demo', href: '/demo' },
    { name: 'About', href: '/about' },
  ];

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'nav backdrop-blur-sm' 
          : 'bg-white/95 backdrop-blur-sm'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          
          {/* Logo Section */}
          <a className='flex items-center space-x-2' href="/">
            <img src={logo} alt="MindVault Logo" className="h-12 lg:h-14" />
            <img src={logoText} alt="MindVault Text Logo" className="h-6 lg:h-24 hidden sm:block" />
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="text-gray-600 hover:text-primary-600 font-medium transition-colors duration-200"
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Wallet Connection & Mobile Menu */}
          <div className="flex items-center space-x-4">
            
            {/* Wallet Connection Button */}
            {!isConnected ? (
              <button
                onClick={openWalletModal}
                className="btn btn-primary text-sm lg:text-base"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Connect Wallet
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="card px-3 py-2 flex items-center space-x-2 bg-primary-50 relative group">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-primary-700">
                    {user?.username || (address && formatAddress(address))}
                  </span>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-3 border-b border-gray-100">
                      {user && (
                        <div className="mb-2">
                          <div className="text-xs text-gray-500 mb-1">Username</div>
                          <div className="text-sm font-semibold text-gray-900">{user.username}</div>
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mb-1">Connected Wallet</div>
                      <div className="text-sm font-mono text-gray-900">{address && formatAddress(address)}</div>
                    </div>
                    <button
                      onClick={handleDisconnect}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Disconnect Wallet
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden card p-2"
            >
              <div className="w-6 h-6 relative">
                <span className={`absolute top-1 left-0 w-full h-0.5 bg-primary-600 transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 top-3' : ''}`}></span>
                <span className={`absolute top-3 left-0 w-full h-0.5 bg-primary-600 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`absolute top-5 left-0 w-full h-0.5 bg-primary-600 transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 top-3' : ''}`}></span>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`lg:hidden transition-all duration-300 overflow-hidden ${
        isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="nav border-t border-gray-200 px-4 py-4 space-y-2">
          {navItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-gray-600 hover:text-primary-600 font-medium transition-colors duration-200"
            >
              {item.name}
            </a>
          ))}
          
          {/* Mobile Wallet Info */}
          {!isConnected ? (
            <button
              onClick={openWalletModal}
              className="w-full btn btn-primary text-sm mt-4"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Connect Wallet
            </button>
          ) : (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="card p-3 bg-primary-50 mb-3">
                <div className="space-y-2">
                  {user && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-primary-700 font-semibold">
                        {user.username}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <div className="w-1 h-1 bg-gray-400 rounded-full ml-0.5"></div>
                    <span className="text-xs text-gray-500 font-mono">
                      {address && formatAddress(address)}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleDisconnect}
                className="w-full text-left p-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Disconnect Wallet
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Wallet Modal */}
      <WalletModal 
        isOpen={isWalletModalOpen} 
        onClose={closeWalletModal} 
      />
    </header>
  );
};

export default Header;