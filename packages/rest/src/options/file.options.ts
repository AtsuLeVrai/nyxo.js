import { z } from "zod";

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024;
const DEFAULT_MAX_ATTACHMENTS = 10;

export const FileOptions = z.object({
  maxTotalSize: z.number().int().default(DEFAULT_MAX_SIZE),
  maxAttachments: z.number().int().default(DEFAULT_MAX_ATTACHMENTS),
  defaultImageOptions: z
    .object({
      format: z
        .union([
          z.literal("jpeg"),
          z.literal("png"),
          z.literal("webp"),
          z.literal("gif"),
        ])
        .optional(),
      size: z.number().int().optional(),
      asDataUri: z.boolean().optional(),
    })
    .optional(),
  validationOptions: z
    .object({
      maxSizeBytes: z.number().int().optional(),
      allowedTypes: z.array(z.string()).optional(),
      allowedExtensions: z.array(z.string()).optional(),
      validateImage: z.boolean().optional(),
      maxWidth: z.number().int().optional(),
      maxHeight: z.number().int().optional(),
      minWidth: z.number().int().optional(),
      minHeight: z.number().int().optional(),
      embedImage: z.boolean().optional(),
    })
    .optional(),
});
