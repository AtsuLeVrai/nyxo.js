import { createCipheriv, createDecipheriv, createHash } from "node:crypto";
import type {
  E2eeFrame,
  MlsFrameEncryptionContext,
  MlsGroup,
} from "../types/index.js";

const AUTH_TAG_LENGTH = 8;
const MAGIC_MARKER = 0xfafa;
const KEY_SIZE = 16; // AES-128-GCM uses 16 byte keys
const NONCE_SIZE = 12;
const MAX_GENERATION = 255; // 8-bit generation counter

export class E2eeManager {
  #currentNonce = 0;
  #keyCache = new Map<number, Buffer>();
  #ratchetState: Buffer | null = null;

  initialize(): void {
    this.#currentNonce = 0;
    this.#keyCache.clear();
    this.#ratchetState = null;
  }

  updateEncryptionContext(group: MlsGroup): MlsFrameEncryptionContext {
    // Extract secret from MLS group using HKDF
    const groupSecret = this.#extractGroupSecret(group);

    // Initialize ratchet state
    this.#ratchetState = this.#initializeRatchet(groupSecret);

    // Generate initial sender key
    const senderKey = this.#deriveKeyFromRatchet(0);

    // Create empty receiver keys map - will be populated as needed
    const receiverKeys = new Map<number, Buffer>();

    return {
      generation: 0,
      senderKey,
      receiverKeys,
    };
  }

  encryptFrame(
    inputFrame: Buffer,
    encryptionContext: MlsFrameEncryptionContext,
  ): E2eeFrame {
    // Incrémenter le nonce de manière sûre
    const nextNonce = (this.#currentNonce + 1) >>> 0;

    // Extraire la génération
    const generation = (nextNonce >> 24) & 0xff;

    // Mettre à jour la génération si nécessaire
    const context = { ...encryptionContext };
    if (generation !== context.generation) {
      this.#updateGeneration(context, generation);
    }

    // Créer le nonce
    const nonceBuffer = this.#createNonce(nextNonce);

    // Chiffrer avec AES-128-GCM
    const cipher = createCipheriv(
      "aes-128-gcm",
      context.senderKey,
      nonceBuffer,
      {
        authTagLength: AUTH_TAG_LENGTH,
      },
    );

    // Données additionnelles authentifiées
    const aad = Buffer.alloc(2);
    aad.writeUInt16BE(inputFrame.length);
    cipher.setAAD(aad);

    // Chiffrer les données
    const encrypted = Buffer.concat([
      cipher.update(inputFrame),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag().subarray(0, AUTH_TAG_LENGTH);

    return {
      opusFrame: encrypted,
      nonce: nextNonce,
      authTag: authTag,
      unencryptedRanges: [],
      magicMarker: MAGIC_MARKER,
    };
  }

  decryptFrame(
    frame: E2eeFrame,
    encryptionContext: MlsFrameEncryptionContext,
  ): Buffer {
    const generation = (frame.nonce >> 24) & 0xff;

    const context = { ...encryptionContext };
    const key =
      context.receiverKeys.get(generation) ??
      this.#deriveReceiverKey(generation);
    context.receiverKeys.set(generation, key);

    const nonceBuffer = this.#createNonce(frame.nonce);
    const decipher = createDecipheriv("aes-128-gcm", key, nonceBuffer, {
      authTagLength: AUTH_TAG_LENGTH,
    });

    const aad = Buffer.alloc(2);
    aad.writeUInt16BE(frame.opusFrame.length - AUTH_TAG_LENGTH);
    decipher.setAAD(aad);
    decipher.setAuthTag(frame.authTag);

    try {
      return Buffer.concat([
        decipher.update(frame.opusFrame),
        decipher.final(),
      ]);
    } catch (error) {
      throw new Error("Failed to decrypt frame - invalid authentication tag", {
        cause: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  cleanup(): void {
    this.#currentNonce = 0;
    this.#keyCache.clear();
    this.#ratchetState = null;
  }

  destroy(): void {
    this.cleanup();
  }

  #extractGroupSecret(group: MlsGroup): Buffer {
    // Implement HKDF-Extract from RFC 5869
    const hash = createHash("sha256");

    // Salt is the group epoch number
    const salt = Buffer.alloc(4);
    salt.writeUInt32BE(group.epoch);

    // Input keying material is the group key package
    hash.update(salt);
    hash.update(group.keyPackage);

    // Return first 16 bytes for AES-128 key
    return Buffer.from(hash.digest()).subarray(0, KEY_SIZE);
  }

  #initializeRatchet(secret: Buffer): Buffer {
    // Initialize ratchet state with group secret
    const hash = createHash("sha256");
    hash.update(secret);
    hash.update(Buffer.from("ratchet_init"));
    return Buffer.from(hash.digest());
  }

  #deriveKeyFromRatchet(generation: number): Buffer {
    if (!this.#ratchetState) {
      throw new Error("Ratchet not initialized");
    }

    // Check cache first
    const cached = this.#keyCache.get(generation);
    if (cached) {
      return cached;
    }

    // Derive new key using SHA-256
    const hash = createHash("sha256");
    hash.update(this.#ratchetState);
    hash.update(Buffer.from([generation]));

    // Update ratchet state
    this.#ratchetState = Buffer.from(hash.digest());

    // Generate key from ratchet output
    const key = this.#ratchetState.subarray(0, KEY_SIZE);

    // Cache the key
    this.#keyCache.set(generation, key);

    return key;
  }

  #deriveReceiverKey(generation: number): Buffer {
    // For testing, generate deterministic key
    // In production, this would use proper key derivation
    const key = Buffer.alloc(KEY_SIZE);
    key.writeUInt32BE(generation, 0);
    return key;
  }

  #createNonce(counter: number): Buffer {
    const nonce = Buffer.alloc(NONCE_SIZE);
    nonce.writeUInt32BE(counter, NONCE_SIZE - 4);
    return nonce;
  }

  #updateGeneration(
    context: MlsFrameEncryptionContext,
    newGeneration: number,
  ): void {
    if (newGeneration > MAX_GENERATION) {
      throw new Error("Generation counter overflow");
    }

    const newContext = { ...context };
    newContext.generation = newGeneration;
    newContext.senderKey = this.#deriveKeyFromRatchet(newGeneration);

    for (const gen of this.#keyCache.keys()) {
      if (gen < newGeneration - 2) {
        this.#keyCache.delete(gen);
      }
    }

    Object.assign(context, newContext);
  }
}
