import React, { useState, useEffect } from 'react';

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
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary-600 rounded-xl flex items-center justify-center group-hover:bg-primary-700 transition-colors duration-200">
              <div className="w-6 h-6 lg:w-7 lg:h-7 relative">
                {/* Brain/Mind Icon */}
                <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-white">
                  <path 
                    d="M12 2C8.5 2 6 4.5 6 7.5c0 1.5.5 3 1.5 4C6.5 12.5 6 14 6 15.5c0 3 2.5 5.5 6 5.5s6-2.5 6-5.5c0-1.5-.5-3-1.5-4 1-1 1.5-2.5 1.5-4C18 4.5 15.5 2 12 2z" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    fill="rgba(255, 255, 255, 0.1)"
                  />
                  <circle cx="9" cy="9" r="1.5" fill="currentColor" />
                  <circle cx="15" cy="9" r="1.5" fill="currentColor" />
                  <path d="M9 15c1 1 3 1 6 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>
            
            <div className="flex flex-col">
              <div className="text-xl lg:text-2xl font-bold">
                <span className="text-primary-600">Mind</span>
                <span className="text-gray-900">Vault</span>
              </div>
              <span className="text-xs text-gray-500 -mt-1 hidden sm:block">
                Mental Wellness Platform
              </span>
            </div>
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