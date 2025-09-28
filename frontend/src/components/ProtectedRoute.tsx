import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import WalletModal from './WalletModal';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = "/" 
}) => {
  const { isConnected, user, isLoading, isInitializing, isWalletModalOpen, openWalletModal, closeWalletModal } = useWallet();

  useEffect(() => {
    if (!isInitializing && !isConnected && !user && !isWalletModalOpen && !isLoading) {
  
      const timer = setTimeout(() => {
        if (!isConnected && !user && !isWalletModalOpen) {
          openWalletModal();
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isInitializing, isConnected, user, isWalletModalOpen, isLoading, openWalletModal]);

  if (isInitializing || isLoading || (user && !isConnected)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-4">
            <svg className="animate-spin text-primary-600 w-full h-full" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-gray-600">
            {isInitializing ? 'Loading your session...' : 
             isLoading ? 'Setting up your account...' : 
             'Reconnecting to wallet...'}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6">
              You need to connect your wallet to access MindVault's mental health platform and features.
            </p>
            <button
              onClick={openWalletModal}
              className="btn btn-primary"
            >
              Connect Wallet
            </button>
            <div className="mt-4">
              <Navigate to={redirectTo} replace />
            </div>
          </div>
        </div>
        
        <WalletModal 
          isOpen={isWalletModalOpen} 
          onClose={closeWalletModal} 
        />
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;