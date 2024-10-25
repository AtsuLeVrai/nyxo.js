import type { AvailableLocales, BitwisePermissions, LocaleKeys } from "../enums/index.js";
import type { BitfieldResolvable } from "../managers/index.js";
import type { Integer, Snowflake } from "../markdown/index.js";
import type { ApplicationIntegrationTypes } from "./applications.js";
import type { ChannelStructure, ChannelTypes } from "./channels.js";
import type {
    ActionRowStructure,
    ComponentTypes,
    SelectMenuOptionStructure,
    TextInputStructure,
} from "./components.js";
import type { EntitlementStructure } from "./entitlements.js";
import type { GuildMemberStructure, GuildStructure } from "./guilds.js";
import type {
    AllowedMentionStructure,
    AttachmentStructure,
    EmbedStructure,
    MessageFlags,
    MessageStructure,
} from "./messages.js";
import type { PollCreateRequestStructure } from "./polls.js";
import type { RoleStructure } from "./roles.js";
import type { UserStructure } from "./users.js";

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-permissions-object-application-command-permission-type|Application Command Permission Types}
 */
export enum ApplicationCommandPermissionTypes {
    Role = 1,
    User = 2,
    Channel = 3,
}

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-permissions-object-application-command-permissions-structure|Application Command Permissions Structure}
 */
export type ApplicationCommandPermissionsStructure = {
    /**
     * ID of the role, user, or channel. It can also be a permission constant
     */
    id: Snowflake;
    /**
     * true to allow, false, to disallow
     */
    permission: boolean;
    /**
     * role (1), user (2), or channel (3)
     */
    type: ApplicationCommandPermissionTypes;
};

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-permissions-object-guild-application-command-permissions-structure|Guild Application Command Permissions Structure}
 */
export type GuildApplicationCommandPermissionsStructure = {
    /**
     * ID of the application the command belongs to
     */
    application_id: Snowflake;
    /**
     * ID of the guild
     */
    guild_id: Snowflake;
    /**
     * ID of the command or the application ID
     */
    id: Snowflake;
    /**
     * Permissions for the command in the guild, max of 100
     */
    permissions: ApplicationCommandPermissionsStructure[];
};

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-entry-point-command-handler-types|Entry Point Command Handler Types}
 */
export enum EntryPointCommandHandlerTypes {
    /**
     * The app handles the interaction using an interaction token
     */
    AppHandler = 1,
    /**
     * Discord handles the interaction by launching an Activity and sending a follow-up message without coordinating with the app
     */
    DiscordLaunchActivity = 2,
}

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-choice-structure|Application Command Option Choice Structure}
 */
export type ApplicationCommandOptionChoiceStructure = {
    /**
     * 1-100 character choice name
     */
    name: string;
    /**
     * Localization dictionary for the name field. Values follow the same restrictions as name
     */
    name_localizations?: AvailableLocales | null;
    /**
     * Value for the choice, up to 100 characters if string
     */
    value: Integer | boolean | string;
};

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type}
 */
export enum ApplicationCommandOptionTypes {
    SubCommand = 1,
    SubCommandGroup = 2,
    String = 3,
    Integer = 4,
    Boolean = 5,
    User = 6,
    Channel = 7,
    Role = 8,
    Mentionable = 9,
    Number = 10,
    Attachment = 11,
}

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure}
 */
export type ApplicationCommandOptionStructure = {
    /**
     * If autocomplete interactions are enabled for this option
     */
    autocomplete?: boolean;
    /**
     * The channels shown will be restricted to these types
     */
    channel_types?: ChannelTypes[];
    /**
     * Choices for the user to pick from, max 25
     */
    choices?: ApplicationCommandOptionChoiceStructure[];
    /**
     * 1-100 character description
     */
    description: string;
    /**
     * Localization dictionary for the description field. Values follow the same restrictions as description
     */
    description_localizations?: AvailableLocales | null;
    /**
     * The maximum allowed length (minimum of 1, maximum of 6000)
     */
    max_length?: Integer;
    /**
     * The maximum value permitted
     */
    max_value?: Integer;
    /**
     * The minimum allowed length (minimum of 0, maximum of 6000)
     */
    min_length?: Integer;
    /**
     * The minimum value permitted
     */
    min_value?: Integer;
    /**
     * 1-32 character name
     */
    name: string;
    /**
     * Localization dictionary for the name field. Values follow the same restrictions as name
     */
    name_localizations?: AvailableLocales | null;
    /**
     * If the option is a subcommand or subcommand group type, these nested options will be the parameters or subcommands respectively; up to 25
     */
    options?: ApplicationCommandOptionStructure[];
    /**
     * Whether the parameter is required or optional, default false
     */
    required?: boolean;
    /**
     * Type of option
     */
    type: ApplicationCommandOptionTypes;
};

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-types|Application Command Types}
 */
