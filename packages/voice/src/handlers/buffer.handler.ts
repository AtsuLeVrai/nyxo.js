/**
 * Utility class for common buffer operations
 *
 * This class centralizes buffer creation and manipulation operations
 * used throughout the voice connection implementation.
 */
export const BufferHandler = {
  /**
   * Creates an RTP header buffer
   *
   * @param version - Version and flags (typically 0x80)
   * @param payloadType - Payload type (typically 0x78 for voice)
   * @param sequence - Sequence number (16-bit)
   * @param timestamp - Timestamp (32-bit)
   * @param ssrc - Synchronization Source identifier (32-bit)
   * @returns A 12-byte buffer containing the RTP header
   */
  createRtpHeader(
    version: number,
    payloadType: number,
    sequence: number,
    timestamp: number,
    ssrc: number,
  ): Buffer {
    const header = Buffer.allocUnsafe(12);
    header.writeUInt8(version, 0);
    header.writeUInt8(payloadType, 1);
    header.writeUInt16BE(sequence, 2);
    header.writeUInt32BE(timestamp, 4);
    header.writeUInt32BE(ssrc, 8);
    return header;
  },

  /**
   * Creates an IP discovery packet
   *
   * @param ssrc - Synchronization Source identifier (32-bit)
   * @returns A 74-byte buffer containing the IP discovery request
   */
  createIpDiscoveryPacket(ssrc: number): Buffer {
    const packet = Buffer.allocUnsafe(74).fill(0);
    packet.writeUInt16BE(0x1, 0); // Type (request)
    packet.writeUInt16BE(70, 2); // Length
    packet.writeUInt32BE(ssrc, 4); // SSRC
    return packet;
  },

  /**
   * Creates a nonce buffer for encryption
   *
   * @param counter - Nonce counter value
   * @param size - Size of the nonce buffer (12 for AES-GCM, 24 for XChaCha20)
   * @returns A buffer containing the nonce with counter in the last 4 bytes
   */
  createNonce(counter: number, size: 12 | 24): Buffer {
    const nonce = Buffer.allocUnsafe(size).fill(0);
    nonce.writeUInt32BE(counter, size - 4);
    return nonce;
  },

  /**
   * Extracts a nonce counter from a full nonce
   *
   * @param nonce - Full nonce buffer
   * @param offset - Offset where counter is stored
   * @returns A 4-byte buffer containing just the counter
   */
  extractNonceCounter(nonce: Buffer, offset: number): Buffer {
    const counter = Buffer.allocUnsafe(4);
    nonce.copy(counter, 0, offset, offset + 4);
    return counter;
  },

  /**
   * Extracts components from an encrypted packet
   *
   * @param data - Complete encrypted packet
   * @param rtpSize - Size of the RTP header (unencrypted portion)
   * @returns Object containing packet components
   */
  extractEncryptedComponents(
    data: Buffer,
    rtpSize: number,
  ): {
    rtpHeader: Buffer;
    encryptedData: Buffer;
    authTag: Buffer;
    nonceCounter: Buffer;
  } {
    const rtpHeader = data.subarray(0, rtpSize);
    const remaining = data.subarray(rtpSize);

    const nonceCounter = remaining.subarray(remaining.length - 4);
    const authTag = remaining.subarray(
      remaining.length - 20,
      remaining.length - 4,
    );
    const encryptedData = remaining.subarray(0, remaining.length - 20);

    return { rtpHeader, encryptedData, authTag, nonceCounter };
  },
} as const;
