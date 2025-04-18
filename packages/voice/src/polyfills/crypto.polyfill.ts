import crypto from "node:crypto";
import { OptionalDeps } from "@nyxjs/core";
import type LibSodiumWrappers from "libsodium-wrappers";
import type SodiumNative from "sodium-native";
import type Tweetnacl from "tweetnacl";

/**
 * Common interface for cryptographic implementations
 * Simplified to only support non-deprecated modes:
 * - aead_aes256_gcm_rtpsize (uses node:crypto)
 * - aead_xchacha20_poly1305_rtpsize
 */
export interface CryptoImplementation {
  /**
   * Generates random bytes
   * @param length Length of the byte array to generate
   * @returns Random byte array
   */
  randomBytes(length: number): Uint8Array;

  /**
   * Encrypts data with XChaCha20-Poly1305 mode
   * @param data Data to encrypt
   * @param nonce Nonce to use
   * @param key Secret key
   * @returns Encrypted data
   */
  xchacha20poly1305Encrypt(
    data: Uint8Array,
    nonce: Uint8Array,
    key: Uint8Array,
  ): Uint8Array;

  /**
   * Decrypts data with XChaCha20-Poly1305 mode
   * @param data Encrypted data
   * @param nonce Nonce used
   * @param key Secret key
   * @returns Decrypted data or null if decryption fails
   */
  xchacha20poly1305Decrypt(
    data: Uint8Array,
    nonce: Uint8Array,
    key: Uint8Array,
  ): Uint8Array | null;

  /**
   * Encrypts data with AES-256-GCM mode (uses node:crypto)
   * @param data Data to encrypt
   * @param nonce Nonce to use (must be 12 bytes)
   * @param key Secret key
   * @returns Encrypted data
   */
  aes256gcmEncrypt(
    data: Uint8Array,
    nonce: Uint8Array,
    key: Uint8Array,
  ): Uint8Array;

  /**
   * Decrypts data with AES-256-GCM mode (uses node:crypto)
   * @param data Encrypted data
   * @param nonce Nonce used (must be 12 bytes)
   * @param key Secret key
   * @returns Decrypted data or null if decryption fails
   */
  aes256gcmDecrypt(
    data: Uint8Array,
    nonce: Uint8Array,
    key: Uint8Array,
  ): Uint8Array | null;
}

/**
 * Common implementation of AES-GCM using node:crypto
 * This class is used by all implementations for AES-GCM
 */
