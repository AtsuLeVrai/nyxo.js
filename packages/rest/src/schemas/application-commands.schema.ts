import {
  APPLICATION_COMMAND_NAME_REGEX,
  AnyApplicationCommandOptionEntity,
  ApplicationCommandPermissionEntity,
  ApplicationCommandType,
  ApplicationIntegrationType,
  InteractionContextType,
  Locale,
} from "@nyxjs/core";
import { z } from "zod";

export const EditApplicationCommandPermissionsSchema = z.object({
  permissions: ApplicationCommandPermissionEntity.array().max(100),
});

export type EditApplicationCommandPermissionsSchema = z.input<
  typeof EditApplicationCommandPermissionsSchema
>;

export const CreateGlobalApplicationCommandSchema = z.object({
  name: z.string().min(1).max(32).regex(APPLICATION_COMMAND_NAME_REGEX),
  name_localizations: z
    .record(
      z.nativeEnum(Locale),
      z.string().min(1).max(32).regex(APPLICATION_COMMAND_NAME_REGEX),
    )
    .nullish(),
  description: z.string().min(1).max(100).optional(),
  description_localizations: z
    .record(z.nativeEnum(Locale), z.string().min(1).max(100))
    .nullish(),
  options: AnyApplicationCommandOptionEntity.array().max(25).optional(),
  default_member_permissions: z.string().nullish(),
  /** @deprecated User `contexts instead` */
  dm_permission: z.boolean().nullish(),
  default_permission: z.boolean().default(true),
  integration_types: z
    .array(z.nativeEnum(ApplicationIntegrationType))
    .optional(),
  contexts: z.nativeEnum(InteractionContextType).array().optional(),
  type: z
    .nativeEnum(ApplicationCommandType)
    .optional()
    .default(ApplicationCommandType.ChatInput),
  nsfw: z.boolean().optional(),
});

export type CreateGlobalApplicationCommandSchema = z.input<
  typeof CreateGlobalApplicationCommandSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-global-application-command-json-params}
 */
export const EditGlobalApplicationCommandSchema =
  CreateGlobalApplicationCommandSchema.omit({
    type: true,
  }).partial();

export type EditGlobalApplicationCommandSchema = z.input<
  typeof EditGlobalApplicationCommandSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#create-guild-application-command-json-params}
 */
export const CreateGuildApplicationCommandSchema =
  CreateGlobalApplicationCommandSchema.omit({
    integration_types: true,
    contexts: true,
  });

export type CreateGuildApplicationCommandSchema = z.input<
  typeof CreateGuildApplicationCommandSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-guild-application-command-json-params}
 */
export const EditGuildApplicationCommandSchema =
  CreateGuildApplicationCommandSchema.omit({
    type: true,
  }).partial();

export type EditGuildApplicationCommandSchema = z.input<
  typeof EditGuildApplicationCommandSchema
>;
