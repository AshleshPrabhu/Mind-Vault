import React from 'react';
import { useConnect, useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import Modal from './ui/modal';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { connectors, connect, isPending } = useConnect();
  const { isConnected, address } = useAccount();
  const { isLoading, createOrLoginUser, user } = useWallet();
  const navigate = useNavigate();
  const [hasProcessedConnection, setHasProcessedConnection] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isConnected && address && isOpen && !isLoading && !user && !hasProcessedConnection) {
      setHasProcessedConnection(true);
      setError(null);
      createOrLoginUser(address)
        .then(() => {
          navigate('/app/chats');
        })
        .catch((err) => {
          console.error('Failed to create/login user:', err);
          setHasProcessedConnection(false); 
          setError(err instanceof Error ? err.message : 'Failed to create account');
        });
    }
  }, [isConnected, address, isOpen, isLoading, user, hasProcessedConnection, createOrLoginUser, navigate]);

  React.useEffect(() => {
    if (!isOpen || !isConnected) {
      setHasProcessedConnection(false);
      setError(null);
    }
  }, [isOpen, isConnected]);

  const handleConnect = (connector: any) => {
    connect({ connector });
  };

  const getConnectorIcon = (connectorName: string) => {
    switch (connectorName.toLowerCase()) {
      case 'metamask':
        return (
          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-200">
            <svg className="w-5 h-5 text-white" viewBox="0 0 318.6 318.6" fill="currentColor">
              <path d="M274.1 35.5l-99.5 73.9L193 65.8z" fill="#e2761b" stroke="#e2761b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5.94"/>
              <path d="m44.4 35.5 98.7 74.6-17.5-44.3z" fill="#e4761b" stroke="#e4761b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5.94"/>
              <path d="m238.3 206.8-26.5 40.6 56.7 15.6 16.3-55.3z" fill="#e4761b" stroke="#e4761b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5.94"/>
              <path d="m33.9 207.7 16.2 55.3 56.7-15.6-26.5-40.6z" fill="#e4761b" stroke="#e4761b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5.94"/>
              <path d="m103.6 138.2-15.8 23.9 56.3 2.5-1.9-60.6z" fill="#e4761b" stroke="#e4761b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5.94"/>
              <path d="m214.9 138.2-39-34.8-1.3 61.2 56.2-2.5z" fill="#e4761b" stroke="#e4761b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5.94"/>
              <path d="m106.8 247.4 33.8-16.5-29.2-22.8z" fill="#e4761b" stroke="#e4761b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5.94"/>
              <path d="m177.9 230.9 33.9 16.5-4.7-39.3z" fill="#e4761b" stroke="#e4761b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5.94"/>
            </svg>
          </div>
        );
      case 'walletconnect':
        return (
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-200">
            <svg className="w-5 h-5 text-white" viewBox="0 0 480 332" fill="currentColor">
              <path d="M126.613 93.9842C181.563 39.2969 270.781 39.2969 325.731 93.9842L334.226 102.431C337.068 105.251 337.068 109.884 334.226 112.705L305.785 140.909C304.364 142.319 302.088 142.319 300.667 140.909L289.507 129.816C256.189 96.6579 200.156 96.6579 166.838 129.816L154.87 141.721C153.449 143.131 151.173 143.131 149.752 141.721L121.311 113.517C118.469 110.696 118.469 106.063 121.311 103.243L126.613 93.9842ZM368.539 144.234L394.33 169.831C397.172 172.652 397.172 177.285 394.33 180.105L274.909 298.684C272.067 301.504 267.397 301.504 264.555 298.684C264.555 298.684 264.555 298.684 264.554 298.684L191.062 225.316C190.352 224.608 189.155 224.608 188.445 225.316C188.445 225.316 188.445 225.316 188.444 225.316L114.952 298.684C112.11 301.504 107.44 301.504 104.598 298.684C104.598 298.684 104.598 298.684 104.597 298.684L-14.8237 180.105C-17.6657 177.285 -17.6657 172.652 -14.8237 169.831L10.9673 144.234C13.8093 141.413 18.4799 141.413 21.3219 144.234L94.8137 217.602C95.5236 218.31 96.7209 218.31 97.4308 217.602C97.4308 217.602 97.4308 217.602 97.4309 217.602L170.923 144.234C173.765 141.413 178.435 141.413 181.277 144.234C181.277 144.234 181.277 144.234 181.278 144.234L254.77 217.602C255.48 218.31 256.677 218.31 257.387 217.602L330.879 144.234C333.721 141.413 338.391 141.413 341.233 144.234L368.539 144.234Z"/>
            </svg>
          </div>
        );
      case 'brave wallet':
        return (
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-200">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L3.09 8.26L4 21L12 18L20 21L20.91 8.26L12 2Z"/>
            </svg>
          </div>
        );
      case 'coinbase wallet':
        return (
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-200">
            <svg className="w-5 h-5 text-white" viewBox="0 0 1024 1024" fill="currentColor">
              <path d="M512 0C229.12 0 0 229.12 0 512s229.12 512 512 512 512-229.12 512-512S794.88 0 512 0zm0 692c-99.41 0-180-80.59-180-180s80.59-180 180-180 180 80.59 180 180-80.59 180-180 180z"/>
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-700 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-200">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Connect Your Wallet"
      className=""
    >
      <div className="space-y-4">
        <div className="mb-4">
          <p className="text-gray-600 text-sm leading-relaxed">
            Choose your preferred wallet to connect to <span className="font-semibold text-primary-600">MindVault</span>.
          </p>
          <div className="mt-2 flex items-center text-xs text-gray-500">
            <svg className="w-3 h-3 mr-1.5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Secure and anonymous
          </div>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          {connectors.map((connector) => (
            <button
              key={connector.uid}
              onClick={() => handleConnect(connector)}
              disabled={isPending || isLoading}
              className="w-full flex items-center space-x-3 p-3 border-2 border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 active:bg-primary-100 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 min-h-[52px] touch-manipulation"
            >
              {getConnectorIcon(connector.name)}
              <div className="flex-1 text-left min-w-0">
                <div className="font-semibold text-gray-900 group-hover:text-primary-700 text-sm truncate">
                  {connector.name}
                </div>
                <div className="text-xs text-gray-500 mt-0.5 truncate">
                  {isLoading ? 'Creating account...' : (
                    <>
                      {connector.name === 'MetaMask' && 'Browser extension'}
                      {connector.name === 'WalletConnect' && 'Scan to connect'}
                      {connector.name === 'Injected' && 'Injected wallet'}
                      {!['MetaMask', 'WalletConnect', 'Injected'].includes(connector.name) && 'Connect wallet'}
                    </>
                  )}
                </div>
              </div>
              {(isPending || isLoading) ? (
                <div className="w-6 h-6">
                  <svg className="animate-spin text-primary-600 w-full h-full" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : (
                <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
        
        <div className="pt-3 mt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center leading-tight">
            By connecting, you agree to our{' '}
            <a href="#" className="text-primary-600 hover:text-primary-700 underline underline-offset-1 transition-colors">Terms</a>
            {' '}and{' '}
            <a href="#" className="text-primary-600 hover:text-primary-700 underline underline-offset-1 transition-colors">Privacy Policy</a>
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default WalletModal;