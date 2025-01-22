import { z } from "zod";
import { createAvailableLocale } from "../enums/index.js";

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

export const APPLICATION_ROLE_CONNECTION_METADATA_KEY_REGEX = /^[a-z0-9_]+$/;

/**
 * @see {@link https://discord.com/developers/docs/resources/application-role-connection-metadata#application-role-connection-metadata-object-application-role-connection-metadata-structure}
 */
export const ApplicationRoleConnectionMetadataEntity = z.object({
  type: z.nativeEnum(ApplicationRoleConnectionMetadataType),
  key: z
    .string()
    .min(1)
    .max(50)
    .regex(APPLICATION_ROLE_CONNECTION_METADATA_KEY_REGEX),
  name: z.string().min(1).max(100),
  name_localizations: createAvailableLocale(
    z.string().min(1).max(100),
  ).optional(),
  description: z.string().min(1).max(200),
  description_localizations: createAvailableLocale(
    z.string().min(1).max(200),
  ).optional(),
});

export type ApplicationRoleConnectionMetadataEntity = z.infer<
  typeof ApplicationRoleConnectionMetadataEntity
>;
