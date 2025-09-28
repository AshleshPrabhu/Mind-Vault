import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const TOKEN_ABI = [
  {
    "inputs": [
      { "name": "_to", "type": "address" },
      { "name": "_amount", "type": "uint256" }
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "account", "type": "address" }
    ],
    "name": "balanceOf",
    "outputs": [
      { "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export interface MintingResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

class TokenMintingService {
  private provider: ethers.providers.JsonRpcProvider | null = null;
  private wallet: ethers.Wallet | null = null;
  private ashTokenContract: ethers.Contract | null = null;

  constructor() {
    console.log(' Initializing Token Minting Service...');
    
    const rpcUrl = process.env.SEPOLIA_RPC_URL || process.env.RPC_URL;
    console.log('   - RPC URL configured:', !!rpcUrl);
    
    if (!rpcUrl) {
      console.warn(' No RPC URL configured for token minting');
      return;
    }

    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    
    const privateKey = process.env.MINTING_PRIVATE_KEY;
    const contractAddress = process.env.ASH_TOKEN_CONTRACT;
    
    console.log('   - Private key configured:', !!privateKey);
    console.log('   - Contract address configured:', !!contractAddress);

    if (privateKey && contractAddress) {
      try {
        this.wallet = new ethers.Wallet(privateKey, this.provider);
        this.ashTokenContract = new ethers.Contract(contractAddress, TOKEN_ABI, this.wallet);
        console.log(' Token minting service initialized successfully!');
        console.log('   - Wallet Address:', this.wallet.address);
        console.log('   - Contract Address:', contractAddress);
      } catch (error) {
        console.error(' Failed to initialize token minting service:', error);
      }
    } else {
      console.warn(' Token minting not configured (missing MINTING_PRIVATE_KEY or ASH_TOKEN_CONTRACT)');
      if (!privateKey) console.warn('   - MINTING_PRIVATE_KEY is missing');
      if (!contractAddress) console.warn('   - ASH_TOKEN_CONTRACT is missing');
    }
  }

  async mintTokens(recipientAddress: string, amount: number): Promise<MintingResult> {
    try {
      if (!this.wallet || !this.ashTokenContract || !this.provider) {
        return { 
          success: false, 
          error: 'Token minting service not properly configured' 
        };
      }
      if (!ethers.utils.isAddress(recipientAddress)) {
        return { 
          success: false, 
          error: 'Invalid recipient address' 
        };
      }

      console.log(`Minting ${amount} ASH tokens to ${recipientAddress}...`);
      
      const gasPrice = await this.provider.getGasPrice();
      
      const tx = await this.ashTokenContract.mint(recipientAddress, amount, {
        gasPrice: gasPrice.mul(110).div(100)
      });
      
      console.log(' Transaction sent:', tx.hash);

      const receipt = await tx.wait(1); 
      console.log(' Token minting confirmed!');
      console.log('   TX Hash:', receipt.transactionHash);
      console.log('   Gas Used:', receipt.gasUsed.toString());
      
      return {
        success: true,
        txHash: receipt.transactionHash
      };

    } catch (error: any) {
      console.error('Token minting failed:', error);
      
      let errorMessage = 'Unknown error occurred';
      if (error.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = 'Insufficient funds for gas fees';
      } else if (error.code === 'NONCE_EXPIRED') {
        errorMessage = 'Transaction nonce expired';
      } else if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  isConfigured(): boolean {
    return !!(this.wallet && this.ashTokenContract);
  }

  getMintingWalletAddress(): string | null {
    return this.wallet?.address || null;
  }
  async getWalletBalance(): Promise<string> {
    try {
      if (!this.wallet) return '0';
      const balance = await this.wallet.getBalance();
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      return '0';
    }
  }

  async getTokenBalance(address: string): Promise<number> {
    try {
      if (!this.ashTokenContract || !this.provider) {
        return 0;
      }

      if (!ethers.utils.isAddress(address)) {
        return 0;
      }

      const balance = await this.ashTokenContract.balanceOf(address);
      return parseFloat(ethers.utils.formatEther(balance));
    } catch (error) {
      console.error('Error getting token balance:', error);
      return 0;
    }
  }
}

export const tokenMintingService = new TokenMintingService();
export default tokenMintingService;
