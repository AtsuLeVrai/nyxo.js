import {
  type ApplicationRoleConnectionMetadataEntity,
  ApplicationRoleConnectionMetadataType,
} from "@nyxjs/core";
import { z } from "zod";
import { createAvailableLocaleSchema } from "./application-commands.schema.js";

export const ApplicationRoleConnectionMetadataSchema: z.ZodType<ApplicationRoleConnectionMetadataEntity> =
  z
    .object({
      type: z.nativeEnum(ApplicationRoleConnectionMetadataType),
      key: z
        .string()
        .min(1)
        .max(50)
        .regex(/^[a-z0-9_]+$/),
      name: z.string().min(1).max(100),
      name_localizations: createAvailableLocaleSchema(
        z.string().min(1).max(100),
      ).optional(),
      description: z.string().min(1).max(200),
      description_localizations: createAvailableLocaleSchema(
        z.string().min(1).max(200),
      ).optional(),
    })
    .strict();
