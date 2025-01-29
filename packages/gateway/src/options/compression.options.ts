import { z } from "zod";

const COMPRESSION_ZLIB_CHUNK_SIZE = 128 * 1024;
const COMPRESSION_ZLIB_WINDOW_BITS = 15;

export const CompressionType = z.enum(["zlib-stream", "zstd-stream"]);
export type CompressionType = z.infer<typeof CompressionType>;

export const CompressionOptions = z
  .object({
    compressionType: CompressionType.optional(),
    zlibChunkSize: z.number().positive().default(COMPRESSION_ZLIB_CHUNK_SIZE),
    zlibWindowBits: z.number().positive().default(COMPRESSION_ZLIB_WINDOW_BITS),
  })
  .strict();

export type CompressionOptions = z.infer<typeof CompressionOptions>;
