import { z } from "zod";
import type { BitwisePermissionFlags, Locale } from "../enums/index.js";
import { BitFieldManager, type Snowflake } from "../managers/index.js";
import {
  ApplicationCommandOptionChoiceEntity,
  type ApplicationCommandOptionType,
  type ApplicationCommandType,
} from "./application-commands.entity.js";
import type { ChannelEntity } from "./channel.entity.js";
import type { EntitlementEntity } from "./entitlement.entity.js";
import type { GuildEntity, GuildMemberEntity } from "./guild.entity.js";
import {
  ActionRowEntity,
  type ComponentType,
  type SelectMenuOptionEntity,
} from "./message-components.entity.js";
import {
  AllowedMentionsEntity,
  AttachmentEntity,
  EmbedEntity,
  type MessageEntity,
  type MessageFlags,
} from "./message.entity.js";
import { PollCreateRequestEntity } from "./poll.entity.js";
import type { RoleEntity } from "./role.entity.js";
import type { UserEntity } from "./user.entity.js";

/**
 * Enumeration of all interaction types
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-type}
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
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-callback-type}
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
 * Represents an Activity Instance resource for interaction callbacks
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-callback-interaction-callback-activity-instance-resource}
 */
export interface InteractionCallbackActivityInstanceEntity {
  /** Instance ID of the Activity */
  id: string;
}

/**
 * Base structure for command options
 */
export interface BaseCommandOptionEntity {
  /** Name of the parameter */
  name: string;

  /** Type of the option */
  type: ApplicationCommandOptionType;
}

export interface SimpleCommandOptionEntity extends BaseCommandOptionEntity {
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
  value: Snowflake;

  /** True if this option is the currently focused option for autocomplete */
  focused?: boolean;
}

/**
 * SubCommand option
 */
export interface SubCommandOptionEntity extends BaseCommandOptionEntity {
  /** SubCommand option type */
  type: ApplicationCommandOptionType.SubCommand;

  /** Options for this subcommand */
  options?: SimpleCommandOptionEntity[];
}

/**
 * SubCommandGroup option
 */
export interface SubCommandGroupOptionEntity extends BaseCommandOptionEntity {
  /** SubCommandGroup option type */
  type: ApplicationCommandOptionType.SubCommandGroup;

  /** SubCommand options for this group */
  options: SubCommandOptionEntity[];
}

/**
 * Union of all command options
 */
export type CommandOptionEntity =
  | SubCommandOptionEntity
  | SubCommandGroupOptionEntity
  | SimpleCommandOptionEntity;

/**
 * Resolved data structure containing detailed Discord objects from an interaction
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#resolved-data-structure}
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
  channels?: Record<
    Snowflake,
    Pick<
      ChannelEntity,
      "id" | "name" | "type" | "permissions" | "thread_metadata" | "parent_id"
    >
  >;

  /** Map of message IDs to partial message objects */
  messages?: Record<Snowflake, Partial<MessageEntity>>;

  /** Map of attachment IDs to attachment objects */
  attachments?: Record<Snowflake, AttachmentEntity>;
}

/**
 * Application command interaction data structure
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#application-command-data-structure}
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
  options?: CommandOptionEntity[];

  /** ID of the guild the command is registered to */
  guild_id?: Snowflake;

  /** ID of the user or message targeted by a user or message command */
  target_id?: Snowflake;
}

/**
 * Message component interaction data structure
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#message-component-data-structure}
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
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#modal-submit-data-structure}
 */
export interface ModalSubmitInteractionDataEntity {
  /** Developer-defined identifier for the modal */
  custom_id: string;

  /** Components submitted with the modal */
  components: ActionRowEntity[];
}

/**
 * Union of all interaction data types
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-data}
 */
export type InteractionDataEntity =
  | ApplicationCommandInteractionDataEntity
  | MessageComponentInteractionDataEntity
  | ModalSubmitInteractionDataEntity;

/**
 * Message interaction structure sent on message objects when responding to an interaction
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#message-interaction-structure}
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
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-callback-interaction-callback-object}
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
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-callback-resource-object}
 */
export interface InteractionCallbackResourceEntity {
  /** Interaction callback type */
  type: InteractionCallbackType;

  /** Activity instance information when launching an activity */
  activity_instance?: InteractionCallbackActivityInstanceEntity;

  /** Message created by the interaction */
  message?: Partial<MessageEntity>;
}

/**
 * Interaction callback response object
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-callback-response-object}
 */
export interface InteractionCallbackResponseEntity {
  /** The interaction object associated with the interaction response */
  interaction: InteractionCallbackEntity;

  /** The resource that was created by the interaction response */
  resource?: InteractionCallbackResourceEntity;
}

/**
 * Interaction callback message entity for sending message responses
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-response-object-messages}
 */
