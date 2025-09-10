// services/encryptionService.ts (Development version - allows bypass)
import CryptoJS from 'crypto-js';
import * as SecureStore from 'expo-secure-store';

export class EncryptionService {
  private static masterKey: string | null = null;
  private static devMode: boolean = true; // Set to false in production

  /**
   * Derive encryption key from master password using PBKDF2
   */
  private static deriveKey(masterPassword: string, salt: string): string {
    return CryptoJS.PBKDF2(masterPassword, salt, {
      keySize: 256 / 32,
      iterations: 10000,
      hasher: CryptoJS.algo.SHA256
    }).toString();
  }

  /**
   * Generate random salt
   */
  private static generateSalt(): string {
    return CryptoJS.lib.WordArray.random(128 / 8).toString();
  }

  /**
   * Set master password and derive key
   */
  static async setMasterPassword(masterPassword: string): Promise<void> {
    let salt = await SecureStore.getItemAsync('encryption_salt');
    if (!salt) {
      salt = this.generateSalt();
      await SecureStore.setItemAsync('encryption_salt', salt);
    }

    this.masterKey = this.deriveKey(masterPassword, salt);
    
    const verificationToken = 'master_password_verification';
    const encryptedToken = this.encryptData(verificationToken);
    await SecureStore.setItemAsync('verification_token', encryptedToken);
  }

  /**
   * Development mode: Set a temporary master key
   */
  static setTempMasterKey(): void {
    if (this.devMode) {
      this.masterKey = 'temp_dev_key_12345';
      console.log('🔑 Development mode: Using temporary master key');
    }
  }

  /**
   * Verify master password
   */
  static async verifyMasterPassword(masterPassword: string): Promise<boolean> {
    try {
      const salt = await SecureStore.getItemAsync('encryption_salt');
      if (!salt) return false;

      const testKey = this.deriveKey(masterPassword, salt);
      const storedToken = await SecureStore.getItemAsync('verification_token');
      
      if (!storedToken) return false;

      const originalKey = this.masterKey;
      this.masterKey = testKey;

      try {
        const decrypted = this.decryptData(storedToken);
        const isValid = decrypted === 'master_password_verification';
        
        if (!isValid) {
          this.masterKey = originalKey;
        }
        
        return isValid;
      } catch {
        this.masterKey = originalKey;
        return false;
      }
    } catch {
      return false;
    }
  }

  /**
   * Check if master key is available (or dev mode is enabled)
   */
  static isMasterKeySet(): boolean {
    if (this.devMode && !this.masterKey) {
      this.setTempMasterKey();
    }
    return this.masterKey !== null;
  }

  /**
   * Clear master key from memory (logout)
   */
  static clearMasterKey(): void {
    this.masterKey = null;
  }

  /**
   * Encrypt password
   */
  static encryptPassword(password: string): string {
    if (!this.isMasterKeySet()) {
      throw new Error('Master key not set. Please authenticate first.');
    }
    return this.encryptData(password);
  }

  /**
   * Decrypt password
   */
  static decryptPassword(encryptedPassword: string): string {
    if (!this.isMasterKeySet()) {
      throw new Error('Master key not set. Please authenticate first.');
    }
    return this.decryptData(encryptedPassword);
  }

  /**
   * Internal encryption method
   */
  private static encryptData(data: string): string {
    if (!this.masterKey) {
      throw new Error('Master key not set');
    }

    // In dev mode with temp key, just base64 encode for simplicity
    if (this.devMode && this.masterKey === 'temp_dev_key_12345') {
      return btoa(data); // Simple base64 encoding for development
    }

    const encrypted = CryptoJS.AES.encrypt(data, this.masterKey).toString();
    return encrypted;
  }

  /**
   * Internal decryption method
   */
  private static decryptData(encryptedData: string): string {
    if (!this.masterKey) {
      throw new Error('Master key not set');
    }

    // In dev mode with temp key, decode from base64
    if (this.devMode && this.masterKey === 'temp_dev_key_12345') {
      try {
        return atob(encryptedData); // Simple base64 decoding for development
      } catch {
        // If it's not base64, return as is (for existing plain text passwords)
        return encryptedData;
      }
    }

    const bytes = CryptoJS.AES.decrypt(encryptedData, this.masterKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decrypted) {
      throw new Error('Failed to decrypt data. Invalid key or corrupted data.');
    }
    
    return decrypted;
  }

  /**
   * Generate secure random password
   */
  static generateSecurePassword(length: number = 16): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    
    return Array.from(array, byte => charset[byte % charset.length]).join('');
  }

  /**
   * Enable/disable development mode
   */
  static setDevMode(enabled: boolean): void {
    this.devMode = enabled;
    if (!enabled && this.masterKey === 'temp_dev_key_12345') {
      this.clearMasterKey();
    }
  }
}