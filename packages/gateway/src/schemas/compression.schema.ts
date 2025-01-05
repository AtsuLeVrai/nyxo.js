import { z } from "zod";

export const CompressionTypeSchema = z.union([
  z.literal("zlib-stream"),
  z.literal("zstd-stream"),
]);

export type CompressionType = z.infer<typeof CompressionTypeSchema>;

export const CompressionOptionsSchema = z
  .object({
    compressionType: CompressionTypeSchema.optional(),
    zlibChunkSize: z
      .number()
      .int()
      .positive()
      .optional()
      .default(128 * 1024),
    zlibWindowBits: z.number().int().optional().default(15),
    zlibMemLevel: z.number().int().min(1).max(9).optional(),
    zlibStrategy: z.number().int().min(0).max(4).optional(),
    zlibDictionary: z.instanceof(Buffer).nullable().optional(),
    zlibFlushBytes: z
      .instanceof(Buffer)
      .optional()
      .default(Buffer.from([0x00, 0x00, 0xff, 0xff])),
    zstdBufferSize: z.number().int().positive().optional(),
    zstdDictionary: z.instanceof(Buffer).nullable().optional(),
    maxChunksInMemory: z.number().int().positive().optional().default(1000),
    autoCleanChunks: z.boolean().optional().default(true),
    maxChunkSize: z
      .number()
      .int()
      .positive()
      .optional()
      .default(1024 * 1024),
    validateBuffers: z.boolean().optional().default(true),
    maxTotalMemory: z
      .number()
      .int()
      .positive()
      .optional()
      .default(100 * 1024 * 1024),
    useDirectBuffers: z.boolean().optional().default(false),
    parallelDecompression: z.boolean().optional().default(false),
  })
  .strict();

export type CompressionOptions = z.infer<typeof CompressionOptionsSchema>;
