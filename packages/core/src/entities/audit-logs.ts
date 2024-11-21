import type { Snowflake } from "../formatting/index.js";
import type { ApplicationCommandEntity } from "./applications-commands.js";
import type { AutoModerationRuleEntity } from "./auto-moderations.js";
import type { ChannelEntity } from "./channels.js";
import type { IntegrationEntity } from "./guilds.js";
import type { GuildScheduledEventEntity } from "./scheduled-events.js";
import type { UserEntity } from "./users.js";
import type { WebhookEntity } from "./webhooks.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/audit-log#audit-log-change-object-audit-log-change-structure}
 */
export interface AuditLogChangeEntity {
  key: string;
  new_value?: unknown;
  old_value?: unknown;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/audit-log#audit-log-entry-object-optional-audit-entry-info}
 */
export interface AuditLogEntryInfo {
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

/**
 * @see {@link https://discord.com/developers/docs/resources/audit-log#audit-log-entry-object-audit-log-events}
 */
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
  SoundboardSoundCreate = 130,
  SoundboardSoundUpdate = 131,
  SoundboardSoundDelete = 132,
  AutoModerationRuleCreate = 140,
  AutoModerationRuleUpdate = 141,
  AutoModerationRuleDelete = 142,
  AutoModerationBlockMessage = 143,
  AutoModerationFlagToChannel = 144,
  AutoModerationUserCommunicationDisabled = 145,
  CreatorMonetizationRequestCreated = 150,
  CreatorMonetizationTermsAccepted = 151,
  OnboardingPromptCreate = 163,
  OnboardingPromptUpdate = 164,
  OnboardingPromptDelete = 165,
  OnboardingCreate = 166,
  OnboardingUpdate = 167,
  HomeSettingsCreate = 190,
  HomeSettingsUpdate = 191,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/audit-log#audit-log-entry-object-audit-log-entry-structure}
 */
export interface AuditLogEntryEntity {
  target_id: string | null;
  changes?: AuditLogChangeEntity[];
  user_id: Snowflake | null;
  id: Snowflake;
  action_type: AuditLogEvent;
  options?: AuditLogEntryInfo;
  reason?: string;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/audit-log#audit-log-object-audit-log-structure}
 */
export interface AuditLogEntity {
  application_commands: ApplicationCommandEntity[];
  audit_log_entries: AuditLogEntryEntity[];
  auto_moderation_rules: AutoModerationRuleEntity[];
  guild_scheduled_events: GuildScheduledEventEntity[];
  integrations: Partial<IntegrationEntity>[];
  threads: ChannelEntity[];
  users: UserEntity[];
  webhooks: WebhookEntity[];
}
