import { createCipheriv, createDecipheriv } from "node:crypto";
import { XChaCha20Poly1305 } from "@stablelib/xchacha20poly1305";
import { EventEmitter } from "eventemitter3";
import { z } from "zod";
import {
  type DaveE2eeOpusFrameEntity,
  VoiceEncryptionMode,
  type VoiceRtpPacketEntity,
} from "../types/index.js";

/**
 * Zod schema for RTP packet options
 */
export const RtpPacketOptionsSchema = z
  .object({
    /**
     * Sequence number for the packet
     * 16-bit unsigned integer that increments with each packet
     */
    sequence: z.number().int().min(0).max(0xffff),

    /**
     * Timestamp for the packet
     * 32-bit unsigned integer that increments by frameSize with each packet
     */
    timestamp: z.number().int().min(0).max(0xffffffff),

    /**
     * SSRC (Synchronization Source) identifier for the packet
     * 32-bit identifier unique to the sender
     */
    ssrc: z.number().int().positive(),

    /**
     * Audio data to be encrypted and sent
     * Typically Opus-encoded audio
     */
    audioData: z.instanceof(Buffer).or(z.instanceof(Uint8Array)),

    /**
     * Optional MLS-derived key for DAVE protocol
     * Required when DAVE protocol is enabled
     * Must be 16 bytes (128 bits) for AES-128-GCM
     */
    daveKey: z.instanceof(Uint8Array).optional(),
  })
  .strict();

export type RtpPacketOptions = z.infer<typeof RtpPacketOptionsSchema>;

/**
 * Zod schema for RTP service options
 */
export const RtpServiceOptionsSchema = z
  .object({
    /**
     * Encryption mode to use for voice data
     * Discord recommends aead_aes256_gcm_rtpsize when available
     */
    encryptionMode: z
      .nativeEnum(VoiceEncryptionMode)
      .default(VoiceEncryptionMode.AeadAes256GcmRtpSize),

    /**
     * Secret key for encryption (provided by Discord)
     * Usually 32 bytes for AES-256-GCM
     */
    secretKey: z.instanceof(Uint8Array),

    /**
     * Whether to use DAVE protocol for end-to-end encryption
     * @default false
     */
    useDaveProtocol: z.boolean().default(false),

    /**
     * Size of the pre-allocated buffer pool for packet encryption
     * Higher values reduce memory allocations but use more memory
     * @default 10
     */
    bufferPoolSize: z.number().int().min(0).max(100).default(10),

    /**
     * Maximum packet size to pre-allocate
     * Most opus packets are under 200 bytes
     * @default 1500
     */
    maxPacketSize: z.number().int().positive().default(1500),
  })
  .strict();

export type RtpServiceOptions = z.infer<typeof RtpServiceOptionsSchema>;

/**
 * Events emitted by the RTP service
 */
export interface RtpServiceEvents {
  /**
   * Emitted when a packet is created
   * @param packet The RTP packet data
   * @param encryptionMode The encryption mode used
   */
  packetCreated: [packet: Buffer, encryptionMode: VoiceEncryptionMode];

  /**
   * Emitted when a packet is parsed
   * @param packet The parsed RTP packet entity
   */
  packetParsed: [packet: VoiceRtpPacketEntity];

  /**
   * Emitted when a packet is decrypted
   * @param data The decrypted audio data
   * @param packet The original packet that was decrypted
   */
  packetDecrypted: [data: Buffer, packet: VoiceRtpPacketEntity];

  /**
   * Emitted when an error occurs during packet processing
   * @param error The error that occurred
   * @param operation The operation that failed (create, parse, decrypt)
   */
  error: [error: Error, operation: "create" | "parse" | "decrypt"];

  /**
   * Emitted when DAVE protocol state changes
   * @param enabled Whether DAVE protocol is now enabled
   */
  daveProtocolChanged: [enabled: boolean];

  /**
   * Emitted when RTP service statistics are updated
   * @param stats Statistics object
   */
  stats: [stats: RtpServiceStats];
}

/**
 * Statistics about RTP service operation
 */
export interface RtpServiceStats {
  /**
   * Number of packets created
   */
  packetsCreated: number;

  /**
   * Number of packets parsed
   */
  packetsParsed: number;

  /**
   * Number of packets decrypted
   */
  packetsDecrypted: number;

  /**
   * Number of encryption errors
   */
  encryptionErrors: number;

  /**
   * Number of decryption errors
   */
  decryptionErrors: number;

  /**
   * Average packet size in bytes
   */
  averagePacketSize: number;

