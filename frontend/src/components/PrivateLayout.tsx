import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import PrivateHeader from '../components/PrivateHeader';

interface PrivateLayoutProps {
  walletAddress?: string;
  onDisconnectWallet?: () => void;
}

const PrivateLayout: React.FC<PrivateLayoutProps> = ({ 
  walletAddress, 
  onDisconnectWallet 
}) => {
  const location = useLocation();
  
  // Hide PrivateHeader on AI Chat page since it has its own header
  const shouldShowHeader = !location.pathname.includes('/app/ai-chat');

  return (
    <div className="min-h-screen bg-gray-50">
      {shouldShowHeader && (
        <PrivateHeader 
          walletAddress={walletAddress}
          onDisconnectWallet={onDisconnectWallet}
        />
      )}
      <main> {/* Add padding to account for fixed header */}
        <Outlet />
      </main>
    </div>
  );
};

export default PrivateLayout;