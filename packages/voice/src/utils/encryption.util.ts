import crypto from "node:crypto";
import sodium from "sodium-native";
import { EncryptionMode, type RTPPacketHeader } from "../types/index.js";

export const EncryptionUtil = {
  SODIUM_NONCE_SIZE: 24,
  AES_GCM_NONCE_SIZE: 12,
  XCHACHA20_NONCE_SIZE: 24,
  TAG_SIZE: 16,
  XSALSA20_POLY1305_LITE_NONCE_SIZE: 4,

  createNonce(header: RTPPacketHeader, mode: EncryptionMode): Buffer {
    switch (mode) {
      case EncryptionMode.AEAD_AES256_GCM_RTPSize:
      case EncryptionMode.AEAD_AES256_GCM: {
        const nonce = Buffer.alloc(EncryptionUtil.AES_GCM_NONCE_SIZE);
        nonce.fill(0);
        nonce.writeUInt32BE(header.ssrc, 8);
        return nonce;
      }

      case EncryptionMode.AEAD_XChaCha20_Poly1305_RTPSize: {
        const nonce = Buffer.alloc(EncryptionUtil.XCHACHA20_NONCE_SIZE);
        nonce.fill(0);
        nonce.writeUInt32BE(
          header.ssrc,
          EncryptionUtil.XCHACHA20_NONCE_SIZE - 4,
        );
        return nonce;
      }

      case EncryptionMode.XSalsa20_Poly1305_Lite_RTPSize:
      case EncryptionMode.XSalsa20_Poly1305_Lite: {
        const nonce = Buffer.alloc(EncryptionUtil.SODIUM_NONCE_SIZE);
        nonce.fill(0);
        nonce.writeUInt32LE(header.sequence, 0);
        return nonce;
      }

      case EncryptionMode.XSalsa20_Poly1305: {
        // Copy RTP header as nonce
        const headerBuffer = Buffer.alloc(12);
        headerBuffer.writeUInt8(header.version, 0);
        headerBuffer.writeUInt8(header.payloadType, 1);
        headerBuffer.writeUInt16BE(header.sequence, 2);
        headerBuffer.writeUInt32BE(header.timestamp, 4);
        headerBuffer.writeUInt32BE(header.ssrc, 8);

        const nonce = Buffer.alloc(EncryptionUtil.SODIUM_NONCE_SIZE);
        headerBuffer.copy(nonce);
        return nonce;
      }

      case EncryptionMode.XSalsa20_Poly1305_Suffix: {
        // Generate 24 random bytes
        const nonce = Buffer.alloc(EncryptionUtil.SODIUM_NONCE_SIZE);
        sodium.randombytes_buf(nonce);
        return nonce;
      }

      default:
        throw new Error(`Unsupported encryption mode: ${mode}`);
    }
  },

  encryptAEADGCM(
    plaintext: Uint8Array,
    key: Uint8Array,
    nonce: Buffer,
    aad: Buffer,
  ): { ciphertext: Buffer; tag: Buffer } {
    const cipher = crypto.createCipheriv(
      "aes-256-gcm",
      Buffer.from(key),
      nonce,
      { authTagLength: EncryptionUtil.TAG_SIZE },
    );

    if (aad && aad.length > 0) {
      cipher.setAAD(aad);
    }

    const ciphertext = Buffer.concat([
      cipher.update(Buffer.from(plaintext)),
      cipher.final(),
    ]);

    const tag = cipher.getAuthTag();

    return { ciphertext, tag };
  },

  decryptAEADGCM(
    ciphertext: Uint8Array,
    key: Uint8Array,
    nonce: Buffer,
    tag: Buffer,
    aad: Buffer,
  ): Buffer {
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      Buffer.from(key),
      nonce,
      { authTagLength: EncryptionUtil.TAG_SIZE },
    );

    decipher.setAuthTag(tag);

    if (aad && aad.length > 0) {
      decipher.setAAD(aad);
    }

    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(ciphertext)),
      decipher.final(),
    ]);

    return plaintext;
  },

  encryptXSalsa20(
    plaintext: Uint8Array,
    key: Uint8Array,
    nonce: Buffer,
  ): Buffer {
    const ciphertext = Buffer.alloc(
      plaintext.length + sodium.crypto_secretbox_MACBYTES,
    );
    sodium.crypto_secretbox_easy(
      ciphertext,
      Buffer.from(plaintext),
      nonce,
      Buffer.from(key),
    );
    return ciphertext;
  },

  decryptXSalsa20(
    ciphertext: Uint8Array,
    key: Uint8Array,
    nonce: Buffer,
  ): Buffer {
    const plaintext = Buffer.alloc(
      ciphertext.length - sodium.crypto_secretbox_MACBYTES,
    );

    const success = sodium.crypto_secretbox_open_easy(
      plaintext,
      Buffer.from(ciphertext),
      nonce,
      Buffer.from(key),
    );

    if (!success) {
      throw new Error("Failed to decrypt with XSalsa20");
    }

    return plaintext;
  },

  encryptXChaCha20(
    plaintext: Uint8Array,
    key: Uint8Array,
    nonce: Buffer,
  ): Buffer {
    const ciphertext = Buffer.alloc(
      plaintext.length + sodium.crypto_aead_xchacha20poly1305_ietf_ABYTES,
    );

    sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
      ciphertext,
      Buffer.from(plaintext),
      null,
      null,
      nonce,
      Buffer.from(key),
    );

    return ciphertext;
  },

  decryptXChaCha20(
    ciphertext: Uint8Array,
    key: Uint8Array,
    nonce: Buffer,
  ): Buffer {
    const plaintext = Buffer.alloc(
      ciphertext.length - sodium.crypto_aead_xchacha20poly1305_ietf_ABYTES,
    );

    sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
      plaintext,
      null,
      Buffer.from(ciphertext),
      null,
      nonce,
      Buffer.from(key),
    );

    return plaintext;
  },

  encryptRTP(
    plaintext: Uint8Array,
    key: Uint8Array,
    header: RTPPacketHeader,
    mode: EncryptionMode,
    nonce?: number,
  ): { encrypted: Buffer; nonce?: Buffer } {
    switch (mode) {
      case EncryptionMode.AEAD_AES256_GCM_RTPSize:
      case EncryptionMode.AEAD_AES256_GCM: {
        const nonceBuffer = EncryptionUtil.createNonce(header, mode);
        // Increment counter for each packet
        if (nonce !== undefined) {
          nonceBuffer.writeUInt32BE(nonce, 0);
        }

        // Determine the unencrypted portion size
        const rtpSize =
          mode === EncryptionMode.AEAD_AES256_GCM_RTPSize ? 12 : 0;
        const headerBuffer = Buffer.alloc(rtpSize);
        if (rtpSize > 0) {
          // Copy the RTP header
          headerBuffer.writeUInt8(header.version, 0);
          headerBuffer.writeUInt8(header.payloadType, 1);
          headerBuffer.writeUInt16BE(header.sequence, 2);
          headerBuffer.writeUInt32BE(header.timestamp, 4);
          headerBuffer.writeUInt32BE(header.ssrc, 8);
        }

        // Encrypt
        const { ciphertext, tag } = EncryptionUtil.encryptAEADGCM(
          plaintext,
          key,
          nonceBuffer,
          headerBuffer,
        );

        return {
          encrypted: Buffer.concat([ciphertext, tag]),
          nonce: nonceBuffer,
        };
      }

      case EncryptionMode.AEAD_XChaCha20_Poly1305_RTPSize: {
        const nonceBuffer = EncryptionUtil.createNonce(header, mode);
        // Increment counter for each packet
        if (nonce !== undefined) {
          nonceBuffer.writeUInt32BE(nonce, 0);
        }

        // Determine the unencrypted portion size
        const rtpSize = 12;
        const headerBuffer = Buffer.alloc(rtpSize);
        // Copy the RTP header
        headerBuffer.writeUInt8(header.version, 0);
        headerBuffer.writeUInt8(header.payloadType, 1);
        headerBuffer.writeUInt16BE(header.sequence, 2);
        headerBuffer.writeUInt32BE(header.timestamp, 4);
        headerBuffer.writeUInt32BE(header.ssrc, 8);

        // Encrypt
        const encrypted = EncryptionUtil.encryptXChaCha20(
          plaintext,
          key,
          nonceBuffer,
        );

        return { encrypted, nonce: nonceBuffer };
      }

      case EncryptionMode.XSalsa20_Poly1305_Lite_RTPSize:
      case EncryptionMode.XSalsa20_Poly1305_Lite: {
        // Use sequence number as nonce
        const nonceValue = nonce !== undefined ? nonce : header.sequence;
        const nonceBuffer = Buffer.alloc(EncryptionUtil.SODIUM_NONCE_SIZE);
        nonceBuffer.fill(0);
        nonceBuffer.writeUInt32LE(nonceValue, 0);

        // Determine the unencrypted portion size
        // const rtpSize =
        //   mode === EncryptionMode.XSalsa20_Poly1305_Lite_RTPSize ? 12 : 0;

        // Encrypt
        const encrypted = EncryptionUtil.encryptXSalsa20(
          plaintext,
          key,
          nonceBuffer,
        );

        // For Lite mode, we need to append nonce value (4 bytes) at the end
        const result = Buffer.concat([
          encrypted,
          Buffer.from([
            (nonceValue >> 24) & 0xff,
            (nonceValue >> 16) & 0xff,
            (nonceValue >> 8) & 0xff,
            nonceValue & 0xff,
          ]),
        ]);

        return { encrypted: result, nonce: nonceBuffer };
      }

      case EncryptionMode.XSalsa20_Poly1305: {
        const nonceBuffer = EncryptionUtil.createNonce(header, mode);
        const encrypted = EncryptionUtil.encryptXSalsa20(
          plaintext,
          key,
          nonceBuffer,
        );
        return { encrypted };
      }

      case EncryptionMode.XSalsa20_Poly1305_Suffix: {
        const nonceBuffer = EncryptionUtil.createNonce(header, mode);
        const encrypted = EncryptionUtil.encryptXSalsa20(
          plaintext,
          key,
          nonceBuffer,
        );
        // For Suffix mode, we append the entire nonce at the end
        return {
          encrypted: Buffer.concat([encrypted, nonceBuffer]),
          nonce: nonceBuffer,
        };
      }

      default:
        throw new Error(`Unsupported encryption mode: ${mode}`);
    }
  },

  decryptRTP(
    encryptedData: Buffer,
    key: Uint8Array,
    header: RTPPacketHeader,
    mode: EncryptionMode,
  ): Buffer {
    switch (mode) {
      case EncryptionMode.AEAD_AES256_GCM_RTPSize:
      case EncryptionMode.AEAD_AES256_GCM: {
        const nonceBuffer = EncryptionUtil.createNonce(header, mode);

        // Determine the unencrypted portion size
        const rtpSize =
          mode === EncryptionMode.AEAD_AES256_GCM_RTPSize ? 12 : 0;
        const headerBuffer = Buffer.alloc(rtpSize);
        if (rtpSize > 0) {
          // Copy the RTP header
          headerBuffer.writeUInt8(header.version, 0);
          headerBuffer.writeUInt8(header.payloadType, 1);
          headerBuffer.writeUInt16BE(header.sequence, 2);
          headerBuffer.writeUInt32BE(header.timestamp, 4);
          headerBuffer.writeUInt32BE(header.ssrc, 8);
        }

        // Extract tag
        const tagSize = EncryptionUtil.TAG_SIZE;
        const tag = encryptedData.subarray(encryptedData.length - tagSize);
        const ciphertext = encryptedData.subarray(
          0,
          encryptedData.length - tagSize,
        );

        // Decrypt
        return EncryptionUtil.decryptAEADGCM(
          ciphertext,
          key,
          nonceBuffer,
          tag,
          headerBuffer,
        );
      }

      case EncryptionMode.AEAD_XChaCha20_Poly1305_RTPSize: {
        const nonceBuffer = EncryptionUtil.createNonce(header, mode);

        // Determine the unencrypted portion size
        const rtpSize = 12;
        const headerBuffer = Buffer.alloc(rtpSize);
        // Copy the RTP header
        headerBuffer.writeUInt8(header.version, 0);
        headerBuffer.writeUInt8(header.payloadType, 1);
        headerBuffer.writeUInt16BE(header.sequence, 2);
        headerBuffer.writeUInt32BE(header.timestamp, 4);
        headerBuffer.writeUInt32BE(header.ssrc, 8);

        // Decrypt
        return EncryptionUtil.decryptXChaCha20(encryptedData, key, nonceBuffer);
      }

      case EncryptionMode.XSalsa20_Poly1305_Lite_RTPSize:
      case EncryptionMode.XSalsa20_Poly1305_Lite: {
        // Extract nonce value (last 4 bytes)
        const nonceValue = encryptedData.readUInt32BE(
          encryptedData.length -
            EncryptionUtil.XSALSA20_POLY1305_LITE_NONCE_SIZE,
        );
        const ciphertext = encryptedData.subarray(
          0,
          encryptedData.length -
            EncryptionUtil.XSALSA20_POLY1305_LITE_NONCE_SIZE,
        );

        // Create nonce buffer
        const nonceBuffer = Buffer.alloc(EncryptionUtil.SODIUM_NONCE_SIZE);
        nonceBuffer.fill(0);
        nonceBuffer.writeUInt32LE(nonceValue, 0);

        // Decrypt
        return EncryptionUtil.decryptXSalsa20(ciphertext, key, nonceBuffer);
      }

      case EncryptionMode.XSalsa20_Poly1305: {
        const nonceBuffer = EncryptionUtil.createNonce(header, mode);
        return EncryptionUtil.decryptXSalsa20(encryptedData, key, nonceBuffer);
      }

      case EncryptionMode.XSalsa20_Poly1305_Suffix: {
        // Extract nonce (last 24 bytes)
        const nonceBuffer = encryptedData.subarray(
          encryptedData.length - EncryptionUtil.SODIUM_NONCE_SIZE,
        );
        const ciphertext = encryptedData.subarray(
          0,
          encryptedData.length - EncryptionUtil.SODIUM_NONCE_SIZE,
        );

        // Decrypt
        return EncryptionUtil.decryptXSalsa20(ciphertext, key, nonceBuffer);
      }

      default:
        throw new Error(`Unsupported encryption mode: ${mode}`);
    }
  },

  generateEncryptionKey(): Buffer {
    const key = Buffer.alloc(32);
    sodium.randombytes_buf(key);
    return key;
  },
} as const;
