import type { Snowflake } from "../common/index.js";
import type { AutoModerationRuleObject } from "./auto-moderation.js";
import type { AnyChannelObject } from "./channel.js";
import type { IntegrationObject } from "./guild.js";
import type { GuildScheduledEventObject } from "./guild-scheduled-event.js";
import type { UserObject } from "./user.js";
import type { WebhookObject } from "./webhook.js";

export enum AuditLogEvent {
  GuildUpdate = 1,
  ChannelCreate = 10,
  ChannelUpdate = 11,
  ChannelDelete = 12,
  ChannelOverwriteCreate = 13,
  ChannelOverwriteUpdate = 14,
  ChannelOverwriteDelete = 15,
  MemberKick = 20,
  MemberPrune = 21,
  MemberBanAdd = 22,
  MemberBanRemove = 23,
  MemberUpdate = 24,
  MemberRoleUpdate = 25,
  MemberMove = 26,
  MemberDisconnect = 27,
  BotAdd = 28,
  RoleCreate = 30,
  RoleUpdate = 31,
  RoleDelete = 32,
  InviteCreate = 40,
  InviteUpdate = 41,
  InviteDelete = 42,
  WebhookCreate = 50,
  WebhookUpdate = 51,
  WebhookDelete = 52,
  EmojiCreate = 60,
  EmojiUpdate = 61,
  EmojiDelete = 62,
  MessageDelete = 72,
  MessageBulkDelete = 73,
  MessagePin = 74,
  MessageUnpin = 75,
  IntegrationCreate = 80,
  IntegrationUpdate = 81,
  IntegrationDelete = 82,
  StageInstanceCreate = 83,
  StageInstanceUpdate = 84,
  StageInstanceDelete = 85,
  StickerCreate = 90,
  StickerUpdate = 91,
  StickerDelete = 92,
  GuildScheduledEventCreate = 100,
  GuildScheduledEventUpdate = 101,
  GuildScheduledEventDelete = 102,
  ThreadCreate = 110,
  ThreadUpdate = 111,
  ThreadDelete = 112,
  ApplicationCommandPermissionUpdate = 121,
  AutoModerationRuleCreate = 140,
  AutoModerationRuleUpdate = 141,
  AutoModerationRuleDelete = 142,
  AutoModerationBlockMessage = 143,
  AutoModerationFlagToChannel = 144,
  AutoModerationUserTimeout = 145,
  CreatorMonetizationRequestCreated = 150,
  CreatorMonetizationTermsAccepted = 151,
}

export interface AuditLogObject {
  application_commands: ApplicationCommandObject[];
  audit_log_entries: AuditLogEntryObject[];
  auto_moderation_rules: AutoModerationRuleObject[];
  guild_scheduled_events: GuildScheduledEventObject[];
  integrations: Partial<IntegrationObject>[];
  threads: AnyChannelObject[];
  users: UserObject[];
  webhooks: WebhookObject[];
}

export interface AuditLogEntryObject {
  target_id: string | null;
  changes?: AuditLogChangeObject[];
  user_id: Snowflake | null;
  id: Snowflake;
  action_type: AuditLogEvent;
  options?: OptionalAuditEntryInfoObject;
  reason?: string;
}

export interface AuditLogChangeObject {
  new_value?: unknown;
  old_value?: unknown;
  key: string;
}

export interface OptionalAuditEntryInfoObject {
  application_id?: Snowflake;
  auto_moderation_rule_name?: string;
  auto_moderation_rule_trigger_type?: string;
  channel_id?: Snowflake;
  count?: string;
  delete_member_days?: string;
  id?: Snowflake;
  members_removed?: string;
  message_id?: Snowflake;
  role_name?: string;
  type?: string;
  integration_type?: string;
}
