import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Welcome Section */}
        <div className="glass-card-hero mb-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gradient-primary mb-4">
              Welcome to Your Dashboard
            </h1>
            <p className="text-gray-300 text-lg">
              Your safe space for mental wellness in the decentralized world
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-card text-center hover:glow-cyan transition-all duration-300">
            <div className="text-3xl font-bold text-primary-400 mb-2">24</div>
            <div className="text-gray-400 text-sm">Sessions This Month</div>
          </div>
          <div className="glass-card text-center hover:glow-cyan transition-all duration-300">
            <div className="text-3xl font-bold text-primary-400 mb-2">1,250</div>
            <div className="text-gray-400 text-sm">MVT Tokens Earned</div>
          </div>
          <div className="glass-card text-center hover:glow-cyan transition-all duration-300">
            <div className="text-3xl font-bold text-primary-400 mb-2">8.5</div>
            <div className="text-gray-400 text-sm">Wellness Score</div>
          </div>
          <div className="glass-card text-center hover:glow-cyan transition-all duration-300">
            <div className="text-3xl font-bold text-primary-400 mb-2">12</div>
            <div className="text-gray-400 text-sm">Days Streak</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="glass-card">
              <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {[1,2,3,4].map((item) => (
                  <div key={item} className="flex items-center space-x-4 p-4 glass rounded-lg hover:glow-cyan transition-all duration-300">
                    <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium">Participated in support group</div>
                      <div className="text-gray-400 text-sm">2 hours ago • Earned 50 MVT</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="glass-card">
              <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="glass-btn w-full justify-start hover:glow-cyan">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Join Public Chat
                </button>
                <button className="glass-btn w-full justify-start hover:glow-cyan">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Start Private Session
                </button>
                <button className="glass-btn w-full justify-start hover:glow-cyan">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Talk to AI
                </button>
              </div>
            </div>

            {/* Wellness Goals */}
            <div className="glass-card">
              <h3 className="text-xl font-bold text-white mb-4">Today's Goals</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Mood Check-in</span>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Support Someone</span>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Meditation (10min)</span>
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;