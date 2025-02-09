import { z } from "zod";

const COMPRESSION_CONSTANTS = {
  ZLIB_CHUNK_SIZE: 128 * 1024,
  ZLIB_WINDOW_BITS: 15,
} as const;

export const CompressionType = z.enum(["zlib-stream", "zstd-stream"]);
export type CompressionType = z.infer<typeof CompressionType>;

export const ZlibCompressionOptions = z
  .object({
    compressionType: z.literal("zlib-stream"),
    zlibChunkSize: z
      .number()
      .positive()
      .default(COMPRESSION_CONSTANTS.ZLIB_CHUNK_SIZE),
    zlibWindowBits: z
      .number()
      .positive()
      .default(COMPRESSION_CONSTANTS.ZLIB_WINDOW_BITS),
  })
  .strict();

export type ZlibCompressionOptions = z.infer<typeof ZlibCompressionOptions>;

export const ZstdCompressionOptions = z
  .object({
    compressionType: z.literal("zstd-stream"),
  })
  .strict();

export type ZstdCompressionOptions = z.infer<typeof ZstdCompressionOptions>;

export const CompressionOptions = z
  .discriminatedUnion("compressionType", [
    ZlibCompressionOptions,
    ZstdCompressionOptions,
  ])
  .readonly();

export type CompressionOptions = z.infer<typeof CompressionOptions>;
