import React from 'react';
import { Linkedin, Heart, Code, Users } from 'lucide-react';

const About: React.FC = () => {
  const teamMembers = [
    {
      name: "Vidith Venkatesha Murthy",
      role: "Developer",
      description: "Passionate about building innovative mental health solutions with cutting-edge technology. Specializes in AI integration and user experience design.",
      linkedin: "https://www.linkedin.com/in/vidith-venkatesha-murthy?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
      avatar: "V",
      gradient: "from-primary-500 to-primary-600"
    },
    {
      name: "Vamshikrishna V Bidari",
      role: "Developer",
      description: "Dedicated to creating intuitive and accessible user interfaces. Combines design thinking with technical expertise to enhance user experiences.",
      linkedin: "https://www.linkedin.com/in/vamshikrishna-v-bidari-154080329?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
      avatar: "VK",
      gradient: "from-primary-600 to-primary-700"
    },
    {
      name: "Ashlesh Prabhu",
      role: "Developer",
      description: "Interested in decentralized technologies and smart contract development. Focused on creating secure, anonymous platforms for mental health support.",
      linkedin: "https://www.linkedin.com/in/ashlesh-prabhu-bb457b312/",
      avatar: "A",
      gradient: "from-primary-700 to-primary-800"
    }
  ];

  const values = [
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Mental Health First",
      description: "We prioritize user wellbeing and create safe spaces for healing and growth."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Community Driven",
      description: "Building supportive networks where people can connect and help each other."
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: "Innovation & Privacy",
      description: "Leveraging Web3 and AI technologies to ensure complete anonymity and security."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-primary-50 via-white to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              About <span className="text-gradient-primary">MindVault</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              We're a passionate team of developers and designers committed to revolutionizing mental health support through innovative Web3 technologies and AI-powered solutions.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                MindVault was born from a simple but powerful belief: everyone deserves access to mental health support in a safe, anonymous, and judgement-free environment.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                By combining the power of Web3 technology with AI-driven support systems, we're creating a platform where users can connect, share, and heal while maintaining complete privacy and earning rewards for supporting their peers.
              </p>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-r from-primary-800 to-primary-600 rounded-3xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Why MindVault?</h3>
                <ul className="space-y-4">
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <span>Complete anonymity through blockchain technology</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <span>24/7 AI-powered mental health assistance</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <span>Earn ASH tokens by supporting community members</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <span>Peer-to-peer support networks</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We're a diverse team of passionate individuals united by our commitment to making mental health support accessible to everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index}>
                <div className="card-lg text-center">
                  {/* Avatar */}
                  <div className={`w-24 h-24 bg-gradient-to-r ${member.gradient} rounded-full flex items-center justify-center mx-auto mb-6`}>
                    <span className="text-3xl font-bold text-white">{member.avatar}</span>
                  </div>

                  {/* Member Info */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-primary-600 font-medium mb-4">{member.role}</p>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">{member.description}</p>

                  {/* Social Links */}
                  <div className="flex justify-center space-x-4">
                    <a 
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center"
                    >
                      <Linkedin className="w-5 h-5 text-primary-600" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;