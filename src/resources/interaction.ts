import type { Snowflake } from "../common/index.js";
import type { ApplicationIntegrationType } from "./application.js";
import type { ApplicationCommandOptionChoiceObject } from "./application-commands.js";
import type { AnyChannelObject } from "./channel.js";
import type {
  ActionRowComponentObject,
  ComponentType,
  TextInputComponentObject,
} from "./components.js";
import type { EntitlementObject } from "./entitlement.js";
import type { GuildMemberObject, GuildObject, RoleObject } from "./guild.js";
import type {
  AllowedMentionsObject,
  AttachmentObject,
  EmbedObject,
  MessageObject,
} from "./message.js";
import type { PollCreateRequestObject } from "./poll.js";
import type { UserObject } from "./user.js";

export enum InteractionType {
  Ping = 1,
  ApplicationCommand = 2,
  MessageComponent = 3,
  ApplicationCommandAutocomplete = 4,
  ModalSubmit = 5,
}

export enum InteractionContextType {
  Guild = 0,
  BotDM = 1,
  PrivateChannel = 2,
}

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

export interface ResolvedDataObject {
  users?: Record<Snowflake, UserObject>;
  members?: Record<Snowflake, Partial<GuildMemberObject>>;
  roles?: Record<Snowflake, RoleObject>;
  channels?: Record<Snowflake, Partial<AnyChannelObject>>;
  messages?: Record<Snowflake, Partial<MessageObject>>;
  attachments?: Record<Snowflake, AttachmentObject>;
}

export interface InteractionObject {
  id: Snowflake;
  application_id: Snowflake;
  type: InteractionType;
  data?: AnyInteractionDataObject;
  guild?: Partial<GuildObject>;
  guild_id?: Snowflake;
  channel?: Partial<AnyChannelObject>;
  channel_id?: Snowflake;
  member?: GuildMemberObject;
  user?: UserObject;
  token: string;
  version: number;
  message?: MessageObject;
  app_permissions: string;
  locale?: string;
  guild_locale?: string;
  entitlements: EntitlementObject[];
  authorizing_integration_owners: Partial<Record<ApplicationIntegrationType, Snowflake>>;
  context?: InteractionContextType;
  attachment_size_limit: number;
}

export interface ApplicationCommandInteractionDataOptionObject {
  name: string;
  type: number;
  value?: string | number | boolean;
  options?: ApplicationCommandInteractionDataOptionObject[];
  focused?: boolean;
}

export interface ApplicationCommandInteractionDataObject {
  id: Snowflake;
  name: string;
  type: number;
  resolved?: ResolvedDataObject;
  options?: ApplicationCommandInteractionDataOptionObject[];
  guild_id?: Snowflake;
  target_id?: Snowflake;
}

export interface MessageComponentInteractionDataObject {
  custom_id: string;
  component_type: ComponentType;
  values?: string[];
  resolved?: ResolvedDataObject;
}

export interface ModalSubmitInteractionDataObject {
  custom_id: string;
  components: ActionRowComponentObject<TextInputComponentObject>[];
}

export type AnyInteractionDataObject =
  | ApplicationCommandInteractionDataObject
  | MessageComponentInteractionDataObject
  | ModalSubmitInteractionDataObject;

export interface PingInteractionObject
  extends Pick<
    InteractionObject,
    | "id"
    | "application_id"
    | "token"
    | "version"
    | "app_permissions"
    | "entitlements"
    | "authorizing_integration_owners"
    | "context"
    | "attachment_size_limit"
  > {
  type: InteractionType.Ping;
}

export interface ApplicationCommandInteractionObject
  extends Pick<
    InteractionObject,
    | "id"
    | "application_id"
    | "data"
    | "guild"
    | "guild_id"
    | "channel"
    | "channel_id"
    | "member"
    | "user"
    | "token"
    | "version"
    | "app_permissions"
    | "locale"
    | "guild_locale"
    | "entitlements"
    | "authorizing_integration_owners"
    | "context"
    | "attachment_size_limit"
  > {
  type: InteractionType.ApplicationCommand;
  data: ApplicationCommandInteractionDataObject;
}

export interface MessageComponentInteractionObject
  extends Pick<
    InteractionObject,
    | "id"
    | "application_id"
    | "data"
    | "guild"
    | "guild_id"
    | "channel"
    | "channel_id"
    | "member"
    | "user"
    | "token"
    | "version"
    | "message"
    | "app_permissions"
    | "locale"
    | "guild_locale"
    | "entitlements"
    | "authorizing_integration_owners"
    | "context"
    | "attachment_size_limit"
  > {
  type: InteractionType.MessageComponent;
  data: MessageComponentInteractionDataObject;
  message: MessageObject;
}

export interface ApplicationCommandAutocompleteInteractionObject
  extends Pick<
    InteractionObject,
    | "id"
    | "application_id"
    | "data"
    | "guild"
    | "guild_id"
    | "channel"
    | "channel_id"
    | "member"
    | "user"
    | "token"
    | "version"
    | "app_permissions"
    | "locale"
    | "guild_locale"
    | "entitlements"
    | "authorizing_integration_owners"
    | "context"
    | "attachment_size_limit"
  > {
  type: InteractionType.ApplicationCommandAutocomplete;
  data: ApplicationCommandInteractionDataObject;
}

export interface ModalSubmitInteractionObject
  extends Pick<
    InteractionObject,
    | "id"
    | "application_id"
    | "data"
    | "guild"
    | "guild_id"
    | "channel"
    | "channel_id"
    | "member"
    | "user"
    | "token"
    | "version"
    | "message"
    | "app_permissions"
    | "locale"
    | "guild_locale"
    | "entitlements"
    | "authorizing_integration_owners"
    | "context"
    | "attachment_size_limit"
  > {
  type: InteractionType.ModalSubmit;
  data: ModalSubmitInteractionDataObject;
  message?: MessageObject;
}

export type AnyInteractionObject =
  | PingInteractionObject
  | ApplicationCommandInteractionObject
  | MessageComponentInteractionObject
  | ApplicationCommandAutocompleteInteractionObject
  | ModalSubmitInteractionObject;

export interface MessageInteractionObject {
  id: Snowflake;
  type: InteractionType;
  name: string;
  user: UserObject;
  member?: Partial<GuildMemberObject>;
}

export interface InteractionResponseObject {
  type: InteractionCallbackType;
  data?: InteractionCallbackDataStructure;
}

export interface InteractionCallbackDataStructure {
  tts?: boolean;
  content?: string;
  embeds?: EmbedObject[];
  allowed_mentions?: AllowedMentionsObject;
  flags?: number;
  components?: ActionRowComponentObject[];
  attachments?: Partial<AttachmentObject>[];
  poll?: PollCreateRequestObject;
  choices?: ApplicationCommandOptionChoiceObject[];
  custom_id?: string;
  title?: string;
}

export interface InteractionCallbackResponseObject {
  interaction: InteractionCallbackObject;
  resource?: InteractionCallbackResourceObject;
}

export interface InteractionCallbackObject {
  id: Snowflake;
  type: InteractionType;
  activity_instance_id?: string;
  response_message_id?: Snowflake;
  response_message_loading?: boolean;
  response_message_ephemeral?: boolean;
}

export interface InteractionCallbackResourceObject {
  type: InteractionCallbackType;
  activity_instance?: InteractionCallbackActivityInstanceResource;
  message?: MessageObject;
}

export interface InteractionCallbackActivityInstanceResource {
  id: string;
}
