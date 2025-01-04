import {
  ApplicationCommandOptionSchema,
  ApplicationCommandPermissionSchema,
  ApplicationCommandType,
  ApplicationIntegrationType,
  InteractionContextType,
  createAvailableLocaleSchema,
} from "@nyxjs/core";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-application-command-permissions-json-params}
 */
export const EditApplicationCommandPermissionsSchema = z
  .object({
    permissions: z.array(ApplicationCommandPermissionSchema).max(100),
  })
  .strict();

export type EditApplicationCommandPermissionsEntity = z.infer<
  typeof EditApplicationCommandPermissionsSchema
>;

const APPLICATION_COMMAND_NAME_REGEX =
  /[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}/u;

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#create-global-application-command-json-params}
 */
export const CreateGlobalApplicationCommandSchema = z
  .object({
    name: z.string().min(1).max(32).regex(APPLICATION_COMMAND_NAME_REGEX),
    name_localizations: createAvailableLocaleSchema(
      z.string().min(1).max(32).regex(APPLICATION_COMMAND_NAME_REGEX),
    ).nullish(),
    description: z.string().min(1).max(100).optional(),
    description_localizations: createAvailableLocaleSchema(
      z.string().min(1).max(100),
    ).nullish(),
    options: z.array(ApplicationCommandOptionSchema).max(25).optional(),
    default_member_permissions: z.string().nullish(),
    /**
     * @deprecated User `contexts instead`
     */
    dm_permission: z.boolean().nullish(),
    default_permission: z.boolean().default(true).optional(),
    integration_types: z
      .array(z.nativeEnum(ApplicationIntegrationType))
      .optional(),
    contexts: z.array(z.nativeEnum(InteractionContextType)).optional(),
    type: z
      .nativeEnum(ApplicationCommandType)
      .default(ApplicationCommandType.chatInput)
      .optional(),
    nsfw: z.boolean().optional(),
  })
  .strict();

export type CreateGlobalApplicationCommandEntity = z.infer<
  typeof CreateGlobalApplicationCommandSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-global-application-command-json-params}
 */
export const EditGlobalApplicationCommandSchema =
  CreateGlobalApplicationCommandSchema.omit({
    type: true,
  })
    .strict()
    .partial();

export type EditGlobalApplicationCommandEntity = z.infer<
  typeof EditGlobalApplicationCommandSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#create-guild-application-command-json-params}
 */
export const CreateGuildApplicationCommandSchema =
  CreateGlobalApplicationCommandSchema.omit({
    integration_types: true,
    contexts: true,
  }).strict();

export type CreateGuildApplicationCommandEntity = z.infer<
  typeof CreateGuildApplicationCommandSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#edit-guild-application-command-json-params}
 */
export const EditGuildApplicationCommandSchema =
  CreateGuildApplicationCommandSchema.omit({
    type: true,
  })
    .strict()
    .partial();

export type EditGuildApplicationCommandEntity = z.infer<
  typeof EditGuildApplicationCommandSchema
>;
