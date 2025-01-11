import { z } from "zod";

const DEFAULT_MAX_TOTAL_SIZE = 10 * 1024 * 1024;
const MAX_ATTACHMENTS_PER_MESSAGE = 10;

export const FileProcessorOptions = z
  .object({
    allowedMimeTypes: z.array(z.string()).optional(),
    preserveFilenames: z.boolean().optional().default(true),
    sanitizeFilenames: z.boolean().optional().default(true),
    maxTotalSize: z.number().optional().default(DEFAULT_MAX_TOTAL_SIZE),
    maxAttachments: z
      .number()
      .max(MAX_ATTACHMENTS_PER_MESSAGE)
      .optional()
      .default(MAX_ATTACHMENTS_PER_MESSAGE),
    slugifyOptions: z
      .object({
        separator: z.string().optional().default("-"),
        lowercase: z.boolean().optional().default(true),
        strict: z.boolean().optional().default(true),
      })
      .optional(),
  })
  .strict();
