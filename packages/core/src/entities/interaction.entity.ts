import { z } from "zod";
import { type BitwisePermissionFlags, Locale } from "../enums/index.js";
import { BitFieldManager, Snowflake } from "../managers/index.js";
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
  type MessageFlags,
} from "./message.entity.js";
import { PollCreateRequestEntity } from "./poll.entity.js";
import { RoleEntity } from "./role.entity.js";
import { UserEntity } from "./user.entity.js";

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

/**
 * String command option
 */
export const StringCommandOptionEntity = BaseCommandOptionEntity.extend({
  /** String option type */
  type: z.literal(3),

  /** Value of the option resulting from user input */
  value: z.string(),

  /** True if this option is the currently focused option for autocomplete */
  focused: z.boolean().optional(),
});

export type StringCommandOptionEntity = z.infer<
  typeof StringCommandOptionEntity
>;

/**
 * Number command option
 */
export const NumberCommandOptionEntity = BaseCommandOptionEntity.extend({
  /** Number option type */
  type: z.literal(10),

  /** Value of the option resulting from user input */
  value: z.number(),

  /** True if this option is the currently focused option for autocomplete */
  focused: z.boolean().optional(),
});

export type NumberCommandOptionEntity = z.infer<
  typeof NumberCommandOptionEntity
>;

/**
 * Integer command option
 */
export const IntegerCommandOptionEntity = BaseCommandOptionEntity.extend({
  /** Integer option type */
  type: z.literal(4),

  /** Value of the option resulting from user input */
  value: z.number().int(),

  /** True if this option is the currently focused option for autocomplete */
  focused: z.boolean().optional(),
});

export type IntegerCommandOptionEntity = z.infer<
  typeof IntegerCommandOptionEntity
>;

/**
 * Boolean command option
 */
export const BooleanCommandOptionEntity = BaseCommandOptionEntity.extend({
  /** Boolean option type */
  type: z.literal(5),

  /** Value of the option resulting from user input */
  value: z.boolean(),

  /** True if this option is the currently focused option for autocomplete */
  focused: z.boolean().optional(),
});

export type BooleanCommandOptionEntity = z.infer<
  typeof BooleanCommandOptionEntity
>;

/**
 * User command option
 */
export const UserCommandOptionEntity = BaseCommandOptionEntity.extend({
  /** User option type */
  type: z.literal(6),

  /** Value of the option resulting from user input */
  value: Snowflake,

  /** True if this option is the currently focused option for autocomplete */
  focused: z.boolean().optional(),
});

export type UserCommandOptionEntity = z.infer<typeof UserCommandOptionEntity>;

/**
 * Channel command option
 */
export const ChannelCommandOptionEntity = BaseCommandOptionEntity.extend({
  /** Channel option type */
  type: z.literal(7),

  /** Value of the option resulting from user input */
  value: Snowflake,

  /** True if this option is the currently focused option for autocomplete */
  focused: z.boolean().optional(),
});

export type ChannelCommandOptionEntity = z.infer<
  typeof ChannelCommandOptionEntity
>;

/**
 * Role command option
 */
export const RoleCommandOptionEntity = BaseCommandOptionEntity.extend({
  /** Role option type */
  type: z.literal(8),

  /** Value of the option resulting from user input */
  value: Snowflake,

  /** True if this option is the currently focused option for autocomplete */
  focused: z.boolean().optional(),
});

export type RoleCommandOptionEntity = z.infer<typeof RoleCommandOptionEntity>;

/**
 * Mentionable command option
 */
export const MentionableCommandOptionEntity = BaseCommandOptionEntity.extend({
  /** Mentionable option type */
  type: z.literal(9),

  /** Value of the option resulting from user input */
  value: Snowflake,

  /** True if this option is the currently focused option for autocomplete */
  focused: z.boolean().optional(),
});

export type MentionableCommandOptionEntity = z.infer<
  typeof MentionableCommandOptionEntity
>;

/**
 * Attachment command option
 */
export const AttachmentCommandOptionEntity = BaseCommandOptionEntity.extend({
  /** Attachment option type */
  type: z.literal(11),

  /** Value of the option resulting from user input */
  value: Snowflake,

  /** True if this option is the currently focused option for autocomplete */
  focused: z.boolean().optional(),
});

export type AttachmentCommandOptionEntity = z.infer<
  typeof AttachmentCommandOptionEntity
>;

/**
 * Union of all simple command options
 */
export const SimpleCommandOptionEntity = z.discriminatedUnion("type", [
  StringCommandOptionEntity,
  NumberCommandOptionEntity,
  IntegerCommandOptionEntity,
  BooleanCommandOptionEntity,
  UserCommandOptionEntity,
  ChannelCommandOptionEntity,
  RoleCommandOptionEntity,
  MentionableCommandOptionEntity,
  AttachmentCommandOptionEntity,
]);

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
  options: z.lazy(() => z.array(SimpleCommandOptionEntity)).optional(),
});

