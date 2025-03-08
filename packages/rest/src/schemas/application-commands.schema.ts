import {
  ApplicationCommandOptionType,
  ApplicationCommandPermissionType,
  ApplicationCommandType,
  ApplicationIntegrationType,
  ChannelType,
  InteractionContextType,
  Locale,
  Snowflake,
} from "@nyxjs/core";
import { z } from "zod";

/** Regex pattern for application command names */
export const APPLICATION_COMMAND_NAME_REGEX =
  /^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u;

export const ApplicationCommandOptionChoiceSchema = z.object({
  name: z.string().min(1).max(100),
  name_localizations: z.record(z.nativeEnum(Locale), z.string()).nullish(),
  value: z.union([z.string(), z.number()]),
});

const BaseApplicationCommandOptionSchema = z.object({
  name: z.string().min(1).max(32),
  name_localizations: z.record(z.nativeEnum(Locale), z.string()).nullish(),
  description: z.string().min(1).max(100),
  description_localizations: z
    .record(z.nativeEnum(Locale), z.string())
    .nullish(),
});

export const StringOptionSchema = BaseApplicationCommandOptionSchema.extend({
  type: z.literal(ApplicationCommandOptionType.String),
  required: z.boolean().optional(),
  min_length: z.number().int().min(0).max(6000).optional(),
  max_length: z.number().int().min(1).max(6000).optional(),
  autocomplete: z.boolean().optional(),
  choices: z.array(ApplicationCommandOptionChoiceSchema).max(25).optional(),
});

export const IntegerOptionSchema = BaseApplicationCommandOptionSchema.extend({
  type: z.literal(ApplicationCommandOptionType.Integer),
  required: z.boolean().optional(),
  min_value: z.number().int().optional(),
  max_value: z.number().int().optional(),
  autocomplete: z.boolean().optional(),
  choices: z.array(ApplicationCommandOptionChoiceSchema).max(25).optional(),
});

export const NumberOptionSchema = BaseApplicationCommandOptionSchema.extend({
  type: z.literal(ApplicationCommandOptionType.Number),
  required: z.boolean().optional(),
  min_value: z.number().optional(),
  max_value: z.number().optional(),
  autocomplete: z.boolean().optional(),
  choices: z.array(ApplicationCommandOptionChoiceSchema).max(25).optional(),
});

export const BooleanOptionSchema = BaseApplicationCommandOptionSchema.extend({
  type: z.literal(ApplicationCommandOptionType.Boolean),
  required: z.boolean().optional(),
});

export const UserOptionSchema = BaseApplicationCommandOptionSchema.extend({
  type: z.literal(ApplicationCommandOptionType.User),
  required: z.boolean().optional(),
});

export const ChannelOptionSchema = BaseApplicationCommandOptionSchema.extend({
  type: z.literal(ApplicationCommandOptionType.Channel),
  required: z.boolean().optional(),
  channel_types: z.array(z.nativeEnum(ChannelType)).optional(),
});

export const RoleOptionSchema = BaseApplicationCommandOptionSchema.extend({
  type: z.literal(ApplicationCommandOptionType.Role),
  required: z.boolean().optional(),
});

export const MentionableOptionSchema =
  BaseApplicationCommandOptionSchema.extend({
    type: z.literal(ApplicationCommandOptionType.Mentionable),
    required: z.boolean().optional(),
  });

export const AttachmentOptionSchema = BaseApplicationCommandOptionSchema.extend(
  {
    type: z.literal(ApplicationCommandOptionType.Attachment),
    required: z.boolean().optional(),
  },
);

export const SimpleApplicationCommandOptionSchema = z.discriminatedUnion(
  "type",
  [
    StringOptionSchema,
    IntegerOptionSchema,
    NumberOptionSchema,
    BooleanOptionSchema,
    UserOptionSchema,
    ChannelOptionSchema,
    RoleOptionSchema,
    MentionableOptionSchema,
    AttachmentOptionSchema,
  ],
);

export const SubCommandOptionSchema = BaseApplicationCommandOptionSchema.extend(
  {
    type: z.literal(ApplicationCommandOptionType.SubCommand),
    options: z.lazy(() =>
      z.array(SimpleApplicationCommandOptionSchema).max(25).optional(),
    ),
  },
);

export const SubCommandGroupOptionSchema =
  BaseApplicationCommandOptionSchema.extend({
    type: z.literal(ApplicationCommandOptionType.SubCommandGroup),
    options: z.lazy(() => z.array(SubCommandOptionSchema).max(25)),
  });

export const ApplicationCommandOptionSchema = z.discriminatedUnion("type", [
  StringOptionSchema,
  IntegerOptionSchema,
  NumberOptionSchema,
  BooleanOptionSchema,
  UserOptionSchema,
  ChannelOptionSchema,
  RoleOptionSchema,
  MentionableOptionSchema,
  AttachmentOptionSchema,
  SubCommandOptionSchema,
  SubCommandGroupOptionSchema,
]);

export type ApplicationCommandOptionSchema = z.input<
  typeof ApplicationCommandOptionSchema
>;

export const ApplicationCommandPermissionSchema = z.object({
  id: Snowflake,
  type: z.nativeEnum(ApplicationCommandPermissionType),
  permission: z.boolean(),
});

export type ApplicationCommandPermissionSchema = z.input<
  typeof ApplicationCommandPermissionSchema
>;

export const EditApplicationCommandPermissionsSchema = z.object({
  permissions: z.array(ApplicationCommandPermissionSchema).max(100),
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
  options: z.array(ApplicationCommandOptionSchema).max(25).optional(),
  default_member_permissions: z.string().nullish(),
  /** @deprecated User `contexts instead` */
  dm_permission: z.boolean().nullish(),
  default_permission: z.boolean().default(true),
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
