import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, History, Heart, TrendingUp, X, MessageCircle, ArrowLeft } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import ashTokenImage from '../assets/ash_coin.png';
import { API_BASE_URL } from '../config';

const ASH_TOKEN_ABI = [
  {
    "inputs": [
      { "name": "spender", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "owner", "type": "address" },
      { "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "account", "type": "address" }
    ],
    "name": "balanceOf",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

const FOUNDATION_ABI = [
  {
    "inputs": [
      { "name": "token", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "donateToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

const CONTRACT_ADDRESSES = {
  ASH_TOKEN: "0x652Cdd1D2Aa3c7a2804a18816B90eD44Ec6AdC22",
  FOUNDATIONS: {
    "Manas Foundation": "0x846E9C974Db0bF19caf739768Aa6E4CcD8378adD",
    "Minds Foundation": "0xFe5036504D3e3620346e19C643Be813477E34B68", 
    "Mitram Foundation": "0x331a975530127C6a02f01D5F9eC8Fa3d31fc2352"
  }
} as const;

interface DonationHistory {
  id: number;
  ngoName: string;
  contractAddress: string;
  amount: number;
  date: Date;
  status: string;
  focus: string;
  txHash?: string;
}
interface RankingData {
  user: {
    rank: number;
    score: number;
    tier: string;
    tierColor: string;
    percentile: number;
    messageCount: number;
    validatedMessages: number;
    totalDonations: number;
    tokenBalance: number;
  };
  leaderboard: Array<{
    rank: number;
    username: string;
    profilePicture: string;
    score: number;
    tier: string;
  }>;
  totalUsers: number;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useWallet();
  const { address, isConnected } = useAccount();

  const { data: onChainBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.ASH_TOKEN as `0x${string}`,
    abi: ASH_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
      refetchInterval: 10000,
    },
  });


  const currentBalance = onChainBalance ? parseFloat(formatEther(onChainBalance as bigint)) : 0;
  


  

  const { writeContract, data: txHash, error: writeError } = useWriteContract();
  const { isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });
  
  const [donationHistory, setDonationHistory] = useState<DonationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataRefreshing, setDataRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  

  const [rankingData, setRankingData] = useState<RankingData | null>(null);
  const [rankingLoading, setRankingLoading] = useState(true);
  

  const [selectedNGO, setSelectedNGO] = useState<any>(null);
  const [donationAmount, setDonationAmount] = useState('');
  const [showDonationDialog, setShowDonationDialog] = useState(false);
  const [donationStep, setDonationStep] = useState<'input' | 'approving' | 'donating' | 'success' | 'error'>('input');


  const fetchDonationHistory = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/donations/history/${user.id}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 404) {

          setDonationHistory([]);
          return;
        }
        if (response.status >= 500) {

          setDonationHistory([]);
          return;
        }
        throw new Error(`HTTP ${response.status}: Failed to fetch donation history`);
      }
      
      const data = await response.json();
      if (data.success) {
        const donationsArray = data.data.donations || [];
        const historyWithDates = donationsArray.map((item: any) => ({
          ...item,
          date: new Date(item.date)
        }));
        setDonationHistory(historyWithDates);
      } else {

        setDonationHistory([]);
      }
    } catch (err) {

      
      if (err instanceof TypeError && err.message.includes('fetch')) {

        setDonationHistory([]);
        return;
      }
      
      if (err instanceof Error && !err.message.includes('404')) {

        setDonationHistory([]);
      } else {
        setDonationHistory([]);
      }
    }
  };

  const fetchRankingData = async () => {
    if (!user?.walletAddress) return;
    
    try {
      setRankingLoading(true);
      const response = await fetch(`${API_BASE_URL}/user/rank/${user.walletAddress}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRankingData(data.data);
        } else {

        }
      } else {

      }
    } catch (err) {
    } finally {
      setRankingLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (user?.id) {
        setLoading(true);
        await Promise.all([
          fetchDonationHistory(),
          fetchRankingData()
        ]);
        setLoading(false);
      }
    };
    
    loadData();
  }, [user?.id, user?.walletAddress]);

  const handleModalDonation = async () => {
    if (!selectedNGO || !donationAmount || parseFloat(donationAmount) <= 0) {
      setError('Please select an NGO and enter a valid donation amount');
      return;
    }

    if (parseFloat(donationAmount) > currentBalance) {
      setError('Insufficient ASH tokens for this donation');
      return;
    }

    setError('');
    setDonationStep('approving');

    try {
      const foundationAddress = CONTRACT_ADDRESSES.FOUNDATIONS[selectedNGO.name as keyof typeof CONTRACT_ADDRESSES.FOUNDATIONS];
      if (!foundationAddress) {
        throw new Error('Foundation contract not found for selected NGO');
      }

      const amountInWei = parseEther(donationAmount.toString());
      writeContract({
        address: CONTRACT_ADDRESSES.ASH_TOKEN as `0x${string}`,
        abi: ASH_TOKEN_ABI,
        functionName: 'approve',
        args: [foundationAddress, amountInWei],
      });
    } catch (error) {

      setError('Token approval failed. Please try again or contact support');
      setDonationStep('error');
    }
  };

  const executeDonation = async () => {
    if (!selectedNGO || !donationAmount) return;

    setDonationStep('donating');
    
    try {
      const foundationAddress = CONTRACT_ADDRESSES.FOUNDATIONS[selectedNGO.name as keyof typeof CONTRACT_ADDRESSES.FOUNDATIONS];
      const amountInWei = parseEther(donationAmount.toString());
      writeContract({
        address: foundationAddress as `0x${string}`,
        abi: FOUNDATION_ABI,
        functionName: 'donateToken',
        args: [CONTRACT_ADDRESSES.ASH_TOKEN as `0x${string}`, amountInWei],
      });
    } catch (error) {

      setError('Donation contract error. Please try again or contact support');
      setDonationStep('error');
    }
  };




  const recordDonationInDB = async (ngo: any, amount: string, transactionHash: string) => {
    try {
      const ngoIdMapping: { [key: string]: number } = {
        "Manas Foundation": 1,
        "Minds Foundation": 2, 
        "Mitram Foundation": 3
      };
      const ngoId = ngoIdMapping[ngo.name] || 1;
      
      const response = await fetch(`${API_BASE_URL}/donations/record`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: user!.id,
          ngoId: ngoId,
          amount: parseFloat(amount),
          txHash: transactionHash
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setDataRefreshing(true);
        await fetchDonationHistory();
        setDataRefreshing(false);
        setDonationStep('success');
        
        setTimeout(() => {
          setShowDonationDialog(false);
          setSelectedNGO(null);
          setDonationAmount('');
          setDonationStep('input');
        }, 2000);
        
      } else {
        throw new Error(data.message || 'Failed to record donation');
      }
    } catch (err) {

      setError(err instanceof Error ? err.message : 'Failed to record donation');
      setDonationStep('error');
      setDataRefreshing(false);
    }
  };

  useEffect(() => {
    if (txHash && isTxSuccess && donationStep === 'approving') {
      executeDonation();
    } else if (txHash && isTxSuccess && donationStep === 'donating') {
      if (selectedNGO && donationAmount) {
        recordDonationInDB(selectedNGO, donationAmount, txHash);
      }
    } else if (writeError && donationStep !== 'input') {

      let errorMessage = 'Donation failed';
      
      if (writeError.message.includes('User rejected') || writeError.message.includes('user rejected')) {
        errorMessage = 'Transaction was cancelled by user';
      } else if (writeError.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for transaction';
      } else if (writeError.message.includes('approve') && donationStep === 'approving') {
        errorMessage = 'Token approval failed. Please try again or contact support';
      } else if (writeError.message.includes('donateToken')) {
        errorMessage = 'Donation contract error. Please try again or contact support';
      } else {
        errorMessage = 'Transaction failed. Please try again';
      }
      
      setError(errorMessage);
      setDonationStep('error');
      if (writeError.message.includes('User rejected') || writeError.message.includes('user rejected')) {
        setTimeout(() => {
          setDonationStep('input');
          setError(null);
        }, 3000);
      }
    }
  }, [txHash, isTxSuccess, writeError, donationStep, selectedNGO, donationAmount]);

  const displayDonationHistory = donationHistory.length > 0 ? donationHistory : [];

  const ngoData = [
    {
      id: 1,
      name: "Manas Foundation",
      description: "Providing comprehensive mental health support and counseling services to underserved communities worldwide.",
      impact: "50,000+ lives impacted",
      image: "https://skchildrenfoundation.org/wp-content/uploads/2022/10/skcf5.png",
      focus: "Youth Mental Health",
      rating: 4.9
    },
    {
      id: 2,
      name: "Minds Foundation", 
      description: "Dedicated to promoting mental wellness through mindfulness practices, therapy, and community support programs.",
      impact: "25,000+ people served",
      image: "https://globalindiannetwork.com/wp-content/uploads/mental-health-ngos-in-india.webp",
      focus: "Community Wellness",
      rating: 4.8
    },
    {
      id: 3,
      name: "Mitram Foundation",
      description: "Building bridges to mental health resources and breaking stigma through education and awareness campaigns.",
      impact: "100,000+ awareness reached",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTu9vEE5UZTj_Mh56ytaqBRAL19dKdLuKEuqA&s",
      focus: "Stigma Reduction", 
      rating: 4.7
    }
  ];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const totalDonated = displayDonationHistory.reduce((sum, donation) => sum + donation.amount, 0);
  const totalDonations = displayDonationHistory.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-2">Failed to load profile</p>
              <p className="text-gray-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-8">

          <div className="mb-4">
            <button
              onClick={() => navigate('/app/chats')}
              className="
                group flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-primary-50 hover:border-primary-200
                transition-all duration-200 text-gray-700 hover:text-primary-700
              "
              aria-label="Go to chats"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">Chats</span>
            </button>
          </div>
          

          <div className="flex items-center space-x-6">

            <div className="flex-shrink-0">
              <img 
                src={user?.profilePicture || "https://avatar.iran.liara.run/public"} 
                alt={user?.username || "User"}
                className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://avatar.iran.liara.run/public";
                }}
              />
            </div>
            

            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gradient-primary">
                  👤 My Profile
                </h1>
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {user?.username || "Anonymous User"}
                  </h2>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    {user?.role === 'VALIDATOR' ? 'Validator' : 'Member'}
                  </span>
                </div>
                <p className="text-gray-600">Manage your MindVault account and contributions</p>
                {address && (
                  <p className="text-sm text-gray-500 font-mono">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          
          <div className="space-y-8">
            
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
                      {formatNumber(currentBalance)} <span className="text-2xl text-primary-600">ASH</span>
                    </div>

                  </div>
                  <div className="w-24 h-24 bg-gradient-to-br from-primary-600/10 to-primary-600/5 rounded-full flex items-center justify-center mr-4">
                    <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center">
                      <img src={ashTokenImage} alt="ASH Coin" className='w-24 h-24' />
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


            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Community Ranking</h2>
                    <p className="text-primary-200 text-sm">Your position in the MindVault community</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {rankingLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                ) : rankingData ? (
                  <div className="space-y-6">

                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-dashed border-gray-300">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div 
                            className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
                            style={{ backgroundColor: rankingData.user.tierColor }}
                          >
                            #{rankingData.user.rank}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">
                              {rankingData.user.tier} Rank
                            </h3>
                            <p className="text-gray-600">
                              Top {rankingData.user.percentile}% of {rankingData.totalUsers} users
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            {rankingData.user.score.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">Community Score</div>
                        </div>
                      </div>
                      

                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-primary-600">{rankingData.user.messageCount}</div>
                          <div className="text-xs text-gray-600">Messages</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-green-600">{rankingData.user.validatedMessages}</div>
                          <div className="text-xs text-gray-600">Validated</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-primary-600">{rankingData.user.totalDonations.toLocaleString()}</div>
                          <div className="text-xs text-gray-600">Donated</div>
                        </div>
                      </div>
                    </div>


                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-3">Top Community Members</h4>
                      <div className="space-y-2">
                        {rankingData.leaderboard.slice(0, 5).map((leader, index) => (
                          <div 
                            key={leader.rank} 
                            className={`flex items-center justify-between p-3 rounded-lg ${
                              leader.rank === rankingData.user.rank ? 'bg-primary-50 border border-primary-200' : 'bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                                index === 0 ? 'bg-yellow-500' : 
                                index === 1 ? 'bg-gray-400' : 
                                index === 2 ? 'bg-primary-600' : 'bg-gray-500'
                              }`}>
                                {leader.rank}
                              </div>
                              <img 
                                src={leader.profilePicture} 
                                alt={leader.username}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <span className="font-medium text-gray-900">
                                {leader.username}
                                {leader.rank === rankingData.user.rank && (
                                  <span className="text-primary-600 ml-2">(You)</span>
                                )}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-gray-900">{leader.score.toLocaleString()}</div>
                              <div className="text-xs text-gray-600">{leader.tier}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Unable to load ranking data</p>
                  </div>
                )}
              </div>
            </div>


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

                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {displayDonationHistory.map((donation) => (
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

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>


        <div className="mt-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Support Mental Health NGOs</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Make a difference in mental health advocacy by supporting organizations that are working tirelessly to improve lives and break stigmas.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ngoData.map((ngo) => (
              <div key={ngo.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">

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


      {showDonationDialog && selectedNGO && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">

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


            <div className="p-6">

              <div className="bg-gradient-to-r from-primary-600/10 to-primary-600/5 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Available ASH Tokens</p>
                    <p className="text-2xl font-bold text-primary-600">{formatNumber(currentBalance)}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">ASH</span>
                  </div>
                </div>
              </div>


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
                    max={currentBalance}
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 outline-none transition-colors"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    ASH
                  </div>
                </div>
                {donationAmount && parseFloat(donationAmount) > currentBalance && (
                  <p className="text-red-500 text-sm mt-1">Insufficient balance</p>
                )}
              </div>


              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center space-x-2 text-red-700">
                    <X className="w-5 h-5" />
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                </div>
              )}


              {donationStep !== 'input' && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center space-x-2 text-blue-700">
                    {donationStep === 'donating' && (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-700"></div>
                        <p className="text-sm font-medium">Processing donation to {selectedNGO?.name}...</p>
                      </>
                    )}
                    {donationStep === 'success' && (
                      <>
                        <Heart className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-green-700">Donation successful! Thank you for your contribution.</p>
                          {dataRefreshing && (
                            <p className="text-xs text-green-600 mt-1">Updating your balance and history...</p>
                          )}
                        </div>
                      </>
                    )}
                    {donationStep === 'error' && (
                      <div>
                        <div className="flex items-center space-x-2 text-red-700">
                          <X className="w-5 h-5 text-red-600" />
                          <p className="text-sm font-medium text-red-700">Donation failed. Please try again.</p>
                        </div>
                        <button
                          onClick={() => {
                            setError(null);
                            setDonationStep('input');
                            setDataRefreshing(false);
                            if (writeError) {

                            }
                          }}
                          className="mt-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Try Again
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}


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
                    if (donationAmount && parseFloat(donationAmount) > 0 && parseFloat(donationAmount) <= currentBalance) {
                      handleModalDonation();
                    }
                  }}
                  disabled={
                    !donationAmount || 
                    parseFloat(donationAmount) <= 0 || 
                    parseFloat(donationAmount) > currentBalance ||
                    !isConnected ||
                    donationStep !== 'input'
                  }
                  className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  {donationStep === 'input' && !isConnected && (
                    <>
                      <Wallet className="w-4 h-4" />
                      <span>Connect Wallet to Donate</span>
                    </>
                  )}
                  {donationStep === 'input' && isConnected && (
                    <>
                      <Heart className="w-4 h-4" />
                      <span>Proceed to Donate</span>
                    </>
                  )}
                  {donationStep === 'approving' && (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Approving Tokens...</span>
                    </>
                  )}
                  {donationStep === 'donating' && (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing Donation...</span>
                    </>
                  )}
                  {donationStep === 'success' && (
                    <>
                      <Heart className="w-4 h-4 text-green-400" />
                      <span>Donation Successful!</span>
                    </>
                  )}
                  {donationStep === 'error' && (
                    <>
                      <X className="w-4 h-4 text-red-400" />
                      <span>Donation Failed</span>
                    </>
                  )}
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