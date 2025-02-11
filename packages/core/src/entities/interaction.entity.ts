import { z } from "zod";
import { BitwisePermissionFlags, LocaleKey } from "../enums/index.js";
import { Snowflake } from "../managers/index.js";
import {
  ApplicationCommandOptionChoiceEntity,
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from "./application-commands.entity.js";
import { ApplicationIntegrationType } from "./application.entity.js";
import { ChannelEntity } from "./channel.entity.js";
import { EntitlementEntity } from "./entitlement.entity.js";
import { GuildEntity, GuildMemberEntity } from "./guild.entity.js";
import {
  ActionRowEntity,
  ComponentType,
  SelectMenuEntity,
} from "./message-components.entity.js";
import {
  AllowedMentionsEntity,
  AttachmentEntity,
  EmbedEntity,
  MessageFlags,
} from "./message.entity.js";
import { PollCreateRequestEntity } from "./poll.entity.js";
import { RoleEntity } from "./role.entity.js";
import { UserEntity } from "./user.entity.js";

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-type}
 */
export enum InteractionType {
  Ping = 1,
  ApplicationCommand = 2,
  MessageComponent = 3,
  ApplicationCommandAutocomplete = 4,
  ModalSubmit = 5,
}

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-callback-type}
 */
export enum InteractionCallbackType {
  Pong = 1,
  ChannelMessageWithSource = 4,
  DeferredChannelMessageWithSource = 5,
  DeferredUpdateMessage = 6,
  UpdateMessage = 7,
  ApplicationCommandAutocompleteResult = 8,
  Modal = 9,
  PremiumRequired = 10,
  LaunchActivity = 12,
}

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-context-types}
 */
export enum InteractionContextType {
  Guild = 0,
  BotDm = 1,
  PrivateChannel = 2,
}

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-callback-interaction-callback-activity-instance-resource}
 */
export const InteractionCallbackActivityInstanceEntity = z.object({
  id: z.string(),
});

export type InteractionCallbackActivityInstanceEntity = z.infer<
  typeof InteractionCallbackActivityInstanceEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-callback-interaction-callback-object}
 */
export const InteractionCallbackEntity = z.object({
  id: Snowflake,
  type: z.nativeEnum(InteractionType),
  activity_instance_id: z.string().optional(),
  response_message_id: Snowflake.optional(),
  response_message_loading: z.boolean().optional(),
  response_message_ephemeral: z.boolean().optional(),
});

export type InteractionCallbackEntity = z.infer<
  typeof InteractionCallbackEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-callback-resource-object}
 */
export const InteractionCallbackResourceEntity = z.object({
  type: z.nativeEnum(InteractionCallbackType),
  activity_instance: InteractionCallbackActivityInstanceEntity.optional(),
  // message: MessageEntity.optional(), // Commented to avoid circular reference
});

export type InteractionCallbackResourceEntity = z.infer<
  typeof InteractionCallbackResourceEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#resolved-data-structure}
 */
export const InteractionResolvedDataEntity = z.object({
  users: z.record(Snowflake, UserEntity).optional(),
  members: z
    .record(
      Snowflake,
      GuildMemberEntity.omit({ user: true, deaf: true, mute: true }),
    )
    .optional(),
  roles: z.record(Snowflake, RoleEntity).optional(),
  channels: z
    .record(
      Snowflake,
      ChannelEntity.pick({
        id: true,
        name: true,
        type: true,
        permissions: true,
        thread_metadata: true,
        parent_id: true,
      }),
    )
    .optional(),
  // messages: z.record(Snowflake, MessageEntity).optional(), // Commented to avoid circular reference
  attachments: z.record(Snowflake, AttachmentEntity).optional(),
});

export type InteractionResolvedDataEntity = z.infer<
  typeof InteractionResolvedDataEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#message-component-data-structure}
 */
export const MessageComponentInteractionDataEntity = z.object({
  custom_id: z.string(),
  component_type: z.nativeEnum(ComponentType),
  values: z.array(SelectMenuEntity).optional(),
  resolved: InteractionResolvedDataEntity.optional(),
});

export type MessageComponentInteractionDataEntity = z.infer<
  typeof MessageComponentInteractionDataEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#modal-submit-data-structure}
 */
export const ModalSubmitInteractionDataEntity = z.object({
  custom_id: z.string(),
  components: z.array(ActionRowEntity),
});

export type ModalSubmitInteractionDataEntity = z.infer<
  typeof ModalSubmitInteractionDataEntity
>;

// Base command option structure
const BaseCommandOption = z.object({
  name: z.string(),
  type: z.nativeEnum(ApplicationCommandOptionType),
});

const StringCommandOption = BaseCommandOption.extend({
  type: z.literal(ApplicationCommandOptionType.String),
  value: z.string(),
  focused: z.boolean().optional(),
});

const NumberCommandOption = BaseCommandOption.extend({
  type: z.literal(ApplicationCommandOptionType.Number),
  value: z.number(),
  focused: z.boolean().optional(),
});

const IntegerCommandOption = BaseCommandOption.extend({
  type: z.literal(ApplicationCommandOptionType.Integer),
  value: z.number().int(),
  focused: z.boolean().optional(),
});

const BooleanCommandOption = BaseCommandOption.extend({
  type: z.literal(ApplicationCommandOptionType.Boolean),
  value: z.boolean(),
  focused: z.boolean().optional(),
});

const SubCommandOption = BaseCommandOption.extend({
  type: z.literal(ApplicationCommandOptionType.SubCommand),
  options: z.array(z.lazy(() => SimpleCommandOption)).optional(),
});

