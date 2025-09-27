import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';

interface PublicLayoutProps {
  onConnectWallet?: () => void;
  isWalletConnected?: boolean;
  walletAddress?: string;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ 
  onConnectWallet, 
  isWalletConnected, 
  walletAddress 
}) => {
  return (
    <div className="min-h-screen bg-white">
      <Header 
        onConnectWallet={onConnectWallet}
        isWalletConnected={isWalletConnected}
        walletAddress={walletAddress}
      />
      <main className="pt-16 lg:pt-20">
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout;