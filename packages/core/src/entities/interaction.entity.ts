import type { Locale } from "../enums/index.js";
import type { Snowflake } from "../markdown/index.js";
import type {
  ApplicationCommandOptionChoiceEntity,
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from "./application-commands.entity.js";
import type { ApplicationIntegrationType } from "./application.entity.js";
import type { AnyChannelEntity } from "./channel.entity.js";
import type { EntitlementEntity } from "./entitlement.entity.js";
import type { GuildEntity, GuildMemberEntity } from "./guild.entity.js";
import type {
  ActionRowEntity,
  ComponentType,
  SelectMenuOptionEntity,
} from "./message-components.entity.js";
import type {
  AllowedMentionsEntity,
  AttachmentEntity,
  EmbedEntity,
  MessageEntity,
  MessageFlags,
} from "./message.entity.js";
import type { PollCreateRequestEntity } from "./poll.entity.js";
import type { RoleEntity } from "./role.entity.js";
import type { UserEntity } from "./user.entity.js";

/**
 * Types of interactions that can be received from Discord.
 * An interaction is the message Discord sends when a user uses an application command or a message component.
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-type}
 */
export enum InteractionType {
  /**
   * Server is testing if the interaction endpoint is available.
   * Used during the initial webhook handshake process.
   */
  Ping = 1,

  /**
   * User has used an application command.
   * Represents Slash Commands, User Commands, or Message Commands.
   */
  ApplicationCommand = 2,

  /**
   * User has used a message component like a button or select menu.
   * Triggered when a user interacts with UI components attached to messages.
   */
  MessageComponent = 3,

  /**
   * User is typing in an application command option that has autocomplete.
   * Sent when a user begins typing in an option with autocomplete enabled.
   */
  ApplicationCommandAutocomplete = 4,

  /**
   * User has submitted a modal.
   * Triggered when a user submits a popup form/modal.
   */
  ModalSubmit = 5,
}

/**
 * Types of responses that can be sent back when responding to an interaction.
 * Each type represents a different way to respond to a user's interaction.
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-response-object-interaction-callback-type}
 */
export enum InteractionCallbackType {
  /**
   * ACK a Ping.
   * Used to acknowledge a ping interaction during the webhook handshake.
   */
  Pong = 1,

  /**
   * Respond to an interaction with a message.
   * Creates a new message as a response to the interaction.
   */
  ChannelMessageWithSource = 4,

  /**
   * ACK an interaction and edit a response later, the user sees a loading state.
   * Acknowledges the interaction and shows a loading state until you edit it later.
   */
  DeferredChannelMessageWithSource = 5,

  /**
   * For components, ACK an interaction and edit the original message later.
   * The user does not see a loading state.
   */
  DeferredUpdateMessage = 6,

  /**
   * For components, edit the message the component was attached to.
   * Updates the message where the component was used.
   */
  UpdateMessage = 7,

  /**
   * Respond to an autocomplete interaction with suggested choices.
   * Provides autocomplete suggestions as the user types.
   */
  ApplicationCommandAutocompleteResult = 8,

  /**
   * Respond to an interaction with a popup modal.
   * Displays a form dialog in response to the interaction.
   */
  Modal = 9,

  /**
   * Respond to an interaction with an upgrade button.
   * Only available for apps with monetization enabled.
   * @deprecated Use deep linking URL schemes instead
   */
  PremiumRequired = 10,

  /**
   * Launch the Activity associated with the app.
   * Only available for apps with Activities enabled.
   */
  LaunchActivity = 12,
}

/**
 * Context in Discord where an interaction can be used or was triggered from.
 * Defines the source environment of an interaction within Discord.
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-context-types}
 */
export enum InteractionContextType {
  /**
   * Interaction can be used within servers.
   * Commands and components usable in guild channels.
   */
  Guild = 0,

  /**
   * Interaction can be used within DMs with the app's bot user.
   * Commands and components usable in direct messages with the application's bot.
   */
  BotDm = 1,

  /**
   * Interaction can be used within Group DMs and DMs other than the app's bot user.
   * Commands and components usable in non-bot DMs and group conversations.
   */
  PrivateChannel = 2,
}

/**
 * Represents an Activity Instance resource for interaction callbacks.
 * Contains information about an activity that was launched or joined.
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-callback-interaction-callback-activity-instance-resource}
 */
export interface InteractionCallbackActivityInstanceEntity {
  /**
   * Instance ID of the Activity.
   * Unique identifier for the specific activity instance.
   */
  id: string;
}

/**
 * Base structure for all interaction command options.
 * Contains common fields shared across all option types.
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-application-command-interaction-data-option-structure}
 */
export interface InteractionCommandOptionEntity {
  /**
   * Name of the parameter.
   * The identifier for this option as defined in the command.
   */
  name: string;

  /**
   * Type of the option.
   * Determines what kind of option this is (string, integer, subcommand, etc.).
   */
  type: ApplicationCommandOptionType;

  /**
   * Value of the option resulting from user input.
   * The value provided by the user for this option.
   * Present for simple types but not for subcommands or groups.
   */
  value?: string | number | boolean;

  /**
   * Options for this option (for subcommands and groups).
   * For subcommand and subcommand group types, contains nested options.
   * Not present for simple option types.
   */
  options?: InteractionCommandOptionEntity[];

  /**
   * True if this option is the currently focused option for autocomplete.
   * Indicates which option the user is currently typing in for autocomplete interactions.
   * Only present in APPLICATION_COMMAND_AUTOCOMPLETE interactions.
   */
  focused?: boolean;
}

/**
 * String option for interaction commands.
 * Used for text input parameters.
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-application-command-interaction-data-option-structure}
 */
export interface StringInteractionCommandOptionEntity
  extends Omit<InteractionCommandOptionEntity, "options" | "value"> {
  /**
   * String option type.
   * Identifies this as a string parameter.
   */
  type: ApplicationCommandOptionType.String;

  /**
   * Value of the string option provided by the user.
   * The text input from the user.
   */
  value: string;
}

/**
 * Integer option for interaction commands.
 * Used for whole number input parameters.
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-application-command-interaction-data-option-structure}
 */
export interface IntegerInteractionCommandOptionEntity
  extends Omit<InteractionCommandOptionEntity, "options" | "value"> {
  /**
   * Integer option type.
   * Identifies this as an integer parameter.
   */
  type: ApplicationCommandOptionType.Integer;

  /**
   * Value of the integer option provided by the user.
   * The whole number input from the user.
   */
  value: number;
}

/**
 * Number option for interaction commands.
 * Used for decimal number input parameters.
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-application-command-interaction-data-option-structure}
 */
export interface NumberInteractionCommandOptionEntity
  extends Omit<InteractionCommandOptionEntity, "options" | "value"> {
  /**
   * Number option type.
   * Identifies this as a decimal number parameter.
   */
  type: ApplicationCommandOptionType.Number;

  /**
   * Value of the number option provided by the user.
   * The decimal number input from the user.
   */
  value: number;
}

/**
 * Boolean option for interaction commands.
 * Used for true/false input parameters.
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-application-command-interaction-data-option-structure}
 */
export interface BooleanInteractionCommandOptionEntity
  extends Omit<InteractionCommandOptionEntity, "options" | "value"> {
  /**
   * Boolean option type.
   * Identifies this as a boolean parameter.
   */
  type: ApplicationCommandOptionType.Boolean;

  /**
   * Value of the boolean option provided by the user.
   * The true/false input from the user.
   */
  value: boolean;
}

/**
 * User option for interaction commands.
 * Used for user mention parameters.
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-application-command-interaction-data-option-structure}
 */
export interface UserInteractionCommandOptionEntity
  extends Omit<InteractionCommandOptionEntity, "options" | "value"> {
  /**
   * User option type.
   * Identifies this as a user parameter.
   */
  type: ApplicationCommandOptionType.User;

  /**
   * Value of the user option provided by the user.
   * The user ID selected by the user.
   */
  value: string;
}

/**
 * Channel option for interaction commands.
 * Used for channel mention parameters.
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-application-command-interaction-data-option-structure}
 */
export interface ChannelInteractionCommandOptionEntity
  extends Omit<InteractionCommandOptionEntity, "options" | "value"> {
  /**
   * Channel option type.
   * Identifies this as a channel parameter.
   */
  type: ApplicationCommandOptionType.Channel;

  /**
   * Value of the channel option provided by the user.
   * The channel ID selected by the user.
   */
  value: string;
}

/**
 * Role option for interaction commands.
 * Used for role mention parameters.
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-application-command-interaction-data-option-structure}
 */
export interface RoleInteractionCommandOptionEntity
  extends Omit<InteractionCommandOptionEntity, "options" | "value"> {
  /**
   * Role option type.
   * Identifies this as a role parameter.
   */
  type: ApplicationCommandOptionType.Role;

  /**
   * Value of the role option provided by the user.
   * The role ID selected by the user.
   */
  value: string;
}

/**
 * Mentionable option for interaction commands.
 * Used for parameters that can be either users or roles.
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-application-command-interaction-data-option-structure}
 */
export interface MentionableInteractionCommandOptionEntity
  extends Omit<InteractionCommandOptionEntity, "options" | "value"> {
  /**
   * Mentionable option type.
   * Identifies this as a mentionable parameter.
   */
  type: ApplicationCommandOptionType.Mentionable;

  /**
   * Value of the mentionable option provided by the user.
   * The user or role ID selected by the user.
   */
  value: string;
}

/**
 * Attachment option for interaction commands.
 * Used for file upload parameters.
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-application-command-interaction-data-option-structure}
 */
export interface AttachmentInteractionCommandOptionEntity
  extends Omit<InteractionCommandOptionEntity, "options" | "value"> {
  /**
   * Attachment option type.
   * Identifies this as an attachment parameter.
   */
  type: ApplicationCommandOptionType.Attachment;

  /**
   * Value of the attachment option provided by the user.
   * The attachment ID provided by the user.
   */
  value: string;
}

/**
 * Union of all simple interaction command options.
 * A type that can be any of the non-container option types.
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-application-command-interaction-data-option-structure}
 */
export type AnySimpleInteractionCommandOptionEntity =
  | StringInteractionCommandOptionEntity
  | IntegerInteractionCommandOptionEntity
  | NumberInteractionCommandOptionEntity
  | BooleanInteractionCommandOptionEntity
  | UserInteractionCommandOptionEntity
  | ChannelInteractionCommandOptionEntity
  | RoleInteractionCommandOptionEntity
  | MentionableInteractionCommandOptionEntity
  | AttachmentInteractionCommandOptionEntity;

/**
 * SubCommand option structure.
 * Represents a subcommand within an application command.
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-application-command-interaction-data-option-structure}
 */
export interface SubCommandInteractionOptionEntity
  extends Omit<InteractionCommandOptionEntity, "value" | "focused"> {
  /**
   * SubCommand option type.
   * Identifies this option as a subcommand.
   */
  type: ApplicationCommandOptionType.SubCommand;

  /**
   * Options for this subcommand.
   * Parameters within this subcommand.
   */
  options?: AnySimpleInteractionCommandOptionEntity[];
}

/**
 * SubCommandGroup option structure.
 * Represents a group of related subcommands.
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-application-command-interaction-data-option-structure}
 */
export interface SubCommandGroupInteractionOptionEntity
  extends Omit<InteractionCommandOptionEntity, "value" | "focused"> {
  /**
   * SubCommandGroup option type.
   * Identifies this option as a subcommand group.
   */
  type: ApplicationCommandOptionType.SubCommandGroup;

  /**
   * SubCommand options for this group.
   * Subcommands contained within this group.
   */
  options: SubCommandInteractionOptionEntity[];
}

/**
 * Union of all interaction command options.
 * A type that can be any of the possible command option types.
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-application-command-interaction-data-option-structure}
 */
export type AnyInteractionCommandOptionEntity =
  | AnySimpleInteractionCommandOptionEntity
  | SubCommandInteractionOptionEntity
  | SubCommandGroupInteractionOptionEntity;

/**
 * Resolved data structure containing detailed Discord objects from an interaction.
 * Contains the full objects for IDs mentioned or referenced in the interaction.
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-resolved-data-structure}
 */
export interface InteractionResolvedDataEntity {
  /**
   * Map of user IDs to user objects.
   * Contains user data for users referenced in the interaction.
   */
  users?: Record<Snowflake, UserEntity>;

  /**
   * Map of user IDs to partial member objects (missing user, deaf, and mute fields).
   * Contains guild member data for users referenced in the interaction.
   */
  members?: Record<
    Snowflake,
    Omit<GuildMemberEntity, "user" | "deaf" | "mute">
  >;

  /**
   * Map of role IDs to role objects.
   * Contains role data for roles referenced in the interaction.
   */
  roles?: Record<Snowflake, RoleEntity>;

  /**
   * Map of channel IDs to partial channel objects.
   * Contains channel data for channels referenced in the interaction.
   */
  channels?: Record<Snowflake, Partial<AnyChannelEntity>>;

  /**
   * Map of attachment IDs to attachment objects.
   * Contains attachment data for attachments referenced in the interaction.
   */
  attachments?: Record<Snowflake, AttachmentEntity>;

  /**
   * Map of message IDs to message objects.
   * Contains message data for messages referenced in the interaction.
   */
  messages?: Record<Snowflake, Partial<MessageEntity>>;
}

/**
 * Application command interaction data structure.
 * Contains details about an application command that was used.
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-application-command-data-structure}
 */
export interface ApplicationCommandInteractionDataEntity {
  /**
   * ID of the invoked command.
   * Unique identifier for the command that was triggered.
   */
  id: Snowflake;

  /**
   * Name of the invoked command.
   * The registered name of the command that was used.
   */
  name: string;

  /**
   * Type of the invoked command.
   * Whether this is a chat input, user, or message command.
   */
  type: ApplicationCommandType;

  /**
   * Converted users + roles + channels + attachments.
   * Resolved objects for any IDs passed in the interaction.
   */
  resolved?: InteractionResolvedDataEntity;

  /**
   * Parameters and values from the user.
   * Options and values that the user provided when using the command.
   */
  options?: AnyInteractionCommandOptionEntity[];

  /**
   * ID of the guild the command is registered to.
   * The guild where this command is available, if command is guild-specific.
   */
  guild_id?: Snowflake;

  /**
   * ID of the user or message targeted by a user or message command.
   * The specific user or message this command targeted (for user/message commands).
   */
  target_id?: Snowflake;
}

/**
 * Message component interaction data structure.
 * Contains details about a component interaction like button presses or select menu choices.
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-message-component-data-structure}
 */
export interface MessageComponentInteractionDataEntity {
  /**
   * Developer-defined identifier for the component.
   * The custom_id value specified when creating the component.
   */
  custom_id: string;

  /**
   * Type of component.
   * Identifies what kind of component triggered this interaction.
   */
  component_type: ComponentType;

  /**
   * Values selected by the user (for select menu components).
   * Array of selected options for select menu interactions.
   */
  values?: SelectMenuOptionEntity[];

  /**
   * Resolved entities from selected options.
   * Full objects for any referenced IDs in select menu options.
   */
  resolved?: InteractionResolvedDataEntity;
}

/**
 * Modal submit interaction data structure.
 * Contains the values submitted through a modal form.
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-modal-submit-data-structure}
 */
export interface ModalSubmitInteractionDataEntity {
  /**
   * Developer-defined identifier for the modal.
   * The custom_id value specified when creating the modal.
   */
  custom_id: string;

  /**
   * Components submitted with the modal.
   * Array of components containing the values submitted by the user.
   */
  components: ActionRowEntity[];
}

/**
 * Union of all interaction data types.
 * A type that can be any of the possible interaction data structures.
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-data}
 */
export type InteractionDataEntity =
  | ApplicationCommandInteractionDataEntity
  | MessageComponentInteractionDataEntity
  | ModalSubmitInteractionDataEntity;

/**
 * Message interaction structure sent on message objects when responding to an interaction.
 * Information about the interaction that a message is responding to.
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#message-interaction-structure}
 */
export interface MessageInteractionEntity {
  /**
   * ID of the interaction.
   * Unique identifier for the interaction this message is responding to.
   */
  id: Snowflake;

  /**
   * Type of interaction.
   * The kind of interaction that generated this message.
   */
  type: InteractionType;

  /**
   * Name of the application command.
   * The command name including subcommands and subcommand groups.
   */
  name: string;

  /**
   * User who invoked the interaction.
   * Information about the user who triggered the interaction.
   */
  user: UserEntity;

  /**
   * Member who invoked the interaction in the guild.
   * Guild-specific information about the user who triggered the interaction.
   */
  member?: Partial<GuildMemberEntity>;
}

/**
 * Interaction callback object containing information about the interaction response.
 * Metadata about a response sent to an interaction.
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-callback-interaction-callback-object}
 */
export interface InteractionCallbackEntity {
  /**
   * ID of the interaction.
   * Unique identifier for the interaction this is a callback for.
   */
  id: Snowflake;

  /**
   * Type of interaction.
   * The kind of interaction this callback is responding to.
   */
  type: InteractionType;

  /**
   * Instance ID of the Activity if one was launched or joined.
   * Identifier for an activity instance created by this interaction.
   */
  activity_instance_id?: string;

  /**
   * ID of the message that was created by the interaction.
   * Unique identifier for the response message.
   */
  response_message_id?: Snowflake;

  /**
   * Whether or not the message is in a loading state.
   * Indicates if the response is showing a loading indicator.
   */
  response_message_loading?: boolean;

  /**
   * Whether or not the response message was ephemeral.
   * Indicates if the response was only visible to the interaction user.
   */
  response_message_ephemeral?: boolean;
}

/**
 * Interaction callback resource object containing the response data.
 * Contains the actual content of an interaction response.
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-callback-interaction-callback-resource-object}
 */
export interface InteractionCallbackResourceEntity {
  /**
   * Interaction callback type.
   * The kind of response being provided.
   */
  type: InteractionCallbackType;

  /**
   * Activity instance information when launching an activity.
   * Details about an activity launched as part of this response.
   */
  activity_instance?: InteractionCallbackActivityInstanceEntity;

  /**
   * Message created by the interaction.
   * Content and metadata of the response message.
   */
  message?: MessageEntity;
}

/**
 * Interaction callback response object.
 * Complete response information returned after responding to an interaction.
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-callback-response-object}
 */
export interface InteractionCallbackResponseEntity {
  /**
   * The interaction object associated with the interaction response.
   * Metadata about the interaction and its response.
   */
  interaction: InteractionCallbackEntity;

  /**
   * The resource that was created by the interaction response.
   * Content and details of what was sent in response.
   */
  resource?: InteractionCallbackResourceEntity;
}

/**
 * Interaction callback message entity for sending message responses.
 * Contains the content for a message response to an interaction.
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-response-object-messages}
 */
export interface InteractionCallbackMessagesEntity {
  /**
   * Whether the response is TTS.
   * If true, the message will be sent using text-to-speech.
   */
  tts?: boolean;

  /**
   * Message content.
   * The text content of the message.
   */
  content?: string;

  /**
   * Supports up to 10 embeds.
   * Rich embeds to include with the message.
   */
  embeds?: EmbedEntity[];

  /**
   * Allowed mentions object.
   * Controls which mentions will actually ping users/roles/everyone.
   */
  allowed_mentions?: AllowedMentionsEntity;

  /**
   * Message flags combined as a bitfield.
   * Only SUPPRESS_EMBEDS, EPHEMERAL, and SUPPRESS_NOTIFICATIONS can be set.
   * EPHEMERAL makes the message visible only to the interaction user.
   */
  flags?: MessageFlags;

  /**
   * Message components.
   * UI components like buttons or select menus to include with the message.
   */
  components?: ActionRowEntity[];

  /**
   * Attachment objects with filename and description.
   * Files to attach to the message.
   */
  attachments?: AttachmentEntity[];

  /**
   * Details about the poll.
   * Configuration for creating a poll with this message.
   */
  poll?: PollCreateRequestEntity;
}

/**
 * Interaction callback modal entity for responding with a popup modal.
 * Configuration for displaying a form dialog in response to an interaction.
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#modal}
 */
export interface InteractionCallbackModalEntity {
  /**
   * Developer-defined identifier for the modal.
   * A unique ID that will be provided when the modal is submitted.
   */
  custom_id: string;

  /**
   * Title of the popup modal.
   * Text displayed at the top of the modal.
   */
  title: string;

  /**
   * Between 1 and 5 (inclusive) components that make up the modal.
   * UI components like text inputs that make up the form.
   */
  components: ActionRowEntity[];
}

/**
 * Interaction callback autocomplete entity for responding with suggested choices.
 * Provides autocomplete suggestions for a command option.
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#autocomplete}
 */
export interface InteractionCallbackAutocompleteEntity {
  /**
   * Autocomplete choices.
   * Suggestions to display to the user.
   */
  choices: ApplicationCommandOptionChoiceEntity[];
}

/**
 * Interaction response structure for responding to interactions.
 * The primary structure for responding to any interaction.
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-response-structure}
 */
export interface InteractionResponseEntity {
  /**
   * Type of response.
   * Determines the kind of response being sent.
   */
  type: InteractionCallbackType;

  /**
   * An optional response message.
   * The content and configuration of the response, format depends on the response type.
   */
  data?:
    | InteractionCallbackAutocompleteEntity
    | InteractionCallbackModalEntity
    | InteractionCallbackMessagesEntity;
}

/**
 * Complete Interaction object structure with all possible properties.
 * Represents an interaction received from Discord.
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object}
 */
export interface InteractionEntity {
  /**
   * ID of the interaction.
   * Unique identifier for this interaction.
   */
  id: Snowflake;

  /**
   * ID of the application this interaction is for.
   * The application that owns the interaction command or component.
   */
  application_id: Snowflake;

  /**
   * Type of interaction.
   * The category of interaction (command, component, etc.).
   */
  type: InteractionType;

  /**
   * Interaction data payload.
   * Details specific to the type of interaction.
   */
  data?: InteractionDataEntity;

  /**
   * Guild that the interaction was sent from.
   * Information about the server where the interaction occurred.
   */
  guild?: Partial<GuildEntity>;

  /**
   * Guild ID that the interaction was sent from.
   * Identifier for the server where the interaction occurred.
   */
  guild_id?: Snowflake;

  /**
   * Channel that the interaction was sent from.
   * Information about the channel where the interaction occurred.
   */
  channel?: Partial<AnyChannelEntity>;

  /**
   * Channel ID that the interaction was sent from.
   * Identifier for the channel where the interaction occurred.
   */
  channel_id?: Snowflake;

  /**
   * Guild member data for the invoking user, including permissions.
   * Server-specific information about the user who triggered the interaction.
   */
  member?: GuildMemberEntity;

  /**
   * User object for the invoking user, if invoked in a DM.
   * Information about the user who triggered the interaction.
   */
  user?: UserEntity;

  /**
   * Continuation token for responding to the interaction.
   * Secret token for authorization when responding to this interaction.
   */
  token: string;

  /**
   * Read-only property, always 1.
   * Version identifier for the interaction structure.
   */
  version: 1;

  /**
   * For components, the message they were attached to.
   * The original message where a component interaction came from.
   */
  message?: MessageEntity;

  /**
   * Bitwise set of permissions the app has in the source location of the interaction.
   * The permissions that the app has in the channel where the interaction occurred.
   */
  app_permissions: string;

  /**
   * Selected language of the invoking user.
   * The locale/language setting of the user who triggered the interaction.
   */
  locale?: Locale;

  /**
   * Guild's preferred locale, if invoked in a guild.
   * The locale/language setting of the server where the interaction occurred.
   */
  guild_locale?: Locale;

  /**
   * For monetized apps, any entitlements for the invoking user.
   * Premium subscriptions that the interaction user has access to.
   */
  entitlements: EntitlementEntity[];

  /**
   * Mapping of installation contexts that the interaction was authorized for.
   * Information about which installation contexts (user/guild) authorized this interaction.
   */
  authorizing_integration_owners: Record<
    ApplicationIntegrationType,
    Snowflake | "0"
  >;

  /**
   * Context where the interaction was triggered from.
   * The environment where this interaction occurred (guild, DM, etc.).
   */
  context?: InteractionContextType;
}

/**
 * Guild-specific interaction entity.
 * Specialized interaction type for interactions that occur in servers.
 */
export interface GuildInteractionEntity
  extends Omit<
    InteractionEntity,
    "guild" | "guild_id" | "member" | "guild_locale" | "context"
  > {
  /**
   * Guild context identifier.
   * Indicates this interaction occurred in a server.
   */
  context: InteractionContextType.Guild;

  /**
   * Guild ID that the interaction was sent from.
   * Identifier for the server where the interaction occurred.
   */
  guild_id: Snowflake;

  /**
   * Guild that the interaction was sent from.
   * Information about the server where the interaction occurred.
   */
  guild: Partial<GuildEntity>;

  /**
   * Guild member data for the invoking user.
   * Server-specific information about the user who triggered the interaction.
   */
  member: GuildMemberEntity;

  /**
   * Guild's preferred locale, if invoked in a guild.
   * The locale/language setting of the server where the interaction occurred.
   */
  guild_locale?: Locale;
}

/**
 * Bot DM-specific interaction entity.
 * Specialized interaction type for interactions that occur in direct messages with the bot.
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
  /**
   * Bot DM context identifier.
   * Indicates this interaction occurred in a DM with the bot.
   */
  context: InteractionContextType.BotDm;

  /**
   * Channel ID that the interaction was sent from.
   * Identifier for the DM channel where the interaction occurred.
   */
  channel_id: Snowflake;

  /**
   * Channel that the interaction was sent from.
   * Information about the DM channel where the interaction occurred.
   */
  channel: Partial<AnyChannelEntity>;

  /**
   * User object for the invoking user.
   * Information about the user who triggered the interaction.
   */
  user: UserEntity;
}

/**
 * Private channel-specific interaction entity.
 * Specialized interaction type for interactions that occur in group DMs or non-bot DMs.
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
  /**
   * Private channel context identifier.
   * Indicates this interaction occurred in a non-bot DM or group DM.
   */
  context: InteractionContextType.PrivateChannel;

  /**
   * Channel ID that the interaction was sent from.
   * Identifier for the private channel where the interaction occurred.
   */
  channel_id: Snowflake;

  /**
   * Channel that the interaction was sent from.
   * Information about the private channel where the interaction occurred.
   */
  channel: Partial<AnyChannelEntity>;

  /**
   * User object for the invoking user.
   * Information about the user who triggered the interaction.
   */
  user: UserEntity;
}

/**
 * Union of all context-specific interaction entities.
 * A type that can be any of the context-specific interaction types.
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-context-types}
 */
export type AnyInteractionEntity =
  | GuildInteractionEntity
  | BotDmInteractionEntity
  | PrivateChannelInteractionEntity;
