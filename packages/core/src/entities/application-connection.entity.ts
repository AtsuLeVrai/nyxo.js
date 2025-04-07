import type { Locale } from "../enums/index.js";

/**
 * Types of application role connection metadata for verification.
 * Each metadata type offers a comparison operation that allows guilds to configure
 * role requirements based on metadata values stored by the application.
 * Applications specify a metadata value for each user, and guilds specify the required
 * value within the guild role settings.
 * @see {@link https://discord.com/developers/docs/resources/application-role-connection-metadata#application-role-connection-metadata-object-application-role-connection-metadata-type}
 */
export enum ApplicationRoleConnectionMetadataType {
  /**
   * Metadata value (integer) is less than or equal to the guild's configured value.
   * Used for comparing numeric values where the requirement is to be at or below a threshold.
   * @value 1
   * @example User level (5) <= Required level (10)
   */
  IntegerLessThanOrEqual = 1,

  /**
   * Metadata value (integer) is greater than or equal to the guild's configured value.
   * Used for comparing numeric values where the requirement is to be at or above a threshold.
   * @value 2
   * @example User level (15) >= Required level (10)
   */
  IntegerGreaterThanOrEqual = 2,

  /**
   * Metadata value (integer) is equal to the guild's configured value.
   * Used for exact numeric matching requirements.
   * @value 3
   * @example User rank (3) == Required rank (3)
   */
  IntegerEqual = 3,

  /**
   * Metadata value (integer) is not equal to the guild's configured value.
   * Used for exclusionary numeric matching requirements.
   * @value 4
   * @example User rank (3) != Excluded rank (4)
   */
  IntegerNotEqual = 4,

  /**
   * Metadata value (ISO8601 string) is less than or equal to the guild's configured value (days before current date).
   * Used for comparing dates where the requirement is to be before or at a specific timeframe.
   * @value 5
   * @example User join date (2022-01-01) <= 30 days before current date
   */
  DatetimeLessThanOrEqual = 5,

  /**
   * Metadata value (ISO8601 string) is greater than or equal to the guild's configured value (days before current date).
   * Used for comparing dates where the requirement is to be after or at a specific timeframe.
   * @value 6
   * @example User join date (2022-01-01) >= 90 days before current date
   */
  DatetimeGreaterThanOrEqual = 6,

  /**
   * Metadata value (integer) is equal to the guild's configured boolean value (1).
   * Used for checking if a flag or boolean condition is true.
   * @value 7
   * @example User subscription status (1) == Required status (1) [true]
   */
  BooleanEqual = 7,

  /**
   * Metadata value (integer) is not equal to the guild's configured boolean value (1).
   * Used for checking if a flag or boolean condition is false.
   * @value 8
   * @example User subscription status (0) != Required status (1) [false]
   */
  BooleanNotEqual = 8,
}

/**
 * Application Role Connection Metadata.
 *
 * This represents data that applications can use for role verification within guilds.
 * When a guild has added a bot and configured its role_connections_verification_url,
 * the application will render as a verification method in the guild's role verification configuration.
 *
 * Applications can define up to 5 metadata records that describe the data they provide for role membership validation.
 *
 * @see {@link https://discord.com/developers/docs/resources/application-role-connection-metadata#application-role-connection-metadata-object}
 */
export interface ApplicationRoleConnectionMetadataEntity {
  /**
   * Type of metadata value.
   * Defines the comparison operation that will be used to check if a user meets the role requirement.
   */
  type: ApplicationRoleConnectionMetadataType;

  /**
   * Dictionary key for the metadata field.
   * Must be lowercase a-z, 0-9, or underscore, between 1-50 characters.
   * This is used as a unique identifier for the metadata field.
   * @pattern ^[a-z0-9_]{1,50}$
   * @minLength 1
   * @maxLength 50
   */
  key: string;

  /**
   * Name of the metadata field.
   * This is displayed in the Discord client UI when configuring role requirements.
   * @minLength 1
   * @maxLength 100
   */
  name: string;

  /**
   * Translations of the name in available locales.
   * Allows for localization of the metadata field name in different languages.
   * Keys must be valid locale identifiers.
   */
  name_localizations?: Record<Locale, string>;

  /**
   * Description of the metadata field.
   * Explains what this metadata represents and how it's used for verification.
   * @minLength 1
   * @maxLength 200
   */
  description: string;

  /**
   * Translations of the description in available locales.
   * Allows for localization of the metadata field description in different languages.
   * Keys must be valid locale identifiers.
   */
  description_localizations?: Record<Locale, string>;
}
