import crypto from 'crypto';
import { log } from '../vite';

/**
 * Service for encrypting and decrypting sensitive user data
 * Uses AES-256-GCM for encryption with authentication
 */

// Use environment variable for encryption key or generate one
// In production, this should be a persistent key stored securely
const ENCRYPTION_KEY_ENV = process.env.ENCRYPTION_KEY;
let ENCRYPTION_KEY: Buffer;

if (ENCRYPTION_KEY_ENV) {
  // Use provided key (should be a 32-byte hex string)
  ENCRYPTION_KEY = Buffer.from(ENCRYPTION_KEY_ENV, 'hex');
  if (ENCRYPTION_KEY.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be a 32-byte (64 character) hex string');
  }
} else {
  // Generate a key for this session (will change on server restart)
  ENCRYPTION_KEY = crypto.randomBytes(32);
  log('Encryption key generated for this session', 'security');
  // Note: In production, avoid logging security-related information
}

// Algorithm to use for encryption
const ALGORITHM = 'aes-256-gcm';

/**
 * Encrypt a piece of sensitive data
 * @param text The plain text to encrypt
 * @returns An object containing the encrypted data and metadata needed for decryption
 */
export function encrypt(text: string): { 
  encryptedData: string, 
  iv: string, 
  authTag: string 
} {
  try {
    // Generate a random initialization vector for each encryption
    const iv = crypto.randomBytes(16);
    
    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    
    // Encrypt the data
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get the authentication tag (for GCM mode)
    const authTag = cipher.getAuthTag().toString('hex');
    
    return {
      encryptedData: encrypted,
      iv: iv.toString('hex'),
      authTag
    };
  } catch (error) {
    log(`Encryption error: ${error}`, 'security');
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt previously encrypted data
 * @param encryptedData The encrypted data (hex string)
 * @param iv The initialization vector used for encryption (hex string)
 * @param authTag The authentication tag from encryption (hex string)
 * @returns The decrypted plain text or null if decryption fails
 */
export function decrypt(encryptedData: string, iv: string, authTag: string): string | null {
  try {
    // Convert hex strings back to buffers
    const ivBuffer = Buffer.from(iv, 'hex');
    const authTagBuffer = Buffer.from(authTag, 'hex');
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, ivBuffer);
    decipher.setAuthTag(authTagBuffer);
    
    // Decrypt the data
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    log(`Decryption error: ${error}`, 'security');
    return null; // Return null instead of throwing to handle decryption failures gracefully
  }
}

/**
 * Field-level encryption for objects
 * @param data The object containing fields to encrypt
 * @param fieldsToEncrypt Array of field names that should be encrypted
 * @returns A new object with the specified fields encrypted
 */
export function encryptFields<T extends Record<string, any>>(
  data: T, 
  fieldsToEncrypt: (keyof T)[]
): Record<string, any> {
  const result = { ...data };
  
  for (const field of fieldsToEncrypt) {
    const fieldName = String(field);
    if (data[fieldName] && typeof data[fieldName] === 'string') {
      const encrypted = encrypt(data[fieldName] as string);
      
      // Delete the original field
      delete result[fieldName];
      
      // Store encrypted data and metadata as separate fields
      result[`${fieldName}_encrypted`] = encrypted.encryptedData;
      result[`${fieldName}_iv`] = encrypted.iv;
      result[`${fieldName}_auth`] = encrypted.authTag;
    }
  }
  
  return result;
}

/**
 * Decrypt fields in an object that were previously encrypted
 * @param data The object containing encrypted fields
 * @param fieldsToDecrypt Array of field names that should be decrypted
 * @returns A new object with the specified fields decrypted
 */
export function decryptFields<T extends Record<string, any>>(
  data: T, 
  fieldsToDecrypt: string[]
): Record<string, any> {
  // Create a new object to avoid modifying the original
  const result: Record<string, any> = { ...data };
  
  for (const field of fieldsToDecrypt) {
    const encryptedField = `${field}_encrypted`;
    const ivField = `${field}_iv`;
    const authField = `${field}_auth`;
    
    // Check if all required encryption fields exist
    if (
      result[encryptedField] && 
      result[ivField] && 
      result[authField]
    ) {
      // Attempt to decrypt the field
      const decrypted = decrypt(
        result[encryptedField] as string, 
        result[ivField] as string, 
        result[authField] as string
      );
      
      if (decrypted) {
        // Add the decrypted value
        result[field] = decrypted;
        
        // Remove the encrypted fields
        delete result[encryptedField];
        delete result[ivField];
        delete result[authField];
      }
    }
  }
  
  return result;
}