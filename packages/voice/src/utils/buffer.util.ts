export const BufferUtil = {
  concatUint8Arrays(arrays: Uint8Array[]): Uint8Array {
    const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
    const result = new Uint8Array(totalLength);

    let offset = 0;
    for (const arr of arrays) {
      result.set(arr, offset);
      offset += arr.length;
    }

    return result;
  },

  uint8ArrayToBuffer(arr: Uint8Array): Buffer {
    return Buffer.from(arr.buffer, arr.byteOffset, arr.length);
  },

  bufferToUint8Array(buffer: Buffer): Uint8Array {
    return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.length);
  },

  numberArrayToUint8Array(arr: number[]): Uint8Array {
    return new Uint8Array(arr);
  },

  uint8ArrayToNumberArray(arr: Uint8Array): number[] {
    return Array.from(arr);
  },

  splitBuffer(buffer: Buffer, chunkSize: number): Buffer[] {
    const chunks: Buffer[] = [];

    for (let i = 0; i < buffer.length; i += chunkSize) {
      chunks.push(buffer.subarray(i, i + chunkSize));
    }

    return chunks;
  },

  readBigInt64BE(buffer: Buffer, offset = 0): bigint {
    const high = buffer.readUInt32BE(offset);
    const low = buffer.readUInt32BE(offset + 4);
    return (BigInt(high) << 32n) | BigInt(low);
  },

  writeBigInt64BE(buffer: Buffer, value: bigint, offset = 0): void {
    const high = Number((value >> 32n) & 0xffffffffn);
    const low = Number(value & 0xffffffffn);

    buffer.writeUInt32BE(high, offset);
    buffer.writeUInt32BE(low, offset + 4);
  },

  compareBuffers(a: Buffer, b: Buffer): boolean {
    if (a.length !== b.length) {
      return false;
    }

    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }

    return true;
  },

  bitShiftLeft(buffer: Buffer, bits: number): Buffer {
    const result = Buffer.alloc(buffer.length);

    let carryOver = 0;
    for (let i = buffer.length - 1; i >= 0; i--) {
      const val = ((buffer[i] as number) << bits) | carryOver;
      result[i] = val & 0xff;
      carryOver = (val >> 8) & 0xff;
    }

    return result;
  },

  bitShiftRight(buffer: Buffer, bits: number): Buffer {
    const result = Buffer.alloc(buffer.length);

    let carryOver = 0;
    for (let i = 0; i < buffer.length; i++) {
      const val = (carryOver << 8) | (buffer[i] as number);
      result[i] = (val >> bits) & 0xff;
      carryOver = val & ((1 << bits) - 1);
    }

    return result;
  },

  xor(a: Buffer, b: Buffer): Buffer {
    if (a.length !== b.length) {
      throw new Error("Buffers must have the same length for XOR operation");
    }

    const result = Buffer.alloc(a.length);

    for (let i = 0; i < a.length; i++) {
      result[i] = (a[i] as number) ^ (b[i] as number);
    }

    return result;
  },

  readUInt24BE(buffer: Buffer, offset = 0): number {
    return buffer.readUIntBE(offset, 3);
  },

  writeUInt24BE(buffer: Buffer, value: number, offset = 0): void {
    buffer.writeUIntBE(value, offset, 3);
  },

  createBufferFromBigInt(value: bigint, size = 8): Buffer {
    let remaining: bigint = value;
    const buffer = Buffer.alloc(size);

    for (let i = size - 1; i >= 0; i--) {
      buffer[i] = Number(remaining & 0xffn);
      remaining >>= 8n;
    }

    return buffer;
  },
} as const;
