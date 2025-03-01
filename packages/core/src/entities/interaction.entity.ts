import { z } from "zod";
import { type BitwisePermissionFlags, LocaleKey } from "../enums/index.js";
import { BitFieldManager, Snowflake } from "../managers/index.js";
import {
  ApplicationCommandOptionChoiceEntity,
  ApplicationCommandOptionType,
} from "./application-commands.entity.js";
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
  // message: MessageEntity.optional(), // Commented to avoid circular reference
});

export type InteractionCallbackResourceEntity = z.infer<
  typeof InteractionCallbackResourceEntity
>;

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

  // messages: z.record(Snowflake, MessageEntity).optional(), // Commented to avoid circular reference
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
 * Message component interaction data structure
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#message-component-data-structure}
 */
export const MessageComponentInteractionDataEntity = z.object({
  /** Developer-defined identifier for the component */
  custom_id: z.string(),

  /** Type of component */
  component_type: z.nativeEnum(ComponentType),

  /** Values selected by the user (for select menu components) */
  values: z.array(z.lazy(() => SelectMenuEntity)).optional(),

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

// Base command option structure
const BaseCommandOption = z.object({
  /** Name of the parameter */
  name: z.string(),

  /** Type of the option */
  type: z.nativeEnum(ApplicationCommandOptionType),
});

const StringCommandOption = BaseCommandOption.extend({
  /** String option type */
  type: z.literal(3),

  /** Value of the option resulting from user input */
  value: z.string(),

  /** True if this option is the currently focused option for autocomplete */
  focused: z.boolean().optional(),
});

const NumberCommandOption = BaseCommandOption.extend({
  /** Number option type */
  type: z.literal(10),

  /** Value of the option resulting from user input */
  value: z.number(),

  /** True if this option is the currently focused option for autocomplete */
  focused: z.boolean().optional(),
});

const IntegerCommandOption = BaseCommandOption.extend({
  /** Integer option type */
  type: z.literal(4),

  /** Value of the option resulting from user input */
  value: z.number().int(),

  /** True if this option is the currently focused option for autocomplete */
  focused: z.boolean().optional(),
});

const BooleanCommandOption = BaseCommandOption.extend({
  /** Boolean option type */
  type: z.literal(5),

  /** Value of the option resulting from user input */
  value: z.boolean(),

  /** True if this option is the currently focused option for autocomplete */
  focused: z.boolean().optional(),
});

const SubCommandOption = BaseCommandOption.extend({
  /** SubCommand option type */
  type: z.literal(1),

  /** Options for this subcommand */
  options: z.array(z.lazy(() => SimpleCommandOption)).optional(),
});

const SubCommandGroupOption = BaseCommandOption.extend({
  /** SubCommandGroup option type */
  type: z.literal(2),

  /** SubCommand options for this group */
  options: z.array(SubCommandOption),
});

const SimpleCommandOption = z.discriminatedUnion("type", [
  StringCommandOption,
  NumberCommandOption,
  IntegerCommandOption,
  BooleanCommandOption,
]);

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
  // TODO: Fix enum ApplicationCommandType error in zod
  type: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),

  /** Converted users + roles + channels + attachments */
  resolved: InteractionResolvedDataEntity.optional(),

  /** Parameters and values from the user */
  options: z
    .array(
      z.discriminatedUnion("type", [
        SubCommandOption,
        SubCommandGroupOption,
        ...SimpleCommandOption.options,
      ]),
    )
    .optional(),

  /** ID of the guild the command is registered to */
  guild_id: Snowflake.optional(),

  /** ID of the user or message targeted by a user or message command */
  target_id: Snowflake.optional(),
});

export type ApplicationCommandInteractionDataEntity = z.infer<
  typeof ApplicationCommandInteractionDataEntity
>;

/**
 * Union of all interaction data types
 *
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-data}
 */
export const InteractionDataEntity = z.union([
  ApplicationCommandInteractionDataEntity,
  MessageComponentInteractionDataEntity,
  ModalSubmitInteractionDataEntity,
]);

export type InteractionDataEntity = z.infer<typeof InteractionDataEntity>;

