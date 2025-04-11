import type { RTPPacket, RTPPacketHeader } from "../types/index.js";

export const RTPPacketUtil = {
  VERSION: 0x80,
  PAYLOAD_TYPE: 0x78,
  HEADER_SIZE: 12,

  createPacketHeader(
    sequence: number,
    timestamp: number,
    ssrc: number,
  ): RTPPacketHeader {
    return {
      version: RTPPacketUtil.VERSION,
      payloadType: RTPPacketUtil.PAYLOAD_TYPE,
      sequence,
      timestamp,
      ssrc,
    };
  },

  createPacket(header: RTPPacketHeader, encryptedAudio: Uint8Array): RTPPacket {
    return {
      ...header,
      encryptedAudio,
    };
  },

  serializeHeader(header: RTPPacketHeader): Buffer {
    const buffer = Buffer.alloc(RTPPacketUtil.HEADER_SIZE);

    buffer[0] = header.version;
    buffer[1] = header.payloadType;
    buffer.writeUInt16BE(header.sequence, 2);
    buffer.writeUInt32BE(header.timestamp, 4);
    buffer.writeUInt32BE(header.ssrc, 8);

    return buffer;
  },

  serializePacket(packet: RTPPacket): Buffer {
    const headerBuffer = RTPPacketUtil.serializeHeader(packet);
    return Buffer.concat([headerBuffer, Buffer.from(packet.encryptedAudio)]);
  },

  parseHeader(buffer: Buffer): RTPPacketHeader {
    if (buffer.length < RTPPacketUtil.HEADER_SIZE) {
      throw new Error(`RTP header too small: ${buffer.length} bytes`);
    }

    return {
      version: buffer[0] as number,
      payloadType: buffer[1] as number,
      sequence: buffer.readUInt16BE(2),
      timestamp: buffer.readUInt32BE(4),
      ssrc: buffer.readUInt32BE(8),
    };
  },

  parsePacket(buffer: Buffer): RTPPacket {
    const header = RTPPacketUtil.parseHeader(buffer);
    const encryptedAudio = new Uint8Array(
      buffer.buffer,
      buffer.byteOffset + RTPPacketUtil.HEADER_SIZE,
      buffer.length - RTPPacketUtil.HEADER_SIZE,
    );

    return {
      ...header,
      encryptedAudio,
    };
  },

  validateHeader(header: RTPPacketHeader): boolean {
    return (
      header.version === RTPPacketUtil.VERSION &&
      header.payloadType === RTPPacketUtil.PAYLOAD_TYPE &&
      Number.isInteger(header.sequence) &&
      header.sequence >= 0 &&
      header.sequence <= 0xffff &&
      Number.isInteger(header.timestamp) &&
      Number.isInteger(header.ssrc)
    );
  },

  createSilenceFrame(): Uint8Array {
    return new Uint8Array([0xf8, 0xff, 0xfe]);
  },

  incrementSequence(sequence: number): number {
    return (sequence + 1) % 0x10000; // Wrap around at 65536
  },

  calculateTimestampDelta(frameSize: number): number {
    return frameSize;
  },
} as const;
