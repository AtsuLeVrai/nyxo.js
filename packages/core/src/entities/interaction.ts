import type { BitwisePermissionFlags, LocaleKey } from "../enums/index.js";
import type { Snowflake } from "../managers/index.js";
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
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-callback-interaction-callback-activity-instance-resource}
 */
export interface InteractionCallbackActivityInstance {
  id: string;
}

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-callback-interaction-callback-resource-object}
 */
export interface InteractionCallbackResource {
  type: InteractionCallbackType;
  activity_instance?: InteractionCallbackActivityInstance;
  message?: MessageEntity;
}

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-callback-interaction-callback-object}
 */
export interface InteractionCallbackEntity {
  id: Snowflake;
  type: InteractionCallbackType;
  activity_instance_id?: string;
  response_message_id?: Snowflake;
  response_message_loading?: boolean;
  response_message_ephemeral?: boolean;
}

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-callback-interaction-callback-response-object}
 */
export interface InteractionCallbackResponse {
  interaction: InteractionCallbackEntity;
  resource?: InteractionCallbackResource;
}

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-response-object-modal}
 */
export interface InteractionCallbackModal {
  custom_id: string;
  title: string;
  components: ActionRowEntity[];
}

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-response-object-autocomplete}
 */
export interface InteractionCallbackAutocomplete {
  choices: ApplicationCommandOptionChoiceEntity[];
}

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-response-object-messages}
 */
export interface InteractionCallbackMessages {
  tts?: boolean;
  content?: string;
  embeds?: EmbedEntity[];
  allowed_mentions?: AllowedMentionsEntity;
  flags?: MessageFlags;
  components?: ActionRowEntity[];
  attachments?: Partial<AttachmentEntity>;
  poll?: PollCreateRequestEntity;
}

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
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-response-object-interaction-response-structure}
 */
export interface InteractionCallbackResponseEntity {
  type: InteractionCallbackType;
  data?: InteractionCallbackMessages;
}

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#message-interaction-object-message-interaction-structure}
 */
export interface MessageInteractionEntity {
  id: Snowflake;
  type: InteractionType;
  name: string;
  user: UserEntity;
  member?: Partial<GuildMemberEntity>;
}

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

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-resolved-data-structure}
 */
export interface InteractionResolvedData {
  users?: Map<Snowflake, UserEntity>;
  members?: Map<Snowflake, Omit<GuildMemberEntity, "user" | "deaf" | "mute">>;
  roles?: Map<Snowflake, RoleEntity>;
  channels?: Map<
    Snowflake,
    Pick<
      ChannelEntity,
      "id" | "name" | "type" | "permissions" | "thread_metadata" | "parent_id"
    >
  >;
  messages?: Map<Snowflake, Partial<MessageEntity>>;
  attachments?: Map<Snowflake, AttachmentEntity>;
}

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-modal-submit-data-structure}
 */
export interface InteractionModalSubmitData {
  custom_id: string;
  components: ActionRowEntity[];
}

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-message-component-data-structure}
 */
export interface InteractionMessageComponentData {
  custom_id: string;
  component_type: ComponentType;
  values?: SelectMenuOption[];
  resolved?: InteractionResolvedData;
}

/**
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-application-command-data-structure}
 */
export interface ApplicationCommandInteractionData {
  id: Snowflake;
  name: string;
  type: ApplicationCommandType;
  resolved?: InteractionResolvedData;
  options?: ApplicationCommandInteractionDataOptionEntity[];
  guild_id?: Snowflake;
  target_id?: Snowflake;
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
 * @see {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-structure}
 */
export interface InteractionEntity {
  id: Snowflake;
  application_id: Snowflake;
  type: InteractionType;
  data?: ApplicationCommandInteractionData | InteractionMessageComponentData;
  guild?: Partial<GuildEntity>;
  guild_id?: Snowflake;
  channel?: Partial<ChannelEntity>;
  channel_id?: Snowflake;
  member?: GuildMemberEntity;
  user?: UserEntity;
  token: string;
  version: 1;
  message?: MessageEntity;
  app_permissions: BitwisePermissionFlags;
  locale?: LocaleKey;
  guild_locale?: LocaleKey;
  entitlements: EntitlementEntity[];
  authorizing_integration_owners: Record<ApplicationIntegrationType, Snowflake>;
  context?: InteractionContextType;
}
