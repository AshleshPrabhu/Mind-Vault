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

/**
 * Decrypt a message if it's encrypted
 */
export const decryptMessage = async (
  message: any, 
  walletAddress: string
): Promise<DecryptedMessage> => {
  const decryptedMessage: DecryptedMessage = {
    ...message,
    decrypted: false,
    decryptionError: undefined
  };

  // If message is not encrypted, return as-is
  if (!message.isEncrypted || !message.encryptedData) {
    return {
      ...decryptedMessage,
      decrypted: true
    };
  }

  try {
    // Parse encrypted data
    const encryptedData: EncryptedData = typeof message.encryptedData === 'string' 
      ? JSON.parse(message.encryptedData) 
      : message.encryptedData;

    // Decrypt the message content
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

/**
 * Decrypt multiple messages
 */
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
    // Return partially decrypted results
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

/**
 * Check if user can decrypt messages in a room
 */
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

/**
 * Format message for display, handling both encrypted and unencrypted
 */
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

/**
 * Get message status icon
 */
export const getMessageStatusIcon = (message: DecryptedMessage): string => {
  if (!message.isEncrypted) {
    return ""; // No icon for regular messages
  }

  if (message.decrypted) {
    return "🔓"; // Unlocked
  }

  return "🔒"; // Locked
};