export const InteractionCallbackMessagesEntity = z
  .object({
    /** Whether the response is TTS */
    tts: z.boolean().optional(),

    /** Message content */
    content: z.string().optional(),

    /** Supports up to 10 embeds */
    embeds: z
      .array(z.lazy(() => EmbedEntity))
      .max(10)
      .optional(),

    /** Allowed mentions object */
    allowed_mentions: z.lazy(() => AllowedMentionsEntity).optional(),

    /** Message flags combined as a bitfield */
    flags: z.custom<MessageFlags>(BitFieldManager.isValidBitField).optional(),

    /** Message components */
    components: z.array(z.lazy(() => ActionRowEntity)).optional(),

    /** Attachment objects with filename and description */
    attachments: z.array(z.lazy(() => AttachmentEntity)).optional(),

    /** Details about the poll */
    poll: z.lazy(() => PollCreateRequestEntity).optional(),
  })
  .refine(
    (data) => {
      // At least one field must be provided
      return (
        (data.content !== undefined && data.content !== "") ||
        (data.embeds && data.embeds.length > 0) ||
        (data.components && data.components.length > 0) ||
        (data.attachments && data.attachments.length > 0) ||
        data.poll !== undefined
      );
    },
    {
      message:
        "At least one of content, embeds, components, attachments or poll must be provided",
    },
  );

export type InteractionCallbackMessagesEntity = z.infer<
  typeof InteractionCallbackMessagesEntity
>;

/**
 * Interaction callback modal entity for responding with a popup modal
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#modal}
 */
export const InteractionCallbackModalEntity = z.object({
  /** Developer-defined identifier for the modal, max 100 characters */
  custom_id: z.string().max(100),

  /** Title of the popup modal, max 45 characters */
  title: z.string().max(45),

  /** Between 1 and 5 (inclusive) components that make up the modal */
  components: z
    .array(z.lazy(() => ActionRowEntity))
    .min(1)
    .max(5),
});

export type InteractionCallbackModalEntity = z.infer<
  typeof InteractionCallbackModalEntity
>;

/**
 * Interaction callback autocomplete entity for responding with suggested choices
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#autocomplete}
 */
export const InteractionCallbackAutocompleteEntity = z.object({
  /** Autocomplete choices (max of 25 choices) */
  choices: z.array(z.lazy(() => ApplicationCommandOptionChoiceEntity)).max(25),
});

export type InteractionCallbackAutocompleteEntity = z.infer<
  typeof InteractionCallbackAutocompleteEntity
>;

/**
 * Interaction response structure for responding to interactions
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-response-structure}
 */
export const InteractionResponseEntity = z
  .object({
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
  })
  .superRefine((data, ctx) => {
    // Validate that the appropriate data is provided for each type
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

    if (data.type === InteractionCallbackType.UpdateMessage && !data.data) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Data is required for UPDATE_MESSAGE",
      });
    }
  });

export type InteractionResponseEntity = z.infer<
  typeof InteractionResponseEntity
>;

/**
 * Base Interaction object structure
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object}
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

  /** Continuation token for responding to the interaction */
  token: string;

  /** Read-only property, always 1 */
  version: 1;

  /** Bitwise set of permissions the app has in the source location of the interaction */
  app_permissions: BitwisePermissionFlags;

  /** Selected language of the invoking user */
  locale?: Locale;

  /** For monetized apps, any entitlements for the invoking user */
  entitlements?: EntitlementEntity[];

  /** Mapping of installation contexts that the interaction was authorized for */
  authorizing_integration_owners: Record<string, Snowflake>;

  /** Context where the interaction was triggered from */
  context?: InteractionContextType;

  /** Guild ID that the interaction was sent from */
  guild_id?: Snowflake;

  /** Guild that the interaction was sent from */
  guild?: Partial<GuildEntity>;

  /** Guild member data for the invoking user */
  member?: GuildMemberEntity;

  /** Channel ID that the interaction was sent from */
  channel_id?: Snowflake;

  /** Channel that the interaction was sent from */
  channel?: Partial<ChannelEntity>;

  /** Guild's preferred locale, if invoked in a guild */
  guild_locale?: Locale;

  /** For components, the message they were attached to */
  message?: Partial<MessageEntity>;

  /** User object for the invoking user */
  user?: UserEntity;
}

/**
 * Guild-specific interaction entity
 */
export interface GuildInteractionEntity extends InteractionEntity {
  /** Guild context identifier */
  context: InteractionContextType.Guild;

  /** Guild ID that the interaction was sent from */
  guild_id: Snowflake;

  /** Guild that the interaction was sent from */
  guild: Partial<GuildEntity>;

  /** Guild member data for the invoking user */
  member: GuildMemberEntity;

  /** Channel ID that the interaction was sent from */
  channel_id?: Snowflake;

  /** Channel that the interaction was sent from */
  channel?: Partial<ChannelEntity>;

  /** Guild's preferred locale, if invoked in a guild */
  guild_locale?: Locale;
}

/**
 * Bot DM-specific interaction entity
 */
export interface BotDmInteractionEntity extends InteractionEntity {
  /** Bot DM context identifier */
  context: InteractionContextType.BotDm;

  /** Channel ID that the interaction was sent from */
  channel_id: Snowflake;

  /** Channel that the interaction was sent from */
  channel: Partial<ChannelEntity>;

  /** User object for the invoking user */
  user: UserEntity;
}

/**
 * Private channel-specific interaction entity
 */
export interface PrivateChannelInteractionEntity extends InteractionEntity {
  /** Private channel context identifier */
  context: InteractionContextType.PrivateChannel;

  /** Channel ID that the interaction was sent from */
  channel_id: Snowflake;

  /** Channel that the interaction was sent from */
  channel: Partial<ChannelEntity>;

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
