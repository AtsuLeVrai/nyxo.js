export const ULEBUtil = {
  encodeULEB128(value: number): Uint8Array {
    if (value < 0) {
      throw new Error("ULEB128 encoding only supports non-negative integers");
    }

    if (value === 0) {
      return new Uint8Array([0]);
    }

    const bytes: number[] = [];
    let remaining = value;

    while (true) {
      const byte = remaining & 0x7f;
      remaining >>>= 7;

      if (remaining === 0) {
        bytes.push(byte);
        break;
      }

      bytes.push(byte | 0x80);
    }

    return new Uint8Array(bytes);
  },

  decodeULEB128(
    bytes: Uint8Array | Buffer,
    startOffset = 0,
  ): { value: number; bytesRead: number } {
    let value = 0;
    let shift = 0;
    let bytesRead = 0;
    let currentByte: number;

    do {
      if (startOffset + bytesRead >= bytes.length) {
        throw new Error("Malformed ULEB128 encoding: unexpected end of input");
      }

      currentByte = bytes[startOffset + bytesRead] as number;
      bytesRead++;

      // Check for overflow
      if (shift > 28 && currentByte > 0xf) {
        throw new Error("ULEB128 value exceeds safe integer range");
      }

      value |= (currentByte & 0x7f) << shift;
      shift += 7;
    } while (currentByte & 0x80);

    return { value, bytesRead };
  },

  encodePair(offset: number, length: number): Uint8Array {
    const offsetBytes = ULEBUtil.encodeULEB128(offset);
    const lengthBytes = ULEBUtil.encodeULEB128(length);

    const result = new Uint8Array(offsetBytes.length + lengthBytes.length);
    result.set(offsetBytes);
    result.set(lengthBytes, offsetBytes.length);

    return result;
  },

  decodePair(
    bytes: Uint8Array | Buffer,
    startOffset = 0,
  ): { offset: number; length: number; bytesRead: number } {
    const offsetResult = ULEBUtil.decodeULEB128(bytes, startOffset);
    const lengthResult = ULEBUtil.decodeULEB128(
      bytes,
      startOffset + offsetResult.bytesRead,
    );

    return {
      offset: offsetResult.value,
      length: lengthResult.value,
      bytesRead: offsetResult.bytesRead + lengthResult.bytesRead,
    };
  },

  encodeMultiplePairs(
    pairs: Array<{ offset: number; length: number }>,
  ): Uint8Array {
    if (pairs.length === 0) {
      return new Uint8Array(0);
    }

    // First encode the count of pairs
    const countBytes = ULEBUtil.encodeULEB128(pairs.length);

    // Then encode each pair
    const pairEncodings = pairs.map((pair) =>
      ULEBUtil.encodePair(pair.offset, pair.length),
    );

    // Calculate total size and allocate result array
    const totalSize =
      countBytes.length +
      pairEncodings.reduce((sum, encoding) => sum + encoding.length, 0);

    const result = new Uint8Array(totalSize);

    // Copy count
    result.set(countBytes);

    // Copy pairs
    let offset = countBytes.length;
    for (const encoding of pairEncodings) {
      result.set(encoding, offset);
      offset += encoding.length;
    }

    return result;
  },

  decodeMultiplePairs(
    bytes: Uint8Array | Buffer,
    startOffset = 0,
  ): { pairs: Array<{ offset: number; length: number }>; bytesRead: number } {
    // First decode the count
    const countResult = ULEBUtil.decodeULEB128(bytes, startOffset);
    const count = countResult.value;
    let currentOffset = startOffset + countResult.bytesRead;

    // Then decode each pair
    const pairs: Array<{ offset: number; length: number }> = [];
    for (let i = 0; i < count; i++) {
      const pairResult = ULEBUtil.decodePair(bytes, currentOffset);
      pairs.push({
        offset: pairResult.offset,
        length: pairResult.length,
      });
      currentOffset += pairResult.bytesRead;
    }

    return {
      pairs,
      bytesRead: currentOffset - startOffset,
    };
  },

  getSizeHint(value: number): number {
    if (value < 0) {
      throw new Error("ULEB128 encoding only supports non-negative integers");
    }

    if (value === 0) {
      return 1;
    }

    // Count how many 7-bit groups are needed
    let size = 0;
    let remaining = value;

    while (remaining > 0) {
      size++;
      remaining >>>= 7;
    }

    return size;
  },
} as const;