export enum ApplicationCommandTypes {
    /**
     * Slash commands; a text-based command that shows up when a user types /
     */
    ChatInput = 1,
    /**
     * A UI-based command that shows up when you right click or tap on a user
     */
    User = 2,
    /**
     * A UI-based command that shows up when you right click or tap on a message
     */
    Message = 3,
    /**
     * A UI-based command that represents the primary way to invoke an app's Activity
     */
    PrimaryEntryPoint = 4,
}

/**
 * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-structure|Application Command Structure}
 */
export type ApplicationCommandStructure = {
    /**
     * ID of the parent application
     */
    application_id: Snowflake;
    /**
     * Interaction context(s) where the command can be used, only for globally-scoped commands. By default, all interaction context types included for new commands.
     */
    contexts?: InteractionContextTypes[] | null;
    /**
     * Set of permissions represented as a bit set
     */
    default_member_permissions: BitfieldResolvable<BitwisePermissions>;
    /**
     * Not recommended for use as field will soon be deprecated. Indicates whether the command is enabled by default when the app is added to a guild, defaults to true
     */
    default_permission?: boolean | null;
    /**
     * Description for CHAT_INPUT commands, 1-100 characters. Empty string for USER and MESSAGE commands
     */
    description: string;
    /**
     * Localization dictionary for description field. Values follow the same restrictions as description
     */
    description_localizations?: AvailableLocales | null;
    /**
     * Deprecated (use contexts instead); Indicates whether the command is available in DMs with the app, only for globally-scoped commands. By default, commands are visible.
     *
     * @deprecated use contexts instead
     */
    dm_permission?: boolean;
    /**
     * Guild ID of the command, if not global
     */
    guild_id?: Snowflake;
    /**
     * Determines whether the interaction is handled by the app's interactions handler or by Discord
     */
    handler?: EntryPointCommandHandlerTypes;
    /**
     * Unique ID of command
     */
    id: Snowflake;
    /**
     * Installation contexts where the command is available, only for globally-scoped commands. Defaults to your app's configured contexts
     */
    integration_types?: ApplicationIntegrationTypes[];
    /**
     * Name of command, 1-32 characters
     */
    name: string;
    /**
     * Localization dictionary for name field. Values follow the same restrictions as name
     */
    name_localizations?: AvailableLocales | null;
    /**
     * Indicates whether the command is age-restricted, defaults to false
     */
    nsfw?: boolean;
    /**
     * Parameters for the command, max of 25
     */
    options?: ApplicationCommandOptionStructure[];
    /**
     * Type of command, defaults to 1
     */
    type?: ApplicationCommandTypes;
    /**
     * Autoincrementing version identifier updated during substantial record changes
     */
    version: Snowflake;
};

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-callback-interaction-callback-activity-instance-resource|Interaction Callback Activity Instance Resource}
 */
export type InteractionCallbackActivityInstanceResourceStructure = {
    /**
     * Instance ID of the Activity if one was launched or joined.
     */
    id: string;
};

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-response-object-interaction-callback-type|Interaction Callback Types}
 */
export enum InteractionCallbackTypes {
    /**
     * ACK a Ping
     */
    Pong = 1,
    /**
     * Respond to an interaction with a message
     */
    ChannelMessageWithSource = 4,
    /**
     * ACK an interaction and edit a response later, the user sees a loading state
     */
    DeferredChannelMessageWithSource = 5,
    /**
     * For components, ACK an interaction and edit the original message later; the user does not see a loading state
     */
    DeferredUpdateMessage = 6,
    /**
     * For components, edit the message the component was attached to
     */
    UpdateMessage = 7,
    /**
     * Respond to an autocomplete interaction with suggested choices
     */
    ApplicationCommandAutocompleteResult = 8,
    /**
     * Respond to an interaction with a popup modal
     */
    Modal = 9,
    /**
     * Deprecated; respond to an interaction with an upgrade button, only available for apps with monetization enabled
     */
    PremiumRequired = 10,
    /**
     * Launch the Activity associated with the app. Only available for apps with Activities enabled
     */
    LaunchActivity = 12,
}

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-callback-interaction-callback-resource-object|Interaction Callback Resource Object}
 */
export type InteractionCallbackResourceStructure = {
    /**
     * Represents the Activity launched by this interaction.
     */
    activity_instance?: InteractionCallbackActivityInstanceResourceStructure;
    /**
     * Message created by the interaction.
     */
    message?: MessageStructure;
    /**
     * Interaction callback type
     */
    type: InteractionCallbackTypes;
};

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-type|Interaction Types}
 */
