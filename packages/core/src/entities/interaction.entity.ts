import { z } from "zod";
import { BitwisePermissionFlags, LocaleKeySchema } from "../enums/index.js";
import { BitFieldManager, SnowflakeSchema } from "../managers/index.js";
import {
  ApplicationCommandOptionSchema,
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from "./application-commands.entity.js";
import { ApplicationIntegrationType } from "./application.entity.js";
import { ChannelSchema } from "./channel.entity.js";
import { EntitlementSchema } from "./entitlement.entity.js";
import { GuildMemberSchema, GuildSchema } from "./guild.entity.js";
import {
  ActionRowSchema,
  ComponentType,
  SelectMenuSchema,
} from "./message-components.entity.js";
import {
  AllowedMentionsSchema,
  AttachmentSchema,
  EmbedSchema,
  MessageFlags,
  MessageSchema,
} from "./message.entity.js";
import { PollCreateRequestSchema } from "./poll.entity.js";
import { RoleSchema } from "./role.entity.js";
import { UserSchema } from "./user.entity.js";

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-response-object-interaction-callback-type}
 */
export const InteractionCallbackType = {
  pong: 1,
  channelMessageWithSource: 4,
  deferredChannelMessageWithSource: 5,
  deferredUpdateMessage: 6,
  updateMessage: 7,
  applicationCommandAutocompleteResult: 8,
  modal: 9,
  premiumRequired: 10,
  launchActivity: 12,
} as const;

export type InteractionCallbackType =
  (typeof InteractionCallbackType)[keyof typeof InteractionCallbackType];

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-type}
 */
export const InteractionType = {
  ping: 1,
  applicationCommand: 2,
  messageComponent: 3,
  applicationCommandAutocomplete: 4,
  modalSubmit: 5,
} as const;

export type InteractionType =
  (typeof InteractionType)[keyof typeof InteractionType];

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-callback-interaction-callback-activity-instance-resource}
 */
export const InteractionCallbackActivityInstanceSchema = z
  .object({
    id: z.string(),
  })
  .strict();

export type InteractionCallbackActivityInstanceEntity = z.infer<
  typeof InteractionCallbackActivityInstanceSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-callback-interaction-callback-resource-object}
 */
export const InteractionCallbackResourceSchema = z
  .object({
    type: z.nativeEnum(InteractionCallbackType),
    activity_instance: InteractionCallbackActivityInstanceSchema.optional(),
    message: z.lazy(() => MessageSchema).optional(),
  })
  .strict();

export type InteractionCallbackResource = z.infer<
  typeof InteractionCallbackResourceSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-callback-interaction-callback-object}
 */
export const InteractionCallbackSchema = z
  .object({
    id: SnowflakeSchema,
    type: z.nativeEnum(InteractionCallbackType),
    activity_instance_id: z.string().optional(),
    response_message_id: SnowflakeSchema.optional(),
    response_message_loading: z.boolean().optional(),
    response_message_ephemeral: z.boolean().optional(),
  })
  .strict();

export type InteractionCallbackEntity = z.infer<
  typeof InteractionCallbackSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-response-object-modal}
 */
export const InteractionCallbackModalSchema = z
  .object({
    custom_id: z.string().max(100),
    title: z.string().max(45),
    components: z.array(ActionRowSchema).min(1).max(5),
  })
  .strict();

export type InteractionCallbackModal = z.infer<
  typeof InteractionCallbackModalSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-response-object-autocomplete}
 */
export const InteractionCallbackAutocompleteSchema = z
  .object({
    choices: z.array(z.lazy(() => ApplicationCommandOptionSchema)).max(25),
  })
  .strict();

export type InteractionCallbackAutocomplete = z.infer<
  typeof InteractionCallbackAutocompleteSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-response-object-messages}
 */
