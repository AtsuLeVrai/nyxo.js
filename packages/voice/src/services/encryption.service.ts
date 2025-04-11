import { EncryptionMode, type RTPPacketHeader } from "../types/index.js";
import { BufferUtil, EncryptionUtil, RTPPacketUtil } from "../utils/index.js";

export class EncryptionService {
  #secretKey: Uint8Array | null = null;
  #mode: EncryptionMode | null = null;
  #nonceCounter = 0;
  #destroyed = false;
  readonly #preferredModes: EncryptionMode[];

  constructor(preferredModes?: EncryptionMode[]) {
    this.#preferredModes = preferredModes ?? [
      EncryptionMode.AEAD_AES256_GCM_RTPSize,
      EncryptionMode.AEAD_XChaCha20_Poly1305_RTPSize,
    ];
  }

  get encryptionMode(): EncryptionMode | null {
    return this.#mode;
  }

  get isInitialized(): boolean {
    return this.#secretKey !== null && this.#mode !== null;
  }

  initialize(secretKey: number[] | Uint8Array, mode: EncryptionMode): void {
    if (this.#destroyed) {
      throw new Error("EncryptionService has been destroyed");
    }

    if (Buffer.isBuffer(secretKey)) {
      this.#secretKey = BufferUtil.bufferToUint8Array(secretKey);
    } else if (Array.isArray(secretKey)) {
      this.#secretKey = BufferUtil.numberArrayToUint8Array(secretKey);
    } else {
      this.#secretKey = secretKey;
    }

    this.#mode = mode;
    this.#nonceCounter = 0;
  }

  selectPreferredMode(availableModes: EncryptionMode[]): EncryptionMode {
    // First check if we can use our first preference
    for (const preferred of this.#preferredModes) {
      if (availableModes.includes(preferred)) {
        return preferred;
      }
    }

    // If none of our preferred modes are available, use the first supported mode
    // We always at least support XChaCha20
    for (const mode of availableModes) {
      if (mode === EncryptionMode.AEAD_XChaCha20_Poly1305_RTPSize) {
        return mode;
      }
    }

    // Last resort fallback
    throw new Error("No supported encryption mode available");
  }

  encryptPacket(opusData: Buffer, header: RTPPacketHeader): Buffer | null {
    if (
      !this.isInitialized ||
      this.#destroyed ||
      !this.#secretKey ||
      !this.#mode
    ) {
      throw new Error("EncryptionService not initialized");
    }

    try {
      const { encrypted } = EncryptionUtil.encryptRTP(
        opusData,
        this.#secretKey,
        header,
        this.#mode,
        this.#nonceCounter++,
      );

      if (this.#nonceCounter >= 0xffffffff) {
        this.#nonceCounter = 0;
      }

      return encrypted;
    } catch {
      return null;
    }
  }

  decryptPacket(encryptedData: Buffer, header: RTPPacketHeader): Buffer | null {
    if (
      !this.isInitialized ||
      this.#destroyed ||
      !this.#secretKey ||
      !this.#mode
    ) {
      throw new Error("EncryptionService not initialized");
    }

    try {
      return EncryptionUtil.decryptRTP(
        encryptedData,
        this.#secretKey,
        header,
        this.#mode,
      );
    } catch {
      return null;
    }
  }

  createPacket(
    opusData: Buffer,
    sequence: number,
    timestamp: number,
    ssrc: number,
  ): Buffer | null {
    if (!this.isInitialized || this.#destroyed) {
      return null;
    }

    try {
      // Create the RTP header
      const header = RTPPacketUtil.createPacketHeader(
        sequence,
        timestamp,
        ssrc,
      );

      // Encrypt the opus data
      const encryptedData = this.encryptPacket(opusData, header);
      if (!encryptedData) {
        return null;
      }

      // Serialize the header
      const headerBuffer = RTPPacketUtil.serializeHeader(header);

      // Combine header and encrypted data
      return Buffer.concat([headerBuffer, encryptedData]);
    } catch {
      return null;
    }
  }

  parsePacket(
    data: Buffer,
  ): { header: RTPPacketHeader; decryptedData: Buffer } | null {
    if (!this.isInitialized || this.#destroyed) {
      return null;
    }

    try {
      // Parse the RTP header
      const header = RTPPacketUtil.parseHeader(data);

      // Extract the encrypted payload
      const encryptedData = data.subarray(RTPPacketUtil.HEADER_SIZE);

      // Decrypt the payload
      const decryptedData = this.decryptPacket(encryptedData, header);
      if (!decryptedData) {
        return null;
      }

      return { header, decryptedData };
    } catch {
      return null;
    }
  }

  generateKey(): Buffer {
    return EncryptionUtil.generateEncryptionKey();
  }

  destroy(): void {
    if (this.#destroyed) {
      return;
    }

    this.#destroyed = true;
    this.#secretKey = null;
    this.#mode = null;
    this.#nonceCounter = 0;
  }
}
