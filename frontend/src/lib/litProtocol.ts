import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { LIT_NETWORK, LIT_ABILITY } from "@lit-protocol/constants";
import { 
  LitAccessControlConditionResource,
  createSiweMessageWithRecaps,
  generateAuthSig
} from "@lit-protocol/auth-helpers";
import { encryptString, decryptToString } from "@lit-protocol/encryption";
import { ethers } from "ethers";
import { 
  EncryptionErrorType, 
  LitProtocolError,
  handleEncryptionError,
  showEncryptionSuccess,
  showEncryptionLoading,
  dismissToast
} from './encryptionErrors';

export interface EncryptedData {
  ciphertext: string;
  dataToEncryptHash: string;
  accessControlConditions: any[];
}

export interface ChatroomAccessCondition {
  contractAddress: string;
  standardContractType: string;
  chain: string;
  method: string;
  parameters: string[];
  returnValueTest: {
    comparator: string;
    value: string;
  };
}

class LitProtocolService {
  private litNodeClient: LitJsSdk.LitNodeClient | null = null;
  private sessionSigs: any = null;
  private chain = "sepolia"; // Using Sepolia testnet for development

  constructor() {
    this.initLitClient();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Listen for wallet connection events
    window.addEventListener('connect-wallet', () => {
      // Trigger wallet connection - this would be handled by WalletContext
      console.log('Wallet connection requested from Lit Protocol');
    });

    // Listen for Lit reconnection events
    window.addEventListener('reconnect-lit', () => {
      this.clearSessions();
      this.initLitClient();
    });
  }

  private async initLitClient() {
    const loadingToast = showEncryptionLoading('connect');
    
    try {
      this.litNodeClient = new LitJsSdk.LitNodeClient({
        litNetwork: LIT_NETWORK.DatilDev, // Development network
        debug: false,
      });

      await this.litNodeClient.connect();
      console.log("✅ Connected to Lit Network");
      
      dismissToast(loadingToast);
      showEncryptionSuccess('connect');
    } catch (error) {
      dismissToast(loadingToast);
      console.error("❌ Failed to connect to Lit Network:", error);
      
      const litError = new LitProtocolError(
        EncryptionErrorType.CONNECTION_FAILED,
        "Failed to connect to Lit Network",
        error,
        true
      );
      
      handleEncryptionError(litError, 'initLitClient');
      throw litError;
    }
  }

  private async ensureConnection(retries: number = 2) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        if (!this.litNodeClient) {
          console.log(`🔗 Connecting to Lit Protocol (attempt ${attempt + 1}/${retries + 1})...`);
          await this.initLitClient();
        }
        
