import React, { useState } from 'react';
import { Wallet, History, Heart, TrendingUp, ArrowUpRight, X } from 'lucide-react';

const Profile: React.FC = () => {
  const [ashBalance] = useState(2847.63); // User's current ASH token balance
  const [selectedNGO, setSelectedNGO] = useState<any>(null);
  const [donationAmount, setDonationAmount] = useState('');
  const [showDonationDialog, setShowDonationDialog] = useState(false);

  // Dummy donation history data
  const donationHistory = [
    {
      id: 1,
      ngoName: "Hope for Tomorrow Mental Health Foundation",
      amount: 150.50,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      status: "Completed",
      txHash: "0xa1b2c3d4e5f6..."
    },
    {
      id: 2,
      ngoName: "Mindfulness Care Alliance",
      amount: 75.25,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      status: "Completed",
      txHash: "0xb2c3d4e5f6g7..."
    },
    {
      id: 3,
      ngoName: "Mental Wellness Support Network",
      amount: 200.00,
      date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
      status: "Completed",
      txHash: "0xc3d4e5f6g7h8..."
    },
    {
      id: 4,
      ngoName: "Peaceful Minds Initiative",
      amount: 88.90,
      date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
      status: "Completed",
      txHash: "0xd4e5f6g7h8i9..."
    },
    {
      id: 5,
      ngoName: "Community Mental Health Center",
      amount: 320.15,
      date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000), // 18 days ago
      status: "Completed",
      txHash: "0xe5f6g7h8i9j0..."
    }
  ];

  // NGO data with the provided image URLs
  const ngoData = [
    {
      id: 1,
      name: "Hope for Tomorrow Foundation",
      description: "Providing comprehensive mental health support and counseling services to underserved communities worldwide.",
      impact: "50,000+ lives impacted",
      image: "https://skchildrenfoundation.org/wp-content/uploads/2022/10/skcf5.png",
      focus: "Youth Mental Health",
      rating: 4.9
    },
    {
      id: 2,
      name: "Mindfulness Care Alliance", 
      description: "Dedicated to promoting mental wellness through mindfulness practices, therapy, and community support programs.",
      impact: "25,000+ people served",
      image: "https://globalindiannetwork.com/wp-content/uploads/mental-health-ngos-in-india.webp",
      focus: "Community Wellness",
      rating: 4.8
    },
    {
      id: 3,
      name: "Mental Wellness Network",
      description: "Building bridges to mental health resources and breaking stigma through education and awareness campaigns.",
      impact: "100,000+ awareness reached",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTu9vEE5UZTj_Mh56ytaqBRAL19dKdLuKEuqA&s",
      focus: "Stigma Reduction", 
      rating: 4.7
    }
  ];

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Calculate totals from donation history
  const totalDonated = donationHistory.reduce((sum, donation) => sum + donation.amount, 0);
  const totalDonations = donationHistory.length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-2">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-xl font-bold">MV</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600">Manage your MindVault account and contributions</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Balance & History */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. Balance Tokens Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">ASH Token Balance</h2>
                    <p className="text-primary-200 text-sm">Your available tokens for donations</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-4xl font-bold text-gray-900 mb-2">
                      {formatNumber(ashBalance)} <span className="text-2xl text-primary-600">ASH</span>
                    </div>
                    <div className="flex items-center space-x-2 text-green-600">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm font-medium">+5.2% from last month</span>
                    </div>
                  </div>
                  <div className="w-24 h-24 bg-gradient-to-br from-primary-600/10 to-primary-600/5 rounded-full flex items-center justify-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">ASH</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between gap-4">
                  <div className="bg-gray-50 rounded-xl p-4 text-center flex-1">
                    <div className="text-2xl font-bold text-gray-900">{formatNumber(totalDonated)}</div>
                    <div className="text-sm text-gray-600">Total Donated</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center flex-1">
                    <div className="text-2xl font-bold text-gray-900">{totalDonations}</div>
                    <div className="text-sm text-gray-600">Total Donations</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. NGO Donation History Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-600/10 rounded-xl flex items-center justify-center">
                      <History className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">NGO Donation History</h2>
                      <p className="text-gray-600 text-sm">Your contribution timeline</p>
                    </div>
                  </div>
                  <span className="bg-primary-600/10 text-primary-600 px-3 py-1 rounded-full text-sm font-medium">
                    {donationHistory.length} donations
                  </span>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        NGO Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transaction
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {donationHistory.map((donation) => (
                      <tr key={donation.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{donation.ngoName}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-1">
                            <span className="text-sm font-bold text-primary-600">
                              {formatNumber(donation.amount)}
                            </span>
                            <span className="text-xs text-gray-500">ASH</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">{formatDate(donation.date)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            {donation.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button 
                            className="text-sm text-primary-600 hover:text-[#16625a] font-medium flex items-center space-x-1"
                            onClick={() => window.open(`https://etherscan.io/tx/${donation.txHash}`, '_blank')}
                          >
                            <span>{donation.txHash}</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {/* Right Column - Quick Stats */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Heart className="w-6 h-6 text-red-500" />
                <h3 className="text-lg font-semibold text-gray-900">Impact Summary</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Lives Impacted</span>
                  <span className="font-bold text-gray-900">1,247</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Support Hours</span>
                  <span className="font-bold text-gray-900">89.4</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Community Rank</span>
                  <span className="font-bold text-primary-600">#23</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Mental Health Matters</h3>
              <p className="text-white/80 text-sm mb-4">Your contributions are making a real difference in people's lives.</p>
              <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2">
                <span>View Impact Report</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 3. Donate to NGO Section */}
        <div className="mt-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Support Mental Health NGOs</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Make a difference in mental health advocacy by supporting organizations that are working tirelessly to improve lives and break stigmas.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ngoData.map((ngo) => (
              <div key={ngo.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                {/* NGO Image */}
                <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                    <img 
                      src={ngo.image} 
                      alt={ngo.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = `
                          <div class="w-full h-full bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center">
                            <span class="text-white font-bold text-lg">${ngo.name.split(' ').map(word => word[0]).join('').substring(0, 2)}</span>
                          </div>
                        `;
                      }}
                    />
                  </div>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700">
                    ⭐ {ngo.rating}
                  </div>
                </div>
                
                {/* NGO Content */}
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{ngo.name}</h3>
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-600/10 text-primary-600">
                        {ngo.focus}
                      </span>
                      <span className="text-sm text-gray-500">{ngo.impact}</span>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{ngo.description}</p>
                  </div>
                  
                  {/* Impact Stats */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-gray-900">98%</div>
                        <div className="text-xs text-gray-600">Transparency</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-gray-900">4.5k</div>
                        <div className="text-xs text-gray-600">Donors</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Donate Button */}
                  <button
                    onClick={() => {
                      setSelectedNGO(ngo);
                      setShowDonationDialog(true);
                    }}
                    className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm hover:shadow-md"
                  >
                    <Heart className="w-5 h-5" />
                    <span>Donate ASH Tokens</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Donation Dialog Modal */}
      {showDonationDialog && selectedNGO && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200">
                  <img 
                    src={selectedNGO.image} 
                    alt={selectedNGO.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = `
                        <div class="w-full h-full bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center">
                          <span class="text-white font-bold text-sm">${selectedNGO.name.split(' ').map((word: string) => word[0]).join('').substring(0, 2)}</span>
                        </div>
                      `;
                    }}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Donate to</h3>
                  <p className="text-sm text-gray-600">{selectedNGO.name}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDonationDialog(false);
                  setSelectedNGO(null);
                  setDonationAmount('');
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Available Balance */}
              <div className="bg-gradient-to-r from-primary-600/10 to-primary-600/5 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Available ASH Tokens</p>
                    <p className="text-2xl font-bold text-primary-600">{formatNumber(ashBalance)}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">ASH</span>
                  </div>
                </div>
              </div>

              {/* Donation Amount Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Donation Amount (ASH Tokens)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    placeholder="Enter amount to donate"
                    min="0"
                    max={ashBalance}
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 outline-none transition-colors"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    ASH
                  </div>
                </div>
                {donationAmount && parseFloat(donationAmount) > ashBalance && (
                  <p className="text-red-500 text-sm mt-1">Insufficient balance</p>
                )}
              </div>

              {/* Quick Amount Buttons */}
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-3">Quick Select</p>
                <div className="grid grid-cols-4 gap-2">
                  {[50, 100, 250, 500].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setDonationAmount(amount.toString())}
                      className="py-2 px-3 text-sm border border-gray-300 rounded-lg hover:border-primary-600 hover:text-primary-600 transition-colors"
                    >
                      {amount}
                    </button>
                  ))}
                </div>
              </div>

              {/* Impact Preview */}
              {donationAmount && parseFloat(donationAmount) > 0 && (
                <div className="bg-green-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <Heart className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Your Impact</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Your donation of {formatNumber(parseFloat(donationAmount))} ASH tokens could provide 
                    approximately {Math.floor(parseFloat(donationAmount) / 10)} hours of mental health support.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDonationDialog(false);
                    setSelectedNGO(null);
                    setDonationAmount('');
                  }}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (donationAmount && parseFloat(donationAmount) > 0 && parseFloat(donationAmount) <= ashBalance) {
                      // Here you would implement the actual donation logic
                      alert(`Successfully donated ${donationAmount} ASH tokens to ${selectedNGO.name}!`);
                      setShowDonationDialog(false);
                      setSelectedNGO(null);
                      setDonationAmount('');
                    }
                  }}
                  disabled={!donationAmount || parseFloat(donationAmount) <= 0 || parseFloat(donationAmount) > ashBalance}
                  className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-all duration-200"
                >
                  Proceed to Donate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;