export type SubCommandOptionEntity = z.infer<typeof SubCommandOptionEntity>;

/**
 * SubCommandGroup option
 */
export const SubCommandGroupOptionEntity = BaseCommandOptionEntity.extend({
  /** SubCommandGroup option type */
  type: z.literal(2),

  /** SubCommand options for this group */
  options: z.lazy(() => z.array(SubCommandOptionEntity)),
});

export type SubCommandGroupOptionEntity = z.infer<
  typeof SubCommandGroupOptionEntity
>;

/**
 * Union of all command options
 */
export const CommandOptionEntity = z.discriminatedUnion("type", [
  SubCommandOptionEntity,
  SubCommandGroupOptionEntity,
  ...SimpleCommandOptionEntity.options,
]);

export type CommandOptionEntity = z.infer<typeof CommandOptionEntity>;

/**
 * Resolved data structure containing detailed Discord objects from an interaction
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#resolved-data-structure}
 */
export const InteractionResolvedDataEntity = z.object({
  /** Map of user IDs to user objects */
  users: z
    .record(
      Snowflake,
      z.lazy(() => UserEntity),
    )
    .optional(),

  /** Map of user IDs to partial member objects (missing user, deaf, and mute fields) */
  members: z
    .record(
      Snowflake,
      z.lazy(() =>
        GuildMemberEntity.omit({ user: true, deaf: true, mute: true }),
      ),
    )
    .optional(),

  /** Map of role IDs to role objects */
  roles: z
    .record(
      Snowflake,
      z.lazy(() => RoleEntity),
    )
    .optional(),

  /** Map of channel IDs to partial channel objects */
  channels: z
    .record(
      Snowflake,
      z.lazy(() =>
        ChannelEntity.pick({
          id: true,
          name: true,
          type: true,
          permissions: true,
          thread_metadata: true,
          parent_id: true,
        }),
      ),
    )
    .optional(),

  /** Map of message IDs to partial message objects */
  messages: z
    .record(
      Snowflake,
      z.lazy(() => MessageEntity),
    )
    .optional(),

  /** Map of attachment IDs to attachment objects */
  attachments: z
    .record(
      Snowflake,
      z.lazy(() => AttachmentEntity),
    )
    .optional(),
});

export type InteractionResolvedDataEntity = z.infer<
  typeof InteractionResolvedDataEntity
>;

/**
 * Application command interaction data structure
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#application-command-data-structure}
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
  options: z.array(CommandOptionEntity).optional(),

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
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#message-component-data-structure}
 */
export const MessageComponentInteractionDataEntity = z.object({
  /** Developer-defined identifier for the component */
  custom_id: z.string(),

  /** Type of component */
  component_type: z.nativeEnum(ComponentType),

  /** Values selected by the user (for select menu components) */
  values: z.array(z.lazy(() => SelectMenuOptionEntity)).optional(),

  /** Resolved entities from selected options */
  resolved: InteractionResolvedDataEntity.optional(),
});

export type MessageComponentInteractionDataEntity = z.infer<
  typeof MessageComponentInteractionDataEntity
>;

/**
 * Modal submit interaction data structure
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#modal-submit-data-structure}
 */
export const ModalSubmitInteractionDataEntity = z.object({
  /** Developer-defined identifier for the modal */
  custom_id: z.string(),

  /** Components submitted with the modal */
  components: z.array(z.lazy(() => ActionRowEntity)),
});

export type ModalSubmitInteractionDataEntity = z.infer<
  typeof ModalSubmitInteractionDataEntity
>;

/**
 * Union of all interaction data types
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-data}
 */
export const InteractionDataEntity = z.discriminatedUnion("type", [
  ApplicationCommandInteractionDataEntity.extend({
    type: z.literal(InteractionType.ApplicationCommand),
  }),
  ApplicationCommandInteractionDataEntity.extend({
    type: z.literal(InteractionType.ApplicationCommandAutocomplete),
  }),
  MessageComponentInteractionDataEntity.extend({
    type: z.literal(InteractionType.MessageComponent),
  }),
  ModalSubmitInteractionDataEntity.extend({
    type: z.literal(InteractionType.ModalSubmit),
  }),
]);

export type InteractionDataEntity = z.infer<typeof InteractionDataEntity>;

/**
 * Message interaction structure sent on message objects when responding to an interaction
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#message-interaction-structure}
 */
export const MessageInteractionEntity = z.object({
  /** ID of the interaction */
  id: Snowflake,

  /** Type of interaction */
  type: z.nativeEnum(InteractionType),

  /** Name of the application command */
  name: z.string(),

  /** User who invoked the interaction */
  user: z.lazy(() => UserEntity),

  /** Member who invoked the interaction in the guild */
  member: z.lazy(() => GuildMemberEntity.partial()).optional(),
});

