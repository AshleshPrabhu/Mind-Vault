import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ContainerTextFlip } from '../components/ui/container-text-flip';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleConnectWallet = async () => {
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
              Connect with people and supportive communities in a completely private, decentralized environment designed for your mental wellness journey.
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
      <section id='features' className="py-8 bg-gray-50">
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
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Earn ASH Tokens</h3>
              <p className="text-gray-600 leading-relaxed">
                Support your peers in their mental health journey and earn ASH tokens as rewards for meaningful contributions to the community.
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

      {/* Community Section */}
      <section id='community' className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Join Our Supportive Community
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Connect with like-minded individuals, share experiences, and grow together in a safe, anonymous environment designed for mental wellness support.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            
            {/* Discussion Spaces */}
            <div className="card-lg group transition-all duration-300">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-transform duration-300">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Find Your Circle</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Join public chatrooms based on topics that matter to you
                </p>
                
                {/* Topic Tags */}
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  <span className="px-3 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                    Stress & Anxiety
                  </span>
                  <span className="px-3 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                    Sleep & Relaxation
                  </span>
                  <span className="px-3 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                    Work-Life Balance
                  </span>
                </div>
                
                <div className="space-y-3 text-left">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-600">Participate in private circles for deeper, personal discussions</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-600">Share thoughts freely in a secure, supportive environment</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Peer-to-Peer Support */}
            <div className="card-lg group transition-all duration-300">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-primary-600 to-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-transform duration-300">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Support Each Other</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Connect with peers and build meaningful support networks
                </p>
                
                {/* Support Features */}
                <div className="bg-primary-50 px-3 py-2 rounded-xl mb-6">
                  <div className="text-primary-600 font-semibold text-sm">Anonymous Peer Matching</div>
                </div>
                
                <div className="space-y-3 text-left">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-600">Connect anonymously and offer encouragement</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-600">Regular check-ins with trusted community members</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;