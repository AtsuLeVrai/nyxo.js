import {
  type BinaryDavePayload,
  type BinaryMessage,
  VoiceOpcodes,
} from "../types/index.js";

const SEQUENCE_NUMBER_SIZE = 2;
const OPCODE_SIZE = 1;

export const BinaryMessageHandler = {
  encodeBinaryMessage(message: BinaryMessage): Buffer {
    const hasSequence = "sequenceNumber" in message;
    const headerSize = hasSequence
      ? SEQUENCE_NUMBER_SIZE + OPCODE_SIZE
      : OPCODE_SIZE;
    const totalSize = headerSize + message.payload.length;

    const buffer = Buffer.alloc(totalSize);
    let offset = 0;

    if (hasSequence && message.sequenceNumber !== undefined) {
      buffer.writeUInt16BE(message.sequenceNumber, offset);
      offset += SEQUENCE_NUMBER_SIZE;
    }

    buffer.writeUInt8(message.opcode, offset);
    offset += OPCODE_SIZE;

    message.payload.copy(buffer, offset);
    return buffer;
  },
  decodeBinaryMessage(buffer: Buffer): BinaryDavePayload {
    if (buffer.length < SEQUENCE_NUMBER_SIZE + OPCODE_SIZE) {
      throw new Error("Binary message too short");
    }

    const sequenceNumber = buffer.readUInt16BE(0);
    const opcode = buffer.readUInt8(SEQUENCE_NUMBER_SIZE);
    const payload = buffer.subarray(SEQUENCE_NUMBER_SIZE + OPCODE_SIZE);

    if (!this.isValidDaveOpcode(opcode)) {
      throw new Error(`Invalid DAVE opcode: ${opcode}`);
    }

    return {
      sequenceNumber,
      opcode,
      payload,
    };
  },
  encodeDaveMessage(
    type: VoiceOpcodes,
    data: Buffer,
    sequenceNumber?: number,
  ): Buffer {
    return this.encodeBinaryMessage({
      opcode: type,
      payload: data,
      sequenceNumber,
    });
  },
  decodeDavePayload(message: BinaryDavePayload): unknown {
    switch (message.opcode) {
      case VoiceOpcodes.DaveProtocolPrepareTransition:
        return this.decodeTransitionPayload(message.payload);

      case VoiceOpcodes.DaveProtocolPrepareEpoch:
        return this.decodeEpochPayload(message.payload);

      case VoiceOpcodes.DaveMlsKeyPackage:
        return this.decodeKeyPackagePayload(message.payload);

      case VoiceOpcodes.DaveMlsProposals:
        return this.decodeProposalsPayload(message.payload);

      case VoiceOpcodes.DaveMlsCommitWelcome:
        return this.decodeCommitWelcomePayload(message.payload);

      default:
        throw new Error(`Unsupported DAVE opcode: ${message.opcode}`);
    }
  },
  isValidDaveOpcode(opcode: number): boolean {
    return (
      opcode >= VoiceOpcodes.DaveProtocolPrepareTransition &&
      opcode <= VoiceOpcodes.DaveMlsInvalidCommitWelcome
    );
  },
  decodeTransitionPayload(payload: Buffer): { transition_id: string } {
    const transitionId = payload.toString("utf8");
    return { transition_id: transitionId };
  },
  decodeEpochPayload(payload: Buffer): {
    transition_id: string;
    epoch_id: number;
  } {
    const transitionId = payload.subarray(0, 32).toString("utf8");
    const epochId = payload.readUInt32BE(32);
    return {
      transition_id: transitionId,
      epoch_id: epochId,
    };
  },
  decodeKeyPackagePayload(payload: Buffer): { key_package: string } {
    return {
      key_package: payload.toString("base64"),
    };
  },
  decodeProposalsPayload(payload: Buffer): { proposals: string[] } {
    const count = payload.readUInt16BE(0);
    const proposals: string[] = [];
    let offset = 2;

    for (let i = 0; i < count; i++) {
      const length = payload.readUInt16BE(offset);
      offset += 2;
      const proposal = payload.subarray(offset, offset + length);
      proposals.push(proposal.toString("base64"));
      offset += length;
    }

    return { proposals };
  },
  decodeCommitWelcomePayload(payload: Buffer): {
    commit: string;
    welcome?: string[];
  } {
    const commitLength = payload.readUInt16BE(0);
    const commit = payload.subarray(2, 2 + commitLength).toString("base64");
    let welcome: string[] | undefined;

    if (payload.length > 2 + commitLength) {
      const welcomeCount = payload.readUInt16BE(2 + commitLength);
      welcome = [];
      let offset = 4 + commitLength;

      for (let i = 0; i < welcomeCount; i++) {
        const length = payload.readUInt16BE(offset);
        offset += 2;
        const welcomeMsg = payload.subarray(offset, offset + length);
        welcome.push(welcomeMsg.toString("base64"));
        offset += length;
      }
    }

    return { commit, welcome };
  },
} as const;

export const DavePayloadEncoder = {
  encodeTransition(transitionId: string): Buffer {
    return Buffer.from(transitionId, "utf8");
  },
  encodeEpoch(transitionId: string, epochId: number): Buffer {
    const buffer = Buffer.alloc(36);
    buffer.write(transitionId, 0, "utf8");
    buffer.writeUInt32BE(epochId, 32);
    return buffer;
  },
  encodeKeyPackage(keyPackage: Buffer): Buffer {
    const buffer = Buffer.alloc(2 + keyPackage.length);
    buffer.writeUInt16BE(keyPackage.length, 0);
    keyPackage.copy(buffer, 2);
    return buffer;
  },
  encodeProposals(proposals: Buffer[]): Buffer {
    const totalSize =
      2 + proposals.reduce((sum, prop) => sum + 2 + prop.length, 0);
    const buffer = Buffer.alloc(totalSize);

    buffer.writeUInt16BE(proposals.length, 0);
    let offset = 2;

    for (const proposal of proposals) {
      buffer.writeUInt16BE(proposal.length, offset);
      offset += 2;
      proposal.copy(buffer, offset);
      offset += proposal.length;
    }

    return buffer;
  },
  encodeCommitWelcome(commit: Buffer, welcome?: Buffer[]): Buffer {
    const welcomeSize = welcome
      ? 2 + welcome.reduce((sum, w) => sum + 2 + w.length, 0)
      : 0;

    const buffer = Buffer.alloc(2 + commit.length + welcomeSize);
    let offset = 0;

    buffer.writeUInt16BE(commit.length, offset);
    offset += 2;
    commit.copy(buffer, offset);
    offset += commit.length;

    if (welcome && welcome.length > 0) {
      buffer.writeUInt16BE(welcome.length, offset);
      offset += 2;

      for (const w of welcome) {
        buffer.writeUInt16BE(w.length, offset);
        offset += 2;
        w.copy(buffer, offset);
        offset += w.length;
      }
    }

    return buffer;
  },
} as const;