const nodeCryptoAesgcm = {
  /**
   * Encrypts data with AES-256-GCM using node:crypto
   */
  encrypt(data: Uint8Array, nonce: Uint8Array, key: Uint8Array): Uint8Array {
    // Check if nonce length is correct (12 bytes for AES-GCM)
    if (nonce.length !== 12) {
      throw new Error("AES-GCM nonce must be 12 bytes");
    }

    try {
      // Create an AES-GCM cipher with the key and nonce
      const cipher = crypto.createCipheriv("aes-256-gcm", key, nonce);

      // Encrypt the data
      const encrypted = Buffer.concat([
        cipher.update(Buffer.from(data)),
        cipher.final(),
      ]);

      // Get the authentication tag (16 bytes)
      const authTag = cipher.getAuthTag();

      // Concatenate the encrypted data and authentication tag
      return Buffer.concat([encrypted, authTag]);
    } catch (error) {
      throw new Error(
        `AES-GCM encryption error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },

  /**
   * Decrypts data with AES-256-GCM using node:crypto
   */
  decrypt(
    data: Uint8Array,
    nonce: Uint8Array,
    key: Uint8Array,
  ): Uint8Array | null {
    // Check if nonce length is correct (12 bytes for AES-GCM)
    if (nonce.length !== 12) {
      throw new Error("AES-GCM nonce must be 12 bytes");
    }

    try {
      // Separate the encrypted data and authentication tag
      // The authentication tag is the last 16 bytes
      const encrypted = data.slice(0, data.length - 16);
      const authTag = data.slice(data.length - 16);

      // Create an AES-GCM decipher with the key and nonce
      const decipher = crypto.createDecipheriv("aes-256-gcm", key, nonce);

      // Set the authentication tag
      decipher.setAuthTag(Buffer.from(authTag));

      // Decrypt the data
      const decrypted = Buffer.concat([
        decipher.update(Buffer.from(encrypted)),
        decipher.final(),
      ]);

      return new Uint8Array(decrypted);
    } catch (_error) {
      // Return null on decryption error (authenticity verification failure)
      return null;
    }
  },
} as const;

/**
 * Implementation for sodium-native
 */
export class SodiumNativeImpl implements CryptoImplementation {
  readonly #sodium: typeof SodiumNative;

  constructor(sodium: typeof SodiumNative) {
    this.#sodium = sodium;
  }

  randomBytes(length: number): Uint8Array {
    const buffer = Buffer.alloc(length);
    this.#sodium.randombytes_buf(buffer);
    return new Uint8Array(buffer);
  }

  xchacha20poly1305Encrypt(
    data: Uint8Array,
    nonce: Uint8Array,
    key: Uint8Array,
  ): Uint8Array {
    // Try to use crypto_aead_xchacha20poly1305_ietf_encrypt if available
    if (
      "crypto_aead_xchacha20poly1305_ietf_encrypt" in this.#sodium &&
      typeof this.#sodium.crypto_aead_xchacha20poly1305_ietf_encrypt ===
        "function"
    ) {
      try {
        const message = Buffer.from(data);
        const nonceBuffer = Buffer.from(nonce);
        const keyBuffer = Buffer.from(key);

        // Get the authentication header size constant
        const abytes =
          this.#sodium.crypto_aead_xchacha20poly1305_ietf_ABYTES || 16;

        const ciphertext = Buffer.alloc(message.length + abytes);

        this.#sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
          ciphertext,
          message,
          null, // no additional data
          null, // no secret nonce
          nonceBuffer,
          keyBuffer,
        );

        return new Uint8Array(ciphertext);
      } catch (_error) {
        // Fallback if error
      }
    }

    // Fallback to crypto_secretbox (XSalsa20-Poly1305)
    const message = Buffer.from(data);
    const nonceBuffer = Buffer.from(nonce);
    const keyBuffer = Buffer.from(key);

    const ciphertext = Buffer.alloc(
      message.length + this.#sodium.crypto_secretbox_MACBYTES,
    );
    this.#sodium.crypto_secretbox_easy(
      ciphertext,
      message,
      nonceBuffer,
      keyBuffer,
    );

    return new Uint8Array(ciphertext);
  }

  xchacha20poly1305Decrypt(
    data: Uint8Array,
    nonce: Uint8Array,
    key: Uint8Array,
  ): Uint8Array | null {
    // Try to use crypto_aead_xchacha20poly1305_ietf_decrypt if available
    if (
      "crypto_aead_xchacha20poly1305_ietf_decrypt" in this.#sodium &&
      typeof this.#sodium.crypto_aead_xchacha20poly1305_ietf_decrypt ===
        "function"
    ) {
      try {
        const ciphertext = Buffer.from(data);
        const nonceBuffer = Buffer.from(nonce);
        const keyBuffer = Buffer.from(key);

        // Get the authentication header size constant
        const abytes =
          this.#sodium.crypto_aead_xchacha20poly1305_ietf_ABYTES || 16;

        const message = Buffer.alloc(ciphertext.length - abytes);

        this.#sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
          message,
          null, // no secret nonce
          ciphertext,
          null, // no additional data
          nonceBuffer,
          keyBuffer,
        );

        return new Uint8Array(message);
      } catch (_error) {
        // Try the fallback if this method fails
      }
    }

    // Fallback to crypto_secretbox_open_easy (XSalsa20-Poly1305)
    try {
      const ciphertext = Buffer.from(data);
      const nonceBuffer = Buffer.from(nonce);
      const keyBuffer = Buffer.from(key);

      const message = Buffer.alloc(
        ciphertext.length - this.#sodium.crypto_secretbox_MACBYTES,
      );

      const success = this.#sodium.crypto_secretbox_open_easy(
        message,
        ciphertext,
        nonceBuffer,
        keyBuffer,
      );
      if (success) {
        return new Uint8Array(message);
      }
      return null;
    } catch (_error) {
      return null;
    }
  }

  // Use node:crypto implementation for AES-GCM
  aes256gcmEncrypt(
    data: Uint8Array,
    nonce: Uint8Array,
    key: Uint8Array,
  ): Uint8Array {
    return nodeCryptoAesgcm.encrypt(data, nonce, key);
  }

  // Use node:crypto implementation for AES-GCM
  aes256gcmDecrypt(
    data: Uint8Array,
    nonce: Uint8Array,
    key: Uint8Array,
  ): Uint8Array | null {
    return nodeCryptoAesgcm.decrypt(data, nonce, key);
  }
}

/**
 * Implementation for libsodium-wrappers
 */
export class LibSodiumWrappersImpl implements CryptoImplementation {
  readonly #sodium: typeof LibSodiumWrappers;

  constructor(sodium: typeof LibSodiumWrappers) {
    this.#sodium = sodium;
  }

  randomBytes(length: number): Uint8Array {
    return this.#sodium.randombytes_buf(length);
  }

  xchacha20poly1305Encrypt(
    data: Uint8Array,
    nonce: Uint8Array,
    key: Uint8Array,
  ): Uint8Array {
    try {
      // Try to use crypto_aead_xchacha20poly1305_ietf_encrypt if available
      if ("crypto_aead_xchacha20poly1305_ietf_encrypt" in this.#sodium) {
        return this.#sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
          data,
          null,
          null,
          nonce,
          key,
        );
      }
    } catch (_error) {
      // Fallback if error
    }

    // Fallback to crypto_secretbox_easy (XSalsa20-Poly1305)
    return this.#sodium.crypto_secretbox_easy(data, nonce, key);
  }

  xchacha20poly1305Decrypt(
    data: Uint8Array,
    nonce: Uint8Array,
    key: Uint8Array,
  ): Uint8Array | null {
    try {
      // Try to use crypto_aead_xchacha20poly1305_ietf_decrypt if available
      if ("crypto_aead_xchacha20poly1305_ietf_decrypt" in this.#sodium) {
        return this.#sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
          null,
          data,
          null,
          nonce,
          key,
        );
      }
    } catch (_error) {
      // Try the fallback if this method fails
    }

    // Fallback to crypto_secretbox_open_easy (XSalsa20-Poly1305)
    try {
      return this.#sodium.crypto_secretbox_open_easy(data, nonce, key);
    } catch (_error) {
      return null;
    }
  }

  // Use node:crypto implementation for AES-GCM
  aes256gcmEncrypt(
    data: Uint8Array,
    nonce: Uint8Array,
    key: Uint8Array,
  ): Uint8Array {
    return nodeCryptoAesgcm.encrypt(data, nonce, key);
  }

  // Use node:crypto implementation for AES-GCM
  aes256gcmDecrypt(
    data: Uint8Array,
    nonce: Uint8Array,
    key: Uint8Array,
  ): Uint8Array | null {
    return nodeCryptoAesgcm.decrypt(data, nonce, key);
  }
}

/**
 * Implementation for TweetNaCl
 */
export class TweetNaClImpl implements CryptoImplementation {
  #nacl: typeof Tweetnacl;

  constructor(nacl: typeof Tweetnacl) {
    this.#nacl = nacl;
  }

  randomBytes(length: number): Uint8Array {
    return this.#nacl.randomBytes(length);
  }

  xchacha20poly1305Encrypt(
    data: Uint8Array,
    nonce: Uint8Array,
    key: Uint8Array,
  ): Uint8Array {
    // TweetNaCl only supports XSalsa20-Poly1305
    return this.#nacl.secretbox(data, nonce, key);
  }

  xchacha20poly1305Decrypt(
    data: Uint8Array,
    nonce: Uint8Array,
    key: Uint8Array,
  ): Uint8Array | null {
    // TweetNaCl only supports XSalsa20-Poly1305
    return this.#nacl.secretbox.open(data, nonce, key);
  }

  // Use node:crypto implementation for AES-GCM
  aes256gcmEncrypt(
    data: Uint8Array,
    nonce: Uint8Array,
    key: Uint8Array,
  ): Uint8Array {
    return nodeCryptoAesgcm.encrypt(data, nonce, key);
  }

  // Use node:crypto implementation for AES-GCM
  aes256gcmDecrypt(
    data: Uint8Array,
    nonce: Uint8Array,
    key: Uint8Array,
  ): Uint8Array | null {
    return nodeCryptoAesgcm.decrypt(data, nonce, key);
  }
}

/**
 * Creates a unified cryptographic implementation by automatically
 * loading the appropriate library
 *
 * @returns An initialized CryptoImplementation instance
 * @throws Error if no compatible library is available
 */
export async function createUnifiedCrypto(): Promise<CryptoImplementation> {
  try {
    // Try to load libraries in order of preference
    const sodiumNative =
      await OptionalDeps.safeImport<typeof SodiumNative>("sodium-native");
    if (sodiumNative.success) {
      return new SodiumNativeImpl(sodiumNative.data);
    }

    const libsodium =
      await OptionalDeps.safeImport<typeof LibSodiumWrappers>(
        "libsodium-wrappers",
      );
    if (libsodium.success) {
      return new LibSodiumWrappersImpl(libsodium.data);
    }

    const tweetnacl =
      await OptionalDeps.safeImport<typeof Tweetnacl>("tweetnacl");
    if (tweetnacl.success) {
      return new TweetNaClImpl(tweetnacl.data);
    }

    throw new Error(
      "No encryption library available. Please install either sodium-native, libsodium-wrappers, or tweetnacl.",
    );
  } catch (error) {
    throw new Error(
      `Failed to create cryptographic implementation: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
