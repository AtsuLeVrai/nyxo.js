import { ApplicationRoleConnectionMetadataType, Locale } from "@nyxjs/core";
import { z } from "zod";

export const ApplicationRoleConnectionMetadataSchema = z.object({
  type: z.nativeEnum(ApplicationRoleConnectionMetadataType),
  key: z.string().regex(/^[a-z0-9_]{1,50}$/, {
    message:
      "La clé doit contenir uniquement des caractères a-z, 0-9 ou _ et avoir entre 1 et 50 caractères",
  }),
  name: z.string().min(1).max(100),
  name_localizations: z.record(z.nativeEnum(Locale), z.string()).optional(),
  description: z.string().min(1).max(200),
  description_localizations: z
    .record(z.nativeEnum(Locale), z.string())
    .optional(),
});

export type ApplicationRoleConnectionMetadataSchema = z.input<
  typeof ApplicationRoleConnectionMetadataSchema
>;
