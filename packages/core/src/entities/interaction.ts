import type { BitwisePermissionFlags, LocaleKey } from "../enums/index.js";
import type { BitFieldResolvable, Snowflake } from "../utils/index.js";
import type {
  ApplicationCommandOptionChoiceEntity,
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from "./application-commands.js";
import type { ApplicationIntegrationType } from "./application.js";
import type { ChannelEntity } from "./channel.js";
import type { EntitlementEntity } from "./entitlement.js";
import type { GuildEntity, GuildMemberEntity } from "./guild.js";
import type {
  ActionRowEntity,
  ComponentType,
  SelectMenuOption,
} from "./message-components.js";
import type {
  AllowedMentionsEntity,
  AttachmentEntity,
  EmbedEntity,
  MessageEntity,
  MessageFlags,
} from "./message.js";
import type { PollCreateRequestEntity } from "./poll.js";
import type { RoleEntity } from "./role.js";
import type { UserEntity } from "./user.js";

/**
 * Represents the instance of an activity launched via interaction.
 *
 * @remarks
 * When an interaction launches an activity, this object contains the unique identifier
 * for that activity instance.
 *
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-callback-interaction-callback-activity-instance-resource}
 */
export interface InteractionCallbackActivityInstance {
  /** Unique instance ID of the activity */
  id: string;
}

/**
 * Represents the resource created by an interaction response.
 *
 * @remarks
 * This object contains either the created message or activity instance,
 * depending on the interaction callback type.
 *
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-callback-interaction-callback-resource-object}
 */
export interface InteractionCallbackResource {
  /** Type of callback response */
  type: InteractionCallbackType;
  /** Activity instance if one was launched */
  activity_instance?: InteractionCallbackActivityInstance;
  /** Message created by the interaction */
  message?: MessageEntity;
}

/**
 * Represents an interaction callback.
 *
 * @remarks
 * Contains information about an interaction response, including its type and
 * associated message or activity data.
 *
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-callback-interaction-callback-object}
 */
export interface InteractionCallbackEntity {
  /** ID of the interaction */
  id: Snowflake;
  /** Type of interaction */
  type: InteractionCallbackType;
  /** Instance ID of the Activity if one was launched */
  activity_instance_id?: string;
  /** ID of the message created by the interaction */
  response_message_id?: Snowflake;
  /** Whether the message is in a loading state */
  response_message_loading?: boolean;
  /** Whether the response message was ephemeral */
  response_message_ephemeral?: boolean;
}

/**
 * Represents the response to an interaction callback.
 *
 * @remarks
 * Contains both the interaction callback and optionally its associated resource.
 *
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-callback-interaction-callback-response-object}
 */
export interface InteractionCallbackResponse {
  /** The interaction callback information */
  interaction: InteractionCallbackEntity;
  /** The resource created by the interaction */
  resource?: InteractionCallbackResource;
}

/**
 * Represents a modal interaction response.
 *
 * @remarks
 * Used when responding to an interaction with a popup modal dialog.
 * Limited to text input components.
 *
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-response-object-modal}
 */
export interface InteractionCallbackModal {
  /** Developer-defined identifier for the modal, max 100 characters */
  custom_id: string;
  /** Title of the popup modal, max 45 characters */
  title: string;
  /** Between 1 and 5 components that make up the modal */
  components: ActionRowEntity[];
}

/**
 * Represents an autocomplete interaction response.
 *
 * @remarks
 * Used to provide suggestions for autocomplete interactions.
 *
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-response-object-autocomplete}
 */
export interface InteractionCallbackAutocomplete {
  /** Maximum of 25 choice objects */
  choices: ApplicationCommandOptionChoiceEntity[];
}

/**
 * Represents the message response to an interaction.
 *
 * @remarks
 * Defines the structure of a message response, including content, embeds,
 * components and other message properties.
 *
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-response-object-messages}
 */
export interface InteractionCallbackMessages {
  /** Whether the response is TTS */
  tts?: boolean;
  /** Message content */
  content?: string;
  /** Up to 10 rich embeds */
  embeds?: EmbedEntity[];
  /** Allowed mentions object */
  allowed_mentions?: AllowedMentionsEntity;
  /** Message flags combined as a bitfield */
  flags?: BitFieldResolvable<MessageFlags>;
  /** Message components */
  components?: ActionRowEntity[];
  /** Message attachments */
  attachments?: Partial<AttachmentEntity>;
  /** Poll create request */
  poll?: PollCreateRequestEntity;
}

/**
 * Represents the different types of interaction callbacks.
 *
 * @remarks
 * Defines how the application will respond to an interaction.
 *
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-response-object-interaction-callback-type}
 */
export enum InteractionCallbackType {
  /** ACK a Ping */
  Pong = 1,
  /** Respond with a message */
  ChannelMessageWithSource = 4,
  /** ACK an interaction and edit response later (user sees loading) */
  DeferredChannelMessageWithSource = 5,
  /** For components, ACK an interaction and edit original message later */
  DeferredUpdateMessage = 6,
  /** For components, edit the message the component was attached to */
  UpdateMessage = 7,
  /** Respond to an autocomplete interaction with suggested choices */
  ApplicationCommandAutocompleteResult = 8,
  /** Respond with a popup modal */
  Modal = 9,
  /** Respond with an upgrade button */
  PremiumRequired = 10,
  /** Launch the Activity associated with the app */
  LaunchActivity = 12,
}

/**
 * Represents the structure of an interaction response.
 *
 * @remarks
 * The base structure for all interaction responses.
 *
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-response-object-interaction-response-structure}
 */
export interface InteractionCallbackResponseEntity {
  /** Type of the response */
  type: InteractionCallbackType;
  /** Optional response data */
  data?: InteractionCallbackMessages;
}

/**
 * Represents a message interaction.
 *
 * @remarks
 * Contains information about the interaction that triggered a message response.
 *
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#message-interaction-object-message-interaction-structure}
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
 * Represents an application command interaction data option.
 *
 * @remarks
 * Contains the values and options provided by the user when using an application command.
 *
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-application-command-interaction-data-option-structure}
 */
export interface ApplicationCommandInteractionDataOptionEntity {
  /** Name of the parameter */
  name: string;
  /** Value of application command option type */
  type: ApplicationCommandOptionType;
  /** Value of the option resulting from user input */
  value?: string | number | boolean;
  /** Present if this option is a group or subcommand */
  options?: ApplicationCommandInteractionDataOptionEntity[];
  /** True if this option is the currently focused option for autocomplete */
  focused?: boolean;
}

/**
 * Represents resolved data in an interaction.
 *
 * @remarks
 * Contains resolved objects for users, members, roles, channels and messages
 * referenced in the interaction.
 *
 * @example
 * ```typescript
 * // Resolved data in a user command interaction
 * const resolved: InteractionResolvedData = {
 *   users: new Map([["123", { id: "123", username: "Example" }]]),
 *   members: new Map([["123", { nick: "Nick" }]])
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-resolved-data-structure}
 */
export interface InteractionResolvedData {
  /** Resolved users */
  users?: Map<Snowflake, UserEntity>;
  /** Resolved partial guild members */
  members?: Map<Snowflake, Omit<GuildMemberEntity, "user" | "deaf" | "mute">>;
  /** Resolved roles */
  roles?: Map<Snowflake, RoleEntity>;
  /** Resolved partial channels */
  channels?: Map<
    Snowflake,
    Pick<
      ChannelEntity,
      "id" | "name" | "type" | "permissions" | "thread_metadata" | "parent_id"
    >
  >;
  /** Resolved partial messages */
  messages?: Map<Snowflake, Partial<MessageEntity>>;
  /** Resolved attachments */
  attachments?: Map<Snowflake, AttachmentEntity>;
}

/**
 * Represents data submitted through a modal interaction.
 *
 * @remarks
 * Contains the custom ID and components with values submitted through a modal.
 *
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-modal-submit-data-structure}
 */
export interface InteractionModalSubmitData {
  /** Custom ID of the modal */
  custom_id: string;
  /** Components submitted with the modal */
  components: ActionRowEntity[];
}

/**
 * Represents data from a message component interaction.
 *
 * @remarks
 * Contains information about the component that was interacted with.
 *
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-message-component-data-structure}
 */
export interface InteractionMessageComponentData {
  /** Custom ID of the component */
  custom_id: string;
  /** Type of the component */
  component_type: ComponentType;
  /** Values selected in a select menu component */
  values?: SelectMenuOption[];
  /** Resolved entities from the interaction */
  resolved?: InteractionResolvedData;
}

/**
 * Represents data from an application command interaction.
 *
 * @remarks
 * Contains information about the command that was used and its options.
 *
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-application-command-data-structure}
 */
export interface ApplicationCommandInteractionData {
  /** ID of the invoked command */
  id: Snowflake;
  /** Name of the invoked command */
  name: string;
  /** Type of the invoked command */
  type: ApplicationCommandType;
  /** Converted users, roles and channels */
  resolved?: InteractionResolvedData;
  /** Parameters and values from the user */
  options?: ApplicationCommandInteractionDataOptionEntity[];
  /** ID of the guild the command is registered to */
  guild_id?: Snowflake;
  /** ID for the target of a context menu command */
  target_id?: Snowflake;
}

/**
 * Represents the context types for interactions.
 *
 * @remarks
 * Defines where an interaction can be used.
 *
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-context-types}
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
 * Represents the types of interactions.
 *
 * @remarks
 * Defines the different kinds of interactions that can occur.
 *
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-type}
 */
export enum InteractionType {
  /** Ping interaction */
  Ping = 1,
  /** Application command interaction */
  ApplicationCommand = 2,
  /** Message component interaction */
  MessageComponent = 3,
  /** Application command autocomplete interaction */
  ApplicationCommandAutocomplete = 4,
  /** Modal submit interaction */
  ModalSubmit = 5,
}

/**
 * Represents an interaction with a Discord application.
 *
 * @remarks
 * The base interaction object that contains all information about an interaction event.
 * This includes the type of interaction, user information, and any associated data.
 *
 * @example
 * ```typescript
 * const interaction: InteractionEntity = {
 *   id: "123456789",
 *   application_id: "987654321",
 *   type: InteractionType.ApplicationCommand,
 *   token: "unique-token",
 *   version: 1
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-structure}
 */
export interface InteractionEntity {
  /** ID of the interaction */
  id: Snowflake;
  /** ID of the application this interaction is for */
  application_id: Snowflake;
  /** Type of interaction */
  type: InteractionType;
  /** Interaction data payload */
  data?: ApplicationCommandInteractionData | InteractionMessageComponentData;
  /** Guild that the interaction was sent from */
  guild?: Partial<GuildEntity>;
  /** ID of the guild the interaction was sent from */
  guild_id?: Snowflake;
  /** Channel that the interaction was sent from */
  channel?: Partial<ChannelEntity>;
  /** ID of the channel the interaction was sent from */
  channel_id?: Snowflake;
  /** Guild member data for the invoking user */
  member?: GuildMemberEntity;
  /** User object for the invoking user, if invoked in a DM */
  user?: UserEntity;
  /** Continuation token for responding to the interaction */
  token: string;
  /** Read-only property, always 1 */
  version: 1;
  /** For components, the message they were attached to */
  message?: MessageEntity;
  /** Bitwise set of permissions the app has in the source location of the interaction */
  app_permissions: BitFieldResolvable<BitwisePermissionFlags>;
  /** Selected language of the invoking user */
  locale?: LocaleKey;
  /** Guild's preferred locale */
  guild_locale?: LocaleKey;
  /** For monetized apps, any entitlements for the invoking user */
  entitlements: EntitlementEntity[];
  /** Mapping of installation contexts that the interaction was authorized for to related user or guild IDs */
  authorizing_integration_owners: Record<ApplicationIntegrationType, Snowflake>;
  /** Context where the interaction was triggered from */
  context?: InteractionContextType;
}
