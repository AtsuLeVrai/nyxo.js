import { z } from "zod";
import { CompressionType } from "../types/index.js";

export const CompressionOptions = z
  .object({
    type: z.nativeEnum(CompressionType).optional(),
    zlibChunkSize: z
      .number()
      .int()
      .positive()
      .optional()
      .default(128 * 1024),
    zlibWindowBits: z.number().int().optional().default(15),
    zlibFlushBytes: z
      .instanceof(Buffer)
      .optional()
      .default(Buffer.from([0x00, 0x00, 0xff, 0xff])),
    maxChunksInMemory: z.number().int().positive().optional().default(1000),
    autoCleanChunks: z.boolean().optional().default(true),
    maxChunkSize: z
      .number()
      .int()
      .positive()
      .optional()
      .default(1024 * 1024),
    validateBuffers: z.boolean().optional().default(true),
  })
  .strict();
