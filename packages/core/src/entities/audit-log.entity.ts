import { z } from "zod";
import { Snowflake } from "../managers/index.js";
import { ApplicationCommandEntity } from "./application-commands.entity.js";
import { AutoModerationRuleEntity } from "./auto-moderation.entity.js";
import { AnyThreadChannelEntity } from "./channel.entity.js";
import { IntegrationEntity } from "./guild.entity.js";
import { GuildScheduledEventEntity } from "./scheduled-event.entity.js";
import { UserEntity } from "./user.entity.js";
import { WebhookEntity } from "./webhook.entity.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/audit-log#audit-log-change-object}
 */
export const AuditLogChangeEntity = z
  .object({
    key: z.string(),
    new_value: z.unknown().optional(),
    old_value: z.unknown().optional(),
  })
  .strict();

export type AuditLogChangeEntity = z.infer<typeof AuditLogChangeEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/audit-log#audit-log-change-object-audit-log-change-exceptions}
 */
export const AuditLogCommandPermissionChangeEntity = z
  .object({
    key: Snowflake,
    old_value: z.record(z.unknown()),
    new_value: z.record(z.unknown()),
  })
  .strict();

export type AuditLogCommandPermissionChangeEntity = z.infer<
  typeof AuditLogCommandPermissionChangeEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/audit-log#audit-log-change-object-audit-log-change-exceptions}
 */
export const AuditLogRoleChangeEntity = z
  .object({
    key: z.union([z.literal("$add"), z.literal("$remove")]),
    new_value: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
      }),
    ),
  })
  .strict();

export type AuditLogRoleChangeEntity = z.infer<typeof AuditLogRoleChangeEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/audit-log#audit-log-entry-object-optional-audit-entry-info}
 */
export const AuditLogEntryInfoEntity = z
  .object({
    application_id: Snowflake.optional(),
    auto_moderation_rule_name: z.string().optional(),
    auto_moderation_rule_trigger_type: z.string().optional(),
    channel_id: Snowflake.optional(),
    count: z.string().optional(),
    delete_member_days: z.string().optional(),
    id: Snowflake.optional(),
    members_removed: z.string().optional(),
    message_id: Snowflake.optional(),
    role_name: z.string().optional(),
    type: z.union([z.literal("0"), z.literal("1")]).optional(),
    integration_type: z.string().optional(),
  })
  .strict();

export type AuditLogEntryInfoEntity = z.infer<typeof AuditLogEntryInfoEntity>;

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
export const AuditLogEntryEntity = z
  .object({
    target_id: z.string().nullable(),
    changes: z
      .union([
        z.array(AuditLogChangeEntity),
        z.array(AuditLogCommandPermissionChangeEntity),
        z.array(AuditLogRoleChangeEntity),
      ])
      .optional(),
    user_id: Snowflake.nullable(),
    id: Snowflake,
    action_type: z.nativeEnum(AuditLogEvent),
    options: AuditLogEntryInfoEntity.optional(),
    reason: z.string().optional(),
  })
  .strict();

export type AuditLogEntryEntity = z.infer<typeof AuditLogEntryEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/audit-log#audit-log-object}
 */
export const AuditLogEntity = z
  .object({
    application_commands: z.array(ApplicationCommandEntity),
    audit_log_entries: z.array(AuditLogEntryEntity),
    auto_moderation_rules: z.array(AutoModerationRuleEntity),
    guild_scheduled_events: z.array(GuildScheduledEventEntity),
    integrations: z.array(IntegrationEntity.partial()),
    threads: z.array(AnyThreadChannelEntity),
    users: z.array(UserEntity),
    webhooks: z.array(WebhookEntity),
  })
  .strict();

export type AuditLogEntity = z.infer<typeof AuditLogEntity>;
