import type { Locale } from "../enums/index.js";

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
 * Application Role Connection Metadata
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/resources/application_role_connection_metadata.md#application-role-connection-metadata-structure}
 */
export interface ApplicationRoleConnectionMetadataEntity {
  /** Type of metadata value */
  type: ApplicationRoleConnectionMetadataType;

  /**
   * Dictionary key for the metadata field (a-z, 0-9, or _, 1-50 characters)
   * @pattern ^[a-z0-9_]{1,50}$
   * @validate Key must be 1-50 characters and contain only a-z, 0-9, or _ characters
   */
  key: string;

  /**
   * Name of the metadata field (1-100 characters)
   * @minLength 1
   * @maxLength 100
   */
  name: string;

  /** Translations of the name in available locales */
  name_localizations?: Record<Locale, string>;

  /**
   * Description of the metadata field (1-200 characters)
   * @minLength 1
   * @maxLength 200
   */
  description: string;

  /** Translations of the description in available locales */
  description_localizations?: Record<Locale, string>;
}
