import type { Snowflake } from "../managers/index.js";
import type { ApplicationCommandEntity } from "./application-commands.js";
import type { AutoModerationRuleEntity } from "./auto-moderation.js";
import type { ChannelEntity } from "./channel.js";
import type { IntegrationEntity } from "./guild.js";
import type { GuildScheduledEventEntity } from "./scheduled-event.js";
import type { UserEntity } from "./user.js";
import type { WebhookEntity } from "./webhook.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/audit-log#audit-log-entry-object-optional-audit-entry-info}
 */
export enum AuditLogOverwriteType {
  Role = "0",
  Member = "1",
}

/**
 * @see {@link https://discord.com/developers/docs/resources/audit-log#audit-log-change-object}
 */
export interface AuditLogChangeEntity {
  key: string;
  new_value?: unknown;
  old_value?: unknown;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/audit-log#audit-log-change-object-audit-log-change-exceptions}
 */
export interface AuditLogCommandPermissionChangeEntity
  extends AuditLogChangeEntity {
  key: Snowflake;
  old_value: Record<string, unknown>;
  new_value: Record<string, unknown>;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/audit-log#audit-log-change-object-audit-log-change-exceptions}
 */
export interface AuditLogRoleChangeEntity extends AuditLogChangeEntity {
  key: "$add" | "$remove";
  new_value: Array<{
    id: Snowflake;
    name: string;
  }>;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/audit-log#audit-log-entry-object-optional-audit-entry-info}
 */
export interface AuditLogEntryInfoEntity {
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
  type?: AuditLogOverwriteType;
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
 * @see {@link https://discord.com/developers/docs/resources/audit-log#audit-log-entry-object}
 */
export interface AuditLogEntryEntity {
  target_id: string | null;
  changes?:
    | AuditLogChangeEntity[]
    | AuditLogCommandPermissionChangeEntity[]
    | AuditLogRoleChangeEntity[];
  user_id: Snowflake | null;
  id: Snowflake;
  action_type: AuditLogEvent;
  options?: AuditLogEntryInfoEntity;
  reason?: string;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/audit-log#audit-log-object}
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
