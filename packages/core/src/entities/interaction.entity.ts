import { z } from "zod";
import { BitwisePermissionFlags, LocaleKey } from "../enums/index.js";
import { Snowflake } from "../managers/index.js";
import {
  ApplicationCommandOptionEntity,
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
  MessageEntity,
  MessageFlags,
} from "./message.entity.js";
import { PollCreateRequestEntity } from "./poll.entity.js";
import { RoleEntity } from "./role.entity.js";
import { UserEntity } from "./user.entity.js";

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-response-object-interaction-callback-type}
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
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-callback-interaction-callback-activity-instance-resource}
 */
export const InteractionCallbackActivityInstanceEntity = z.object({
  id: z.string(),
});

export type InteractionCallbackActivityInstanceEntity = z.infer<
  typeof InteractionCallbackActivityInstanceEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-callback-interaction-callback-resource-object}
 */
export const InteractionCallbackResource = z.object({
  type: z.nativeEnum(InteractionCallbackType),
  activity_instance: InteractionCallbackActivityInstanceEntity.optional(),
  message: z.lazy(() => MessageEntity).optional(),
});

export type InteractionCallbackResource = z.infer<
  typeof InteractionCallbackResource
>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-callback-interaction-callback-object}
 */
export const InteractionCallbackEntity = z.object({
  id: Snowflake,
  type: z.nativeEnum(InteractionCallbackType),
  activity_instance_id: z.string().optional(),
  response_message_id: Snowflake.optional(),
  response_message_loading: z.boolean().optional(),
  response_message_ephemeral: z.boolean().optional(),
});

export type InteractionCallbackEntity = z.infer<
  typeof InteractionCallbackEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-response-object-modal}
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
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-response-object-autocomplete}
 */
export const InteractionCallbackAutocompleteEntity = z.object({
  choices: z.array(z.lazy(() => ApplicationCommandOptionEntity)).max(25),
});

export type InteractionCallbackAutocompleteEntity = z.infer<
  typeof InteractionCallbackAutocompleteEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-response-object-messages}
 */
export const InteractionCallbackMessagesEntity = z
  .object({
    tts: z.boolean().optional(),
    content: z.string().optional(),
    embeds: z
      .array(z.lazy(() => EmbedEntity))
      .max(10)
      .optional(),
    allowed_mentions: z.lazy(() => AllowedMentionsEntity).optional(),
    flags: z
      .lazy(() =>
        z.union([
          z.literal(MessageFlags.SuppressEmbeds),
          z.literal(MessageFlags.Ephemeral),
          z.literal(MessageFlags.SuppressNotifications),
        ]),
      )
      .optional(),
    components: z.array(ActionRowEntity).optional(),
    attachments: z.lazy(() => AttachmentEntity).optional(),
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
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-response-object-interaction-response-structure}
 */
export const InteractionCallbackResponseEntity = z
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

export type InteractionCallbackResponseEntity = z.infer<
  typeof InteractionCallbackResponseEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#message-interaction-object-message-interaction-structure}
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
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-application-command-interaction-data-option-structure}
 */
export interface ApplicationCommandInteractionDataOptionEntity {
  name: string;
  type: ApplicationCommandOptionType;
  value?: string | number | boolean;
  options?: ApplicationCommandInteractionDataOptionEntity[];
  focused?: boolean;
}

export const ApplicationCommandInteractionDataOptionEntity: z.ZodType<ApplicationCommandInteractionDataOptionEntity> =
  z.lazy(() =>
    z.object({
      name: z.string(),
      type: z.nativeEnum(ApplicationCommandOptionType),
      value: z.union([z.string(), z.number(), z.boolean()]).optional(),
      options: z
        .array(ApplicationCommandInteractionDataOptionEntity)
        .optional(),
      focused: z.boolean().optional(),
    }),
  );

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-resolved-data-structure}
 */
export const InteractionResolvedDataEntity = z.object({
  users: z.map(Snowflake, UserEntity).optional(),
  members: z
    .map(
      Snowflake,
      GuildMemberEntity.omit({ user: true, deaf: true, mute: true }),
    )
    .optional(),
  roles: z.map(Snowflake, RoleEntity).optional(),
  channels: z
    .map(
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
  messages: z
    .map(
      Snowflake,
      z.lazy(() => MessageEntity.partial()),
    )
    .optional(),
  attachments: z
    .map(
      Snowflake,
      z.lazy(() => AttachmentEntity),
    )
    .optional(),
});

export type InteractionResolvedDataEntity = z.infer<
  typeof InteractionResolvedDataEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-modal-submit-data-structure}
 */
export const InteractionModalSubmitDataEntity = z.object({
  custom_id: z.string(),
  components: z.array(ActionRowEntity),
});

export type InteractionModalSubmitDataEntity = z.infer<
  typeof InteractionModalSubmitDataEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-message-component-data-structure}
 */
export const InteractionMessageComponentDataEntity = z.object({
  custom_id: z.string(),
  component_type: z.nativeEnum(ComponentType),
  values: z.array(SelectMenuEntity).optional(),
  resolved: InteractionResolvedDataEntity.optional(),
});

export type InteractionMessageComponentDataEntity = z.infer<
  typeof InteractionMessageComponentDataEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-application-command-data-structure}
 */
export const ApplicationCommandInteractionDataEntity = z.object({
  id: Snowflake,
  name: z.string(),
  type: z.lazy(() => z.nativeEnum(ApplicationCommandType)),
  resolved: InteractionResolvedDataEntity.optional(),
  options: z.array(ApplicationCommandInteractionDataOptionEntity).optional(),
  guild_id: Snowflake.optional(),
  target_id: Snowflake.optional(),
});

export type ApplicationCommandInteractionDataEntity = z.infer<
  typeof ApplicationCommandInteractionDataEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-context-types}
 */
export enum InteractionContextType {
  Guild = 0,
  BotDm = 1,
  PrivateChannel = 2,
}

export const InteractionDataEntity = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(InteractionType.ApplicationCommand),
    data: ApplicationCommandInteractionDataEntity,
  }),
  z.object({
    type: z.literal(InteractionType.MessageComponent),
    data: InteractionMessageComponentDataEntity,
  }),
  z.object({
    type: z.literal(InteractionType.ApplicationCommandAutocomplete),
    data: ApplicationCommandInteractionDataEntity,
  }),
  z.object({
    type: z.literal(InteractionType.ModalSubmit),
    data: InteractionModalSubmitDataEntity,
  }),
]);

export type InteractionDataEntity = z.infer<typeof InteractionDataEntity>;

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-structure}
 */
export const InteractionEntity = z.object({
  id: Snowflake,
  application_id: Snowflake,
  type: z.nativeEnum(InteractionType),
  data: z
    .union([
      ApplicationCommandInteractionDataEntity,
      InteractionMessageComponentDataEntity,
      InteractionModalSubmitDataEntity,
    ])
    .optional(),
  guild: GuildEntity.partial().optional(),
  guild_id: Snowflake.optional(),
  channel: ChannelEntity.partial().optional(),
  channel_id: Snowflake.optional(),
  member: GuildMemberEntity.optional(),
  user: UserEntity.optional(),
  token: z.string(),
  version: z.literal(1),
  message: z.lazy(() => MessageEntity).optional(),
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
