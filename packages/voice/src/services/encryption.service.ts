import { z } from "zod";
import {
  type CryptoImplementation,
  createUnifiedCrypto,
} from "../polyfills/index.js";
import { VoiceEncryptionMode, type VoicePacket } from "../types/index.js";

/**
 * Options for the voice encryption service
 *
 * Controls aspects of encryption, including mode and nonce handling preferences
 */
export const EncryptionOptions = z.object({
  /**
   * The encryption mode to use
   *
   * Discord supports multiple modes, but the two recommended ones are:
   * - AEAD_AES256_GCM_RTPSIZE: Optimized for modern hardware (preferred)
   * - AEAD_XCHACHA20_POLY1305_RTPSIZE: Compatible with all platforms (required)
   *
   * @default VoiceEncryptionMode.AEAD_XCHACHA20_POLY1305_RTPSIZE
   */
  mode: z
    .nativeEnum(VoiceEncryptionMode)
    .default(VoiceEncryptionMode.AeadXchacha20Poly1305Rtpsize),

  /**
   * Initial size for separating unencrypted RTP header
   *
   * This value is typically 12 bytes for *_RTPSIZE modes
   *
   * @default 12
   */
  rtpHeaderSize: z.number().int().min(0).default(12),
});

export type EncryptionOptions = z.infer<typeof EncryptionOptions>;

/**
 * Service responsible for encrypting and decrypting Discord audio packets
 *
 * This class implements the encryption algorithms required by Discord to
 * secure audio communications. It supports modern encryption modes and
 * automatically handles nonce generation and application.
 *
 * Main features:
 * - Support for AES-GCM and XChaCha20-Poly1305 encryption algorithms
 * - AES-GCM is implemented via the node:crypto module for maximum compatibility
 * - Automatic nonce management based on RTP header
 * - Discord-compliant encryption for RTP packets
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#transport-encryption-and-sending-voice}
 */
export class EncryptionService {
  /**
   * Unified cryptographic implementation
   * Abstracts differences between libraries
   * @private
   */
  #crypto: CryptoImplementation | null = null;

  /**
   * Secret key used for encryption/decryption
   * Set by setSecretKey() after receiving the key from Discord
   * @private
   */
  #secretKey: Uint8Array | null = null;

  /**
   * Indicates if the service has been properly initialized
   * Checked before any encryption/decryption operation
   * @private
   */
  #initialized = false;

  /**
   * Array for encryption/decryption operations
   * Reused to avoid frequent allocations
   * @private
   */
  #nonce = new Uint8Array(24);

  /**
   * Configuration options for the encryption service
   * @private
   */
  readonly #options: EncryptionOptions;

  /**
   * Creates a new instance of the encryption service
   *
   * @param options - Configuration options for encryption
   */
  constructor(options: EncryptionOptions) {
    this.#options = options;
  }

  /**
   * Gets the encryption mode currently being used
   *
   * @returns The current encryption mode
   */
  get mode(): VoiceEncryptionMode {
    return this.#options.mode;
  }

  /**
   * Checks if the service has been properly initialized
   *
   * @returns true if the service is initialized and ready to use
   */
  get isInitialized(): boolean {
    return this.#initialized && this.#secretKey !== null;
  }