  /**
   * Current encryption mode
   */
  encryptionMode: VoiceEncryptionMode;

  /**
   * Whether DAVE protocol is enabled
   */
  daveProtocolEnabled: boolean;

  /**
   * Current nonce counter value
   */
  nonceCounter: string;

  /**
   * Current DAVE nonce counter value
   */
  daveNonceCounter: number;
}

/**
 * Service for managing RTP (Real-time Transport Protocol) packets
 *
 * Handles the creation, encryption, and decryption of voice packets
 * sent over UDP to Discord's voice servers.
 */
export class RtpService extends EventEmitter<RtpServiceEvents> {
  /**
   * Validated configuration options
   * @private
   */
  readonly #options: RtpServiceOptions;

  /**
   * Secret key for encryption (provided by Discord)
   * @private
   */
  readonly #secretKey: Uint8Array;

  /**
   * Encryption mode being used
   * @private
   */
  readonly #encryptionMode: VoiceEncryptionMode;

  /**
   * Counter for nonce generation (for certain encryption modes)
   * @private
   */
  #nonceCounter = BigInt(0);

  /**
   * Whether DAVE protocol E2EE is enabled
   * @private
   */
  #useDaveProtocol: boolean;

  /**
   * Counter for DAVE protocol nonce generation
   * @private
   */
  #daveNonceCounter = 0;

  /**
   * XChaCha20Poly1305 cipher for encryption/decryption (when applicable)
   * @private
   */
  readonly #xChaCha20Poly1305Cipher: XChaCha20Poly1305 | null = null;

  /**
   * Buffer pool for packet creation to reduce allocations
   * @private
   */
  readonly #bufferPool: Buffer[] = [];

