import type { AnyApplicationCommandEntity } from "../application-commands/index.js";
import type { AutoModerationRuleEntity } from "../auto-moderation/index.js";
import type { AnyThreadBasedChannelEntity } from "../channel/index.js";
import type { IntegrationEntity } from "../guild/index.js";
import type { GuildScheduledEventEntity } from "../guild-scheduled-event/index.js";
import type { UserEntity } from "../user/index.js";
import type { WebhookEntity } from "../webhook/index.js";

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

export interface AuditLogChangeEntity {
  key: string;
  new_value?: unknown;
  old_value?: unknown;
}

export interface AuditLogCommandPermissionChangeEntity {
  key: string;
  old_value: Record<string, unknown>;
  new_value: Record<string, unknown>;
}

export interface AuditLogRoleChangeEntity {
  key: "$add" | "$remove";
  new_value: Array<{
    id: string;
    name: string;
  }>;
}

export interface AuditLogEntryInfoEntity {
  application_id?: string;
  auto_moderation_rule_name?: string;
  auto_moderation_rule_trigger_type?: string;
  channel_id?: string;
  count?: string;
  delete_member_days?: string;
  id?: string;
  members_removed?: string;
  message_id?: string;
  role_name?: string;
  type?: "0" | "1";
  integration_type?: string;
}

export interface AuditLogEntryEntity {
  target_id: string | null;
  changes?: Array<
    AuditLogChangeEntity | AuditLogCommandPermissionChangeEntity | AuditLogRoleChangeEntity
  >;
  user_id: string | null;
  id: string;
  action_type: AuditLogEvent;
  options?: AuditLogEntryInfoEntity;
  reason?: string;
}

export interface AuditLogEntity {
  application_commands: AnyApplicationCommandEntity[];
  audit_log_entries: AuditLogEntryEntity[];
  auto_moderation_rules: AutoModerationRuleEntity[];
  guild_scheduled_events: GuildScheduledEventEntity[];
  integrations: Partial<IntegrationEntity>[];
  threads: AnyThreadBasedChannelEntity[];
  users: UserEntity[];
  webhooks: WebhookEntity[];
}

export interface GuildAuditLogEntryCreateEntity extends AuditLogEntryEntity {
  guild_id: string;
}
