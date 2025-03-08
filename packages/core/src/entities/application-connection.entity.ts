import type { Locale } from "../enums/index.js";

/**
 * Types of application role connection metadata for verification
 * @see {@link https://discord.com/developers/docs/resources/application-role-connection-metadata#application-role-connection-metadata-object-application-role-connection-metadata-type}
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
 * Represents role connection metadata for an application
 * @see {@link https://discord.com/developers/docs/resources/application-role-connection-metadata#application-role-connection-metadata-object-application-role-connection-metadata-structure}
 */
export interface ApplicationRoleConnectionMetadataEntity {
  /** Type of metadata value */
  type: ApplicationRoleConnectionMetadataType;

  /** Dictionary key for the metadata field (a-z, 0-9, or _, 1-50 characters) */
  key: string;

  /** Name of the metadata field (1-100 characters) */
  name: string;

  /** Translations of the name in available locales */
  name_localizations?: Record<Locale, string>;

  /** Description of the metadata field (1-200 characters) */
  description: string;

  /** Translations of the description in available locales */
  description_localizations?: Record<Locale, string>;
}