/**
 * Message interaction structure sent on message objects when responding to an interaction
 *
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
 * Interaction callback response object
 *
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
 *
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
 * Interaction callback modal entity for responding with a popup modal
 *
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
 *
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
 *
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
 * Main Interaction object structure
 *
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object}
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

  /** Guild that the interaction was sent from */
  guild: z.lazy(() => GuildEntity.partial()).optional(),

  /** Guild ID that the interaction was sent from */
  guild_id: Snowflake.optional(),

  /** Channel that the interaction was sent from */
  channel: z.lazy(() => ChannelEntity.partial()).optional(),

  /** Channel ID that the interaction was sent from */
  channel_id: Snowflake.optional(),

  /** Guild member data for the invoking user, including permissions */
  member: z.lazy(() => GuildMemberEntity).optional(),

  /** User object for the invoking user, if invoked in a DM */
  user: z.lazy(() => UserEntity).optional(),

  /** Continuation token for responding to the interaction */
  token: z.string(),

  /** Read-only property, always 1 */
  version: z.literal(1),

  // TODO: Fix circular reference error in zod
  // message: MessageEntity.optional(),

  /** Bitwise set of permissions the app has in the source location of the interaction */
  app_permissions: z.custom<BitwisePermissionFlags>(
    BitFieldManager.isValidBitField,
  ),

  /** Selected language of the invoking user */
  locale: LocaleKey.optional(),

  /** Guild's preferred locale, if invoked in a guild */
  guild_locale: LocaleKey.optional(),

  /** For monetized apps, any entitlements for the invoking user */
  entitlements: z.array(z.lazy(() => EntitlementEntity)).optional(),

  /** Mapping of installation contexts that the interaction was authorized for */
  authorizing_integration_owners: z.record(z.string(), Snowflake),

  /** Context where the interaction was triggered from */
  context: z.nativeEnum(InteractionContextType).optional(),
});

export type InteractionEntity = z.infer<typeof InteractionEntity>;

const commonFields = {
  id: true,
  application_id: true,
  type: true,
  data: true,
  token: true,
  version: true,
  app_permissions: true,
  locale: true,
  entitlements: true,
  authorizing_integration_owners: true,
  context: true,
} as const;

/**
 * Guild-specific interaction entity
 */
export const GuildInteractionEntity = InteractionEntity.omit({
  user: true,
})
  .pick({
    ...commonFields,
    guild_id: true,
    guild: true,
    channel_id: true,
    channel: true,
    member: true,
    guild_locale: true,
    // message: true,
  })
  .extend({
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
  });

export type GuildInteractionEntity = z.infer<typeof GuildInteractionEntity>;

/**
 * Bot DM-specific interaction entity
 */
export const BotDmInteractionEntity = InteractionEntity.omit({
  guild: true,
  guild_id: true,
  member: true,
  guild_locale: true,
})
  .pick({
    ...commonFields,
    channel_id: true,
    channel: true,
    user: true,
    // message: true,
  })
  .extend({
    /** Bot DM context identifier */
    context: z.literal(InteractionContextType.BotDm),

    /** Channel ID that the interaction was sent from */
    channel_id: Snowflake,

    /** Channel that the interaction was sent from */
    channel: z.lazy(() => ChannelEntity.partial()),

    /** User object for the invoking user */
    user: z.lazy(() => UserEntity),
  });

export type BotDmInteractionEntity = z.infer<typeof BotDmInteractionEntity>;

/**
 * Private channel-specific interaction entity
 */
export const PrivateChannelInteractionEntity = InteractionEntity.omit({
  guild: true,
  guild_id: true,
  member: true,
  guild_locale: true,
})
  .pick({
    ...commonFields,
    channel_id: true,
    channel: true,
    user: true,
    // message: true,
  })
  .extend({
    /** Private channel context identifier */
    context: z.literal(InteractionContextType.PrivateChannel),

    /** Channel ID that the interaction was sent from */
    channel_id: Snowflake,

    /** Channel that the interaction was sent from */
    channel: z.lazy(() => ChannelEntity.partial()),

    /** User object for the invoking user */
    user: z.lazy(() => UserEntity),
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
