import { z } from "zod";
import { createAvailableLocaleSchema } from "../enums/index.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/application-role-connection-metadata#application-role-connection-metadata-object-application-role-connection-metadata-type}
 */
export const ApplicationRoleConnectionMetadataType = {
  integerLessThanOrEqual: 1,
  integerGreaterThanOrEqual: 2,
  integerEqual: 3,
  integerNotEqual: 4,
  datetimeLessThanOrEqual: 5,
  datetimeGreaterThanOrEqual: 6,
  booleanEqual: 7,
  booleanNotEqual: 8,
} as const;

export type ApplicationRoleConnectionMetadataType =
  (typeof ApplicationRoleConnectionMetadataType)[keyof typeof ApplicationRoleConnectionMetadataType];

/**
 * @see {@link https://discord.com/developers/docs/resources/application-role-connection-metadata#application-role-connection-metadata-object-application-role-connection-metadata-structure}
 */
export const ApplicationRoleConnectionMetadataSchema = z
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

export type ApplicationRoleConnectionMetadataEntity = z.infer<
  typeof ApplicationRoleConnectionMetadataSchema
>;