  /**
   * Statistics tracking object
   * @private
   */
  readonly #stats: RtpServiceStats = {
    packetsCreated: 0,
    packetsParsed: 0,
    packetsDecrypted: 0,
    encryptionErrors: 0,
    decryptionErrors: 0,
    averagePacketSize: 0,
    encryptionMode: VoiceEncryptionMode.AeadAes256GcmRtpSize,
    daveProtocolEnabled: false,
    nonceCounter: "0",
    daveNonceCounter: 0,
  };

  /**
   * Creates a new RTP service
   *
   * @param options Configuration options for the RTP service
   * @throws {Error} If options validation fails
   */
  constructor(options: RtpServiceOptions) {
    super();
    this.#options = options;

    this.#secretKey = this.#options.secretKey;
    this.#encryptionMode = this.#options.encryptionMode;
    this.#useDaveProtocol = this.#options.useDaveProtocol;

    // Update stats
    this.#stats.encryptionMode = this.#encryptionMode;
    this.#stats.daveProtocolEnabled = this.#useDaveProtocol;

    // Initialize XChaCha20Poly1305 cipher if using that encryption mode
    if (this.#encryptionMode === "aead_xchacha20_poly1305_rtpsize") {
      // Convert key to 32 bytes if needed (some implementations provide different key lengths)
      const key =
        this.#secretKey.length === 32
          ? this.#secretKey
          : this.#secretKey.slice(0, 32);

      this.#xChaCha20Poly1305Cipher = new XChaCha20Poly1305(key);
    }

    // Initialize buffer pool
    this.#initializeBufferPool();
  }

  /**
   * Gets the current encryption mode
   * @returns The encryption mode being used
   */
  get encryptionMode(): VoiceEncryptionMode {
    return this.#encryptionMode;
  }

  /**
   * Checks if DAVE protocol is enabled
   * @returns True if DAVE protocol is enabled
   */
  get isDaveProtocolEnabled(): boolean {
    return this.#useDaveProtocol;
  }

  /**
   * Gets current RTP service statistics
   * @returns Current statistics
   */
  get stats(): RtpServiceStats {
    // Update dynamic stats
    this.#stats.nonceCounter = this.#nonceCounter.toString();
    this.#stats.daveNonceCounter = this.#daveNonceCounter;

    // Return a copy to prevent mutation
    return { ...this.#stats };
  }

  /**
   * Creates an RTP packet with encrypted audio data
   *
   * @param options Options for the RTP packet
   * @returns Buffer containing the formatted RTP packet
   * @throws {Error} If packet creation fails or options are invalid
   */
  createPacket(options: RtpPacketOptions): Buffer {
    try {
      // Validate options
      const validatedOptions = RtpPacketOptionsSchema.parse(options);
      const { sequence, timestamp, ssrc, audioData, daveKey } =
        validatedOptions;

      // Check if DAVE protocol is enabled and we have the required key
      if (this.#useDaveProtocol) {
        if (!daveKey) {
          throw new Error("DAVE protocol is enabled, but no key was provided");
        }

        // Apply DAVE protocol for E2EE
        const daveNonce = this.#daveNonceCounter++;
        const daveFrame = this.createDaveE2eeFrame(
          Buffer.from(audioData),
          daveNonce,
          daveKey,
        );

        // Create RTP header and encrypt with transport encryption
        const header = this.#createRtpHeader(sequence, timestamp, ssrc);
        const encrypted = this.#encryptAudio(daveFrame, header);

        // Combine header and encrypted data
        const packet = this.#getPacketBuffer(header.length + encrypted.length);
        header.copy(packet, 0);
        encrypted.copy(packet, header.length);

        // Update statistics
        this.#stats.packetsCreated++;
        this.#stats.averagePacketSize = this.#calculateRunningAverage(
          this.#stats.averagePacketSize,
          packet.length,
          this.#stats.packetsCreated,
        );

        // Emit event
        this.emit("packetCreated", packet, this.#encryptionMode);

        // Update stats every 100 packets
        if (this.#stats.packetsCreated % 100 === 0) {
          this.emit("stats", this.stats);
        }

        return packet;
      }

      // Create RTP header and encrypt with transport encryption only
      const header = this.#createRtpHeader(sequence, timestamp, ssrc);
      const encrypted = this.#encryptAudio(Buffer.from(audioData), header);

      // Combine header and encrypted data
      const packet = this.#getPacketBuffer(header.length + encrypted.length);
      header.copy(packet, 0);
      encrypted.copy(packet, header.length);

      // Update statistics
      this.#stats.packetsCreated++;
      this.#stats.averagePacketSize = this.#calculateRunningAverage(
        this.#stats.averagePacketSize,
        packet.length,
        this.#stats.packetsCreated,
      );

      // Emit event
      this.emit("packetCreated", packet, this.#encryptionMode);

      // Update stats every 100 packets
      if (this.#stats.packetsCreated % 100 === 0) {
        this.emit("stats", this.stats);
      }

      return packet;
    } catch (error) {
      // Update error stats
      this.#stats.encryptionErrors++;

      // Emit error event
      this.emit(
        "error",
        error instanceof Error ? error : new Error(String(error)),
        "create",
      );

      throw error;
    }
  }

  /**
   * Parses an incoming RTP packet
   *
   * @param buffer Raw packet data received from the server
   * @returns Parsed RTP packet structure
   * @throws {Error} If packet parsing fails
   */
  parsePacket(buffer: Buffer): VoiceRtpPacketEntity {
    try {
      // Ensure the packet is at least the size of the RTP header
      if (buffer.length < 12) {
        throw new Error(
          `Invalid RTP packet: expected at least 12 bytes, got ${buffer.length}`,
        );
      }

      // Extract RTP header fields
      const version = buffer[0] as number;
      const payloadType = buffer[1] as number;
      const sequence = buffer.readUInt16BE(2);
      const timestamp = buffer.readUInt32BE(4);
      const ssrc = buffer.readUInt32BE(8);

      // Extract encrypted audio data
      const encryptedAudio = buffer.subarray(12);

      const packet: VoiceRtpPacketEntity = {
        version,
        payloadType,
        sequence,
        timestamp,
        ssrc,
        encryptedAudio,
      };

      // Update statistics
      this.#stats.packetsParsed++;

      // Emit event
      this.emit("packetParsed", packet);

      return packet;
    } catch (error) {
      // Emit error event
      this.emit(
        "error",
        error instanceof Error ? error : new Error(String(error)),
        "parse",
      );

      throw error;
    }
  }

  /**
   * Decrypts audio data from an RTP packet
   *
   * @param packet Parsed RTP packet
   * @param daveKey Optional DAVE protocol key for E2EE decryption
   * @returns Decrypted Opus audio data
   * @throws {Error} If decryption fails
   */
  decryptAudio(packet: VoiceRtpPacketEntity, daveKey?: Uint8Array): Buffer {
    try {
      // Create header buffer for nonce generation
      const header = Buffer.alloc(12);
      header[0] = packet.version;
      header[1] = packet.payloadType;
      header.writeUInt16BE(packet.sequence, 2);
      header.writeUInt32BE(packet.timestamp, 4);
      header.writeUInt32BE(packet.ssrc, 8);

      // First, decrypt the transport encryption
      let decryptedData: Buffer;

      // Handle different encryption modes
      switch (this.#encryptionMode) {
        case "aead_aes256_gcm_rtpsize": {
          // Extract nonce and ciphertext
          const nonceSize = 4; // 32-bit counter
          const tagSize = 16; // AES-GCM tag size

          // Ensure packet has enough data
          if (packet.encryptedAudio.length <= nonceSize + tagSize) {
            throw new Error(
              "Invalid encrypted audio: too small for nonce and authentication tag",
            );
          }

          // Split the encrypted data
          const audioData = Buffer.from(packet.encryptedAudio);
          const nonce = audioData.subarray(audioData.length - nonceSize);
          const ciphertext = audioData.subarray(
            0,
            audioData.length - nonceSize,
          );

          // Create full nonce by combining header and counter
          // For AES-GCM, we need a 12-byte nonce
          const fullNonce = Buffer.alloc(12);
          // Copy 8 bytes of zeroes
          fullNonce.fill(0, 0, 8);
          // Copy the 4-byte counter
          nonce.copy(fullNonce, 8);

          decryptedData = this.#decryptAesGcm(ciphertext, fullNonce, header);
          break;
        }

        case "aead_xchacha20_poly1305_rtpsize": {
          // Extract nonce and ciphertext
          const nonceSize = 4; // 32-bit counter

          // Ensure packet has enough data
          if (packet.encryptedAudio.length <= nonceSize) {
            throw new Error("Invalid encrypted audio: too small for nonce");
          }

          // Split the encrypted data
          const audioData = Buffer.from(packet.encryptedAudio);
          const nonce = audioData.subarray(audioData.length - nonceSize);
          const ciphertext = audioData.subarray(
            0,
            audioData.length - nonceSize,
          );

          // Create full nonce by combining header and counter
          // For XChaCha20-Poly1305, we need a 24-byte nonce
          const fullNonce = Buffer.alloc(24);
          // Copy the 12-byte header
          header.copy(fullNonce, 0);
          // Fill remaining 12 bytes with zeroes
          fullNonce.fill(0, 12, 20);
          // Copy the 4-byte counter to the last 4 bytes
          nonce.copy(fullNonce, 20);

          if (!this.#xChaCha20Poly1305Cipher) {
            throw new Error("XChaCha20Poly1305 cipher not initialized");
          }

          const result = this.#xChaCha20Poly1305Cipher.open(
            fullNonce,
            ciphertext,
            header,
          );

          if (result === null) {
            throw new Error(
              "XChaCha20Poly1305 decryption failed: authentication failed",
            );
          }

          decryptedData = Buffer.from(result);
          break;
        }

        default:
          throw new Error(
            `Unsupported encryption mode: ${this.#encryptionMode}`,
          );
      }

      // If DAVE protocol is enabled, decrypt the E2EE layer
      if (this.#useDaveProtocol) {
        if (!daveKey) {
          throw new Error(
            "DAVE protocol is enabled, but no key was provided for decryption",
          );
        }

        try {
          // Try to parse as DAVE E2EE frame
          const daveFrame = this.parseDaveE2eeFrame(decryptedData);
          const finalData = this.decryptDaveE2eeFrame(daveFrame, daveKey);

          // Update statistics
          this.#stats.packetsDecrypted++;

          // Emit event
          this.emit("packetDecrypted", finalData, packet);

          return finalData;
        } catch (_error) {
          // If DAVE frame parsing fails, return the transport-decrypted data
          // as a fallback (might happen during protocol transitions)

          // Update statistics
          this.#stats.packetsDecrypted++;

          // Emit event
          this.emit("packetDecrypted", decryptedData, packet);

          return decryptedData;
        }
      }

      // Update statistics
      this.#stats.packetsDecrypted++;

      // Emit event
      this.emit("packetDecrypted", decryptedData, packet);

      return decryptedData;
    } catch (error) {
      // Update error stats
      this.#stats.decryptionErrors++;

      // Emit error event
      this.emit(
        "error",
        error instanceof Error ? error : new Error(String(error)),
        "decrypt",
      );

      throw error;
    }
  }

  /**
   * Creates a DAVE E2EE Opus frame from regular Opus data
   *
   * @param opusFrame Raw Opus frame data
   * @param nonce Nonce for encryption
   * @param key Encryption key derived from MLS group
   * @returns Formatted E2EE Opus frame
   * @throws {Error} If frame creation fails
   */
  createDaveE2eeFrame(
    opusFrame: Uint8Array,
    nonce: number,
    key: Uint8Array,
  ): Buffer {
    try {
      // Create nonce buffer (ULEB128 encoded)
      const nonceBuffer = this.#encodeUleb128(nonce);

      // Empty unencrypted ranges for Opus (fully encrypted)
      const unencryptedRanges = Buffer.alloc(1, 0);

      // Calculate supplemental data size
      // 8 (auth tag) + nonceBuffer.length + unencryptedRanges.length + 1 (supplemental size) + 2 (magic marker)
      const supplementalDataSize =
        8 + nonceBuffer.length + unencryptedRanges.length + 1 + 2;

      // Create full nonce for AES-GCM (12 bytes)
      const fullNonce = Buffer.alloc(12);
      // Fill first 8 bytes with zeros
      fullNonce.fill(0, 0, 8);
      // Write 4-byte nonce in remaining bytes
      fullNonce.writeUInt32BE(nonce, 8);

      // Encrypt the Opus frame with AES-128-GCM
      const encryptionResult = this.#encryptAesGcm128(
        opusFrame,
        fullNonce,
        Buffer.alloc(0),
        key,
      );

      // Extract encrypted data and auth tag
      const encryptedFrame = encryptionResult.subarray(
        0,
        encryptionResult.length - 16,
      );
      const authTag = encryptionResult.subarray(
        encryptionResult.length - 16,
        encryptionResult.length - 8,
      );

      // Create the final frame buffer
      const frameSize = encryptedFrame.length + supplementalDataSize;
      const frameBuffer = this.#getPacketBuffer(frameSize);

      // Write components to buffer
      let offset = 0;

      // Write encrypted frame
      encryptedFrame.copy(frameBuffer, offset);
      offset += encryptedFrame.length;

      // Write auth tag (8 bytes)
      authTag.copy(frameBuffer, offset);
      offset += 8;

      // Write ULEB128 nonce
      nonceBuffer.copy(frameBuffer, offset);
      offset += nonceBuffer.length;

      // Write unencrypted ranges (empty for Opus)
      unencryptedRanges.copy(frameBuffer, offset);
      offset += unencryptedRanges.length;

      // Write supplemental data size
      frameBuffer[offset] = supplementalDataSize;
      offset += 1;

      // Write magic marker (0xFAFA)
      frameBuffer.writeUInt16BE(0xfafa, offset);

      return frameBuffer;
    } catch (error) {
      throw new Error(
        `Failed to create DAVE E2EE frame: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Parses a DAVE E2EE Opus frame
   *
   * @param buffer Raw E2EE frame data
   * @returns Parsed E2EE frame structure
   * @throws {Error} If frame parsing fails
   */
  parseDaveE2eeFrame(buffer: Buffer): DaveE2eeOpusFrameEntity {
    // Ensure buffer is large enough for minimum frame size
    if (buffer.length < 11) {
      // 0 encrypted data + 8 auth + 1 nonce + 0 ranges + 1 size + 2 magic
      throw new Error(
        `Invalid E2EE frame: expected at least 11 bytes, got ${buffer.length}`,
      );
    }

    // Extract the supplemental data size (second to last byte)
    const supplementalDataSize = buffer[buffer.length - 3] as number;

    // Verify the magic marker (last 2 bytes)
    const magicMarker = buffer.readUInt16BE(buffer.length - 2);
    if (magicMarker !== 0xfafa) {
      throw new Error(
        `Invalid E2EE frame: expected magic marker 0xFAFA, got 0x${magicMarker.toString(16)}`,
      );
    }

    // Calculate offset to start of supplemental data
    const supplementalOffset = buffer.length - supplementalDataSize;

    // Extract the encrypted frame
    const encryptedFrame = buffer.subarray(0, supplementalOffset);

    // Extract the auth tag (first 8 bytes of supplemental data)
    const authTag = buffer.subarray(supplementalOffset, supplementalOffset + 8);

    // Extract the ULEB128 nonce
    const nonceOffset = supplementalOffset + 8;
    let nonceLength = 0;
    // Find the end of the ULEB128-encoded nonce (MSB is 0)
    while (
      nonceOffset + nonceLength < buffer.length - 3 &&
      ((buffer[nonceOffset + nonceLength] as number) & 0x80) !== 0
    ) {
      nonceLength++;
    }
    nonceLength++; // Include the last byte
    const nonce = buffer.subarray(nonceOffset, nonceOffset + nonceLength);

    // Extract the unencrypted ranges (remaining bytes before size byte)
    const rangesOffset = nonceOffset + nonceLength;
    const rangesLength = buffer.length - 3 - rangesOffset;
    const unencryptedRanges = buffer.subarray(
      rangesOffset,
      rangesOffset + rangesLength,
    );

    return {
      encryptedFrame,
      authTag,
      nonce,
      unencryptedRanges,
      supplementalDataSize,
      magicMarker,
    };
  }

  /**
   * Decrypts a DAVE E2EE Opus frame
   *
   * @param frame Parsed E2EE frame
   * @param key Decryption key derived from MLS group
   * @returns Decrypted Opus audio data
   * @throws {Error} If frame decryption fails
   */
  decryptDaveE2eeFrame(
    frame: DaveE2eeOpusFrameEntity,
    key: Uint8Array,
  ): Buffer {
    try {
      // Decode the ULEB128 nonce value
      const nonceValue = this.#decodeUleb128(frame.nonce);

      // Create full nonce for AES-128-GCM (12 bytes)
      const fullNonce = Buffer.alloc(12);
      // Fill first 8 bytes with zeros
      fullNonce.fill(0, 0, 8);
      // Write 4-byte nonce in remaining bytes
      fullNonce.writeUInt32BE(nonceValue, 8);

      // Combine encrypted frame with auth tag for decryption
      const ciphertext = Buffer.concat([
        Buffer.from(frame.encryptedFrame),
        Buffer.from(frame.authTag),
      ]);

      // Decrypt using AES-128-GCM
      return this.#decryptAesGcm128(
        ciphertext,
        fullNonce,
        Buffer.alloc(0),
        key,
      );
    } catch (error) {
      throw new Error(
        `Failed to decrypt DAVE E2EE frame: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Enables or disables DAVE protocol
   *
   * @param enable Whether to enable DAVE protocol
   * @returns This instance for method chaining
   */
  setDaveProtocol(enable: boolean): this {
    if (this.#useDaveProtocol !== enable) {
      this.#useDaveProtocol = enable;
      this.#stats.daveProtocolEnabled = enable;

      if (enable) {
        // Reset nonce counter when enabling
        this.#daveNonceCounter = 0;
      }

      // Emit event
      this.emit("daveProtocolChanged", enable);
    }

    return this;
  }

  /**
   * Resets all counters and statistics
   *
   * @returns This instance for method chaining
   */
  resetCounters(): this {
    this.#nonceCounter = BigInt(0);
    this.#daveNonceCounter = 0;

    // Reset statistics
    this.#stats.packetsCreated = 0;
    this.#stats.packetsParsed = 0;
    this.#stats.packetsDecrypted = 0;
    this.#stats.encryptionErrors = 0;
    this.#stats.decryptionErrors = 0;
    this.#stats.averagePacketSize = 0;

    return this;
  }

  /**
   * Resets the buffer pool with fresh buffers
   *
   * @returns This instance for method chaining
   */
  resetBufferPool(): this {
    this.#initializeBufferPool();
    return this;
  }

  /**
   * Cleans up resources used by the RTP service
   */
  destroy(): void {
    // Clear buffer pool
    this.#bufferPool.length = 0;

    // Clear event listeners
    this.removeAllListeners();
  }

  /**
   * Creates the standard RTP header
   *
   * @param sequence Sequence number
   * @param timestamp Timestamp
   * @param ssrc Synchronization Source identifier
   * @returns RTP header buffer
   * @private
   */
  #createRtpHeader(sequence: number, timestamp: number, ssrc: number): Buffer {
    // Create RTP header (12 bytes)
    const header = Buffer.alloc(12);

    // Write version and flags (0x80)
    header[0] = 0x80;

    // Write payload type (0x78)
    header[1] = 0x78;

    // Write sequence number (big endian)
    header.writeUInt16BE(sequence, 2);

    // Write timestamp (big endian)
    header.writeUInt32BE(timestamp, 4);

    // Write SSRC (big endian)
    header.writeUInt32BE(ssrc, 8);

    return header;
  }

  /**
   * Encrypts audio data for an RTP packet
   *
   * @param audioData Raw audio data to encrypt
   * @param header RTP header for nonce generation
   * @returns Buffer containing encrypted audio data with any necessary nonce/tags
   * @private
   */
  #encryptAudio(audioData: Buffer, header: Buffer): Buffer {
    switch (this.#encryptionMode) {
      case "aead_aes256_gcm_rtpsize": {
        // Increment nonce counter
        const nonce = Buffer.alloc(4);
        nonce.writeUInt32BE(Number(this.#nonceCounter & BigInt(0xffffffff)), 0);
        this.#nonceCounter += BigInt(1);

        // Create full nonce (12 bytes for AES-GCM)
        const fullNonce = Buffer.alloc(12);
        // Fill first 8 bytes with zeros
        fullNonce.fill(0, 0, 8);
        // Copy 4-byte counter to last 4 bytes
        nonce.copy(fullNonce, 8);

        // Encrypt using AES-GCM with header as additional authenticated data
        const encrypted = this.#encryptAesGcm(audioData, fullNonce, header);

        // Append the nonce
        return Buffer.concat([encrypted, nonce]);
      }

      case "aead_xchacha20_poly1305_rtpsize": {
        // Increment nonce counter
        const nonce = Buffer.alloc(4);
        nonce.writeUInt32BE(Number(this.#nonceCounter & BigInt(0xffffffff)), 0);
        this.#nonceCounter += BigInt(1);

        // Create full nonce (24 bytes for XChaCha20-Poly1305)
        const fullNonce = Buffer.alloc(24);
        // Copy the 12-byte header
        header.copy(fullNonce, 0);
        // Fill remaining bytes with zeros except last 4
        fullNonce.fill(0, 12, 20);
        // Copy 4-byte counter to last 4 bytes
        nonce.copy(fullNonce, 20);

        if (!this.#xChaCha20Poly1305Cipher) {
          throw new Error("XChaCha20Poly1305 cipher not initialized");
        }

        // Encrypt using XChaCha20-Poly1305 with header as additional authenticated data
        const encrypted = Buffer.from(
          this.#xChaCha20Poly1305Cipher.seal(fullNonce, audioData, header),
        );

        // Append the nonce
        return Buffer.concat([encrypted, nonce]);
      }

      default:
        throw new Error(`Unsupported encryption mode: ${this.#encryptionMode}`);
    }
  }

  /**
   * Encrypts data using AES-256-GCM
   *
   * @param data Data to encrypt
   * @param nonce Nonce for encryption
   * @param additionalData Additional authenticated data
   * @returns Encrypted data with authentication tag
   * @private
   */
  #encryptAesGcm(
    data: Buffer | Uint8Array,
    nonce: Buffer | Uint8Array,
    additionalData: Buffer | Uint8Array,
  ): Buffer {
    try {
      // Create cipher using node:crypto
      const cipher = createCipheriv("aes-256-gcm", this.#secretKey, nonce);

      // Set additional authenticated data if provided
      if (additionalData.length > 0) {
        cipher.setAAD(Buffer.from(additionalData));
      }

      // Encrypt data
      const encrypted = Buffer.concat([
        cipher.update(Buffer.from(data)),
        cipher.final(),
      ]);

      // Get authentication tag
      const tag = cipher.getAuthTag();

      // Return encrypted data with authentication tag
      return Buffer.concat([encrypted, tag]);
    } catch (error) {
      throw new Error(
        `AES-GCM encryption failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Decrypts data using AES-256-GCM
   *
   * @param ciphertext Encrypted data with authentication tag
   * @param nonce Nonce used for encryption
   * @param additionalData Additional authenticated data
   * @returns Decrypted data
   * @private
   */
  #decryptAesGcm(
    ciphertext: Buffer | Uint8Array,
    nonce: Buffer | Uint8Array,
    additionalData: Buffer | Uint8Array,
  ): Buffer {
    try {
      // Separate ciphertext and tag
      const data = Buffer.from(ciphertext);
      const encrypted = data.subarray(0, data.length - 16);
      const tag = data.subarray(data.length - 16);

      // Create decipher
      const decipher = createDecipheriv("aes-256-gcm", this.#secretKey, nonce);

      // Set authentication tag
      decipher.setAuthTag(tag);

      // Set additional authenticated data if provided
      if (additionalData.length > 0) {
        decipher.setAAD(Buffer.from(additionalData));
      }

      // Decrypt data
      return Buffer.concat([decipher.update(encrypted), decipher.final()]);
    } catch (error) {
      throw new Error(
        `AES-GCM decryption failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Encrypts data using AES-128-GCM for DAVE protocol
   *
   * @param data Data to encrypt
   * @param nonce Nonce for encryption
   * @param additionalData Additional authenticated data
   * @param key Key to use for encryption
   * @returns Encrypted data with authentication tag
   * @private
   */
  #encryptAesGcm128(
    data: Buffer | Uint8Array,
    nonce: Buffer | Uint8Array,
    additionalData: Buffer | Uint8Array,
    key: Uint8Array,
  ): Buffer {
    try {
      // Create cipher using node:crypto
      const cipher = createCipheriv("aes-128-gcm", key, nonce);

      // Set additional authenticated data if provided
      if (additionalData.length > 0) {
        cipher.setAAD(Buffer.from(additionalData));
      }

      // Encrypt data
      const encrypted = Buffer.concat([
        cipher.update(Buffer.from(data)),
        cipher.final(),
      ]);

      // Get authentication tag
      const tag = cipher.getAuthTag();

      // Return encrypted data with authentication tag
      return Buffer.concat([encrypted, tag]);
    } catch (error) {
      throw new Error(
        `AES-128-GCM encryption failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Decrypts data using AES-128-GCM for DAVE protocol
   *
   * @param ciphertext Encrypted data with authentication tag
   * @param nonce Nonce used for encryption
   * @param additionalData Additional authenticated data
   * @param key Key to use for decryption
   * @returns Decrypted data
   * @private
   */
  #decryptAesGcm128(
    ciphertext: Buffer | Uint8Array,
    nonce: Buffer | Uint8Array,
    additionalData: Buffer | Uint8Array,
    key: Uint8Array,
  ): Buffer {
    try {
      // Separate ciphertext and tag
      const data = Buffer.from(ciphertext);
      const encrypted = data.subarray(0, data.length - 8); // DAVE uses 8-byte truncated tag
      const tag = data.subarray(data.length - 8);

      // Expand tag to full 16 bytes (required by node:crypto)
      const fullTag = Buffer.alloc(16);
      tag.copy(fullTag);

      // Create decipher
      const decipher = createDecipheriv("aes-128-gcm", key, nonce);

      // Set authentication tag
      decipher.setAuthTag(fullTag);

      // Set additional authenticated data if provided
      if (additionalData.length > 0) {
        decipher.setAAD(Buffer.from(additionalData));
      }

      // Decrypt data
      return Buffer.concat([decipher.update(encrypted), decipher.final()]);
    } catch (error) {
      throw new Error(
        `AES-128-GCM decryption failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Encodes a number using ULEB128 (Unsigned Little Endian Base 128)
   *
   * @param value Value to encode
   * @returns Buffer containing ULEB128-encoded value
   * @private
   */
  #encodeUleb128(value: number): Buffer {
    const bytes: number[] = [];
    let remaining = value;

    do {
      let byte = remaining & 0x7f;
      remaining >>>= 7;

      if (remaining !== 0) {
        byte |= 0x80;
      }

      bytes.push(byte);
    } while (remaining !== 0);

    return Buffer.from(bytes);
  }

  /**
   * Decodes a ULEB128 (Unsigned Little Endian Base 128) encoded value
   *
   * @param buffer Buffer containing ULEB128-encoded value
   * @returns Decoded number
   * @private
   */
  #decodeUleb128(buffer: Uint8Array): number {
    let result = 0;
    let shift = 0;

    for (const byte of buffer) {
      result |= (byte & 0x7f) << shift;

      if ((byte & 0x80) === 0) {
        break;
      }

      shift += 7;

      // Check for overflow (JavaScript's bitwise operations are 32-bit)
      if (shift >= 32) {
        throw new Error(
          "ULEB128 value exceeds maximum JavaScript integer precision",
        );
      }
    }

    return result;
  }

  /**
   * Initializes the buffer pool
   *
   * @private
   */
  #initializeBufferPool(): void {
    // Clear existing pool
    this.#bufferPool.length = 0;

    // Skip if pool size is 0
    if (this.#options.bufferPoolSize <= 0) {
      return;
    }

    // Create new buffers
    for (let i = 0; i < this.#options.bufferPoolSize; i++) {
      this.#bufferPool.push(Buffer.allocUnsafe(this.#options.maxPacketSize));
    }
  }

  /**
   * Gets a buffer from the pool or creates a new one if needed
   *
   * @param size Minimum size needed
   * @returns Buffer of at least the requested size
   * @private
   */
  #getPacketBuffer(size: number): Buffer {
    // If buffer pool is disabled or size is larger than max, allocate directly
    if (
      this.#options.bufferPoolSize <= 0 ||
      size > this.#options.maxPacketSize
    ) {
      return Buffer.allocUnsafe(size);
    }

    // Try to get a buffer from the pool
    const buffer = this.#bufferPool.pop();

    // If pool is empty, create a new buffer
    if (!buffer) {
      return Buffer.allocUnsafe(size);
    }

    return buffer;
  }

  /**
   * Calculates a running average
   *
   * @param currentAvg Current average value
   * @param newValue New value to include
   * @param count Number of values including the new one
   * @returns Updated running average
   * @private
   */
  #calculateRunningAverage(
    currentAvg: number,
    newValue: number,
    count: number,
  ): number {
    return (currentAvg * (count - 1) + newValue) / count;
  }
}
