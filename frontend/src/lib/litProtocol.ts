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
  private chain = "sepolia";

  constructor() {
    this.initLitClient();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    window.addEventListener('connect-wallet', () => {
      console.log('Wallet connection requested from Lit Protocol');
    });

    window.addEventListener('reconnect-lit', () => {
      this.clearSessions();
      this.initLitClient();
    });
  }

  private async initLitClient() {
    const loadingToast = showEncryptionLoading('connect');
    
    try {
      this.litNodeClient = new LitJsSdk.LitNodeClient({
        litNetwork: LIT_NETWORK.DatilDev, 
        debug: false,
      });

      await this.litNodeClient.connect();
      console.log("Connected to Lit Network");
      
      dismissToast(loadingToast);
      showEncryptionSuccess('connect');
    } catch (error) {
      dismissToast(loadingToast);
      console.error(" Failed to connect to Lit Network:", error);
      
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
          console.log(`Connecting to Lit Protocol (attempt ${attempt + 1}/${retries + 1})...`);
          await this.initLitClient();
        }
        
        if (this.litNodeClient) {
          await this.litNodeClient.getLatestBlockhash();
          return;
        }
      } catch (error) {
        console.warn(` Connection attempt ${attempt + 1} failed:`, error);
        
        if (attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          
          this.litNodeClient = null;
        } else {
          throw new Error('Failed to connect to Lit Protocol after multiple attempts');
        }
      }
    }
  }

  private async createChatroomAccessConditions(roomId: number, walletAddress: string, chatRoom?: any): Promise<any[]> {
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
            value: "0",
          },
        }
      ];
    }

    let participants = [];
    
    if (chatRoom && chatRoom.participants) {
      participants = chatRoom.participants;
    } else {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/chatrooms/${roomId}`);
        if (response.ok) {
          const roomDataResponse = await response.json();
          if (roomDataResponse.success && roomDataResponse.data) {
            participants = roomDataResponse.data.participants || [];
          }
        }
      } catch (error) {
        console.warn(` Could not fetch room info for room ${roomId}:`, error);
      }
    }

    const participantAddresses = participants
      .filter((p: any) => p.walletAddress && p.walletAddress.startsWith('0x'))
      .map((p: any) => p.walletAddress);

    if (participantAddresses.length === 0) {
      console.warn(`⚠️ No participants found for room ${roomId}, using current user only`);
      return [
        {
          contractAddress: "",
          standardContractType: "",
          chain: this.chain,
          method: "eth_getBalance",
          parameters: [walletAddress, "latest"],
          returnValueTest: {
            comparator: ">=",
            value: "0",
          },
        }
      ];
    }

    console.log(`Creating access conditions for participants:`, participantAddresses);
    
    if (participantAddresses.length === 1) {
      return [
        {
          contractAddress: "",
          standardContractType: "",
          chain: this.chain,
          method: "eth_getBalance",
          parameters: [participantAddresses[0], "latest"],
          returnValueTest: {
            comparator: ">=",
            value: "0",
          },
        }
      ];
    }

    const conditions = [];
    for (let i = 0; i < participantAddresses.length; i++) {
      const condition: any = {
        contractAddress: "",
        standardContractType: "",
        chain: this.chain,
        method: "eth_getBalance",
        parameters: [participantAddresses[i], "latest"],
        returnValueTest: {
          comparator: ">=",
          value: "0",
        },
      };

      if (i > 0) {
        condition.operator = "or";
      }

      conditions.push(condition);
    }

    return conditions;
  }

  private async getSessionSignatures(walletAddress: string): Promise<any> {
    try {
      await this.ensureConnection();

      if (!window.ethereum) {
        throw new Error("No ethereum provider found");
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();

      const latestBlockhash = await this.litNodeClient!.getLatestBlockhash();

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

        const toSign = await createSiweMessageWithRecaps({
          uri: params.uri,
          expiration: params.expiration,
          resources: params.resourceAbilityRequests,
          walletAddress: walletAddress,
          nonce: latestBlockhash,
          litNodeClient: this.litNodeClient!,
        });

        const authSig = await generateAuthSig({
          signer: signer,
          toSign,
        });

        return authSig;
      };

      const litResource = new LitAccessControlConditionResource('*');

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
      console.error(" Failed to get session signatures:", error);
      throw error;
    }
  }

  async encryptMessage(
    message: string, 
    roomId: number, 
    walletAddress: string,
    chatRoom?: any 
  ): Promise<EncryptedData> {
    const loadingToast = showEncryptionLoading('encrypt');
    
    try {
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

      const accessControlConditions = await this.createChatroomAccessConditions(roomId, walletAddress, chatRoom);

      console.log(` Encrypting message for room ${roomId}...`);
      console.log(` Access conditions:`, accessControlConditions);

      const { ciphertext, dataToEncryptHash } = await encryptString(
        {
          accessControlConditions,
          dataToEncrypt: message.trim(),
        },
        this.litNodeClient
      );

      console.log("Message encrypted successfully");
      dismissToast(loadingToast);
      showEncryptionSuccess('encrypt');

      return {
        ciphertext,
        dataToEncryptHash,
        accessControlConditions,
      };
    } catch (error) {
      dismissToast(loadingToast);
      console.error(" Failed to encrypt message:", error);
      
      if (error instanceof LitProtocolError) {
        handleEncryptionError(error, 'encryptMessage');
        throw error;
      }
      
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

  async decryptMessage(
    encryptedData: EncryptedData,
    walletAddress: string
  ): Promise<string> {
    try {
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

      await this.ensureConnection();
      
      if (!this.litNodeClient) {
        throw new LitProtocolError(
          EncryptionErrorType.CONNECTION_FAILED,
          'Lit Protocol client not initialized',
          null,
          true
        );
      }

      console.log(`Decrypting message...`);

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

      console.log(" Message decrypted successfully");
      return decryptedString;
    } catch (error) {
      console.error(" Failed to decrypt message:", error);
      
      if (error instanceof LitProtocolError) {
        handleEncryptionError(error, 'decryptMessage');
        throw error;
      }
      
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
          this.clearSessions(); 
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
  async canDecryptInRoom(roomId: number, walletAddress: string): Promise<boolean> {
    try {
      if (!walletAddress || walletAddress.length !== 42 || !walletAddress.startsWith('0x')) {
        return false;
      }

      if (roomId === 1) {
        return true;
      }

      return true;
    } catch (error) {
      console.error("Failed to check decrypt permissions:", error);
      return false;
    }
  }

  async disconnect() {
    try {
      if (this.litNodeClient) {
        await this.litNodeClient.disconnect();
        this.litNodeClient = null;
        this.sessionSigs = null;
        console.log("Disconnected from Lit Network");
      }
    } catch (error) {
      console.error("Failed to disconnect from Lit Network:", error);
    }
  }

  clearSessions() {
    this.sessionSigs = null;
    LitJsSdk.disconnectWeb3();
  }
}

export const litProtocolService = new LitProtocolService();
export default litProtocolService;