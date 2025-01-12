import { z } from "zod";

const DEFAULT_MAX_TOTAL_SIZE = 10 * 1024 * 1024;
const MAX_ATTACHMENTS_PER_MESSAGE = 10;

export const FileProcessorOptions = z.object({
  allowedMimeTypes: z.array(z.string()).optional(),
  preserveFilenames: z.boolean().default(true),
  sanitizeFilenames: z.boolean().default(true),
  maxTotalSize: z.number().default(DEFAULT_MAX_TOTAL_SIZE),
  maxAttachments: z
    .number()
    .max(MAX_ATTACHMENTS_PER_MESSAGE)
    .default(MAX_ATTACHMENTS_PER_MESSAGE),
  slugifyOptions: z
    .object({
      separator: z.string().default("-"),
      lowercase: z.boolean().default(true),
      strict: z.boolean().default(true),
    })
    .optional(),
});