export enum InteractionTypes {
    Ping = 1,
    ApplicationCommand = 2,
    MessageComponent = 3,
    ApplicationCommandAutocomplete = 4,
    ModalSubmit = 5,
}

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-callback-interaction-callback-object|Interaction Callback Object}
 */
export type InteractionCallbackStructure = {
    /**
     * Instance ID of the Activity if one was launched or joined
     */
    activity_instance_id?: string;
    /**
     * Whether or not the response message was ephemeral
     */
    response_message_ephemeral?: boolean;
    /**
     * ID of the message that was created by the interaction
     */
    response_message_id?: Snowflake;
    /**
     * Whether or not the message is in a loading state
     */
    response_message_loading?: boolean;
    /**
     * Interaction type
     */
    type: InteractionTypes;
};

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-callback-interaction-callback-response-object|Interaction Callback Response Object}
 */
export type InteractionCallbackResponseStructure = {
    /**
     * Interaction object associated with the resource
     */
    interaction: InteractionCallbackStructure;
    /**
     * Resource that was created by the interaction response
     */
    resource?: InteractionCallbackResourceStructure;
};

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-response-object-modal|Interaction Response Modal Structure}
 */
export type InteractionResponseModalStructure = {
    /**
     * Between 1 and 5 (inclusive) components that make up the modal
     */
    components: ActionRowStructure<TextInputStructure>[];
    /**
     * Developer-defined identifier for the modal, max 100 characters
     */
    custom_id: string;
    /**
     * Title of the popup modal, max 45 characters
     */
    title: string;
};

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-response-object-autocomplete|Interaction Response Autocomplete Structure}
 */
export type InteractionResponseAutocompleteStructure = {
    /**
     * Developer-defined identifier for the autocomplete, max 100 characters
     */
    choices: ApplicationCommandOptionChoiceStructure[];
};

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-response-object-interaction-callback-data-structure|Interaction Callback Data Structure}
 */
export type InteractionCallbackDataStructure = {
    /**
     * Allowed mentions object
     */
    allowed_mentions?: AllowedMentionStructure;
    /**
     * Attachment objects with filename and description
     *
     * @todo No information available in the Discord API documentation
     */
    attachments?: Partial<AttachmentStructure>[];
    /**
     * Message components
     */
    components?: ActionRowStructure[];
    /**
     * Message content
     */
    content?: string;
    /**
     * Supports up to 10 embeds
     */
    embeds?: EmbedStructure[];
    /**
     * Message flags combined as a bitfield (only SUPPRESS_EMBEDS, EPHEMERAL, and SUPPRESS_NOTIFICATIONS can be set)
     */
    flags?: BitfieldResolvable<MessageFlags>;
    /**
     * Details about the poll
     */
    poll?: PollCreateRequestStructure;
    /**
     * Whether the response is TTS
     */
    tts?: boolean;
};

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-response-object-interaction-response-structure|Interaction Response Structure}
 */
export type InteractionResponseStructure = {
    /**
     * An optional response message
     */
    data?: InteractionCallbackDataStructure;
    /**
     * Type of response
     */
    type: InteractionCallbackTypes;
};

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#message-interaction-object-message-interaction-structure|Message Interaction Structure}
 */
export type MessageInteractionStructure = {
    /**
     * ID of the interaction
     */
    id: Snowflake;
    /**
     * Member who invoked the interaction in the guild
     *
     * @todo No information available in the Discord API documentation
     */
    member?: Partial<GuildMemberStructure>;
    /**
     * Name of the application command, including subcommands and subcommand groups
     */
    name: string;
    /**
     * Type of interaction
     */
    type: InteractionTypes;
    /**
     * User who invoked the interaction
     */
    user: UserStructure;
};

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-application-command-interaction-data-option-structure|Application Command Interaction Data Option Structure}
 */
export type ApplicationCommandInteractionDataOptionStructure = {
    /**
     * true if this option is the currently focused option for autocomplete
     */
    focused?: boolean;
    /**
     * Name of the parameter
     */
    name: string;
    /**
     * Present if this option is a group or subcommand
     */
    options?: ApplicationCommandInteractionDataOptionStructure[];
    /**
     * Value of application command option type
     */
    type: ApplicationCommandOptionTypes;
    /**
     * Value of the option resulting from user input
     */
    value?: Integer | boolean | string;
};

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-resolved-data-structure|Resolved Data Structure}
 */