  /**
   * Initializes the encryption service by loading the appropriate implementation
   *
   * This method uses the polyfill to automatically load the most appropriate
   * cryptographic library (sodium-native, libsodium-wrappers or tweetnacl).
   *
   * @throws {Error} If initialization fails or if no encryption library is available
   * @returns A promise that resolves when initialization is complete
   */
  async initialize(): Promise<void> {
    // Destroy any existing instance
    this.destroy();

    try {
      // Check encryption mode validity
      this.#validateEncryptionMode();

      // Use the polyfill to create a unified cryptographic implementation
      this.#crypto = await createUnifiedCrypto();

      // Mark as initialized
      this.#initialized = true;
    } catch (error) {
      throw new Error(
        `Failed to initialize encryption service: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Sets the secret key used for encryption/decryption
   *
   * This method must be called after receiving the secret key from Discord
   * in the VoiceSessionDescription event.
   *
   * @param secretKey - 32-byte secret key received from Discord
   * @throws {Error} If the key is not the expected size or if the service is not initialized
   */
  setSecretKey(secretKey: number[] | Uint8Array): void {
    if (!(this.#initialized && this.#crypto)) {
      throw new Error(
        "Encryption service is not initialized. Call initialize() first.",
      );
    }

    // Convert the key to Uint8Array if provided as an array of numbers
    const key = Array.isArray(secretKey)
      ? new Uint8Array(secretKey)
      : secretKey;

    // Check the key size
    if (key.length !== 32) {
      throw new Error(`Invalid secret key size: ${key.length} (expected: 32)`);
    }

    // Store the key
    this.#secretKey = key;
  }

  /**
   * Encrypts an audio packet for transmission
   *
   * Takes an Opus audio packet and encrypts it according to the configured mode.
   * The RTP header remains unencrypted, while the audio data is encrypted.
   *
   * @param packet - Audio packet to encrypt including RTP header and audio data
   * @returns The encrypted packet
   * @throws {Error} If the service is not initialized or if the secret key is not set
   */
  encryptPacket(packet: VoicePacket): Uint8Array {
    if (!(this.isInitialized && this.#crypto && this.#secretKey)) {
      throw new Error(
        "Service is not fully initialized. Call initialize() and setSecretKey() first.",
      );
    }

    try {
      // Extract packet components for encryption
      const header = this.#createRtpHeader(packet);
      const audioData = packet.encryptedAudio;

      // Prepare the nonce based on RTP header
      const nonce = this.#prepareNonce(header);

      // Encrypt the audio data based on the mode
      let encryptedData: Uint8Array;

      if (this.#options.mode === VoiceEncryptionMode.AeadAes256GcmRtpsize) {
        // Use AES-GCM (implemented via node:crypto)
        encryptedData = this.#crypto.aes256gcmEncrypt(
          audioData,
          nonce.subarray(0, 12),
          this.#secretKey,
        );
      } else {
        // Use XChaCha20-Poly1305
        encryptedData = this.#crypto.xchacha20poly1305Encrypt(
          audioData,
          nonce,
          this.#secretKey,
        );
      }

      // Build the final packet
      return this.#assemblePacket(header, encryptedData);
    } catch (error) {
      throw new Error(
        `Error encrypting packet: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Decrypts a received audio packet
   *
   * Takes an encrypted audio packet and decrypts it according to the configured mode.
   *
   * @param packet - Encrypted audio packet received
   * @returns The decrypted audio data
   * @throws {Error} If the service is not initialized or if decryption fails
   */
  decryptPacket(packet: Uint8Array): Uint8Array {
    if (!(this.isInitialized && this.#crypto && this.#secretKey)) {
      throw new Error(
        "Service is not fully initialized. Call initialize() and setSecretKey() first.",
      );
    }

    try {
      // Extract the RTP header (always unencrypted)
      const headerSize = this.#options.rtpHeaderSize;
      const header = packet.subarray(0, headerSize);
      const encryptedData = packet.subarray(headerSize);

      // Prepare the nonce based on RTP header
      const nonce = this.#prepareNonce(header);

      // Decrypt the data based on the mode
      let decryptedData: Uint8Array | null;

      if (this.#options.mode === VoiceEncryptionMode.AeadAes256GcmRtpsize) {
        // Use AES-GCM (implemented via node:crypto)
        decryptedData = this.#crypto.aes256gcmDecrypt(
          encryptedData,
          nonce.subarray(0, 12),
          this.#secretKey,
        );
      } else {
        // Use XChaCha20-Poly1305
        decryptedData = this.#crypto.xchacha20poly1305Decrypt(
          encryptedData,
          nonce,
          this.#secretKey,
        );
      }

      if (!decryptedData) {
        throw new Error("Failed to verify packet authenticity");
      }

      return decryptedData;
    } catch (error) {
      throw new Error(
        `Error decrypting packet: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Cleans up resources used by the service
   *
   * Resets internal state and releases references.
   */
  destroy(): void {
    this.#crypto = null;
    this.#secretKey = null;
    this.#initialized = false;
  }

  /**
   * Creates an RTP header from a voice packet
   *
   * @param packet - Voice packet information
   * @returns The RTP header as a Uint8Array
   * @private
   */
  #createRtpHeader(packet: VoicePacket): Uint8Array {
    const header = new Uint8Array(12);

    // First byte: version and flags (0x80)
    header[0] = packet.versionAndFlags;

    // Second byte: payload type (0x78)
    header[1] = packet.payloadType;

    // Bytes 2-3: sequence number (big-endian)
    header[2] = (packet.sequence >> 8) & 0xff;
    header[3] = packet.sequence & 0xff;

    // Bytes 4-7: timestamp (big-endian)
    header[4] = (packet.timestamp >> 24) & 0xff;
    header[5] = (packet.timestamp >> 16) & 0xff;
    header[6] = (packet.timestamp >> 8) & 0xff;
    header[7] = packet.timestamp & 0xff;

    // Bytes 8-11: SSRC (big-endian)
    header[8] = (packet.ssrc >> 24) & 0xff;
    header[9] = (packet.ssrc >> 16) & 0xff;
    header[10] = (packet.ssrc >> 8) & 0xff;
    header[11] = packet.ssrc & 0xff;

    return header;
  }

  /**
   * Prepares the nonce for encryption based on RTP header
   *
   * @param header - RTP header to use as nonce
   * @returns The prepared nonce
   * @private
   */
  #prepareNonce(header: Uint8Array): Uint8Array {
    const nonce = this.#nonce;
    nonce.fill(0);

    // For _rtpsize modes, use the RTP header as nonce
    nonce.set(header);

    return nonce;
  }

  /**
   * Assembles the final packet with header and encrypted data
   *
   * @param header - RTP header
   * @param encryptedData - Encrypted audio data
   * @returns The complete assembled packet
   * @private
   */
  #assemblePacket(header: Uint8Array, encryptedData: Uint8Array): Uint8Array {
    // For _rtpsize modes, the format is: Header + Encrypted data
    const packetSize = header.length + encryptedData.length;
    const packet = new Uint8Array(packetSize);

    // Copy the header
    packet.set(header, 0);

    // Copy the encrypted data
    packet.set(encryptedData, header.length);

    return packet;
  }

  /**
   * Validates the encryption mode
   *
   * @throws {Error} If the mode is not supported or is deprecated
   * @private
   */
  #validateEncryptionMode(): void {
    // Check if the mode is valid (only non-deprecated modes)
    const validModes = [
      VoiceEncryptionMode.AeadAes256GcmRtpsize,
      VoiceEncryptionMode.AeadXchacha20Poly1305Rtpsize,
    ];

    if (!validModes.includes(this.#options.mode)) {
      throw new Error(
        `Encryption mode ${this.#options.mode} is deprecated or not supported. Please use AeadAes256GcmRtpsize or AeadXchacha20Poly1305Rtpsize.`,
      );
    }
  }
}
