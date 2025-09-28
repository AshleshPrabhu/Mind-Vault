import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Bot, User, ArrowRight, Star } from 'lucide-react';
import chatRoomSS from "../assets/Screenshot001.png"
import aiChatSS from "../assets/Screenshot002.png"
import profileSS from "../assets/Screenshot003.png"

const Demo: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/app/chats');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Star className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-medium">Live Demo</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              See MindVault in Action
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
              Experience the future of mental health support with Web3 technology. 
              Watch how our platform creates safe, anonymous spaces for meaningful connections.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <div className="aspect-video bg-gray-900 rounded-xl flex items-center justify-center relative overflow-hidden">
                {/* <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 hover:bg-white/20 transition-colors cursor-pointer group">
                      <Play className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="text-2xl font-semibold text-white mb-2">Demo Video</h3>
                    <p className="text-white/70">Coming Soon - Full Platform Walkthrough</p>
                  </div>
                </div> */}
                
                <iframe
                  className="w-full h-full rounded-lg"
                  src="https://www.youtube.com/embed/Dhnbe8IFn64?si=nfv72p1_I2wGt_XK"
                  title="MindVault Demo Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                >
                </iframe>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Platform Features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore the key features that make MindVault a revolutionary platform for mental health support
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
            <div className="group">
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-br from-blue-50 to-primary-50 flex items-center justify-center relative overflow-hidden">
                  <img 
                    src={chatRoomSS}
                    alt="Chat Room Interface"
                    className="w-full h-full"
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <MessageCircle className="w-6 h-6 text-primary-600 mr-3" />
                    Anonymous Chat Rooms
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Connect with others in secure, anonymous chat rooms. Share experiences, 
                    offer support, and build meaningful connections without compromising your privacy.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                      End-to-end encryption with Lit Protocol
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                      Global and private conversation options
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                      Real-time messaging with Socket.io
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="group">
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center relative overflow-hidden">
                  <img 
                    src={aiChatSS} 
                    alt="AI Chatbot Interface"
                    className="w-full h-full"
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <Bot className="w-6 h-6 text-purple-600 mr-3" />
                    AI Mental Health Assistant
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Get instant support from our AI-powered mental health assistant. 
                    Available 24/7 to provide guidance, resources, and emotional support.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                      Trained on mental health best practices
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                      Personalized conversation and support
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                      Crisis intervention and resource referrals
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="group mb-20">
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-center">
                <div className="lg:aspect-video bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center relative overflow-hidden">
                  <img 
                    src={profileSS}
                    alt="User Profile Interface"
                    className="w-full h-full"
                  />
                </div>
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <User className="w-6 h-6 text-green-600 mr-3" />
                    Personal Dashboard
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Track your mental health journey with personalized analytics, 
                    manage your ASH token earnings, and access your support network all in one place.
                  </p>
                  <ul className="space-y-3 text-sm text-gray-600 mb-8">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                      Community ranking and engagement metrics
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                      ASH token balance and donation history
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                      Personalized mental health insights
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                      Privacy-first profile management
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Experience MindVault?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join our supportive community and start your mental wellness journey today.
          </p>
          <button 
            onClick={handleGetStarted}
            className="inline-flex items-center space-x-2 bg-white text-primary-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <span>Try MindVault Now</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Built with Modern Technology</h3>
            <p className="text-gray-600">Leveraging cutting-edge Web3 and AI technologies</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">⚛️</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">React 19</h4>
              <p className="text-sm text-gray-600">Modern UI Framework</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">🔗</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Web3</h4>
              <p className="text-sm text-gray-600">Blockchain Integration</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">🔒</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Lit Protocol</h4>
              <p className="text-sm text-gray-600">Decentralized Encryption</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">🤖</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">AI Assistant</h4>
              <p className="text-sm text-gray-600">Mental Health Support</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Demo;