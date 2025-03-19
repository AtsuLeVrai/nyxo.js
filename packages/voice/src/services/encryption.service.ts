import crypto from "node:crypto";
import sodium from "sodium-native";
import { EncryptionMode } from "../types/index.js";

/**
 * Service for handling voice data encryption
 *
 * Provides encryption capabilities for Discord voice data
 * using the recommended encryption modes (AES256-GCM or XChaCha20-Poly1305)
 */
export class VoiceEncryptionService {
  /** Currently selected encryption mode */
  #mode: EncryptionMode | null = null;

  /** Secret key for encryption */
  #secretKey: Uint8Array | null = null;

  /** Rolling nonce counter for encryption */
  #nonce = 0;

  /**
   * Gets the currently selected encryption mode
   */
  get mode(): EncryptionMode | null {
    return this.#mode;
  }

  /**
   * Checks if the encryption service is initialized
   */
  isInitialized(): boolean {
    return this.#mode !== null && this.#secretKey !== null;
  }

  /**
   * Initializes the encryption service with the given mode and key
   *
   * @param mode - Encryption mode to use
   * @param key - Secret key for encryption
   */
  initialize(mode: EncryptionMode, key: Uint8Array): void {
    // Validate the encryption mode (only support recommended modes)
    if (
      mode !== EncryptionMode.AeadAes256GcmRtpsize &&
      mode !== EncryptionMode.AeadXChaCha20Poly1305Rtpsize
    ) {
      throw new Error(
        `Encryption mode ${mode} is not recommended by Discord. Please use AeadAes256GcmRtpsize or AeadXChaCha20Poly1305Rtpsize.`,
      );
    }

    // Validate the key size for the selected mode
    if (key.length !== 32) {
      throw new Error(
        `Encryption requires a 32-byte key, got ${key.length} bytes`,
      );
    }

    this.#mode = mode;
    this.#secretKey = key;
    this.#nonce = 0;
  }

  /**
   * Gets the next nonce for encryption
   */
  getNextNonce(): number {
    return this.#nonce++;
  }

  /**
   * Creates a nonce for the current encryption mode
   *
   * @returns Nonce suitable for the selected encryption mode
   */
  createNonce(): Buffer {
    if (!this.isInitialized()) {
      throw new Error("Encryption service not initialized");
    }

    if (this.#mode === EncryptionMode.AeadAes256GcmRtpsize) {
      // For AES-GCM mode, we use a 12-byte nonce
      const nonceValue = this.getNextNonce();
      const nonce = Buffer.allocUnsafe(12).fill(0);
      nonce.writeUInt32BE(nonceValue, 8); // Write to the last 4 bytes
      return nonce;
    }
    // For XChaCha20-Poly1305, we use a 24-byte nonce (first 20 bytes are 0)
    const nonceValue = this.getNextNonce();
    const nonce = Buffer.allocUnsafe(24).fill(0);
    nonce.writeUInt32BE(nonceValue, 20); // Write to the last 4 bytes
    return nonce;
  }

  /**
   * Encrypts audio data using the selected encryption mode
   *
   * @param header - RTP header
   * @param buffer - Audio data to encrypt
   * @returns Encrypted audio data
   */
  encrypt(header: Buffer, buffer: Buffer): Buffer {
    if (!this.isInitialized()) {
      throw new Error("Encryption service not initialized");
    }

    if (!this.#secretKey) {
      throw new Error("Secret key not set");
    }

    // Calculate the unencrypted portion size (RTP header + extensions)
    const rtpSize = this.#calculateRtpSize(header);

    // Split the buffer into header (unencrypted) and payload (to be encrypted)
    const rtpHeader = buffer.subarray(0, rtpSize);
    const payload = buffer.subarray(rtpSize);

    // Create the nonce
    const nonce = this.createNonce();

    if (this.#mode === EncryptionMode.AeadAes256GcmRtpsize) {
      return this.#encryptAesGcm(payload, nonce, rtpHeader);
    }
    return this.#encryptXChaCha20Poly1305(payload, nonce, rtpHeader);
  }

