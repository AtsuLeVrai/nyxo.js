import type { AvailableLocale } from "../enums/index.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/application-role-connection-metadata#application-role-connection-metadata-object-application-role-connection-metadata-type}
 */
export enum ApplicationRoleConnectionMetadataType {
  IntegerLessThanOrEqual = 1,
  IntegerGreaterThanOrEqual = 2,
  IntegerEqual = 3,
  IntegerNotEqual = 4,
  DatetimeLessThanOrEqual = 5,
  DatetimeGreaterThanOrEqual = 6,
  BooleanEqual = 7,
  BooleanNotEqual = 8,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/application-role-connection-metadata#application-role-connection-metadata-object-application-role-connection-metadata-structure}
 */
export interface ApplicationRoleConnectionMetadataEntity {
  type: ApplicationRoleConnectionMetadataType;
  key: string;
  name: string;
  name_localizations?: AvailableLocale;
  description: string;
  description_localizations?: AvailableLocale;
}
