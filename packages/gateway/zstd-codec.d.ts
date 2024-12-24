declare module "zstd-codec" {
  export namespace ZstdCodec {
    // Constants
    const DEFAULT_COMPRESSION_LEVEL: number;
    const STREAMING_DEFAULT_BUFFER_SIZE: number;

    // Core binding types
    interface Binding {
      ZstdCodec: new () => ZstdCodecBinding;
      VectorU8: new () => VectorU8;
      ZstdCompressStreamBinding: new () => ZstdCompressStream;
      ZstdDecompressStreamBinding: new () => ZstdDecompressStream;
      createCompressionDict: (
        dictBytes: Uint8Array,
        compressionLevel?: number,
      ) => CompressionDict;
      createDecompressionDict: (dictBytes: Uint8Array) => DecompressionDict;
      cloneToVector: (dest: VectorU8, src: Uint8Array) => void;
      cloneAsTypedArray: (src: VectorU8) => Uint8Array;
    }

    interface ZstdCodecBinding {
      compressBound(size: number): number;
      contentSize(vector: VectorU8): number;
      compress(dest: VectorU8, src: VectorU8, level: number): number;
      decompress(dest: VectorU8, src: VectorU8): number;
      compressUsingDict(
        dest: VectorU8,
        src: VectorU8,
        dict: CompressionDict,
      ): number;
      decompressUsingDict(
        dest: VectorU8,
        src: VectorU8,
        dict: DecompressionDict,
      ): number;
    }

    interface VectorU8 {
      resize(size: number, value: number): void;
      delete(): void;
    }

    interface BaseStream {
      transform(
        data: Uint8Array,
        callback: (processed: Uint8Array) => void,
      ): boolean;
      flush(callback: (processed: Uint8Array) => void): boolean;
      end(callback: (processed: Uint8Array) => void): boolean;
      delete(): void;
    }

    interface ZstdCompressStream extends BaseStream {
      begin(level: number): boolean;
      beginUsingDict(dict: CompressionDict): boolean;
    }

    interface ZstdDecompressStream extends BaseStream {
      begin(): boolean;
      beginUsingDict(dict: DecompressionDict): boolean;
    }

    interface CompressionDict {
      delete(): void;
    }

    interface DecompressionDict {
      delete(): void;
    }

    // Main API classes
    class Generic {
      compressBound(contentBytes: Uint8Array): number | null;
      contentSize(compressedBytes: Uint8Array): number | null;
    }

    class Simple {
      compress(
        contentBytes: Uint8Array,
        compressionLevel?: number,
      ): Uint8Array | null;
      decompress(compressedBytes: Uint8Array): Uint8Array | null;
      compressUsingDict(
        contentBytes: Uint8Array,
        cdict: Dict.Compression,
      ): Uint8Array | null;
      decompressUsingDict(
        compressedBytes: Uint8Array,
        ddict: Dict.Decompression,
      ): Uint8Array | null;
    }

    class Streaming {
      compress(
        contentBytes: Uint8Array,
        compressionLevel?: number,
      ): Uint8Array | null;
      compressChunks(
        chunks: Iterable<Uint8Array>,
        sizeHint?: number,
        compressionLevel?: number,
      ): Uint8Array | null;
      compressUsingDict(
        contentBytes: Uint8Array,
        cdict: Dict.Compression,
      ): Uint8Array | null;
      compressChunksUsingDict(
        chunks: Iterable<Uint8Array>,
        sizeHint: number | undefined | null,
        cdict: Dict.Compression,
      ): Uint8Array | null;

      decompress(
        compressedBytes: Uint8Array,
        sizeHint?: number,
      ): Uint8Array | null;
      decompressChunks(
        chunks: Iterable<Uint8Array>,
        sizeHint?: number,
      ): Uint8Array | null;
      decompressUsingDict(
        compressedBytes: Uint8Array,
        sizeHint: number | undefined | null,
        ddict: Dict.Decompression,
      ): Uint8Array | null;
      decompressChunksUsingDict(
        chunks: Iterable<Uint8Array>,
        sizeHint: number | undefined | null,
        ddict: Dict.Decompression,
      ): Uint8Array | null;
    }

    // Dictionary classes
    namespace Dict {
      class Compression {
        constructor(dictBytes: Uint8Array, compressionLevel?: number);
        get(): CompressionDict;
        close(): void;
        delete(): void;
      }

      class Decompression {
        constructor(dictBytes: Uint8Array);
        get(): DecompressionDict;
        close(): void;
        delete(): void;
      }
    }

    // Helper types and functions
    class ArrayBufferHelper {
      static transfer(oldBuffer: ArrayBuffer, newCapacity: number): ArrayBuffer;
    }

    function run<T>(
      callback: (api: {
        Generic: typeof Generic;
        Simple: typeof Simple;
        Streaming: typeof Streaming;
        Dict: {
          Compression: typeof Dict.Compression;
          Decompression: typeof Dict.Decompression;
        };
      }) => T,
    ): T;
  }
}
