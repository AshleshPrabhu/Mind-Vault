import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { API_BASE_URL, IS_DEV_MODE } from '../config';

interface User {
  id: number;
  username: string;
  profilePicture: string;
  walletAddress: string;
  type: string;
  role?: 'USER' | 'VALIDATOR';
  createdAt: string;
  updatedAt: string;
}

interface WalletContextType {
  isWalletModalOpen: boolean;
  openWalletModal: () => void;
  closeWalletModal: () => void;
  disconnectWallet: () => void;
  isConnected: boolean;
  address?: string;
  user?: User | null;
  isLoading: boolean;
  isInitializing: boolean;
  createOrLoginUser: (address: string) => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: React.ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  // Function to create or login user
  const createOrLoginUser = async (walletAddress: string) => {
    // Prevent multiple simultaneous calls for the same address
    if (isLoading || user?.walletAddress === walletAddress) {
      return user;
    }

    try {
      setIsLoading(true);
      console.log('Creating/logging in user for address:', walletAddress);
      
      const response = await fetch(`${API_BASE_URL}/user/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: walletAddress,
          type: 'USER' // Default user type
        }),
      });

      if (!response.ok) {
        if (response.status === 0 || !navigator.onLine) {
          throw new Error('Network error. Please check your internet connection and ensure the backend server is running.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.user) {
        // Store user data in localStorage
        localStorage.setItem('mindvault_user', JSON.stringify(data.user));
        setUser(data.user);
        
        // Close wallet modal - navigation will be handled by the calling component
        setIsWalletModalOpen(false);
        console.log('User created/logged in successfully:', data.user);
        return data.user;
      } else {
        console.error('Failed to create/login user:', data.message);
        throw new Error(data.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating/logging in user:', error);
      
      // In development mode, create a mock user if backend is not available
      if (IS_DEV_MODE && error instanceof Error && error.message.includes('Network error')) {
        console.warn('Backend not available, creating mock user for development');
        const mockUser = {
          id: Date.now(),
          username: `dev-user-${Math.floor(Math.random() * 1000)}`,
          profilePicture: `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${walletAddress}`,
          walletAddress,
          type: 'USER',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        localStorage.setItem('mindvault_user', JSON.stringify(mockUser));
        setUser(mockUser);
        setIsWalletModalOpen(false);
        console.log('Mock user created:', mockUser);
        return mockUser;
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('mindvault_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log('Restored user from localStorage:', parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('mindvault_user');
      }
    }
    setIsInitializing(false);
  }, []);

  // Handle explicit wallet disconnection
  // Note: We don't automatically clear user on !isConnected because 
  // the wallet might just be reconnecting on page reload
  useEffect(() => {
    // Only clear user if we have a user but no address (meaning explicit disconnect)
    if (user && !address && isConnected === false) {
      // Add a small delay to avoid clearing during initial load
      const timer = setTimeout(() => {
        if (!address && isConnected === false) {
          setUser(null);
          localStorage.removeItem('mindvault_user');
        }
      }, 2000); // 2 second delay to allow wallet to reconnect
      
      return () => clearTimeout(timer);
    }
  }, [address, isConnected, user]);

  const openWalletModal = () => {
    setIsWalletModalOpen(true);
  };

  const closeWalletModal = () => {
    setIsWalletModalOpen(false);
  };

  const disconnectWallet = () => {
    disconnect();
    setUser(null);
    localStorage.removeItem('mindvault_user');
    // Navigation will be handled by the component that calls this
  };

  const value: WalletContextType = {
    isWalletModalOpen,
    openWalletModal,
    closeWalletModal,
    disconnectWallet,
    isConnected,
    address,
    user,
    isLoading,
    isInitializing,
    createOrLoginUser,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};