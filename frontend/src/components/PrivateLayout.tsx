import React from 'react';
import { Outlet } from 'react-router-dom';
import PrivateHeader from '../components/PrivateHeader';

interface PrivateLayoutProps {
  walletAddress?: string;
  onDisconnectWallet?: () => void;
}

const PrivateLayout: React.FC<PrivateLayoutProps> = ({ 
  walletAddress, 
  onDisconnectWallet 
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <PrivateHeader 
        walletAddress={walletAddress}
        onDisconnectWallet={onDisconnectWallet}
      />
      <main> {/* Add padding to account for fixed header */}
        <Outlet />
      </main>
    </div>
  );
};

export default PrivateLayout;