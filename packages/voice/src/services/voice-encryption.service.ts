import { createCipheriv, createDecipheriv } from "node:crypto";
import sodium from "sodium-native";
import { VoiceEncryptionMode } from "../types/index.js";

export class VoiceEncryptionService {
  #encryptionMode: VoiceEncryptionMode =
    VoiceEncryptionMode.AeadAes256GcmRtpSize;
  #secretKey: Buffer | null = null;
  #rtpHeaderSize = 12;

  initialize(
    secretKey: Buffer,
    mode: VoiceEncryptionMode = VoiceEncryptionMode.AeadAes256GcmRtpSize,
  ): void {
    if (!this.isModeSupported(mode)) {
      throw new Error(`Unsupported encryption mode: ${mode}`);
    }

    this.#encryptionMode = mode;
    this.#secretKey = secretKey;
  }

  encryptPacket(packet: Buffer, sequenceNumber: number): Buffer {
    if (!this.#secretKey) {
      throw new Error("Encryption not initialized");
    }

    const rtpHeader = packet.subarray(0, this.#rtpHeaderSize);
    const payload = packet.subarray(this.#rtpHeaderSize);

    const nonce = this.#createNonce(sequenceNumber);

    switch (this.#encryptionMode) {
      case VoiceEncryptionMode.AeadAes256GcmRtpSize:
        return this.#encryptAesGcm(rtpHeader, payload, nonce);
      case VoiceEncryptionMode.AeadXChaCha20Poly1305RtpSize:
        return this.#encryptXchaCha20(rtpHeader, payload, nonce);
      default:
        throw new Error(`Unsupported encryption mode: ${this.#encryptionMode}`);
    }
  }

  decryptPacket(packet: Buffer, sequenceNumber: number): Buffer {
    if (!this.#secretKey) {
      throw new Error("Encryption not initialized");
    }

    const rtpHeader = packet.subarray(0, this.#rtpHeaderSize);
    const encryptedPayload = packet.subarray(this.#rtpHeaderSize);

    const nonce = this.#createNonce(sequenceNumber);

    switch (this.#encryptionMode) {
      case VoiceEncryptionMode.AeadAes256GcmRtpSize:
        return this.#decryptAesGcm(rtpHeader, encryptedPayload, nonce);
      case VoiceEncryptionMode.AeadXChaCha20Poly1305RtpSize:
        return this.#decryptXchaCha20(rtpHeader, encryptedPayload, nonce);
      default:
        throw new Error(`Unsupported encryption mode: ${this.#encryptionMode}`);
    }
  }

  isModeSupported(mode: VoiceEncryptionMode): boolean {
    return [
      VoiceEncryptionMode.AeadAes256GcmRtpSize,
      VoiceEncryptionMode.AeadXChaCha20Poly1305RtpSize,
    ].includes(mode);
  }

  destroy(): void {
    this.#secretKey = null;
  }

  #encryptAesGcm(rtpHeader: Buffer, payload: Buffer, nonce: Buffer): Buffer {
    if (!this.#secretKey) {
      throw new Error("Encryption not initialized");
    }

    const cipher = createCipheriv(
      "aes-256-gcm",
      this.#secretKey,
      nonce.subarray(0, 12),
      {
        authTagLength: 16,
      },
    );

    cipher.setAAD(rtpHeader);

    const encrypted = cipher.update(payload);
    const final = cipher.final();
    const authTag = cipher.getAuthTag();

    return Buffer.concat([rtpHeader, encrypted, final, authTag]);
  }

  #decryptAesGcm(
    rtpHeader: Buffer,
    encryptedPayload: Buffer,
    nonce: Buffer,
  ): Buffer {
    if (!this.#secretKey) {
      throw new Error("Encryption not initialized");
    }

    const decipher = createDecipheriv(
      "aes-256-gcm",
      this.#secretKey,
      nonce.subarray(0, 12),
      {
        authTagLength: 16,
      },
    );

    const encryptedLength = encryptedPayload.length - 16;
    const authTag = encryptedPayload.subarray(encryptedLength);
    const encrypted = encryptedPayload.subarray(0, encryptedLength);

    decipher.setAAD(rtpHeader);
    decipher.setAuthTag(authTag);

    const decrypted = decipher.update(encrypted);
    const final = decipher.final();

    return Buffer.concat([rtpHeader, decrypted, final]);
  }

  #encryptXchaCha20(rtpHeader: Buffer, payload: Buffer, nonce: Buffer): Buffer {
    if (!this.#secretKey) {
      throw new Error("Encryption not initialized");
    }

    const ciphertext = Buffer.alloc(
      payload.length + sodium.crypto_aead_xchacha20poly1305_ietf_ABYTES,
    );

    sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
      ciphertext,
      payload,
      rtpHeader,
      null,
      nonce,
      this.#secretKey,
    );

    return Buffer.concat([rtpHeader, ciphertext]);
  }

  #decryptXchaCha20(
    rtpHeader: Buffer,
    encryptedPayload: Buffer,
    nonce: Buffer,
  ): Buffer {
    if (!this.#secretKey) {
      throw new Error("Encryption not initialized");
    }

    const decrypted = Buffer.alloc(
      encryptedPayload.length -
        sodium.crypto_aead_xchacha20poly1305_ietf_ABYTES,
    );

    sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
      decrypted,
      null,
      encryptedPayload,
      rtpHeader,
      nonce,
      this.#secretKey,
    );

    return Buffer.concat([rtpHeader, decrypted]);
  }

  #createNonce(sequenceNumber: number): Buffer {
    const nonce = Buffer.alloc(12);
    nonce.writeUInt32BE(sequenceNumber, 0);
    return nonce;
  }
}