const SubCommandGroupOption = BaseCommandOption.extend({
  type: z.literal(ApplicationCommandOptionType.SubCommandGroup),
  options: z.array(SubCommandOption),
});

const SimpleCommandOption = z.discriminatedUnion("type", [
  StringCommandOption,
  NumberCommandOption,
  IntegerCommandOption,
  BooleanCommandOption,
]);

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#application-command-data-structure}
 */
export const ApplicationCommandInteractionDataEntity = z.object({
  id: Snowflake,
  name: z.string(),
  type: z.nativeEnum(ApplicationCommandType),
  resolved: InteractionResolvedDataEntity.optional(),
  options: z
    .array(
      z.discriminatedUnion("type", [
        SubCommandOption,
        SubCommandGroupOption,
        ...SimpleCommandOption.options,
      ]),
    )
    .optional(),
  guild_id: Snowflake.optional(),
  target_id: Snowflake.optional(),
});

export type ApplicationCommandInteractionDataEntity = z.infer<
  typeof ApplicationCommandInteractionDataEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-data}
 */
export const InteractionDataEntity = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(InteractionType.ApplicationCommand),
    data: ApplicationCommandInteractionDataEntity,
  }),
  z.object({
    type: z.literal(InteractionType.ApplicationCommandAutocomplete),
    data: ApplicationCommandInteractionDataEntity,
  }),
  z.object({
    type: z.literal(InteractionType.MessageComponent),
    data: MessageComponentInteractionDataEntity,
  }),
  z.object({
    type: z.literal(InteractionType.ModalSubmit),
    data: ModalSubmitInteractionDataEntity,
  }),
]);

export type InteractionDataEntity = z.infer<typeof InteractionDataEntity>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#message-interaction-structure}
 */
export const MessageInteractionEntity = z.object({
  id: Snowflake,
  type: z.nativeEnum(InteractionType),
  name: z.string(),
  user: UserEntity,
  member: GuildMemberEntity.partial().optional(),
});

export type MessageInteractionEntity = z.infer<typeof MessageInteractionEntity>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-callback-response-object}
 */
export const InteractionCallbackResponseEntity = z.object({
  interaction: InteractionCallbackEntity,
  resource: InteractionCallbackResourceEntity.optional(),
});

export type InteractionCallbackResponseEntity = z.infer<
  typeof InteractionCallbackResponseEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-response-object-messages}
 */
export const InteractionCallbackMessagesEntity = z
  .object({
    tts: z.boolean().optional(),
    content: z.string().optional(),
    embeds: z.array(EmbedEntity).max(10).optional(),
    allowed_mentions: AllowedMentionsEntity.optional(),
    flags: z.nativeEnum(MessageFlags).optional(),
    components: z.array(ActionRowEntity).optional(),
    attachments: z.array(AttachmentEntity).optional(),
    poll: PollCreateRequestEntity.optional(),
  })
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

export type InteractionCallbackMessagesEntity = z.infer<
  typeof InteractionCallbackMessagesEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#modal}
 */
export const InteractionCallbackModalEntity = z.object({
  custom_id: z.string().max(100),
  title: z.string().max(45),
  components: z.array(ActionRowEntity).min(1).max(5),
});

export type InteractionCallbackModalEntity = z.infer<
  typeof InteractionCallbackModalEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#autocomplete}
 */
export const InteractionCallbackAutocompleteEntity = z.object({
  choices: z.array(ApplicationCommandOptionChoiceEntity).max(25),
});

export type InteractionCallbackAutocompleteEntity = z.infer<
  typeof InteractionCallbackAutocompleteEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-response-structure}
 */
export const InteractionResponseEntity = z
  .object({
    type: z.nativeEnum(InteractionCallbackType),
    data: z
      .union([
        InteractionCallbackMessagesEntity,
        InteractionCallbackAutocompleteEntity,
        InteractionCallbackModalEntity,
      ])
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.type === InteractionCallbackType.ChannelMessageWithSource &&
      !data.data
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Data is required for CHANNEL_MESSAGE_WITH_SOURCE",
      });
    }
    if (
      data.type ===
        InteractionCallbackType.ApplicationCommandAutocompleteResult &&
      !(data.data && "choices" in data.data)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Choices are required for APPLICATION_COMMAND_AUTOCOMPLETE_RESULT",
      });
    }
    if (
      data.type === InteractionCallbackType.Modal &&
      !(data.data && "custom_id" in data.data)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Modal data is required for MODAL response",
      });
    }
  });

export type InteractionResponseEntity = z.infer<
  typeof InteractionResponseEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object}
 */
export const InteractionEntity = z.object({
  id: Snowflake,
  application_id: Snowflake,
  type: z.nativeEnum(InteractionType),
  data: InteractionDataEntity.optional(),
  guild: GuildEntity.partial().optional(),
  guild_id: Snowflake.optional(),
  channel: ChannelEntity.partial().optional(),
  channel_id: Snowflake.optional(),
  member: GuildMemberEntity.optional(),
  user: UserEntity.optional(),
  token: z.string(),
  version: z.literal(1),
  // message: MessageEntity.optional(), // Commented to avoid circular reference
  app_permissions: z.nativeEnum(BitwisePermissionFlags),
  locale: LocaleKey.optional(),
  guild_locale: LocaleKey.optional(),
  entitlements: z.array(EntitlementEntity),
  authorizing_integration_owners: z.record(
    z.nativeEnum(ApplicationIntegrationType),
    Snowflake,
  ),
  context: z.nativeEnum(InteractionContextType).optional(),
});

export type InteractionEntity = z.infer<typeof InteractionEntity>;
