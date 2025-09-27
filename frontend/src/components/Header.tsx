import React, { useState, useEffect } from 'react';
import logo from '../assets/logo_only.png';
import logoText from '../assets/logo_text.png';

interface HeaderProps {
  onConnectWallet?: () => void;
  isWalletConnected?: boolean;
  walletAddress?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  onConnectWallet, 
  isWalletConnected = false, 
  walletAddress 
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    { name: 'Features', href: '#features' },
    { name: 'Community', href: '#community' },
    { name: 'About', href: '#about' },
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
          <div className='flex items-center space-x-2'>
            <img src={logo} alt="MindVault Logo" className="h-12 lg:h-14" />
            <img src={logoText} alt="MindVault Text Logo" className="h-6 lg:h-24 hidden sm:block" />
          </div>

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
            {!isWalletConnected ? (
              <button
                onClick={onConnectWallet}
                className="btn btn-primary text-sm lg:text-base"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Connect Wallet
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="card px-3 py-2 flex items-center space-x-2 bg-primary-50">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-mono text-primary-700">
                    {walletAddress && formatAddress(walletAddress)}
                  </span>
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
          {isWalletConnected && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="card p-3 bg-primary-50">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-primary-700">
                    Connected: {walletAddress && formatAddress(walletAddress)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;