export const InteractionCallbackMessagesSchema = z
  .object({
    tts: z.boolean().optional(),
    content: z.string().optional(),
    embeds: z
      .array(z.lazy(() => EmbedSchema))
      .max(10)
      .optional(),
    allowed_mentions: z.lazy(() => AllowedMentionsSchema).optional(),
    flags: z
      .lazy(() =>
        z.union([
          z.literal(MessageFlags.suppressEmbeds),
          z.literal(MessageFlags.ephemeral),
          z.literal(MessageFlags.suppressNotifications),
        ]),
      )
      .transform((value) => new BitFieldManager<MessageFlags>(value))
      .optional(),
    components: z.array(ActionRowSchema).optional(),
    attachments: z.lazy(() => AttachmentSchema).optional(),
    poll: PollCreateRequestSchema.optional(),
  })
  .strict()
  .refine(
    (data) => {
      const hasContent = Boolean(data.content);
      const hasEmbeds = data.embeds && data.embeds.length > 0;
      const hasComponents = data.components && data.components.length > 0;
      return hasContent || hasEmbeds || hasComponents;
    },
    {
      message:
        "At least one of content, embeds, or components must be provided",
    },
  );

export type InteractionCallbackMessages = z.infer<
  typeof InteractionCallbackMessagesSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-response-object-interaction-response-structure}
 */
export const InteractionCallbackResponseSchema = z
  .object({
    type: z.nativeEnum(InteractionCallbackType),
    data: z
      .union([
        InteractionCallbackMessagesSchema,
        InteractionCallbackAutocompleteSchema,
        InteractionCallbackModalSchema,
      ])
      .optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.type === 4 && !data.data) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Data is required for CHANNEL_MESSAGE_WITH_SOURCE",
      });
    }
    if (data.type === 8 && !(data.data && "choices" in data.data)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Choices are required for APPLICATION_COMMAND_AUTOCOMPLETE_RESULT",
      });
    }
    if (data.type === 9 && !(data.data && "custom_id" in data.data)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Modal data is required for MODAL response",
      });
    }
  });

export type InteractionCallbackResponse = z.infer<
  typeof InteractionCallbackResponseSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#message-interaction-object-message-interaction-structure}
 */
export const MessageInteractionSchema = z
  .object({
    id: SnowflakeSchema,
    type: z.nativeEnum(InteractionType),
    name: z.string(),
    user: UserSchema,
    member: GuildMemberSchema.partial().optional(),
  })
  .strict();

export type MessageInteractionEntity = z.infer<typeof MessageInteractionSchema>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-application-command-interaction-data-option-structure}
 */
export interface ApplicationCommandInteractionDataOptionEntity {
  name: string;
  type: ApplicationCommandOptionType;
  value?: string | number | boolean;
  options?: ApplicationCommandInteractionDataOptionEntity[];
  focused?: boolean;
}

export const ApplicationCommandInteractionDataOptionSchema: z.ZodType<ApplicationCommandInteractionDataOptionEntity> =
  z.lazy(() =>
    z
      .object({
        name: z.string(),
        type: z.nativeEnum(ApplicationCommandOptionType),
        value: z.union([z.string(), z.number(), z.boolean()]).optional(),
        options: z
          .array(ApplicationCommandInteractionDataOptionSchema)
          .optional(),
        focused: z.boolean().optional(),
      })
      .strict(),
  );

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-resolved-data-structure}
 */
export const InteractionResolvedDataSchema = z
  .object({
    users: z.map(SnowflakeSchema, UserSchema).optional(),
    members: z
      .map(
        SnowflakeSchema,
        GuildMemberSchema.omit({ user: true, deaf: true, mute: true }),
      )
      .optional(),
    roles: z.map(SnowflakeSchema, RoleSchema).optional(),
    channels: z
      .map(
        SnowflakeSchema,
        ChannelSchema.pick({
          id: true,
          name: true,
          type: true,
          permissions: true,
          thread_metadata: true,
          parent_id: true,
        }),
      )
      .optional(),
    messages: z
      .map(
        SnowflakeSchema,
        z.lazy(() => MessageSchema.partial()),
      )
      .optional(),
    attachments: z
      .map(
        SnowflakeSchema,
        z.lazy(() => AttachmentSchema),
      )
      .optional(),
  })
  .strict();