export type MessageInteractionEntity = z.infer<typeof MessageInteractionEntity>;

/**
 * Interaction callback object containing information about the interaction response
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-callback-interaction-callback-object}
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
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-callback-resource-object}
 */
export const InteractionCallbackResourceEntity = z.object({
  /** Interaction callback type */
  type: z.nativeEnum(InteractionCallbackType),

  /** Activity instance information when launching an activity */
  activity_instance: InteractionCallbackActivityInstanceEntity.optional(),

  /** Message created by the interaction */
  message: z.lazy(() => MessageEntity).optional(),
});

export type InteractionCallbackResourceEntity = z.infer<
  typeof InteractionCallbackResourceEntity
>;

/**
 * Interaction callback response object
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-callback-response-object}
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
 * Authorizing integration owners object
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-authorizing-integration-owners-object}
 */
export const AuthorizingIntegrationOwnersEntity = z.record(
  z.string(), // Key as string representing ApplicationIntegrationType
  Snowflake, // Value as Snowflake ID
);

export type AuthorizingIntegrationOwnersEntity = z.infer<
  typeof AuthorizingIntegrationOwnersEntity
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
        InteractionCallbackAutocompleteEntity,
        InteractionCallbackModalEntity,
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
export const BaseInteractionEntity = z.object({
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
  app_permissions: z.custom<BitwisePermissionFlags>(
    BitFieldManager.isValidBitField,
  ),

  /** Selected language of the invoking user */
  locale: z.nativeEnum(Locale).optional(),

  /** For monetized apps, any entitlements for the invoking user */
  entitlements: z.array(z.lazy(() => EntitlementEntity)).optional(),

  /** Mapping of installation contexts that the interaction was authorized for */
  authorizing_integration_owners: AuthorizingIntegrationOwnersEntity,

  /** Context where the interaction was triggered from */
  context: z.nativeEnum(InteractionContextType).optional(),
});

/**
 * Guild-specific interaction entity
 */
export const GuildInteractionEntity = BaseInteractionEntity.extend({
  /** Guild context identifier */
  context: z.literal(InteractionContextType.Guild),

  /** Guild ID that the interaction was sent from */
  guild_id: Snowflake,

  /** Guild that the interaction was sent from */
  guild: z.lazy(() => GuildEntity.partial()),

  /** Guild member data for the invoking user */
  member: z.lazy(() => GuildMemberEntity),

  /** Channel ID that the interaction was sent from */
  channel_id: Snowflake.optional(),

  /** Channel that the interaction was sent from */
  channel: z.lazy(() => ChannelEntity.partial()).optional(),

  /** Guild's preferred locale, if invoked in a guild */
  guild_locale: z.nativeEnum(Locale).optional(),

  /** For components, the message they were attached to */
  message: z.lazy(() => MessageEntity).optional(),
});

export type GuildInteractionEntity = z.infer<typeof GuildInteractionEntity>;

/**
 * Bot DM-specific interaction entity
 */
export const BotDmInteractionEntity = BaseInteractionEntity.extend({
  /** Bot DM context identifier */
  context: z.literal(InteractionContextType.BotDm),

  /** Channel ID that the interaction was sent from */
  channel_id: Snowflake,

  /** Channel that the interaction was sent from */
  channel: z.lazy(() => ChannelEntity.partial()),

  /** User object for the invoking user */
  user: z.lazy(() => UserEntity),

  /** For components, the message they were attached to */
  message: z.lazy(() => MessageEntity).optional(),
});

export type BotDmInteractionEntity = z.infer<typeof BotDmInteractionEntity>;

/**
 * Private channel-specific interaction entity
 */
export const PrivateChannelInteractionEntity = BaseInteractionEntity.extend({
  /** Private channel context identifier */
  context: z.literal(InteractionContextType.PrivateChannel),

  /** Channel ID that the interaction was sent from */
  channel_id: Snowflake,

  /** Channel that the interaction was sent from */
  channel: z.lazy(() => ChannelEntity.partial()),

  /** User object for the invoking user */
  user: z.lazy(() => UserEntity),

  /** For components, the message they were attached to */
  message: z.lazy(() => MessageEntity).optional(),
});

export type PrivateChannelInteractionEntity = z.infer<
  typeof PrivateChannelInteractionEntity
>;

/**
 * Union of all context-specific interaction entities
 */
export const AnyInteractionEntity = z.discriminatedUnion("context", [
  GuildInteractionEntity,
  BotDmInteractionEntity,
  PrivateChannelInteractionEntity,
]);

export type AnyInteractionEntity = z.infer<typeof AnyInteractionEntity>;
