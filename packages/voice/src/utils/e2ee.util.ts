import crypto from "node:crypto";
import type { E2EEOpusFrame } from "../types/index.js";
import { ULEBUtil } from "./ule.util.js";

export const E2EEUtil = {
  AES_GCM_IV_SIZE: 12,
  AES_GCM_TAG_SIZE: 16,
  AUTH_TAG_SIZE: 8,
  MAGIC_MARKER: 0xfafa,
  MAX_NONCE: 0xffffffff,

  encryptOpusFrame(
    opusFrame: Uint8Array,
    frameKey: Uint8Array,
    nonce: number,
    generation: number,
  ): E2EEOpusFrame {
    // Create the nonce with generation in the first byte
    const nonceUint32 = (generation << 24) | (nonce & 0x00ffffff);

    // Encode nonce as ULEB128
    const encodedNonce = ULEBUtil.encodeULEB128(nonceUint32);

    // Create IV for AES-GCM (12 bytes, with 0s in most significant bytes)
    const iv = Buffer.alloc(E2EEUtil.AES_GCM_IV_SIZE);
    iv.writeUInt32BE(nonceUint32, E2EEUtil.AES_GCM_IV_SIZE - 4);

    // Encrypt using AES-GCM
    const cipher = crypto.createCipheriv("aes-128-gcm", frameKey, iv);
    const ciphertext = Buffer.concat([
      cipher.update(opusFrame),
      cipher.final(),
    ]);

    // Get the authentication tag and truncate to 8 bytes
    const fullAuthTag = cipher.getAuthTag();
    const authTag = fullAuthTag.subarray(0, E2EEUtil.AUTH_TAG_SIZE);

    // No unencrypted ranges for OPUS frames
    const unencryptedRanges = new Uint8Array(0);

    // Calculate supplemental data size
    const supplementalDataSize =
      E2EEUtil.AUTH_TAG_SIZE +
      encodedNonce.length +
      unencryptedRanges.length +
      1 + // Size byte itself
      2; // Magic marker

    return {
      ciphertext,
      authTag,
      nonce: encodedNonce,
      unencryptedRanges,
      supplementalDataSize,
      magicMarker: E2EEUtil.MAGIC_MARKER,
    };
  },

  serializeE2EEOpusFrame(frame: E2EEOpusFrame): Uint8Array {
    // Calculate total size
    const totalSize =
      frame.ciphertext.length +
      frame.authTag.length +
      frame.nonce.length +
      frame.unencryptedRanges.length +
      1 + // Supplemental data size byte
      2; // Magic marker

    // Create the combined buffer
    const result = new Uint8Array(totalSize);
    let offset = 0;

    // Copy ciphertext
    result.set(frame.ciphertext, offset);
    offset += frame.ciphertext.length;

    // Copy auth tag
    result.set(frame.authTag, offset);
    offset += frame.authTag.length;

    // Copy nonce
    result.set(frame.nonce, offset);
    offset += frame.nonce.length;

    // Copy unencrypted ranges
    result.set(frame.unencryptedRanges, offset);
    offset += frame.unencryptedRanges.length;

    // Write supplemental data size
    result[offset] = frame.supplementalDataSize;
    offset++;

    // Write magic marker
    result[offset] = (frame.magicMarker >> 8) & 0xff;
    result[offset + 1] = frame.magicMarker & 0xff;

    return result;
  },

  parseE2EEOpusFrame(data: Uint8Array): E2EEOpusFrame | null {
    // Check minimum size
    if (data.length < 3) {
      return null;
    }

    // Check for magic marker at the end
    const magicMarker =
      ((data.at(-2) as number) << 8) | (data.at(-1) as number);
    if (magicMarker !== E2EEUtil.MAGIC_MARKER) {
      return null;
    }

    // Get supplemental data size
    const supplementalDataSize = data.at(-3) as number;
    if (supplementalDataSize < 10 || data.length <= supplementalDataSize) {
      return null;
    }

    // Calculate ciphertext size
    const ciphertextSize = data.length - supplementalDataSize;

    // Extract parts
    const ciphertext = data.slice(0, ciphertextSize);

    // Start parsing from the end, working backwards
    let offset = data.length - 3; // Position at supplemental data size byte

    // Parse unencrypted ranges and nonce
    offset -= 2; // Skip magic marker

    // Determine where unencrypted ranges end
    const unencryptedRangesEnd = offset;

    // Unencrypted ranges will be 0 bytes for OPUS frames
    const unencryptedRanges = new Uint8Array(0);

    // Read ULEB128 nonce
    // Find where nonce starts by working backwards from where unencrypted ranges end
    const nonceEnd = unencryptedRangesEnd;
    let nonceStart = nonceEnd;

    // Scan backwards to find the start of the ULEB128 encoded nonce
    while (nonceStart > ciphertextSize + E2EEUtil.AUTH_TAG_SIZE) {
      if (((data[nonceStart - 1] as number) & 0x80) === 0) {
        break;
      }
      nonceStart--;
    }

    const nonce = data.slice(nonceStart, nonceEnd);

    // Extract auth tag
    const authTag = data.slice(
      ciphertextSize,
      ciphertextSize + E2EEUtil.AUTH_TAG_SIZE,
    );

    return {
      ciphertext,
      authTag,
      nonce,
      unencryptedRanges,
      supplementalDataSize,
      magicMarker,
    };
  },

  decryptOpusFrame(frame: E2EEOpusFrame, frameKey: Uint8Array): Uint8Array {
    // Decode the nonce value
    const { value: nonceValue } = ULEBUtil.decodeULEB128(frame.nonce);

    // Create IV for AES-GCM (12 bytes, with 0s in most significant bytes)
    const iv = Buffer.alloc(E2EEUtil.AES_GCM_IV_SIZE);
    iv.writeUInt32BE(nonceValue, E2EEUtil.AES_GCM_IV_SIZE - 4);

    // Recreate full 16-byte auth tag by padding with zeros
    const fullAuthTag = Buffer.alloc(E2EEUtil.AES_GCM_TAG_SIZE);
    Buffer.from(frame.authTag).copy(fullAuthTag);

    // Decrypt using AES-GCM
    const decipher = crypto.createDecipheriv("aes-128-gcm", frameKey, iv);
    decipher.setAuthTag(fullAuthTag);

    try {
      return Buffer.concat([
        decipher.update(Buffer.from(frame.ciphertext)),
        decipher.final(),
      ]);
    } catch (error) {
      throw new Error(`Failed to decrypt E2EE frame: ${error}`);
    }
  },

  deriveFrameKey(
    secret: Uint8Array,
    userId: string,
    ssrc: number,
    generation: number,
  ): Buffer {
    // Use HKDF to derive the frame key
    const info = Buffer.from(`DAVE-MEDIA-${userId}-${ssrc}-${generation}`);
    return E2EEUtil.hkdf(secret, undefined, info, 16);
  },

  hkdf(
    ikm: Uint8Array,
    salt?: Uint8Array,
    info?: Uint8Array,
    length = 32,
  ): Buffer {
    // HMAC-based Key Derivation Function (RFC 5869)
    const actualSalt = salt || Buffer.alloc(0);
    const actualInfo = info || Buffer.alloc(0);

    // Step 1: Extract
    const prk = crypto.createHmac("sha256", actualSalt).update(ikm).digest();

    // Step 2: Expand
    const hashLen = 32; // SHA-256 hash length
    const blocks = Math.ceil(length / hashLen);
    let t: Buffer = Buffer.alloc(0);
    let result = Buffer.alloc(0);

    for (let i = 0; i < blocks; i++) {
      const hmac = crypto.createHmac("sha256", prk);
      const input = Buffer.concat([t, actualInfo, Buffer.from([i + 1])]);
      t = hmac.update(input).digest() as Buffer;
      result = Buffer.concat([result, t]);
    }

    return result.subarray(0, length);
  },

  isE2EEFrame(data: Uint8Array): boolean {
    if (data.length < 3) {
      return false;
    }

    // Check for magic marker at the end
    const magicMarker =
      ((data.at(-2) as number) << 8) | (data.at(-1) as number);
    return magicMarker === E2EEUtil.MAGIC_MARKER;
  },

  generateMLSKeyPair(): { publicKey: Buffer; privateKey: Buffer } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("x25519");

    return {
      publicKey: Buffer.from(publicKey.export({ type: "spki", format: "der" })),
      privateKey: Buffer.from(
        privateKey.export({ type: "pkcs8", format: "der" }),
      ),
    };
  },
} as const;