        // Test connection health
        if (this.litNodeClient) {
          // Try to get latest blockhash to test connection
          await this.litNodeClient.getLatestBlockhash();
          return; // Connection is healthy
        }
      } catch (error) {
        console.warn(`❌ Connection attempt ${attempt + 1} failed:`, error);
        
        if (attempt < retries) {
          // Wait before retrying (exponential backoff)
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`⏳ Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          
          // Reset client for retry
          this.litNodeClient = null;
        } else {
          throw new Error('Failed to connect to Lit Protocol after multiple attempts');
        }
      }
    }
  }

  /**
   * Create access control conditions for chatroom-based encryption
   * Only users who are members of the chatroom can decrypt messages
   */
  private createChatroomAccessConditions(roomId: number, _walletAddress: string): any[] {
    // For global chat (roomId = 1), allow anyone with a valid wallet
    if (roomId === 1) {
      return [
        {
          contractAddress: "",
          standardContractType: "",
          chain: this.chain,
          method: "eth_getBalance",
          parameters: [":userAddress", "latest"],
          returnValueTest: {
            comparator: ">=",
            value: "0", // Must have at least 0 ETH (essentially just need a valid wallet)
          },
        }
      ];
    }

    // For private chats, we could implement more sophisticated logic
    // For now, we'll use a simple wallet-based check but this could be enhanced
    // to check if the user is actually a member of the private chat
    return [
      {
        contractAddress: "",
        standardContractType: "",
        chain: this.chain,
        method: "eth_getBalance", 
        parameters: [":userAddress", "latest"],
        returnValueTest: {
          comparator: ">=",
          value: "1000000000000000", // Must have at least 0.001 ETH for private chats (slightly higher requirement)
        },
      }
    ];
  }

  /**
   * Get session signatures for authentication with Lit nodes
   */
  private async getSessionSignatures(walletAddress: string): Promise<any> {
    try {
      await this.ensureConnection();

      if (!window.ethereum) {
        throw new Error("No ethereum provider found");
      }

      // Connect to the wallet
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();

      // Get the latest blockhash
      const latestBlockhash = await this.litNodeClient!.getLatestBlockhash();

      // Define the authNeededCallback function
      const authNeededCallback = async (params: any) => {
        if (!params.uri) {
          throw new Error("uri is required");
        }
        if (!params.expiration) {
          throw new Error("expiration is required");
        }
        if (!params.resourceAbilityRequests) {
          throw new Error("resourceAbilityRequests is required");
        }

        // Create the SIWE message
        const toSign = await createSiweMessageWithRecaps({
          uri: params.uri,
          expiration: params.expiration,
          resources: params.resourceAbilityRequests,
          walletAddress: walletAddress,
          nonce: latestBlockhash,
          litNodeClient: this.litNodeClient!,
        });

        // Generate the authSig
        const authSig = await generateAuthSig({
          signer: signer,
          toSign,
        });

        return authSig;
      };

      // Define the Lit resource
      const litResource = new LitAccessControlConditionResource('*');

      // Get the session signatures
      const sessionSigs = await this.litNodeClient!.getSessionSigs({
        chain: this.chain,
        resourceAbilityRequests: [
          {
            resource: litResource,
            ability: LIT_ABILITY.AccessControlConditionDecryption,
          },
        ],
        authNeededCallback,
      });

      this.sessionSigs = sessionSigs;
      return sessionSigs;
    } catch (error) {
      console.error("❌ Failed to get session signatures:", error);
      throw error;
    }
  }

  /**
   * Encrypt a message with chatroom-based access control
   */
  async encryptMessage(
    message: string, 
    roomId: number, 
    walletAddress: string
  ): Promise<EncryptedData> {
    const loadingToast = showEncryptionLoading('encrypt');
    
    try {
      // Validate inputs
      if (!message || message.trim() === '') {
        dismissToast(loadingToast);
        throw new LitProtocolError(
          EncryptionErrorType.INVALID_DATA,
          'Message cannot be empty',
          null,
          false
        );
      }
      
      if (!walletAddress || !walletAddress.startsWith('0x')) {
        dismissToast(loadingToast);
        throw new LitProtocolError(
          EncryptionErrorType.WALLET_NOT_CONNECTED,
          'Invalid wallet address',
          null,
          false
        );
      }

      // Ensure Lit client is connected
      await this.ensureConnection();
      
      if (!this.litNodeClient) {
        dismissToast(loadingToast);
        throw new LitProtocolError(
          EncryptionErrorType.CONNECTION_FAILED,
          'Lit Protocol client not initialized',
          null,
          true
        );
      }

      // Create access control conditions for this chatroom
      const accessControlConditions = this.createChatroomAccessConditions(roomId, walletAddress);

      console.log(`🔐 Encrypting message for room ${roomId}...`);

      // Encrypt the message
      const { ciphertext, dataToEncryptHash } = await encryptString(
        {
          accessControlConditions,
          dataToEncrypt: message.trim(),
        },
        this.litNodeClient
      );

      console.log("✅ Message encrypted successfully");
      dismissToast(loadingToast);
      showEncryptionSuccess('encrypt');

      return {
        ciphertext,
        dataToEncryptHash,
        accessControlConditions,
      };
    } catch (error) {
      dismissToast(loadingToast);
      console.error("❌ Failed to encrypt message:", error);
      
      if (error instanceof LitProtocolError) {
        handleEncryptionError(error, 'encryptMessage');
        throw error;
      }
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('User denied')) {
          const litError = new LitProtocolError(
            EncryptionErrorType.ACCESS_DENIED,
            'Encryption cancelled by user',
            error,
            false
          );
          handleEncryptionError(litError, 'encryptMessage');
          throw litError;
        }
        if (error.message.includes('network')) {
          const litError = new LitProtocolError(
            EncryptionErrorType.NETWORK_ERROR,
            'Network error during encryption. Please check your connection.',
            error,
            true
          );
          handleEncryptionError(litError, 'encryptMessage');
          throw litError;
        }
        if (error.message.includes('session')) {
          const litError = new LitProtocolError(
            EncryptionErrorType.SESSION_EXPIRED,
            'Authentication session expired. Please refresh and try again.',
            error,
            true
          );
          handleEncryptionError(litError, 'encryptMessage');
          throw litError;
        }
      }
      
      throw new Error('Failed to encrypt message. Please try again.');
    }
  }

  /**
   * Decrypt a message if user has access
   */
  async decryptMessage(
    encryptedData: EncryptedData,
    walletAddress: string
  ): Promise<string> {
    try {
      // Validate inputs
      if (!encryptedData) {
        throw new LitProtocolError(
          EncryptionErrorType.INVALID_DATA,
          'No encrypted data provided',
          null,
          false
        );
      }
      
      if (!encryptedData.ciphertext || !encryptedData.dataToEncryptHash) {
        throw new LitProtocolError(
          EncryptionErrorType.INVALID_DATA,
          'Invalid encrypted data format',
          null,
          false
        );
      }
      
      if (!walletAddress || !walletAddress.startsWith('0x')) {
        throw new LitProtocolError(
          EncryptionErrorType.WALLET_NOT_CONNECTED,
          'Invalid wallet address',
          null,
          false
        );
      }

      // Ensure connection
      await this.ensureConnection();
      
      if (!this.litNodeClient) {
        throw new LitProtocolError(
          EncryptionErrorType.CONNECTION_FAILED,
          'Lit Protocol client not initialized',
          null,
          true
        );
      }

      console.log(`🔓 Decrypting message...`);

      // Get session signatures if not already obtained
      if (!this.sessionSigs) {
        try {
          await this.getSessionSignatures(walletAddress);
        } catch (sessionError) {
          console.error("Failed to get session signatures:", sessionError);
          throw new LitProtocolError(
            EncryptionErrorType.SESSION_EXPIRED,
            'Authentication failed. Please connect your wallet and try again.',
            sessionError,
            true
          );
        }
      }

      // Decrypt the message
      const decryptedString = await decryptToString(
        {
          accessControlConditions: encryptedData.accessControlConditions,
          chain: this.chain,
          ciphertext: encryptedData.ciphertext,
          dataToEncryptHash: encryptedData.dataToEncryptHash,
          sessionSigs: this.sessionSigs,
        },
        this.litNodeClient
      );

      console.log("✅ Message decrypted successfully");
      return decryptedString;
    } catch (error) {
      console.error("❌ Failed to decrypt message:", error);
      
      if (error instanceof LitProtocolError) {
        handleEncryptionError(error, 'decryptMessage');
        throw error;
      }
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('User denied')) {
          const litError = new LitProtocolError(
            EncryptionErrorType.ACCESS_DENIED,
            'Decryption cancelled by user',
            error,
            false
          );
          handleEncryptionError(litError, 'decryptMessage');
          throw litError;
        }
        if (error.message.includes('network')) {
          const litError = new LitProtocolError(
            EncryptionErrorType.NETWORK_ERROR,
            'Network error during decryption. Please check your connection.',
            error,
            true
          );
          handleEncryptionError(litError, 'decryptMessage');
          throw litError;
        }
        if (error.message.includes('Unauthorized') || error.message.includes('access')) {
          const litError = new LitProtocolError(
            EncryptionErrorType.ACCESS_DENIED,
            'Access denied. You do not have permission to decrypt this message.',
            error,
            false
          );
          handleEncryptionError(litError, 'decryptMessage');
          throw litError;
        }
        if (error.message.includes('session') || error.message.includes('signature')) {
          this.clearSessions(); // Clear stale sessions
          const litError = new LitProtocolError(
            EncryptionErrorType.SESSION_EXPIRED,
            'Authentication session expired. Please refresh and try again.',
            error,
            true
          );
          handleEncryptionError(litError, 'decryptMessage');
          throw litError;
        }
      }
      
      const litError = new LitProtocolError(
        EncryptionErrorType.DECRYPTION_FAILED,
        'Failed to decrypt message. You may not have access to this content.',
        error,
        false
      );
      handleEncryptionError(litError, 'decryptMessage');
      throw litError;
    }
  }

  /**
   * Check if a user can decrypt messages in a specific chatroom
   */
  async canDecryptInRoom(roomId: number, walletAddress: string): Promise<boolean> {
    try {
      // Basic validation: user must have a valid wallet address
      if (!walletAddress || walletAddress.length !== 42 || !walletAddress.startsWith('0x')) {
        return false;
      }

      // For global chat (roomId = 1), anyone can decrypt
      if (roomId === 1) {
        return true;
      }

      // For private chats, we could implement more sophisticated logic
      // This could involve checking your backend API to see if the user is a member
      // For now, we'll allow anyone with a valid wallet to access private chats
      // In production, you'd want to verify membership through your backend
      
      return true;
    } catch (error) {
      console.error("❌ Failed to check decrypt permissions:", error);
      return false;
    }
  }

  /**
   * Disconnect from Lit network
   */
  async disconnect() {
    try {
      if (this.litNodeClient) {
        await this.litNodeClient.disconnect();
        this.litNodeClient = null;
        this.sessionSigs = null;
        console.log("✅ Disconnected from Lit Network");
      }
    } catch (error) {
      console.error("❌ Failed to disconnect from Lit Network:", error);
    }
  }

  /**
   * Clear cached session signatures (useful for wallet changes)
   */
  clearSessions() {
    this.sessionSigs = null;
    // Clear any cached auth data
    LitJsSdk.disconnectWeb3();
  }
}

// Export a singleton instance
export const litProtocolService = new LitProtocolService();
export default litProtocolService;