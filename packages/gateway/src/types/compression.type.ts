export interface ChunkStorageController {
  add(chunk: Uint8Array): void;
  get(index: number): Uint8Array | undefined;
  getLast(count: number): Uint8Array[];
  clear(): { count: number; memoryUsage: number };
  getCurrentSize(): number;
}

export enum CompressionType {
  ZlibStream = "zlib-stream",
  ZstdStream = "zstd-stream",
}