export type InteractionResolvedDataEntity = z.infer<
  typeof InteractionResolvedDataSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-modal-submit-data-structure}
 */
export const InteractionModalSubmitDataSchema = z
  .object({
    custom_id: z.string(),
    components: z.array(ActionRowSchema),
  })
  .strict();

export type InteractionModalSubmitDataEntity = z.infer<
  typeof InteractionModalSubmitDataSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-message-component-data-structure}
 */
export const InteractionMessageComponentDataSchema = z
  .object({
    custom_id: z.string(),
    component_type: z.nativeEnum(ComponentType),
    values: z.array(SelectMenuSchema).optional(),
    resolved: InteractionResolvedDataSchema.optional(),
  })
  .strict();

export type InteractionMessageComponentDataEntity = z.infer<
  typeof InteractionMessageComponentDataSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-application-command-data-structure}
 */
export const ApplicationCommandInteractionDataSchema = z
  .object({
    id: SnowflakeSchema,
    name: z.string(),
    type: z.lazy(() => z.nativeEnum(ApplicationCommandType)),
    resolved: InteractionResolvedDataSchema.optional(),
    options: z.array(ApplicationCommandInteractionDataOptionSchema).optional(),
    guild_id: SnowflakeSchema.optional(),
    target_id: SnowflakeSchema.optional(),
  })
  .strict();

export type ApplicationCommandInteractionDataEntity = z.infer<
  typeof ApplicationCommandInteractionDataSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-context-types}
 */
export const InteractionContextType = {
  guild: 0,
  botDm: 1,
  privateChannel: 2,
} as const;

export type InteractionContextType =
  (typeof InteractionContextType)[keyof typeof InteractionContextType];

export const InteractionDataSchema = z.discriminatedUnion("type", [
  z
    .object({
      type: z.literal(InteractionType.applicationCommand),
      data: ApplicationCommandInteractionDataSchema,
    })
    .strict(),
  z
    .object({
      type: z.literal(InteractionType.messageComponent),
      data: InteractionMessageComponentDataSchema,
    })
    .strict(),
  z
    .object({
      type: z.literal(InteractionType.applicationCommandAutocomplete),
      data: ApplicationCommandInteractionDataSchema,
    })
    .strict(),
  z
    .object({
      type: z.literal(InteractionType.modalSubmit),
      data: InteractionModalSubmitDataSchema,
    })
    .strict(),
]);

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-structure}
 */
export const InteractionSchema = z
  .object({
    id: SnowflakeSchema,
    application_id: SnowflakeSchema,
    type: z.nativeEnum(InteractionType),
    data: z
      .union([
        ApplicationCommandInteractionDataSchema,
        InteractionMessageComponentDataSchema,
        InteractionModalSubmitDataSchema,
      ])
      .optional(),
    guild: GuildSchema.partial().optional(),
    guild_id: SnowflakeSchema.optional(),
    channel: ChannelSchema.partial().optional(),
    channel_id: SnowflakeSchema.optional(),
    member: GuildMemberSchema.optional(),
    user: UserSchema.optional(),
    token: z.string(),
    version: z.literal(1),
    message: z.lazy(() => MessageSchema).optional(),
    app_permissions: z.nativeEnum(BitwisePermissionFlags),
    locale: LocaleKeySchema.optional(),
    guild_locale: LocaleKeySchema.optional(),
    entitlements: z.array(EntitlementSchema),
    authorizing_integration_owners: z.record(
      z.nativeEnum(ApplicationIntegrationType),
      SnowflakeSchema,
    ),
    context: z.nativeEnum(InteractionContextType).optional(),
  })
  .strict();

export type InteractionEntity = z.infer<typeof InteractionSchema>;
