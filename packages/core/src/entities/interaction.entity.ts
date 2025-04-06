import type { Locale } from "../enums/index.js";
import type { Snowflake } from "../managers/index.js";
import type { ApplicationIntegrationType } from "./application.entity.js";
import type {
  ApplicationCommandOptionChoiceEntity,
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from "./application-commands.entity.js";
import type { AnyChannelEntity } from "./channel.entity.js";
import type { EntitlementEntity } from "./entitlement.entity.js";
import type { GuildEntity, GuildMemberEntity } from "./guild.entity.js";
import type {
  AllowedMentionsEntity,
  AttachmentEntity,
  EmbedEntity,
  MessageEntity,
  MessageFlags,
} from "./message.entity.js";
import type {
  ActionRowEntity,
  ComponentType,
  SelectMenuOptionEntity,
} from "./message-components.entity.js";
import type { PollCreateRequestEntity } from "./poll.entity.js";
import type { RoleEntity } from "./role.entity.js";
import type { UserEntity } from "./user.entity.js";

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
export interface InteractionCallbackActivityInstanceEntity {
  /** Instance ID of the Activity */
  id: string;
}

/**
 * Comprehensive command option entity with all possible properties
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Receiving_and_Responding.md}
 */
export interface CommandOptionEntity {
  /** Name of the parameter */
  name: string;

  /** Type of the option */
  type: ApplicationCommandOptionType;

  /** Value of the option resulting from user input */
  value?: string | number | boolean;

  /** Options for this option (for subcommands and groups) */
  options?: CommandOptionEntity[];

  /** True if this option is the currently focused option for autocomplete */
  focused?: boolean;
}

/**
 * Simple option for basic command parameters
 */
export interface AnySimpleCommandOptionEntity
  extends Omit<CommandOptionEntity, "options" | "type" | "value"> {
  /** Role option type */
  type:
    | ApplicationCommandOptionType.String
    | ApplicationCommandOptionType.Number
    | ApplicationCommandOptionType.Integer
    | ApplicationCommandOptionType.Boolean
    | ApplicationCommandOptionType.User
    | ApplicationCommandOptionType.Channel
    | ApplicationCommandOptionType.Role
    | ApplicationCommandOptionType.Mentionable
    | ApplicationCommandOptionType.Attachment;

  /** Value of the option resulting from user input */
  value: string | number | boolean;
}

/**
 * SubCommand option
 */
export interface SubCommandOptionEntity
  extends Omit<CommandOptionEntity, "value" | "focused" | "type"> {
  /** SubCommand option type */
  type: ApplicationCommandOptionType.SubCommand;

  /** Options for this subcommand */
  options?: AnySimpleCommandOptionEntity[];
}

/**
 * SubCommandGroup option
 */
export interface SubCommandGroupOptionEntity
  extends Omit<CommandOptionEntity, "value" | "focused" | "type"> {
  /** SubCommandGroup option type */
  type: ApplicationCommandOptionType.SubCommandGroup;

  /** SubCommand options for this group */
  options: SubCommandOptionEntity[];
}

/**
 * Union of all command options
 */
export type AnyCommandOptionEntity =
  | SubCommandOptionEntity
  | SubCommandGroupOptionEntity
  | AnySimpleCommandOptionEntity;

/**
 * Resolved data structure containing detailed Discord objects from an interaction
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Receiving_and_Responding.md#resolved-data-structure}
 */
export interface InteractionResolvedDataEntity {
  /** Map of user IDs to user objects */
  users?: Record<Snowflake, UserEntity>;

  /** Map of user IDs to partial member objects (missing user, deaf, and mute fields) */
  members?: Record<
    Snowflake,
    Omit<GuildMemberEntity, "user" | "deaf" | "mute">
  >;

  /** Map of role IDs to role objects */
  roles?: Record<Snowflake, RoleEntity>;

  /** Map of channel IDs to partial channel objects */
  channels?: Record<Snowflake, Partial<AnyChannelEntity>>;

  /** Map of message IDs to partial message objects */
  messages?: Record<Snowflake, Partial<MessageEntity>>;

  /** Map of attachment IDs to attachment objects */
  attachments?: Record<Snowflake, AttachmentEntity>;
}

/**
 * Application command interaction data structure
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Receiving_and_Responding.md#application-command-data-structure}
 */
export interface ApplicationCommandInteractionDataEntity {
  /** ID of the invoked command */
  id: Snowflake;

  /** Name of the invoked command */
  name: string;

  /** Type of the invoked command */
  type: ApplicationCommandType;

  /** Converted users + roles + channels + attachments */
  resolved?: InteractionResolvedDataEntity;

  /** Parameters and values from the user */
  options?: AnyCommandOptionEntity[];

  /** ID of the guild the command is registered to */
  guild_id?: Snowflake;

  /** ID of the user or message targeted by a user or message command */
  target_id?: Snowflake;
}

/**
 * Message component interaction data structure
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Receiving_and_Responding.md#message-component-data-structure}
 */
export interface MessageComponentInteractionDataEntity {
  /** Developer-defined identifier for the component */
  custom_id: string;

  /** Type of component */
  component_type: ComponentType;

  /** Values selected by the user (for select menu components) */
  values?: SelectMenuOptionEntity[];

  /** Resolved entities from selected options */
  resolved?: InteractionResolvedDataEntity;
}

/**
 * Modal submit interaction data structure
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Receiving_and_Responding.md#modal-submit-data-structure}
 */
export interface ModalSubmitInteractionDataEntity {
  /** Developer-defined identifier for the modal */
  custom_id: string;

  /** Components submitted with the modal */
  components: ActionRowEntity[];
}

/**
 * Union of all interaction data types
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Receiving_and_Responding.md#interaction-object-interaction-data}
 */
export type InteractionDataEntity =
  | ApplicationCommandInteractionDataEntity
  | MessageComponentInteractionDataEntity
  | ModalSubmitInteractionDataEntity;

/**
 * Message interaction structure sent on message objects when responding to an interaction
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Receiving_and_Responding.md#message-interaction-structure}
 */
export interface MessageInteractionEntity {
  /** ID of the interaction */
  id: Snowflake;

  /** Type of interaction */
  type: InteractionType;

  /** Name of the application command */
  name: string;

  /** User who invoked the interaction */
  user: UserEntity;

  /** Member who invoked the interaction in the guild */
  member?: Partial<GuildMemberEntity>;
}

/**
 * Interaction callback object containing information about the interaction response
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Receiving_and_Responding.md#interaction-callback-interaction-callback-object}
 */
export interface InteractionCallbackEntity {
  /** ID of the interaction */
  id: Snowflake;

  /** Type of interaction */
  type: InteractionType;

  /** Instance ID of the Activity if one was launched or joined */
  activity_instance_id?: string;

  /** ID of the message that was created by the interaction */
  response_message_id?: Snowflake;

  /** Whether or not the message is in a loading state */
  response_message_loading?: boolean;

  /** Whether or not the response message was ephemeral */
  response_message_ephemeral?: boolean;
}

/**
 * Interaction callback resource object containing the response data
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Receiving_and_Responding.md#interaction-callback-resource-object}
 */
export interface InteractionCallbackResourceEntity {
  /** Interaction callback type */
  type: InteractionCallbackType;

  /** Activity instance information when launching an activity */
  activity_instance?: InteractionCallbackActivityInstanceEntity;

  /** Message created by the interaction */
  message?: MessageEntity;
}

/**
 * Interaction callback response object
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Receiving_and_Responding.md#interaction-callback-response-object}
 */
export interface InteractionCallbackResponseEntity {
  /** The interaction object associated with the interaction response */
  interaction: InteractionCallbackEntity;

  /** The resource that was created by the interaction response */
  resource?: InteractionCallbackResourceEntity;
}

/**
 * Interaction callback message entity for sending message responses
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Receiving_and_Responding.md#interaction-response-object-messages}
 */
export interface InteractionCallbackMessagesEntity {
  /** Whether the response is TTS */
  tts?: boolean;

  /** Message content */
  content?: string;

  /**
   * Supports up to 10 embeds
   * @maxItems 10
   */
  embeds?: EmbedEntity[];

  /** Allowed mentions object */
  allowed_mentions?: AllowedMentionsEntity;

  /** Message flags combined as a bitfield (only SUPPRESS_EMBEDS, EPHEMERAL, and SUPPRESS_NOTIFICATIONS can be set) */
  flags?:
    | MessageFlags.SuppressEmbeds
    | MessageFlags.Ephemeral
    | MessageFlags.SuppressNotifications;

  /** Message components */
  components?: ActionRowEntity[];

  /** Attachment objects with filename and description */
  attachments?: AttachmentEntity[];

  /** Details about the poll */
  poll?: PollCreateRequestEntity;
}

/**
 * Interaction callback modal entity for responding with a popup modal
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Receiving_and_Responding.md#modal}
 */
export interface InteractionCallbackModalEntity {
  /**
   * Developer-defined identifier for the modal
   * @maxLength 100
   */
  custom_id: string;

  /**
   * Title of the popup modal
   * @maxLength 45
   */
  title: string;

  /**
   * Between 1 and 5 (inclusive) components that make up the modal
   * @minItems 1
   * @maxItems 5
   */
  components: ActionRowEntity[];
}

/**
 * Interaction callback autocomplete entity for responding with suggested choices
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Receiving_and_Responding.md#autocomplete}
 */
export interface InteractionCallbackAutocompleteEntity {
  /**
   * Autocomplete choices
   * @maxItems 25
   */
  choices: ApplicationCommandOptionChoiceEntity[];
}

/**
 * Interaction response structure for responding to interactions
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Receiving_and_Responding.md#interaction-response-structure}
 */
export interface InteractionResponseEntity {
  /** Type of response */
  type: InteractionCallbackType;

  /** An optional response message */
  data?:
    | InteractionCallbackAutocompleteEntity
    | InteractionCallbackModalEntity
    | InteractionCallbackMessagesEntity;
}

/**
 * Complete Interaction object structure with all possible properties
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/Receiving_and_Responding.md#interaction-object}
 */
export interface InteractionEntity {
  /** ID of the interaction */
  id: Snowflake;

  /** ID of the application this interaction is for */
  application_id: Snowflake;

  /** Type of interaction */
  type: InteractionType;

  /** Interaction data payload */
  data?: InteractionDataEntity;

  /** Guild that the interaction was sent from */
  guild?: Partial<GuildEntity>;

  /** Guild ID that the interaction was sent from */
  guild_id?: Snowflake;

  /** Channel that the interaction was sent from */
  channel?: Partial<AnyChannelEntity>;

  /** Channel ID that the interaction was sent from */
  channel_id?: Snowflake;

  /** Guild member data for the invoking user, including permissions */
  member?: GuildMemberEntity;

  /** User object for the invoking user, if invoked in a DM */
  user?: UserEntity;

  /** Continuation token for responding to the interaction */
  token: string;

  /** Read-only property, always 1 */
  version: number;

  /** For components, the message they were attached to */
  message?: MessageEntity;

  /** Bitwise set of permissions the app has in the source location of the interaction */
  app_permissions: string;

  /** Selected language of the invoking user */
  locale?: Locale;

  /** Guild's preferred locale, if invoked in a guild */
  guild_locale?: Locale;

  /** For monetized apps, any entitlements for the invoking user */
  entitlements: EntitlementEntity[];

  /** Mapping of installation contexts that the interaction was authorized for */
  authorizing_integration_owners: Record<
    ApplicationIntegrationType,
    Snowflake | "0"
  >;

  /** Context where the interaction was triggered from */
  context?: InteractionContextType;
}

/**
 * Guild-specific interaction entity
 */
export interface GuildInteractionEntity
  extends Omit<
    InteractionEntity,
    "guild" | "guild_id" | "member" | "guild_locale" | "context"
  > {
  /** Guild context identifier */
  context: InteractionContextType.Guild;

  /** Guild ID that the interaction was sent from */
  guild_id: Snowflake;

  /** Guild that the interaction was sent from */
  guild: Partial<GuildEntity>;

  /** Guild member data for the invoking user */
  member: GuildMemberEntity;

  /** Guild's preferred locale, if invoked in a guild */
  guild_locale?: Locale;
}

/**
 * Bot DM-specific interaction entity
 */
export interface BotDmInteractionEntity
  extends Omit<
    InteractionEntity,
    | "guild"
    | "guild_id"
    | "guild_locale"
    | "member"
    | "channel"
    | "channel_id"
    | "user"
    | "context"
  > {
  /** Bot DM context identifier */
  context: InteractionContextType.BotDm;

  /** Channel ID that the interaction was sent from */
  channel_id: Snowflake;

  /** Channel that the interaction was sent from */
  channel: Partial<AnyChannelEntity>;

  /** User object for the invoking user */
  user: UserEntity;
}

/**
 * Private channel-specific interaction entity
 */
export interface PrivateChannelInteractionEntity
  extends Omit<
    InteractionEntity,
    | "guild"
    | "guild_id"
    | "guild_locale"
    | "member"
    | "channel"
    | "channel_id"
    | "user"
    | "context"
  > {
  /** Private channel context identifier */
  context: InteractionContextType.PrivateChannel;

  /** Channel ID that the interaction was sent from */
  channel_id: Snowflake;

  /** Channel that the interaction was sent from */
  channel: Partial<AnyChannelEntity>;

  /** User object for the invoking user */
  user: UserEntity;
}

/**
 * Union of all context-specific interaction entities
 */
export type AnyInteractionEntity =
  | GuildInteractionEntity
  | BotDmInteractionEntity
  | PrivateChannelInteractionEntity;
