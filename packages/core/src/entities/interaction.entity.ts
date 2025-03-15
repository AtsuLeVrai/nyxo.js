import { z } from "zod";
import { BitwisePermissionFlags, Locale } from "../enums/index.js";
import { Snowflake } from "../managers/index.js";
import {
  ApplicationCommandOptionChoiceEntity,
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from "./application-commands.entity.js";
import { ChannelEntity } from "./channel.entity.js";
import { EntitlementEntity } from "./entitlement.entity.js";
import { GuildEntity, GuildMemberEntity } from "./guild.entity.js";
import {
  ActionRowEntity,
  ComponentType,
  SelectMenuOptionEntity,
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
 * Enumeration of all interaction types
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Receiving_and_Responding.md#interaction-object-interaction-type}
 */
export enum InteractionType {
  /** Server is testing if the interaction endpoint is available */
  Ping = 1,

  /** User has used an application command */
  ApplicationCommand = 2,

  /** User has used a message component like a button or select menu */
  MessageComponent = 3,

  /** User is typing in an application command option that has autocomplete */
  ApplicationCommandAutocomplete = 4,

  /** User has submitted a modal */
  ModalSubmit = 5,
}

/**
 * Enumeration of all interaction callback types
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Receiving_and_Responding.md#interaction-response-object-interaction-callback-type}
 */
export enum InteractionCallbackType {
  /** ACK a Ping */
  Pong = 1,

  /** Respond to an interaction with a message */
  ChannelMessageWithSource = 4,

  /** ACK an interaction and edit a response later, the user sees a loading state */
  DeferredChannelMessageWithSource = 5,

  /** For components, ACK an interaction and edit the original message later; the user does not see a loading state */
  DeferredUpdateMessage = 6,

  /** For components, edit the message the component was attached to */
  UpdateMessage = 7,

  /** Respond to an autocomplete interaction with suggested choices */
  ApplicationCommandAutocompleteResult = 8,

  /** Respond to an interaction with a popup modal */
  Modal = 9,

  /** Respond to an interaction with an upgrade button, only available for apps with monetization enabled */
  PremiumRequired = 10,

  /** Launch the Activity associated with the app */
  LaunchActivity = 12,
}

/**
 * Context in Discord where an interaction can be used or was triggered from
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Receiving_and_Responding.md#interaction-object-interaction-context-types}
 */
export enum InteractionContextType {
  /** Interaction can be used within servers */
  Guild = 0,

  /** Interaction can be used within DMs with the app's bot user */
  BotDm = 1,

  /** Interaction can be used within Group DMs and DMs other than the app's bot user */
  PrivateChannel = 2,
}

/**
 * Represents an Activity Instance resource for interaction callbacks
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Receiving_and_Responding.md#interaction-callback-interaction-callback-activity-instance-resource}
 */
export const InteractionCallbackActivityInstanceEntity = z.object({
  /** Instance ID of the Activity */
  id: z.string(),
});

export type InteractionCallbackActivityInstanceEntity = z.infer<
  typeof InteractionCallbackActivityInstanceEntity
>;

/**
 * Base structure for command options
 */
export const BaseCommandOptionEntity = z.object({
  /** Name of the parameter */
  name: z.string(),

  /** Type of the option */
  type: z.nativeEnum(ApplicationCommandOptionType),
});

export type BaseCommandOptionEntity = z.infer<typeof BaseCommandOptionEntity>;

export const SimpleCommandOptionEntity = BaseCommandOptionEntity.extend({
  /** Role option type */
  type: z.union([
    z.literal(3),
    z.literal(10),
    z.literal(4),
    z.literal(5),
    z.literal(6),
    z.literal(7),
    z.literal(8),
    z.literal(9),
    z.literal(11),
  ]),

  /** Value of the option resulting from user input */
  value: z.union([z.string(), z.number(), z.boolean()]),

  /** True if this option is the currently focused option for autocomplete */
  focused: z.boolean().optional(),
});

export type SimpleCommandOptionEntity = z.infer<
  typeof SimpleCommandOptionEntity
>;

/**
 * SubCommand option
 */
export const SubCommandOptionEntity = BaseCommandOptionEntity.extend({
  /** SubCommand option type */
  type: z.literal(1),

  /** Options for this subcommand */
  options: z.lazy(() => SimpleCommandOptionEntity.array()).optional(),
});

export type SubCommandOptionEntity = z.infer<typeof SubCommandOptionEntity>;

/**
 * SubCommandGroup option
 */
export const SubCommandGroupOptionEntity = BaseCommandOptionEntity.extend({
  /** SubCommandGroup option type */
  type: z.literal(2),

  /** SubCommand options for this group */
  options: z.lazy(() => SubCommandOptionEntity.array()),
});

export type SubCommandGroupOptionEntity = z.infer<
  typeof SubCommandGroupOptionEntity
>;

/**
 * Union of all command options
 */
export const CommandOptionEntity = z.union([
  SubCommandOptionEntity,
  SubCommandGroupOptionEntity,
  SimpleCommandOptionEntity,
]);

export type CommandOptionEntity = z.infer<typeof CommandOptionEntity>;

/**
 * Resolved data structure containing detailed Discord objects from an interaction
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Receiving_and_Responding.md#resolved-data-structure}
 */
export const InteractionResolvedDataEntity = z.object({
  /** Map of user IDs to user objects */
  users: z.record(z.string(), UserEntity).optional(),

  /** Map of user IDs to partial member objects (missing user, deaf, and mute fields) */
  members: z
    .record(
      z.string(),
      GuildMemberEntity.omit({ user: true, deaf: true, mute: true }),
    )
    .optional(),

  /** Map of role IDs to role objects */
  roles: z.record(z.string(), RoleEntity).optional(),

  /** Map of channel IDs to partial channel objects */
  channels: z
    .record(
      z.string(),
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

  /** Map of message IDs to partial message objects */
  messages: z.record(z.string(), MessageEntity).optional(),

  /** Map of attachment IDs to attachment objects */
  attachments: z.record(z.string(), AttachmentEntity).optional(),
});

export type InteractionResolvedDataEntity = z.infer<
  typeof InteractionResolvedDataEntity
>;

/**
 * Application command interaction data structure
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Receiving_and_Responding.md#application-command-data-structure}
 */
export const ApplicationCommandInteractionDataEntity = z.object({
  /** ID of the invoked command */
  id: Snowflake,

  /** Name of the invoked command */
  name: z.string(),

  /** Type of the invoked command */
  type: z.nativeEnum(ApplicationCommandType),

  /** Converted users + roles + channels + attachments */
  resolved: InteractionResolvedDataEntity.optional(),

  /** Parameters and values from the user */
  options: CommandOptionEntity.array().optional(),

  /** ID of the guild the command is registered to */
  guild_id: Snowflake.optional(),

  /** ID of the user or message targeted by a user or message command */
  target_id: Snowflake.optional(),
});

export type ApplicationCommandInteractionDataEntity = z.infer<
  typeof ApplicationCommandInteractionDataEntity
>;

/**
 * Message component interaction data structure
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Receiving_and_Responding.md#message-component-data-structure}
 */
export const MessageComponentInteractionDataEntity = z.object({
  /** Developer-defined identifier for the component */
  custom_id: z.string(),

  /** Type of component */
  component_type: z.nativeEnum(ComponentType),

  /** Values selected by the user (for select menu components) */
  values: SelectMenuOptionEntity.array().optional(),

  /** Resolved entities from selected options */
  resolved: InteractionResolvedDataEntity.optional(),
});

export type MessageComponentInteractionDataEntity = z.infer<
  typeof MessageComponentInteractionDataEntity
>;

/**
 * Modal submit interaction data structure
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Receiving_and_Responding.md#modal-submit-data-structure}
 */
export const ModalSubmitInteractionDataEntity = z.object({
  /** Developer-defined identifier for the modal */
  custom_id: z.string(),

  /** Components submitted with the modal */
  components: ActionRowEntity.array(),
});

export type ModalSubmitInteractionDataEntity = z.infer<
  typeof ModalSubmitInteractionDataEntity
>;

/**
 * Union of all interaction data types
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Receiving_and_Responding.md#interaction-object-interaction-data}
 */
export const InteractionDataEntity = z.union([
  ApplicationCommandInteractionDataEntity,
  MessageComponentInteractionDataEntity,
  ModalSubmitInteractionDataEntity,
]);

export type InteractionDataEntity = z.infer<typeof InteractionDataEntity>;

/**
 * Message interaction structure sent on message objects when responding to an interaction
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Receiving_and_Responding.md#message-interaction-structure}
 */
export const MessageInteractionEntity = z.object({
  /** ID of the interaction */
  id: Snowflake,

  /** Type of interaction */
  type: z.nativeEnum(InteractionType),

  /** Name of the application command */
  name: z.string(),

  /** User who invoked the interaction */
  user: UserEntity,

  /** Member who invoked the interaction in the guild */
  member: GuildMemberEntity.partial().optional(),
});

export type MessageInteractionEntity = z.infer<typeof MessageInteractionEntity>;

/**
 * Interaction callback object containing information about the interaction response
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Receiving_and_Responding.md#interaction-callback-interaction-callback-object}
 */
export const InteractionCallbackEntity = z.object({
  /** ID of the interaction */
  id: Snowflake,

  /** Type of interaction */
  type: z.nativeEnum(InteractionType),

  /** Instance ID of the Activity if one was launched or joined */
  activity_instance_id: z.string().optional(),

  /** ID of the message that was created by the interaction */
  response_message_id: Snowflake.optional(),

  /** Whether or not the message is in a loading state */
  response_message_loading: z.boolean().optional(),

  /** Whether or not the response message was ephemeral */
  response_message_ephemeral: z.boolean().optional(),
});

export type InteractionCallbackEntity = z.infer<
  typeof InteractionCallbackEntity
>;

/**
 * Interaction callback resource object containing the response data
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Receiving_and_Responding.md#interaction-callback-resource-object}
 */
export const InteractionCallbackResourceEntity = z.object({
  /** Interaction callback type */
  type: z.nativeEnum(InteractionCallbackType),

  /** Activity instance information when launching an activity */
  activity_instance: InteractionCallbackActivityInstanceEntity.optional(),

  /** Message created by the interaction */
  message: MessageEntity.optional(),
});

export type InteractionCallbackResourceEntity = z.infer<
  typeof InteractionCallbackResourceEntity
>;

/**
 * Interaction callback response object
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Receiving_and_Responding.md#interaction-callback-response-object}
 */
export const InteractionCallbackResponseEntity = z.object({
  /** The interaction object associated with the interaction response */
  interaction: InteractionCallbackEntity,

  /** The resource that was created by the interaction response */
  resource: InteractionCallbackResourceEntity.optional(),
});

export type InteractionCallbackResponseEntity = z.infer<
  typeof InteractionCallbackResponseEntity
>;

/**
 * Interaction callback message entity for sending message responses
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Receiving_and_Responding.md#interaction-response-object-messages}
 */
export const InteractionCallbackMessagesEntity = z.object({
  /** Whether the response is TTS */
  tts: z.boolean(),

  /** Message content */
  content: z.string().optional(),

  /** Supports up to 10 embeds */
  embeds: EmbedEntity.array().max(10).optional(),

  /** Allowed mentions object */
  allowed_mentions: AllowedMentionsEntity.optional(),

  /** Message flags combined as a bitfield */
  flags: z.nativeEnum(MessageFlags).optional(),

  /** Message components */
  components: ActionRowEntity.array().optional(),

  /** Attachment objects with filename and description */
  attachments: AttachmentEntity.array().optional(),

  /** Details about the poll */
  poll: PollCreateRequestEntity.optional(),
});

export type InteractionCallbackMessagesEntity = z.infer<
  typeof InteractionCallbackMessagesEntity
>;

/**
 * Interaction callback modal entity for responding with a popup modal
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Receiving_and_Responding.md#modal}
 */
export const InteractionCallbackModalEntity = z.object({
  /** Developer-defined identifier for the modal, max 100 characters */
  custom_id: z.string().max(100),

  /** Title of the popup modal, max 45 characters */
  title: z.string().max(45),

  /** Between 1 and 5 (inclusive) components that make up the modal */
  components: ActionRowEntity.array().min(1).max(5),
});

export type InteractionCallbackModalEntity = z.infer<
  typeof InteractionCallbackModalEntity
>;

/**
 * Interaction callback autocomplete entity for responding with suggested choices
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Receiving_and_Responding.md#autocomplete}
 */
export const InteractionCallbackAutocompleteEntity = z.object({
  /** Autocomplete choices (max of 25 choices) */
  choices: z
    .lazy(() => ApplicationCommandOptionChoiceEntity)
    .array()
    .max(25),
});

export type InteractionCallbackAutocompleteEntity = z.infer<
  typeof InteractionCallbackAutocompleteEntity
>;

/**
 * Interaction response structure for responding to interactions
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Receiving_and_Responding.md#interaction-response-structure}
 */
export const InteractionResponseEntity = z.object({
  /** Type of response */
  type: z.nativeEnum(InteractionCallbackType),

  /** An optional response message */
  data: z
    .union([
      InteractionCallbackMessagesEntity,
      InteractionCallbackModalEntity,
      InteractionCallbackAutocompleteEntity,
    ])
    .optional(),
});

export type InteractionResponseEntity = z.infer<
  typeof InteractionResponseEntity
>;

/**
 * Base Interaction object structure
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Receiving_and_Responding.md#interaction-object}
 */
export const InteractionEntity = z.object({
  /** ID of the interaction */
  id: Snowflake,

  /** ID of the application this interaction is for */
  application_id: Snowflake,

  /** Type of interaction */
  type: z.nativeEnum(InteractionType),

  /** Interaction data payload */
  data: InteractionDataEntity.optional(),

  /** Continuation token for responding to the interaction */
  token: z.string(),

  /** Read-only property, always 1 */
  version: z.literal(1),

  /** Bitwise set of permissions the app has in the source location of the interaction */
  app_permissions: z.nativeEnum(BitwisePermissionFlags),

  /** Selected language of the invoking user */
  locale: z.nativeEnum(Locale).optional(),

  /** For monetized apps, any entitlements for the invoking user */
  entitlements: EntitlementEntity.array().optional(),

  /** Mapping of installation contexts that the interaction was authorized for */
  authorizing_integration_owners: z.record(z.string(), Snowflake),

  /** Context where the interaction was triggered from */
  context: z.nativeEnum(InteractionContextType).optional(),

  /** Guild ID that the interaction was sent from */
  guild_id: Snowflake.optional(),

  /** Guild that the interaction was sent from */
  guild: GuildEntity.partial().optional(),

  /** Guild member data for the invoking user */
  member: GuildMemberEntity.optional(),

  /** Channel ID that the interaction was sent from */
  channel_id: Snowflake.optional(),

  /** Channel that the interaction was sent from */
  channel: ChannelEntity.partial().optional(),

  /** Guild's preferred locale, if invoked in a guild */
  guild_locale: z.nativeEnum(Locale).optional(),

  /** For components, the message they were attached to */
  message: MessageEntity.optional(),

  /** User object for the invoking user */
  user: UserEntity.optional(),
});

export type InteractionEntity = z.infer<typeof InteractionEntity>;

/**
 * Guild-specific interaction entity
 */
export const GuildInteractionEntity = InteractionEntity.extend({
  /** Guild context identifier */
  context: z.literal(InteractionContextType.Guild),

  /** Guild ID that the interaction was sent from */
  guild_id: Snowflake,

  /** Guild that the interaction was sent from */
  guild: GuildEntity.partial(),

  /** Guild member data for the invoking user */
  member: GuildMemberEntity,

  /** Channel ID that the interaction was sent from */
  channel_id: Snowflake.optional(),

  /** Channel that the interaction was sent from */
  channel: ChannelEntity.partial().optional(),

  /** Guild's preferred locale, if invoked in a guild */
  guild_locale: z.nativeEnum(Locale).optional(),
});

export type GuildInteractionEntity = z.infer<typeof GuildInteractionEntity>;

/**
 * Bot DM-specific interaction entity
 */
export const BotDmInteractionEntity = InteractionEntity.extend({
  /** Bot DM context identifier */
  context: z.literal(InteractionContextType.BotDm),

  /** Channel ID that the interaction was sent from */
  channel_id: Snowflake,

  /** Channel that the interaction was sent from */
  channel: ChannelEntity.partial(),

  /** User object for the invoking user */
  user: UserEntity,
});

export type BotDmInteractionEntity = z.infer<typeof BotDmInteractionEntity>;

/**
 * Private channel-specific interaction entity
 */
export const PrivateChannelInteractionEntity = InteractionEntity.extend({
  /** Private channel context identifier */
  context: z.literal(InteractionContextType.PrivateChannel),

  /** Channel ID that the interaction was sent from */
  channel_id: Snowflake,

  /** Channel that the interaction was sent from */
  channel: ChannelEntity.partial(),

  /** User object for the invoking user */
  user: UserEntity,
});

export type PrivateChannelInteractionEntity = z.infer<
  typeof PrivateChannelInteractionEntity
>;

/**
 * Union of all context-specific interaction entities
 */
export const AnyInteractionEntity = z.union([
  GuildInteractionEntity,
  BotDmInteractionEntity,
  PrivateChannelInteractionEntity,
]);

export type AnyInteractionEntity = z.infer<typeof AnyInteractionEntity>;
