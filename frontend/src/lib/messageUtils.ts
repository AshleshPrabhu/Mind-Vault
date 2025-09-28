import litProtocolService, { type EncryptedData } from '../lib/litProtocol';

export interface DecryptedMessage {
  messageId: number;
  content: string;
  isEncrypted: boolean;
  decrypted: boolean;
  decryptionError?: string;
  sender: {
    id: number;
    username: string;
    profilePicture?: string;
    walletAddress: string;
  };
  room: {
    roomId: number;
    roomName: string;
    type: string;
  };
  likes: number;
  dislikes: number;
  replyToId?: number;
  replyTo?: any;
  replies?: any[];
  isValidated: boolean;
  rewarded: boolean;
  createdAt: string;
  updatedAt: string;
}

export const decryptMessage = async (
  message: any, 
  walletAddress: string
): Promise<DecryptedMessage> => {
  const decryptedMessage: DecryptedMessage = {
    ...message,
    decrypted: false,
    decryptionError: undefined
  };

  if (!message.isEncrypted || !message.encryptedData) {
    return {
      ...decryptedMessage,
      decrypted: true
    };
  }

  try {
    const encryptedData: EncryptedData = typeof message.encryptedData === 'string' 
      ? JSON.parse(message.encryptedData) 
      : message.encryptedData;

    const decryptedContent = await litProtocolService.decryptMessage(
      encryptedData,
      walletAddress
    );

    return {
      ...decryptedMessage,
      content: decryptedContent,
      decrypted: true
    };

  } catch (error) {
    console.error("Failed to decrypt message:", error);
    
    return {
      ...decryptedMessage,
      content: "🔒 Message encrypted - Unable to decrypt",
      decrypted: false,
      decryptionError: error instanceof Error ? error.message : "Decryption failed"
    };
  }
};

export const decryptMessages = async (
  messages: any[], 
  walletAddress: string
): Promise<DecryptedMessage[]> => {
  const decryptPromises = messages.map(message => 
    decryptMessage(message, walletAddress)
  );

  try {
    return await Promise.all(decryptPromises);
  } catch (error) {
    console.error("Failed to decrypt some messages:", error);
    return Promise.allSettled(decryptPromises).then(results => 
      results.map((result, index) => 
        result.status === 'fulfilled' 
          ? result.value 
          : {
              ...messages[index],
              content: "🔒 Message encrypted - Unable to decrypt",
              decrypted: false,
              decryptionError: "Decryption failed"
            }
      )
    );
  }
};

export const canDecryptInRoom = async (
  roomId: number, 
  walletAddress: string
): Promise<boolean> => {
  try {
    return await litProtocolService.canDecryptInRoom(roomId, walletAddress);
  } catch (error) {
    console.error("Failed to check decryption permissions:", error);
    return false;
  }
};

export const formatMessageForDisplay = (message: DecryptedMessage): string => {
  if (!message.isEncrypted) {
    return message.content;
  }

  if (message.decrypted) {
    return message.content;
  }

  if (message.decryptionError) {
    return `🔒 ${message.decryptionError}`;
  }

  return "🔒 Decrypting...";
};

export const getMessageStatusIcon = (message: DecryptedMessage): string => {
  if (!message.isEncrypted) {
    return ""; 
  }

  if (message.decrypted) {
    return "🔓"; 
  }

  return "🔒";
};