  /**
   * Decrypts audio data using the selected encryption mode
   *
   * @param data - Encrypted packet (includes RTP header)
   * @returns Decrypted audio data
   */
  decrypt(data: Buffer): Buffer {
    if (!this.isInitialized()) {
      throw new Error("Encryption service not initialized");
    }

    if (!this.#secretKey) {
      throw new Error("Secret key not set");
    }

    // Calculate the unencrypted portion size (RTP header + extensions)
    const rtpSize = this.#calculateRtpSize(data);

    if (this.#mode === EncryptionMode.AeadAes256GcmRtpsize) {
      return this.#decryptAesGcm(data, rtpSize);
    }
    return this.#decryptXChaCha20Poly1305(data, rtpSize);
  }

  /**
   * Resets the encryption service
   */
  reset(): void {
    this.#mode = null;
    this.#secretKey = null;
    this.#nonce = 0;
  }

  /**
   * Calculates the RTP size (unencrypted portion)
   *
   * @param header - RTP header
   * @returns Size of the unencrypted portion
   * @private
   */
  #calculateRtpSize(header: Buffer): number {
    // The basic RTP header is 12 bytes
    let size = 12;

    // Check if there are extensions (X bit set in first byte)
    if (((header[0] as number) & 0x10) !== 0) {
      // Extension header starts at byte 12
      // Extension header length is at bytes 14-15 (2 bytes)
      // The length is in 32-bit words, so multiply by 4 to get bytes
      const extensionLength = header.readUInt16BE(14) * 4;

      // Add the extension header (4 bytes) and the extension data
      size += 4 + extensionLength;
    }

