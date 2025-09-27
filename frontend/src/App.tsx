import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './components/PublicLayout';
import PrivateLayout from './components/PrivateLayout';
import { ChatProvider } from './contexts/ChatContext';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import AIChat from './pages/AIChat';
import './index.css';

function App() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');

  const handleConnectWallet = async () => {
    // Mock wallet connection - replace with actual Web3 integration
    try {
      // Simulate wallet connection
      setIsWalletConnected(true);
      setWalletAddress('0x1234567890abcdef1234567890abcdef12345678');
      
      // In real implementation, you would:
      // 1. Check if MetaMask is installed
      // 2. Request account access
      // 3. Get the user's wallet address
      // 4. Possibly redirect to dashboard
      
      console.log('Wallet connected successfully!');
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleDisconnectWallet = () => {
    setIsWalletConnected(false);
    setWalletAddress('');
    console.log('Wallet disconnected');
  };

  // Placeholder components for future routes
  const ComingSoonPage = ({ title }: { title: string }) => (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass-card-hero text-center max-w-2xl">
        <h1 className="text-4xl font-bold text-gradient-primary mb-4">
          {title}
        </h1>
        <p className="text-gray-300 text-lg mb-8">
          This feature is coming soon! We're working hard to bring you the best mental health experience.
        </p>
        <div className="animate-float">
          <svg className="w-16 h-16 text-primary-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
      </div>
    </div>
  );

  return (
    <ChatProvider>
      <Router>
        <div className="App">
          <Routes>
          {/* Public Routes */}
          <Route 
            path="/" 
            element={
              <PublicLayout 
                onConnectWallet={handleConnectWallet}
                isWalletConnected={isWalletConnected}
                walletAddress={walletAddress}
              />
            }
          >
            <Route index element={<Home />} />
          </Route>

          {/* Private Routes - Temporarily accessible without wallet connection */}
          <Route 
            path="/app" 
            element={
              <PrivateLayout 
                walletAddress={walletAddress}
                onDisconnectWallet={handleDisconnectWallet}
              />
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="chats" element={<Chat />} />
            <Route path="chat" element={<Chat />} />
            <Route path="private" element={<ComingSoonPage title="Private Sessions" />} />
            <Route path="ai-chat" element={<AIChat />} />
            
            {/* Default redirect to dashboard when accessing /app */}
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Redirect legacy routes */}
          <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
          <Route path="/chats" element={<Navigate to="/app/chats" replace />} />
          <Route path="/chat" element={<Navigate to="/app/chat" replace />} />
          <Route path="/private" element={<Navigate to="/app/private" replace />} />
          <Route path="/ai-chat" element={<Navigate to="/app/ai-chat" replace />} />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
    </ChatProvider>
  );
}

export default App;
