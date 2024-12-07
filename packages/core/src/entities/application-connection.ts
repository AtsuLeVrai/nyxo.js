import type { AvailableLocale } from "../enums/index.js";

/**
 * Types of metadata that can be used for application role connections.
 * These types define how the metadata value will be compared with the guild's configured value.
 *
 * @remarks
 * Each type provides a specific comparison operation for role requirements:
 * - Integer types compare numeric values
 * - Datetime types compare ISO8601 strings against days before current date
 * - Boolean types compare against 1 (true) or 0 (false)
 *
 * @see {@link https://discord.com/developers/docs/resources/application-role-connection-metadata#application-role-connection-metadata-object-application-role-connection-metadata-type}
 */
export enum ApplicationRoleConnectionMetadataType {
  /** Metadata value (integer) must be less than or equal to the guild's configured value */
  IntegerLessThanOrEqual = 1,
  /** Metadata value (integer) must be greater than or equal to the guild's configured value */
  IntegerGreaterThanOrEqual = 2,
  /** Metadata value (integer) must be equal to the guild's configured value */
  IntegerEqual = 3,
  /** Metadata value (integer) must not be equal to the guild's configured value */
  IntegerNotEqual = 4,
  /** Metadata value (ISO8601 string) must be less than or equal to guild's configured days before current date */
  DatetimeLessThanOrEqual = 5,
  /** Metadata value (ISO8601 string) must be greater than or equal to guild's configured days before current date */
  DatetimeGreaterThanOrEqual = 6,
  /** Metadata value (integer: 0 or 1) must be equal to the guild's configured value */
  BooleanEqual = 7,
  /** Metadata value (integer: 0 or 1) must not be equal to the guild's configured value */
  BooleanNotEqual = 8,
}

/**
 * Represents metadata configuration for an application's role connection.
 *
 * @remarks
 * When a guild has configured role connection verification:
 * 1. Application's metadata appears in role verification configuration
 * 2. Users connect accounts via role_connections_verification_url
 * 3. Bot updates user's role connection with metadata using OAuth2 role_connections.write scope
 *
 * @example
 * ```typescript
 * const metadata: ApplicationRoleConnectionMetadataEntity = {
 *   type: ApplicationRoleConnectionMetadataType.IntegerGreaterThanOrEqual,
 *   key: "player_level",
 *   name: "Player Level",
 *   description: "Minimum player level required",
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/application-role-connection-metadata#application-role-connection-metadata-object-application-role-connection-metadata-structure}
 */
export interface ApplicationRoleConnectionMetadataEntity {
  /** Type of metadata value and how it should be compared */
  type: ApplicationRoleConnectionMetadataType;
  /** Dictionary key for the metadata field (must be a-z, 0-9, or _ characters) */
  key: string;
  /** Name of the metadata field (1-100 characters) */
  name: string;
  /** Localization dictionary for the name field */
  name_localizations?: AvailableLocale;
  /** Description of the metadata field (1-200 characters) */
  description: string;
  /** Localization dictionary for the description field */
  description_localizations?: AvailableLocale;
}
