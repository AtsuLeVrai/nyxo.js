import {
  APPLICATION_COMMAND_NAME_REGEX,
  ApplicationCommandOptionEntity,
  ApplicationCommandPermissionEntity,
  ApplicationCommandType,
  ApplicationIntegrationType,
  InteractionContextType,
  createAvailableLocale,
} from "@nyxjs/core";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-application-command-permissions-json-params}
 */
export const EditApplicationCommandPermissionsEntity = z.object({
  permissions: z.array(ApplicationCommandPermissionEntity).max(100),
});

export type EditApplicationCommandPermissionsEntity = z.infer<
  typeof EditApplicationCommandPermissionsEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#create-global-application-command-json-params}
 */
export const CreateGlobalApplicationCommandEntity = z.object({
  name: z.string().min(1).max(32).regex(APPLICATION_COMMAND_NAME_REGEX),
  name_localizations: createAvailableLocale(
    z.string().min(1).max(32).regex(APPLICATION_COMMAND_NAME_REGEX),
  ).nullish(),
  description: z.string().min(1).max(100).optional(),
  description_localizations: createAvailableLocale(
    z.string().min(1).max(100),
  ).nullish(),
  options: z.array(ApplicationCommandOptionEntity).max(25).optional(),
  default_member_permissions: z.string().nullish(),
  /**
   * @deprecated User `contexts instead`
   */
  dm_permission: z.boolean().nullish(),
  default_permission: z.boolean().optional().default(true),
  integration_types: z
    .array(z.nativeEnum(ApplicationIntegrationType))
    .optional(),
  contexts: z.array(z.nativeEnum(InteractionContextType)).optional(),
  type: z
    .nativeEnum(ApplicationCommandType)
    .optional()
    .default(ApplicationCommandType.ChatInput),
  nsfw: z.boolean().optional(),
});

export type CreateGlobalApplicationCommandEntity = z.infer<
  typeof CreateGlobalApplicationCommandEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-global-application-command-json-params}
 */
export const EditGlobalApplicationCommandEntity =
  CreateGlobalApplicationCommandEntity.omit({
    type: true,
  }).partial();

export type EditGlobalApplicationCommandEntity = z.infer<
  typeof EditGlobalApplicationCommandEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#create-guild-application-command-json-params}
 */
export const CreateGuildApplicationCommandEntity =
  CreateGlobalApplicationCommandEntity.omit({
    integration_types: true,
    contexts: true,
  });

export type CreateGuildApplicationCommandEntity = z.infer<
  typeof CreateGuildApplicationCommandEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-guild-application-command-json-params}
 */
export const EditGuildApplicationCommandEntity =
  CreateGuildApplicationCommandEntity.omit({
    type: true,
  }).partial();

export type EditGuildApplicationCommandEntity = z.infer<
  typeof EditGuildApplicationCommandEntity
>;