export type ResolvedDataStructure = {
    /**
     * Map of Snowflakes to attachment objects
     */
    attachments?: Map<Snowflake, AttachmentStructure>;
    /**
     * Map of Snowflakes to partial channel objects
     */
    channels?: Map<
        Snowflake,
        Pick<ChannelStructure, "id" | "name" | "parent_id" | "permissions" | "thread_metadata" | "type">
    >;
    /**
     * Map of Snowflakes to partial member objects
     */
    members?: Map<Snowflake, Omit<GuildMemberStructure, "deaf" | "mute" | "user">>;
    /**
     * Map of Snowflakes to partial messages objects
     *
     * @todo No information available in the Discord API documentation
     */
    messages?: Map<Snowflake, Partial<MessageStructure>>;
    /**
     * Map of Snowflakes to role objects
     */
    roles?: Map<Snowflake, RoleStructure>;
    /**
     * Map of Snowflakes to user objects
     */
    users?: Map<Snowflake, UserStructure>;
};

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-modal-submit-data-structure|Modal Submit Data Structure}
 */
export type ModalSubmitDataStructure = {
    /**
     * Values submitted by the user
     */
    components: ActionRowStructure<TextInputStructure>[];
    /**
     * custom_id of the modal
     */
    custom_id: string;
};

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-message-component-data-structure|Message Component Data Structure}
 */
export type MessageComponentDataStructure = {
    /**
     * Type of the component
     */
    component_type: ComponentTypes;
    /**
     * custom_id of the component
     */
    custom_id: string;
    /**
     * Resolved entities from selected options
     */
    resolved?: ResolvedDataStructure;
    /**
     * Values the user selected in a select menu component
     */
    values?: SelectMenuOptionStructure[];
};

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-application-command-data-structure|Application Command Data Structure}
 */
export type ApplicationCommandDataStructure = {
    /**
     * ID of the guild the command is registered to
     */
    guild_id?: Snowflake;
    /**
     * ID of the invoked command
     */
    id: Snowflake;
    /**
     * Name of the invoked command
     */
    name: string;
    /**
     * Params + values from the user
     */
    options?: ApplicationCommandInteractionDataOptionStructure[];
    /**
     * Converted users + roles + channels + attachments
     */
    resolved?: Pick<ResolvedDataStructure, "attachments" | "channels" | "roles" | "users">;
    /**
     * ID of the user or message targeted by a user or message command
     */
    target_id?: Snowflake;
    /**
     * Type of the invoked command
     */
    type: ApplicationCommandTypes;
};

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-context-types|Interaction Context Types}
 */
export enum InteractionContextTypes {
    /**
     * Interaction can be used within servers
     */
    Guild = 0,
    /**
     * Interaction can be used within DMs with the app's bot user
     */
    BotDM = 1,
    /**
     * Interaction can be used within Group DMs and DMs other than the app's bot user
     */
    PrivateChannel = 2,
}

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-structure|Interaction Structure}
 */
export type InteractionStructure = {
    /**
     * Bitwise set of permissions the app has in the source location of the interaction
     */
    app_permissions?: BitfieldResolvable<BitwisePermissions>;
    /**
     * ID of the application this interaction is for
     */
    application_id: Snowflake;
    /**
     * Mapping of installation contexts that the interaction was authorized for to related user or guild IDs.
     */
    authorizing_integration_owners?: Record<ApplicationIntegrationTypes, Snowflake>;
    /**
     * Channel that the interaction was sent from
     *
     * @todo No information available in the Discord API documentation
     */
    channel?: Partial<ChannelStructure>;
    /**
     * Channel that the interaction was sent from
     */
    channel_id?: Snowflake;
    /**
     * Context where the interaction was triggered from
     */
    context?: InteractionContextTypes;
    /**
     * Interaction data payload
     */
    data?:
        | ApplicationCommandDataStructure
        | ApplicationCommandInteractionDataOptionStructure
        | MessageComponentDataStructure
        | ModalSubmitDataStructure
        | ResolvedDataStructure;
    /**
     * For monetized apps, any entitlements for the invoking user, representing access to premium SKUs
     */
    entitlements?: EntitlementStructure[];
    /**
     * Guild that the interaction was sent from
     *
     * @todo No information available in the Discord API documentation
     */
    guild?: Partial<GuildStructure>;
    /**
     * Guild that the interaction was sent from
     */
    guild_id?: Snowflake;
    /**
     * Guild's preferred locale, if invoked in a guild
     */
    guild_locale?: LocaleKeys;
    /**
     * ID of the interaction
     */
    id: Snowflake;
    /**
     * Selected language of the invoking user
     */
    locale?: LocaleKeys;
    /**
     * Guild member data for the invoking user, including permissions
     */
    member?: GuildMemberStructure;
    /**
     * For components, the message they were attached to
     */
    message?: MessageStructure;
    /**
     * Continuation token for responding to the interaction
     */
    token: string;
    /**
     * Type of interaction
     */
    type: InteractionTypes;
    /**
     * User object for the invoking user, if invoked in a DM
     */
    user?: UserStructure;
    /**
     * Read-only property, always 1
     */
    version: 1;
};
