import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { name: 'Public Chats', href: '#public-chats' },
      { name: 'Private Sessions', href: '#private-sessions' },
      { name: 'AI Support', href: '#ai-support' },
      { name: 'Community Guidelines', href: '#guidelines' },
    ],
    resources: [
      { name: 'Mental Health Resources', href: '#resources' },
      { name: 'Crisis Support', href: '#crisis' },
      { name: 'Documentation', href: '#docs' },
      { name: 'API Reference', href: '#api' },
    ],
    web3: [
      { name: 'Token Rewards', href: '#tokens' },
      { name: 'Wallet Integration', href: '#wallet' },
      { name: 'Privacy Protocol', href: '#privacy' },
      { name: 'Blockchain', href: '#blockchain' },
    ],
    company: [
      { name: 'About Us', href: '#about' },
      { name: 'Team', href: '#team' },
      { name: 'Careers', href: '#careers' },
      { name: 'Contact', href: '#contact' },
    ],
  };

  const socialLinks = [
    {
      name: 'Twitter',
      href: '#twitter',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    },
    {
      name: 'Discord',
      href: '#discord',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.193.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
        </svg>
      )
    },
    {
      name: 'Telegram',
      href: '#telegram',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.9 1.21-5.36 3.56-.51.36-.97.53-1.39.52-.45-.01-1.33-.26-1.98-.47-.8-.26-1.44-.4-1.38-.85.03-.23.36-.47.98-.72 3.85-1.68 6.43-2.79 7.75-3.33 3.69-1.54 4.46-1.81 4.96-1.81.11 0 .36.03.52.17.13.12.17.28.19.39-.01.09.01.32-.01.5z"/>
        </svg>
      )
    },
    {
      name: 'GitHub',
      href: '#github',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504c.5.092.682-.217.682-.483c0-.237-.008-.868-.013-1.703c-2.782.605-3.369-1.343-3.369-1.343c-.454-1.158-1.11-1.466-1.11-1.466c-.908-.62.069-.608.069-.608c1.003.07 1.531 1.032 1.531 1.032c.892 1.53 2.341 1.088 2.91.832c.092-.647.35-1.088.636-1.338c-2.22-.253-4.555-1.113-4.555-4.951c0-1.093.39-1.988 1.029-2.688c-.103-.253-.446-1.272.098-2.65c0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027c.546 1.379.202 2.398.1 2.651c.64.7 1.028 1.595 1.028 2.688c0 3.848-2.339 4.695-4.566 4.943c.359.309.678.92.678 1.855c0 1.338-.012 2.419-.012 2.747c0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
        </svg>
      )
    }
  ];

  return (
    <footer className="relative mt-20 border-t border-primary-500/10">

      <div className="absolute inset-0 bg-gradient-to-t from-void-950 via-void-950/80 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-transparent to-primary-600/5"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        
        <div className="pt-16 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
            

            <div className="col-span-1 md:col-span-2 lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 glass rounded-xl flex items-center justify-center glow-cyan">
                  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-primary-400">
                    <path 
                      d="M12 2C8.5 2 6 4.5 6 7.5c0 1.5.5 3 1.5 4C6.5 12.5 6 14 6 15.5c0 3 2.5 5.5 6 5.5s6-2.5 6-5.5c0-1.5-.5-3-1.5-4 1-1 1.5-2.5 1.5-4C18 4.5 15.5 2 12 2z" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      fill="rgba(34, 211, 238, 0.1)"
                    />
                    <circle cx="9" cy="9" r="1.5" fill="currentColor" />
                    <circle cx="15" cy="9" r="1.5" fill="currentColor" />
                    <path d="M9 15c1 1 3 1 6 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">
                    <span className="text-cyan-400">Mind</span>
                    <span className="text-white">Vault</span>
                  </h3>
                  <p className="text-sm text-gray-400">Decentralized Mental Wellness</p>
                </div>
              </div>
              
              <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-sm">
                A safe, anonymous, and decentralized platform for mental health support. 
                Connect, share, and heal with AI-powered empathy and community care.
              </p>
              
              <div className="flex items-center space-x-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="glass w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 hover:text-primary-400 hover:glow-cyan transition-all duration-300"
                    aria-label={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>


            <div className="col-span-1">
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Platform</h4>
              <ul className="space-y-3">
                {footerLinks.platform.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="text-gray-400 hover:text-primary-400 text-sm transition-colors duration-300">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-1">
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Resources</h4>
              <ul className="space-y-3">
                {footerLinks.resources.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="text-gray-400 hover:text-primary-400 text-sm transition-colors duration-300">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-1">
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Web3</h4>
              <ul className="space-y-3">
                {footerLinks.web3.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="text-gray-400 hover:text-primary-400 text-sm transition-colors duration-300">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-1">
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Company</h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="text-gray-400 hover:text-primary-400 text-sm transition-colors duration-300">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-500/10 py-8">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
            
            <div className="glass-card p-4 flex items-center space-x-3 glow-cyan">
              <div className="w-6 h-6 text-red-400">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
              </div>
              <div>
                <p className="text-red-400 text-sm font-medium">
                  Crisis? Call 988 (US) or your local emergency number
                </p>
                <p className="text-gray-500 text-xs">
                  This platform is not a replacement for professional help
                </p>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row items-center space-y-2 lg:space-y-0 lg:space-x-8 text-sm text-gray-500">
              <span>© {currentYear} MindVault. All rights reserved.</span>
              <div className="flex items-center space-x-6">
                <a href="#privacy" className="hover:text-primary-400 transition-colors duration-300">
                  Privacy Policy
                </a>
                <a href="#terms" className="hover:text-primary-400 transition-colors duration-300">
                  Terms of Service
                </a>
                <a href="#cookies" className="hover:text-primary-400 transition-colors duration-300">
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-10 right-10 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-10 left-10 w-24 h-24 bg-primary-600/5 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
    </footer>
  );
};

export default Footer;