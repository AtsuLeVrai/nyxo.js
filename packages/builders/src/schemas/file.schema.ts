import { ComponentType, type FileEntity } from "@nyxojs/core";
import { z } from "zod/v4";
import { UnfurledMediaItemSchema } from "./thumbnail.schema.js";

/**
 * Zod validator for a file component.
 * Validates the file structure according to Discord's requirements.
 */
export const FileSchema = z
  .object({
    /**
     * Type of component - always 13 for a file.
     */
    type: z.literal(ComponentType.File),

    /**
     * Optional identifier for component.
     * 32-bit integer used as an optional identifier.
     */
    id: z.number().int().optional(),

    /**
     * The file to display.
     * Must be an attachment reference using the attachment:// syntax.
     */
    file: UnfurledMediaItemSchema,

    /**
     * Whether the file should be a spoiler.
     * If true, the file will be blurred out initially.
     */
    spoiler: z.boolean().default(false),
  })
  .refine(
    (data) => {
      // Ensure the URL starts with attachment://
      return data.file.url.startsWith("attachment://");
    },
    {
      message: "File URL must use the attachment:// syntax",
      path: ["file", "url"],
    },
  )
  .refine(
    (data) => {
      // Ensure the URL is not just the prefix
      return data.file.url.length > "attachment://".length;
    },
    {
      message: "File URL must include a filename after attachment://",
      path: ["file", "url"],
    },
  ) satisfies z.ZodType<FileEntity, FileEntity>;
