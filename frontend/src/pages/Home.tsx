import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ContainerTextFlip } from '../components/ui/container-text-flip';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleConnectWallet = async () => {
    // This will trigger the wallet connection in the parent App component
    // For now, we'll just navigate (in real implementation, this would be handled by a context or prop)
    navigate('/app/dashboard');
  };

  return (
    <div className="min-h-screen bg-white scrollbar-thin -mt-8">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column - Content */}
          <div className="text-left space-y-6">
            <h1 className="text-4xl sm:text-3xl lg:text-6xl font-bold text-gray-900 leading-tight tracking-tight">
              Get mental health support
              <br />
              <ContainerTextFlip className='text-primary-600' />
              <br />
              all through Web3.
            </h1>

            <p className="text-xl text-gray-600 max-w-lg font-normal leading-relaxed">
              Connect with licensed professionals and supportive communities in a completely private, decentralized environment designed for your mental wellness journey.
            </p>

            <button 
              onClick={handleConnectWallet}
              className="btn btn-primary text-lg px-8 py-4 text-white font-medium"
            >
              Get started →
            </button>
          </div>

          {/* Right Column - Mental Health Collaboration Visual */}
          <div className="relative">
            <div className="max-w-lg mx-auto lg:mx-0">
              <img 
                src="https://img.freepik.com/free-vector/people-connecting-jigsaw-pieces-head-together_53876-59847.jpg" 
                alt="Mental health collaboration and support"
                className="w-full h-auto rounded-2xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview Section */}
      <section id='features' className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Mental wellness support designed for everyone
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform provides comprehensive mental health support through anonymous connections, professional guidance, and community-driven wellness programs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.993 1.993 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Anonymous Support</h3>
              <p className="text-gray-600 leading-relaxed">
                Connect with others and share your experiences in a completely anonymous environment that protects your privacy.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Private Sessions</h3>
              <p className="text-gray-600 leading-relaxed">
                Book one-on-one sessions with licensed mental health professionals for personalized support and guidance.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">24/7 AI Assistant</h3>
              <p className="text-gray-600 leading-relaxed">
                Access immediate support through our AI-powered mental health assistant, available whenever you need help.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;