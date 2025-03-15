import { z } from "zod";
import { Locale } from "../enums/index.js";

/**
 * Types of application role connection metadata for verification
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/application_role_connection_metadata.md#application-role-connection-metadata-type}
 */
export enum ApplicationRoleConnectionMetadataType {
  /** Metadata value (integer) is less than or equal to the guild's configured value */
  IntegerLessThanOrEqual = 1,

  /** Metadata value (integer) is greater than or equal to the guild's configured value */
  IntegerGreaterThanOrEqual = 2,

  /** Metadata value (integer) is equal to the guild's configured value */
  IntegerEqual = 3,

  /** Metadata value (integer) is not equal to the guild's configured value */
  IntegerNotEqual = 4,

  /** Metadata value (ISO8601 string) is less than or equal to the guild's configured value (days before current date) */
  DatetimeLessThanOrEqual = 5,

  /** Metadata value (ISO8601 string) is greater than or equal to the guild's configured value (days before current date) */
  DatetimeGreaterThanOrEqual = 6,

  /** Metadata value (integer) is equal to the guild's configured boolean value (1) */
  BooleanEqual = 7,

  /** Metadata value (integer) is not equal to the guild's configured boolean value (1) */
  BooleanNotEqual = 8,
}

/**
 * Zod schema for ApplicationRoleConnectionMetadata
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/application_role_connection_metadata.md#application-role-connection-metadata-structure}
 */
export const ApplicationRoleConnectionMetadataSchema = z.object({
  /** Type of metadata value */
  type: z.nativeEnum(ApplicationRoleConnectionMetadataType),

  /** Dictionary key for the metadata field (a-z, 0-9, or _, 1-50 characters) */
  key: z.string().regex(/^[a-z0-9_]{1,50}$/, {
    message:
      "Key must be 1-50 characters and contain only a-z, 0-9, or _ characters",
  }),

  /** Name of the metadata field (1-100 characters) */
  name: z.string().min(1).max(100),

  /** Translations of the name in available locales */
  name_localizations: z.record(z.nativeEnum(Locale), z.string()).optional(),

  /** Description of the metadata field (1-200 characters) */
  description: z.string().min(1).max(200),

  /** Translations of the description in available locales */
  description_localizations: z
    .record(z.nativeEnum(Locale), z.string())
    .optional(),
});

export type ApplicationRoleConnectionMetadataEntity = z.infer<
  typeof ApplicationRoleConnectionMetadataSchema
>;
