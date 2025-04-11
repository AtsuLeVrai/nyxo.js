export const NACKUtil = {
  MAX_MISSING_PACKETS: 100,
  MAX_SEQUENCE_DIFF: 3000,
  MISSING_TIMEOUT: 10000,
  RTCP_NACK_PT: 205,
  NACK_FMT: 1,

  createNACKTracker(): {
    missingPackets: Map<number, number>; // sequence -> timestamp
    lastReceivedSequence: number;
  } {
    return {
      missingPackets: new Map<number, number>(), // sequence -> timestamp
      lastReceivedSequence: -1,
    };
  },

  checkMissingSequence(lastSequence: number, newSequence: number): number[] {
    if (lastSequence < 0) {
      return []; // First packet received
    }

    const missingSequences: number[] = [];

    // Handle sequence wrap-around at 65536
    const diff = (newSequence - lastSequence + 65536) % 65536;

    // If difference is too large, don't consider them missing
    // (this might be a long break in transmission or initial connection)
    if (diff > 1 && diff < NACKUtil.MAX_SEQUENCE_DIFF) {
      for (let i = 1; i < diff; i++) {
        missingSequences.push((lastSequence + i) % 65536);
      }
    }

    return missingSequences;
  },

  updateNACKTracker(
    tracker: {
      missingPackets: Map<number, number>;
      lastReceivedSequence: number;
    },
    sequence: number,
  ): void {
    const now = Date.now();

    // Remove this sequence from missing packets if it was marked as missing
    tracker.missingPackets.delete(sequence);

    // Check for missing packets
    if (tracker.lastReceivedSequence >= 0) {
      const missingSequences = NACKUtil.checkMissingSequence(
        tracker.lastReceivedSequence,
        sequence,
      );

      // Add missing packets to tracker
      for (const missingSeq of missingSequences) {
        if (!tracker.missingPackets.has(missingSeq)) {
          tracker.missingPackets.set(missingSeq, now);
        }
      }
    }

    // Update last received sequence
    tracker.lastReceivedSequence = sequence;

    // Cleanup old missing packets
    NACKUtil.cleanupMissingPackets(tracker, now);
  },

  cleanupMissingPackets(
    tracker: {
      missingPackets: Map<number, number>;
      lastReceivedSequence: number;
    },
    now = Date.now(),
  ): void {
    // Remove old missing packets
    for (const [seq, timestamp] of tracker.missingPackets.entries()) {
      if (now - timestamp > NACKUtil.MISSING_TIMEOUT) {
        tracker.missingPackets.delete(seq);
      }
    }

    // If we have too many missing packets, remove oldest ones
    if (tracker.missingPackets.size > NACKUtil.MAX_MISSING_PACKETS) {
      const sortedEntries = [...tracker.missingPackets.entries()].sort(
        (a, b) => a[1] - b[1],
      ); // Sort by timestamp

      const toRemove = sortedEntries.slice(
        0,
        sortedEntries.length - NACKUtil.MAX_MISSING_PACKETS,
      );

      for (const [seq] of toRemove) {
        tracker.missingPackets.delete(seq);
      }
    }
  },

  generateNACKPacket(ssrc: number, missingSequences: number[]): Buffer {
    if (missingSequences.length === 0) {
      return Buffer.alloc(0);
    }

    // Group missing sequences into packets with sequences and bitmasks
    const packets: Array<{ pid: number; blp: number }> = [];

    for (let i = 0; i < missingSequences.length; i++) {
      const seq = missingSequences[i] as number;

      // Check if we can add to an existing packet using bitmap
      let added = false;
      for (const packet of packets) {
        // Can only represent 16 sequences after the PID in the bitmap
        const diff = (seq - packet.pid + 65536) % 65536;

        if (diff > 0 && diff <= 16) {
          // Set bit in the bitmask (bit positions 1-16)
          packet.blp |= 1 << (diff - 1);
          added = true;
          break;
        }
      }

      // If not added to an existing packet, create a new one
      if (!added) {
        packets.push({ pid: seq, blp: 0 });
      }
    }

    // Calculate size: RTCP header (8) + sender/receiver SSRCs (8) + each FCI block (4)
    const packetSize = 16 + packets.length * 4;

    // Create the buffer
    const buffer = Buffer.alloc(packetSize);

    // RTCP header
    buffer[0] = 0x80 | NACKUtil.NACK_FMT; // Version 2, no padding, count=NACK format
    buffer[1] = NACKUtil.RTCP_NACK_PT; // Packet type
    buffer.writeUInt16BE(packets.length + 2, 2); // Length in 32-bit words - 1

    // Sender SSRC (same as receiver for self-generated NACKs)
    buffer.writeUInt32BE(ssrc, 4);

    // Media source SSRC
    buffer.writeUInt32BE(ssrc, 8);

    // Write each FCI (Feedback Control Information) block
    for (let i = 0; i < packets.length; i++) {
      const packet = packets[i];
      const offset = 12 + i * 4;

      if (!packet) {
        continue;
      }

      // PID (Packet ID) - the first sequence number
      buffer.writeUInt16BE(packet.pid, offset);

      // BLP (Bitmask of following Lost Packets)
      buffer.writeUInt16BE(packet.blp, offset + 2);
    }

    return buffer;
  },

  processNACKPacket(buffer: Buffer): { ssrc: number; sequences: number[] } {
    // Ensure minimum valid size
    if (buffer.length < 16) {
      throw new Error("NACK packet too small");
    }

    // Check header
    const pt = buffer[1];
    if (pt !== NACKUtil.RTCP_NACK_PT) {
      throw new Error(`Invalid RTCP packet type: ${pt}`);
    }

    // * Skipping sender SSRC at position 4 since we don't need it
    // const senderSsrc = buffer.readUInt32BE(4);

    // Extract SSRCs
    const mediaSsrc = buffer.readUInt32BE(8);

    // Extract FCI blocks
    const sequences: number[] = [];

    // Calculate number of FCI blocks
    const length = buffer.readUInt16BE(2);
    const fciCount = length - 2;

    for (let i = 0; i < fciCount; i++) {
      const offset = 12 + i * 4;

      // Make sure we have enough data
      if (offset + 4 > buffer.length) {
        break;
      }

      const pid = buffer.readUInt16BE(offset);
      const blp = buffer.readUInt16BE(offset + 2);

      // Add the first missing sequence
      sequences.push(pid);

      // Add sequences from the bitmask
      for (let bit = 0; bit < 16; bit++) {
        if ((blp & (1 << bit)) !== 0) {
          sequences.push((pid + bit + 1) % 65536);
        }
      }
    }

    return { ssrc: mediaSsrc, sequences };
  },
} as const;
