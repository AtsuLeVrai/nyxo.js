import { z } from "zod";
import {
  type AvailableLocale,
  AvailableLocaleSchema,
  createAvailableLocaleSchema,
} from "../enums/index.js";
import { SnowflakeSchema } from "../managers/index.js";
import { ApplicationIntegrationType } from "./application.entity.js";
import { ChannelType } from "./channel.entity.js";
import { InteractionContextType } from "./interaction.entity.js";

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-permissions-object-application-command-permission-type}
 */
export const ApplicationCommandPermissionType = {
  role: 1,
  user: 2,
  channel: 3,
} as const;

export type ApplicationCommandPermissionType =
  (typeof ApplicationCommandPermissionType)[keyof typeof ApplicationCommandPermissionType];

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-permissions-object-application-command-permissions-structure}
 */
export const ApplicationCommandPermissionSchema = z
  .object({
    id: SnowflakeSchema,
    type: z.nativeEnum(ApplicationCommandPermissionType),
    permission: z.boolean(),
  })
  .strict();

export type ApplicationCommandPermissionEntity = z.infer<
  typeof ApplicationCommandPermissionSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-permissions-object-guild-application-command-permissions-structure}
 */
export const GuildApplicationCommandPermissionSchema = z
  .object({
    id: SnowflakeSchema,
    application_id: SnowflakeSchema,
    guild_id: SnowflakeSchema,
    permissions: z.array(ApplicationCommandPermissionSchema),
  })
  .strict();

export type GuildApplicationCommandPermissionEntity = z.infer<
  typeof GuildApplicationCommandPermissionSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-entry-point-command-handler-types}
 */
export const ApplicationCommandEntryPointType = {
  appHandler: 1,
  discordLaunchActivity: 2,
} as const;

export type ApplicationCommandEntryPointType =
  (typeof ApplicationCommandEntryPointType)[keyof typeof ApplicationCommandEntryPointType];

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-choice-structure}
 */
export const ApplicationCommandOptionChoiceSchema = z
  .object({
    name: z.string().min(1).max(100),
    name_localizations: AvailableLocaleSchema.nullish(),
    value: z.union([z.string(), z.number()]),
  })
  .strict();

export type ApplicationCommandOptionChoiceEntity = z.infer<
  typeof ApplicationCommandOptionChoiceSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type}
 */
export const ApplicationCommandOptionType = {
  subCommand: 1,
  subCommandGroup: 2,
  string: 3,
  integer: 4,
  boolean: 5,
  user: 6,
  channel: 7,
  role: 8,
  mentionable: 9,
  number: 10,
  attachment: 11,
} as const;

export type ApplicationCommandOptionType =
  (typeof ApplicationCommandOptionType)[keyof typeof ApplicationCommandOptionType];

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure}
 */
export interface ApplicationCommandOptionEntity {
  type: ApplicationCommandOptionType;
  name: string;
  name_localizations?: AvailableLocale | null;
  description: string;
  description_localizations?: AvailableLocale | null;
  required?: boolean;
  choices?: ApplicationCommandOptionChoiceEntity[];
  options?: ApplicationCommandOptionEntity[];
  channel_types?: ChannelType[];
  min_value?: number;
  max_value?: number;
  min_length?: number;
  max_length?: number;
  autocomplete?: boolean;
}

export const APPLICATION_COMMAND_NAME_REGEX =
  /^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u;

export const ApplicationCommandOptionSchema: z.ZodType<ApplicationCommandOptionEntity> =
  z.lazy(() =>
    z
      .object({
        type: z.nativeEnum(ApplicationCommandOptionType),
        name: z.string().min(1).max(32).regex(APPLICATION_COMMAND_NAME_REGEX),
        name_localizations: createAvailableLocaleSchema(
          z.string().min(1).max(32).regex(APPLICATION_COMMAND_NAME_REGEX),
        ).nullish(),
        description: z.string().min(1).max(100),
        description_localizations: createAvailableLocaleSchema(
          z.string().min(1).max(100),
        ).nullish(),
        required: z.boolean().optional(),
        choices: z
          .array(ApplicationCommandOptionChoiceSchema)
          .max(25)
          .optional(),
        options: z.array(ApplicationCommandOptionSchema).max(25).optional(),
        channel_types: z.array(z.nativeEnum(ChannelType)).optional(),
        min_value: z.number().int().optional(),
        max_value: z.number().int().optional(),
        min_length: z.number().int().min(0).max(6000).optional(),
        max_length: z.number().int().min(1).max(6000).optional(),
        autocomplete: z.boolean().optional(),
      })
      .strict(),
  );

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-types}
 */
export const ApplicationCommandType = {
  chatInput: 1,
  user: 2,
  message: 3,
  primaryEntryPoint: 4,
} as const;

export type ApplicationCommandType =
  (typeof ApplicationCommandType)[keyof typeof ApplicationCommandType];

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-structure}
 */
export const ApplicationCommandSchema = z
  .object({
    id: SnowflakeSchema,
    type: z
      .nativeEnum(ApplicationCommandType)
      .optional()
      .default(ApplicationCommandType.chatInput),
    application_id: SnowflakeSchema,
    guild_id: SnowflakeSchema.optional(),
    name: z.string().min(1).max(32).regex(APPLICATION_COMMAND_NAME_REGEX),
    name_localizations: createAvailableLocaleSchema(
      z.string().min(1).max(32).regex(APPLICATION_COMMAND_NAME_REGEX),
    ).nullish(),
    description: z.string().min(1).max(100),
    description_localizations: createAvailableLocaleSchema(
      z.string().min(1).max(100),
    ).nullish(),
    options: z.array(ApplicationCommandOptionSchema).max(25).optional(),
    default_member_permissions: z.string().nullable(),
    dm_permission: z.boolean().optional(),
    default_permission: z.boolean().nullish(),
    nsfw: z.boolean().optional(),
    integration_types: z
      .array(z.nativeEnum(ApplicationIntegrationType))
      .optional(),
    contexts: z
      .array(z.lazy(() => z.nativeEnum(InteractionContextType)))
      .nullish(),
    version: SnowflakeSchema,
    handler: z.nativeEnum(ApplicationCommandEntryPointType).optional(),
  })
  .strict();

export type ApplicationCommandEntity = z.infer<typeof ApplicationCommandSchema>;
