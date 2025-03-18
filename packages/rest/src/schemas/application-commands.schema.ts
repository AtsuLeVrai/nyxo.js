import {
  ApplicationCommandEntity,
  ApplicationCommandPermissionEntity,
  ApplicationCommandType,
  ApplicationIntegrationType,
} from "@nyxjs/core";
import { z } from "zod";

/**
 * Schema for editing application command permissions.
 * Defines a set of permission overwrites for a command.
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-application-command-permissions}
 */
export const EditApplicationCommandPermissionsSchema = z.object({
  /** Array of permission objects for the command (max 100) */
  permissions: ApplicationCommandPermissionEntity.array().max(100),
});

export type EditApplicationCommandPermissionsSchema = z.input<
  typeof EditApplicationCommandPermissionsSchema
>;

/**
 * Schema for creating a global application command.
 * Reuses validation rules from the ApplicationCommandEntity where possible.
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#create-global-application-command}
 */
export const CreateGlobalApplicationCommandSchema = z.object({
  /** Command name (1-32 characters matching regex) */
  name: ApplicationCommandEntity.shape.name,

  /** Localization dictionary for the name field */
  name_localizations: ApplicationCommandEntity.shape.name_localizations,

  /** Command description (1-100 characters) */
  description: ApplicationCommandEntity.shape.description.optional(),

  /** Localization dictionary for the description field */
  description_localizations:
    ApplicationCommandEntity.shape.description_localizations,

  /** Command options/parameters (max 25) */
  options: ApplicationCommandEntity.shape.options,

  /** Permissions required to use the command (bit set as string) */
  default_member_permissions:
    ApplicationCommandEntity.shape.default_member_permissions,

  /**
   * Whether the command is available in DMs with the app
   * @deprecated Use `contexts` instead
   */
  dm_permission: z.boolean().nullish(),

  /** Whether the command is enabled by default (deprecated) */
  default_permission: ApplicationCommandEntity.shape.default_permission,

  /** Installation contexts where the command is available */
  integration_types: z
    .array(z.nativeEnum(ApplicationIntegrationType))
    .optional(),

  /** Interaction contexts where the command can be used */
  contexts: ApplicationCommandEntity.shape.contexts,

  /** Type of command (defaults to ChatInput/slash command) */
  type: ApplicationCommandEntity.shape.type
    .optional()
    .default(ApplicationCommandType.ChatInput),

  /** Whether the command is age-restricted */
  nsfw: ApplicationCommandEntity.shape.nsfw,
});

export type CreateGlobalApplicationCommandSchema = z.input<
  typeof CreateGlobalApplicationCommandSchema
>;

/**
 * Schema for editing a global application command.
 * Similar to creating a command but all fields are optional, and type cannot be changed.
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
 * Schema for creating a guild-specific application command.
 * Similar to global commands but without integration_types and contexts,
 * as these are only applicable to global commands.
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
 * Schema for editing a guild-specific application command.
 * Similar to creating a guild command but all fields are optional, and type cannot be changed.
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-guild-application-command-json-params}
 */
export const EditGuildApplicationCommandSchema =
  CreateGuildApplicationCommandSchema.omit({
    type: true,
  }).partial();

export type EditGuildApplicationCommandSchema = z.input<
  typeof EditGuildApplicationCommandSchema
>;