    return size;
  }

  /**
   * Encrypts data using AES-256-GCM
   *
   * @param data - Data to encrypt
   * @param nonce - Encryption nonce
   * @param rtpHeader - RTP header (unencrypted portion)
   * @returns Encrypted data
   * @private
   */
  #encryptAesGcm(data: Buffer, nonce: Buffer, rtpHeader: Buffer): Buffer {
    if (!this.#secretKey) {
      throw new Error("Secret key not set");
    }

    // Create cipher
    const cipher = crypto.createCipheriv("aes-256-gcm", this.#secretKey, nonce);

    // Add the header as additional authenticated data
    cipher.setAAD(rtpHeader);

    // Encrypt the data
    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);

    // Get the authentication tag (16 bytes)
    const authTag = cipher.getAuthTag();

    // Extract the last 4 bytes of the nonce (the counter)
    const nonceCounter = Buffer.allocUnsafe(4);
    nonce.copy(nonceCounter, 0, 8, 12);

    // Structure: [unencrypted_header, encrypted_data, auth_tag, nonce_counter]
    return Buffer.concat([rtpHeader, encrypted, authTag, nonceCounter]);
  }

  /**
   * Decrypts data using AES-256-GCM
   *
   * @param data - Encrypted data (includes RTP header)
   * @param rtpSize - Size of the RTP header (unencrypted portion)
   * @returns Decrypted data
   * @private
   */
  #decryptAesGcm(data: Buffer, rtpSize: number): Buffer {
    if (!this.#secretKey) {
      throw new Error("Secret key not set");
    }

    // Extract the unencrypted RTP header
    const rtpHeader = data.subarray(0, rtpSize);

    // Extract the rest of the data
    const remaining = data.subarray(rtpSize);

    // The last 4 bytes are the nonce counter
    const nonceCounter = remaining.subarray(remaining.length - 4);

    // The 16 bytes before that are the auth tag
    const authTag = remaining.subarray(
      remaining.length - 20,
      remaining.length - 4,
    );

    // The rest is the encrypted data
    const encryptedData = remaining.subarray(0, remaining.length - 20);

    // Create the full nonce (12 bytes)
    const nonce = Buffer.allocUnsafe(12).fill(0);
    nonceCounter.copy(nonce, 8);

    // Create decipher
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      this.#secretKey,
      nonce,
    );

    // Set auth tag
    decipher.setAuthTag(authTag);

    // Add the header as additional authenticated data
    decipher.setAAD(rtpHeader);

    try {
      // Decrypt the data
      const decrypted = Buffer.concat([
        decipher.update(encryptedData),
        decipher.final(),
      ]);

      // Return the full packet with the decrypted payload
      return Buffer.concat([rtpHeader, decrypted]);
    } catch (error) {
      throw new Error(
        `Failed to decrypt data: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Encrypts data using XChaCha20-Poly1305
   *
   * @param data - Data to encrypt
   * @param nonce - Encryption nonce
   * @param rtpHeader - RTP header (unencrypted portion)
   * @returns Encrypted data
   * @private
   */
  #encryptXChaCha20Poly1305(
    data: Buffer,
    nonce: Buffer,
    rtpHeader: Buffer,
  ): Buffer {
    if (!this.#secretKey) {
      throw new Error("Secret key not set");
    }

    // Use sodium to encrypt with XChaCha20-Poly1305
    const cipher = Buffer.allocUnsafe(
      data.length + sodium.crypto_aead_xchacha20poly1305_ietf_ABYTES,
    );

    // Correctly call the sodium function with the proper parameters
    sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
      cipher, // output ciphertext
      data, // message
      rtpHeader, // additional data
      null, // nsec (not used, always null)
      nonce, // nonce
      Buffer.from(this.#secretKey), // key
    );

    // The auth tag is the last 16 bytes
    const authTag = cipher.subarray(cipher.length - 16);

    // The encrypted data is everything before the auth tag
    const encrypted = cipher.subarray(0, cipher.length - 16);

    // Extract the last 4 bytes of the nonce (the counter)
    const nonceCounter = Buffer.allocUnsafe(4);
    nonce.copy(nonceCounter, 0, 20, 24);

    // Structure: [unencrypted_header, encrypted_data, auth_tag, nonce_counter]
    return Buffer.concat([rtpHeader, encrypted, authTag, nonceCounter]);
  }

  /**
   * Decrypts data using XChaCha20-Poly1305
   *
   * @param data - Encrypted data (includes RTP header)
   * @param rtpSize - Size of the RTP header (unencrypted portion)
   * @returns Decrypted data
   * @private
   */
  #decryptXChaCha20Poly1305(data: Buffer, rtpSize: number): Buffer {
    if (!this.#secretKey) {
      throw new Error("Secret key not set");
    }

    // Extract the unencrypted RTP header
    const rtpHeader = data.subarray(0, rtpSize);

    // Extract the rest of the data
    const remaining = data.subarray(rtpSize);

    // The last 4 bytes are the nonce counter
    const nonceCounter = remaining.subarray(remaining.length - 4);

    // The 16 bytes before that are the auth tag
    const authTag = remaining.subarray(
      remaining.length - 20,
      remaining.length - 4,
    );

    // The rest is the encrypted data
    const encryptedData = remaining.subarray(0, remaining.length - 20);

    // Create the full nonce (24 bytes)
    const nonce = Buffer.allocUnsafe(24).fill(0);
    nonceCounter.copy(nonce, 20);

    // Combine encrypted data and auth tag for sodium API
    const cipherData = Buffer.concat([encryptedData, authTag]);

    // Create buffer for decrypted data
    const decrypted = Buffer.allocUnsafe(encryptedData.length);

    try {
      // Sodium-native's decrypt function doesn't return a boolean
      // It throws an error if decryption fails
      sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
        decrypted, // output message
        null, // nsec (not used, always null)
        cipherData, // ciphertext
        rtpHeader, // additional data
        nonce, // nonce
        Buffer.from(this.#secretKey), // key
      );

      // If we get here, decryption was successful
      // Combine with header and return
      return Buffer.concat([rtpHeader, decrypted]);
    } catch (error) {
      throw new Error(
        `XChaCha20-Poly1305 decryption failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
