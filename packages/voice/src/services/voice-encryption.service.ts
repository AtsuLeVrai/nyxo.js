import type { CipherGCM, DecipherGCM } from "node:crypto";
import { createCipheriv, createDecipheriv } from "node:crypto";
import sodium from "sodium-native";
import { VoiceEncryptionMode } from "../types/index.js";

export class VoiceEncryptionService {
  #encryptionMode: VoiceEncryptionMode =
    VoiceEncryptionMode.AeadAes256GcmRtpSize;
  #secretKey: Buffer | null = null;
  #cipher: CipherGCM | null = null;
  #decipher: DecipherGCM | null = null;
  #nonce = Buffer.alloc(24);
  #rtpHeaderSize = 12;

  initialize(
    secretKey: Buffer,
    mode: VoiceEncryptionMode = VoiceEncryptionMode.AeadAes256GcmRtpSize,
  ): void {
    this.#encryptionMode = mode;
    this.#secretKey = secretKey;
    this.#resetCiphers();
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

  destroy(): void {
    this.#secretKey = null;
    this.#cipher = null;
    this.#decipher = null;
    this.#nonce.fill(0);
  }

  #encryptAesGcm(rtpHeader: Buffer, payload: Buffer, nonce: Buffer): Buffer {
    if (!this.#cipher) {
      if (!this.#secretKey) {
        throw new Error("Encryption not initialized");
      }

      this.#cipher = createCipheriv("aes-256-gcm", this.#secretKey, nonce, {
        authTagLength: 16,
      });

      this.#cipher.setAAD(rtpHeader);
    }

    const encrypted = this.#cipher.update(payload);
    const final = this.#cipher.final();
    const authTag = this.#cipher.getAuthTag();

    this.#cipher = null;

    return Buffer.concat([rtpHeader, encrypted, final, authTag]);
  }

  #decryptAesGcm(
    rtpHeader: Buffer,
    encryptedPayload: Buffer,
    nonce: Buffer,
  ): Buffer {
    if (!this.#decipher) {
      if (!this.#secretKey) {
        throw new Error("Encryption not initialized");
      }

      this.#decipher = createDecipheriv("aes-256-gcm", this.#secretKey, nonce, {
        authTagLength: 16,
      });

      this.#decipher.setAAD(rtpHeader);
    }

    const encryptedLength = encryptedPayload.length - 16;
    const authTag = encryptedPayload.subarray(encryptedLength);
    const encrypted = encryptedPayload.subarray(0, encryptedLength);

    this.#decipher.setAuthTag(authTag);

    const decrypted = this.#decipher.update(encrypted);
    const final = this.#decipher.final();

    this.#decipher = null;

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
    const nonce = Buffer.alloc(24);
    nonce.writeUInt32BE(sequenceNumber, 0);
    return nonce;
  }

  #resetCiphers(): void {
    this.#cipher = null;
    this.#decipher = null;
  }
}
