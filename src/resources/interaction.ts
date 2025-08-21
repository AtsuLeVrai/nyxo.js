import type { Snowflake } from "../common/index.js";
import { ApplicationIntegrationType } from "./application.js";
import type { AnyChannelObject } from "./channel.js";
import type { EmojiObject } from "./emoji.js";
import type { EntitlementObject } from "./entitlement.js";
import type { GuildMemberObject, GuildObject, RoleObject } from "./guild.js";
import type { AttachmentObject, MessageObject } from "./message.js";
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
}

export enum ComponentType {
  ActionRow = 1,
  Button = 2,
  StringSelect = 3,
  TextInput = 4,
  UserSelect = 5,
  RoleSelect = 6,
  MentionableSelect = 7,
  ChannelSelect = 8,
}

export interface AuthorizingIntegrationOwnersObject {
  [ApplicationIntegrationType.GuildInstall]?: Snowflake;
  [ApplicationIntegrationType.UserInstall]?: Snowflake;
}

export interface ResolvedDataObject {
  users?: Record<Snowflake, UserObject>;
  members?: Record<Snowflake, Partial<GuildMemberObject>>;
  roles?: Record<Snowflake, RoleObject>;
  channels?: Record<Snowflake, Partial<AnyChannelObject>>;
  messages?: Record<Snowflake, Partial<MessageObject>>;
  attachments?: Record<Snowflake, AttachmentObject>;
}

interface BaseInteractionObject {
  id: Snowflake;
  application_id: Snowflake;
  token: string;
  version: number;
  app_permissions: string;
  locale?: string;
  guild_locale?: string;
  entitlements: EntitlementObject[];
  authorizing_integration_owners: AuthorizingIntegrationOwnersObject;
  context?: InteractionContextType;
  attachment_size_limit: number;
}

interface BaseGuildInteractionObject extends BaseInteractionObject {
  guild: Partial<GuildObject>;
  guild_id: Snowflake;
  channel: Partial<AnyChannelObject>;
  channel_id: Snowflake;
  member: GuildMemberObject;
}

interface BaseDMInteractionObject extends BaseInteractionObject {
  channel?: Partial<AnyChannelObject>;
  channel_id?: Snowflake;
  user: UserObject;
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
  components: MessageComponentObject[];
}

export interface MessageComponentObject {
  type: ComponentType;
  custom_id?: string;
  disabled?: boolean;
  style?: number;
  label?: string;
  emoji?: Partial<EmojiObject>;
  url?: string;
  options?: SelectOptionObject[];
  placeholder?: string;
  min_values?: number;
  max_values?: number;
  min_length?: number;
  max_length?: number;
  required?: boolean;
  value?: string;
  components?: MessageComponentObject[];
}

export interface SelectOptionObject {
  label: string;
  value: string;
  description?: string;
  emoji?: Pick<EmojiObject, "id" | "name" | "animated">;
  default?: boolean;
}

export interface PingInteractionObject extends BaseInteractionObject {
  type: InteractionType.Ping;
}

export interface ApplicationCommandGuildInteractionObject extends BaseGuildInteractionObject {
  type: InteractionType.ApplicationCommand;
  data: ApplicationCommandInteractionDataObject;
}

export interface ApplicationCommandDMInteractionObject extends BaseDMInteractionObject {
  type: InteractionType.ApplicationCommand;
  data: ApplicationCommandInteractionDataObject;
}

export interface MessageComponentGuildInteractionObject extends BaseGuildInteractionObject {
  type: InteractionType.MessageComponent;
  data: MessageComponentInteractionDataObject;
  message: MessageObject;
}

export interface MessageComponentDMInteractionObject extends BaseDMInteractionObject {
  type: InteractionType.MessageComponent;
  data: MessageComponentInteractionDataObject;
  message: MessageObject;
}

export interface ApplicationCommandAutocompleteGuildInteractionObject
  extends BaseGuildInteractionObject {
  type: InteractionType.ApplicationCommandAutocomplete;
  data: Partial<ApplicationCommandInteractionDataObject>;
}

export interface ApplicationCommandAutocompleteDMInteractionObject extends BaseDMInteractionObject {
  type: InteractionType.ApplicationCommandAutocomplete;
  data: Partial<ApplicationCommandInteractionDataObject>;
}

export interface ModalSubmitGuildInteractionObject extends BaseGuildInteractionObject {
  type: InteractionType.ModalSubmit;
  data: ModalSubmitInteractionDataObject;
  message?: MessageObject;
}

export interface ModalSubmitDMInteractionObject extends BaseDMInteractionObject {
  type: InteractionType.ModalSubmit;
  data: ModalSubmitInteractionDataObject;
  message?: MessageObject;
}

export type GuildInteractionObject =
  | ApplicationCommandGuildInteractionObject
  | MessageComponentGuildInteractionObject
  | ApplicationCommandAutocompleteGuildInteractionObject
  | ModalSubmitGuildInteractionObject;

export type DMInteractionObject =
  | ApplicationCommandDMInteractionObject
  | MessageComponentDMInteractionObject
  | ApplicationCommandAutocompleteDMInteractionObject
  | ModalSubmitDMInteractionObject;

export type ApplicationCommandInteractionObject =
  | ApplicationCommandGuildInteractionObject
  | ApplicationCommandDMInteractionObject;

export type MessageComponentInteractionObject =
  | MessageComponentGuildInteractionObject
  | MessageComponentDMInteractionObject;

export type ApplicationCommandAutocompleteInteractionObject =
  | ApplicationCommandAutocompleteGuildInteractionObject
  | ApplicationCommandAutocompleteDMInteractionObject;

export type ModalSubmitInteractionObject =
  | ModalSubmitGuildInteractionObject
  | ModalSubmitDMInteractionObject;

export type AnyInteractionObject =
  | PingInteractionObject
  | ApplicationCommandGuildInteractionObject
  | ApplicationCommandDMInteractionObject
  | MessageComponentGuildInteractionObject
  | MessageComponentDMInteractionObject
  | ApplicationCommandAutocompleteGuildInteractionObject
  | ApplicationCommandAutocompleteDMInteractionObject
  | ModalSubmitGuildInteractionObject
  | ModalSubmitDMInteractionObject;
