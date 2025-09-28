import { toast } from 'sonner';

export const EncryptionErrorType = {
  CONNECTION_FAILED: 'CONNECTION_FAILED' as const,
  ENCRYPTION_FAILED: 'ENCRYPTION_FAILED' as const,
  DECRYPTION_FAILED: 'DECRYPTION_FAILED' as const,
  ACCESS_DENIED: 'ACCESS_DENIED' as const,
  WALLET_NOT_CONNECTED: 'WALLET_NOT_CONNECTED' as const,
  NETWORK_ERROR: 'NETWORK_ERROR' as const,
  INVALID_DATA: 'INVALID_DATA' as const,
  SESSION_EXPIRED: 'SESSION_EXPIRED' as const,
} as const;

export type EncryptionErrorType = typeof EncryptionErrorType[keyof typeof EncryptionErrorType];

export interface EncryptionError extends Error {
  type: EncryptionErrorType;
  details?: any;
  recoverable: boolean;
}

export class LitProtocolError extends Error implements EncryptionError {
  type: EncryptionErrorType;
  details?: any;
  recoverable: boolean;

  constructor(
    type: EncryptionErrorType, 
    message: string, 
    details?: any, 
    recoverable: boolean = true
  ) {
    super(message);
    this.name = 'LitProtocolError';
    this.type = type;
    this.details = details;
    this.recoverable = recoverable;
  }
}

export const handleEncryptionError = (error: Error | EncryptionError, context: string = '') => {
  console.error(`Encryption Error${context ? ` in ${context}` : ''}:`, error);

  const isLitError = error instanceof LitProtocolError;
  const errorType = isLitError ? error.type : EncryptionErrorType.NETWORK_ERROR;
  const recoverable = isLitError ? error.recoverable : true;

  switch (errorType) {
    case EncryptionErrorType.CONNECTION_FAILED:
      toast.error('Connection Failed', {
        description: 'Failed to connect to Lit Network. Check your internet connection and try again.',
        action: recoverable ? {
          label: 'Retry',
          onClick: () => window.location.reload()
        } : undefined
      });
      break;

    case EncryptionErrorType.ENCRYPTION_FAILED:
      toast.error('Encryption Failed', {
        description: 'Unable to encrypt your message. Please try sending again.',
        action: {
          label: 'Try Again',
          onClick: () => {}
        }
      });
      break;

    case EncryptionErrorType.DECRYPTION_FAILED:
      toast.error('Cannot Decrypt Message', {
        description: 'You may not have permission to view this message, or there was a decryption error.',
        duration: 5000
      });
      break;

    case EncryptionErrorType.ACCESS_DENIED:
      toast.error('Access Denied', {
        description: 'You don\'t have permission to decrypt messages in this chatroom.',
        duration: 5000
      });
      break;

    case EncryptionErrorType.WALLET_NOT_CONNECTED:
      toast.error('Wallet Required', {
        description: 'Please connect your wallet to encrypt/decrypt messages.',
        action: {
          label: 'Connect Wallet',
          onClick: () => {
            window.dispatchEvent(new CustomEvent('connect-wallet'));
          }
        }
      });
      break;

    case EncryptionErrorType.SESSION_EXPIRED:
      toast.error('Session Expired', {
        description: 'Your encryption session has expired. Please reconnect.',
        action: {
          label: 'Reconnect',
          onClick: () => {
            window.dispatchEvent(new CustomEvent('reconnect-lit'));
          }
        }
      });
      break;

    case EncryptionErrorType.NETWORK_ERROR:
    default:
      toast.error('Network Error', {
        description: error.message || 'An unexpected error occurred. Please try again.',
        action: recoverable ? {
          label: 'Retry',
          onClick: () => {}
        } : undefined
      });
      break;
  }

  return {
    type: errorType,
    recoverable,
    message: error.message
  };
};
export const showEncryptionSuccess = (operation: 'encrypt' | 'decrypt' | 'connect') => {
  switch (operation) {
    case 'encrypt':
      toast.success('Message Encrypted', {
        description: 'Your message has been encrypted and sent securely.',
        duration: 3000
      });
      break;
    case 'decrypt':
      break;
    case 'connect':
      toast.success('Encryption Ready', {
        description: 'Connected to Lit Network. Your messages will now be encrypted.',
        duration: 4000
      });
      break;
  }
};

export const showEncryptionLoading = (operation: 'encrypt' | 'decrypt' | 'connect') => {
  switch (operation) {
    case 'encrypt':
      return toast.loading('Encrypting message...', {
        description: 'Securing your message with end-to-end encryption'
      });
    case 'decrypt':
      return toast.loading('Decrypting message...', {
        description: 'Unlocking encrypted content'
      });
    case 'connect':
      return toast.loading('Connecting to Lit Network...', {
        description: 'Setting up secure encryption'
      });
  }
};

export const dismissToast = (toastId: string | number) => {
  toast.dismiss(toastId);
};
export const createLitError = (
  type: EncryptionErrorType,
  message: string,
  details?: any,
  recoverable: boolean = true
): LitProtocolError => {
  return new LitProtocolError(type, message, details, recoverable);
};