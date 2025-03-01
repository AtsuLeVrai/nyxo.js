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
 * Audit log events enumeration
 * @see {@link https://discord.com/developers/docs/resources/audit-log#audit-log-entry-object-audit-log-events}
 */
export enum AuditLogEvent {
  /** Server settings were updated */
  GuildUpdate = 1,

  /** Channel was created */
  ChannelCreate = 10,

  /** Channel settings were updated */
  ChannelUpdate = 11,

  /** Channel was deleted */
  ChannelDelete = 12,

  /** Permission overwrite was added to a channel */
  ChannelOverwriteCreate = 13,

  /** Permission overwrite was updated for a channel */
  ChannelOverwriteUpdate = 14,

  /** Permission overwrite was deleted from a channel */
  ChannelOverwriteDelete = 15,

  /** Member was removed from server */
  MemberKick = 20,

  /** Members were pruned from server */
  MemberPrune = 21,

  /** Member was banned from server */
  MemberBanAdd = 22,

  /** Server ban was lifted for a member */
  MemberBanRemove = 23,

  /** Member was updated in server */
  MemberUpdate = 24,

  /** Member was added or removed from a role */
  MemberRoleUpdate = 25,

  /** Member was moved to a different voice channel */
  MemberMove = 26,

  /** Member was disconnected from a voice channel */
  MemberDisconnect = 27,

  /** Bot user was added to server */
  BotAdd = 28,

  /** Role was created */
  RoleCreate = 30,

  /** Role was edited */
  RoleUpdate = 31,

  /** Role was deleted */
  RoleDelete = 32,

  /** Server invite was created */
  InviteCreate = 40,

  /** Server invite was updated */
  InviteUpdate = 41,

  /** Server invite was deleted */
  InviteDelete = 42,

  /** Webhook was created */
  WebhookCreate = 50,

  /** Webhook properties or channel were updated */
  WebhookUpdate = 51,

  /** Webhook was deleted */
  WebhookDelete = 52,

  /** Emoji was created */
  EmojiCreate = 60,

  /** Emoji name was updated */
  EmojiUpdate = 61,

  /** Emoji was deleted */
  EmojiDelete = 62,

  /** Single message was deleted */
  MessageDelete = 72,

  /** Multiple messages were deleted */
  MessageBulkDelete = 73,

  /** Message was pinned to a channel */
  MessagePin = 74,

  /** Message was unpinned from a channel */
  MessageUnpin = 75,

  /** App was added to server */
  IntegrationCreate = 80,

  /** App was updated (as an example, its scopes were updated) */
  IntegrationUpdate = 81,

  /** App was removed from server */
  IntegrationDelete = 82,

  /** Stage instance was created (stage channel becomes live) */
  StageInstanceCreate = 83,

  /** Stage instance details were updated */
  StageInstanceUpdate = 84,

  /** Stage instance was deleted (stage channel no longer live) */
  StageInstanceDelete = 85,

  /** Sticker was created */
  StickerCreate = 90,

  /** Sticker details were updated */
  StickerUpdate = 91,

  /** Sticker was deleted */
  StickerDelete = 92,

  /** Event was created */
  GuildScheduledEventCreate = 100,

  /** Event was updated */
  GuildScheduledEventUpdate = 101,

  /** Event was cancelled */
  GuildScheduledEventDelete = 102,

  /** Thread was created in a channel */
  ThreadCreate = 110,

  /** Thread was updated */
  ThreadUpdate = 111,

  /** Thread was deleted */
  ThreadDelete = 112,

  /** Permissions were updated for a command */
  ApplicationCommandPermissionUpdate = 121,

  /** Soundboard sound was created */
  SoundboardSoundCreate = 130,

  /** Soundboard sound was updated */
  SoundboardSoundUpdate = 131,

  /** Soundboard sound was deleted */
  SoundboardSoundDelete = 132,

  /** Auto Moderation rule was created */
  AutoModerationRuleCreate = 140,

  /** Auto Moderation rule was updated */
  AutoModerationRuleUpdate = 141,

  /** Auto Moderation rule was deleted */
  AutoModerationRuleDelete = 142,

  /** Message was blocked by Auto Moderation */
  AutoModerationBlockMessage = 143,

  /** Message was flagged by Auto Moderation */
  AutoModerationFlagToChannel = 144,

  /** Member was timed out by Auto Moderation */
  AutoModerationUserCommunicationDisabled = 145,

  /** Creator monetization request was created */
  CreatorMonetizationRequestCreated = 150,

  /** Creator monetization terms were accepted */
  CreatorMonetizationTermsAccepted = 151,

  /** Onboarding prompt was created */
  OnboardingPromptCreate = 163,

  /** Onboarding prompt was updated */
  OnboardingPromptUpdate = 164,

  /** Onboarding prompt was deleted */
  OnboardingPromptDelete = 165,

  /** Onboarding was created */
  OnboardingCreate = 166,

  /** Onboarding was updated */
  OnboardingUpdate = 167,

  /** Home settings were created */
  HomeSettingsCreate = 190,

  /** Home settings were updated */
  HomeSettingsUpdate = 191,
}

/**
 * Represents a change to an entity in an audit log
 * @see {@link https://discord.com/developers/docs/resources/audit-log#audit-log-change-object}
 */
export const AuditLogChangeEntity = z.object({
  /** Name of the changed entity */
  key: z.string(),

  /** New value of the entity */
  new_value: z.unknown().optional(),

  /** Old value of the entity */
  old_value: z.unknown().optional(),
});

export type AuditLogChangeEntity = z.infer<typeof AuditLogChangeEntity>;

/**
 * Represents permission changes for application commands in an audit log
 * @see {@link https://discord.com/developers/docs/resources/audit-log#audit-log-change-object-audit-log-change-exceptions}
 */
export const AuditLogCommandPermissionChangeEntity = z.object({
  /** ID of the command or the application the permissions were changed for */
  key: Snowflake,

  /** Old permission overwrites */
  old_value: z.record(z.unknown()),

  /** New permission overwrites */
  new_value: z.record(z.unknown()),
});

export type AuditLogCommandPermissionChangeEntity = z.infer<
  typeof AuditLogCommandPermissionChangeEntity
>;

/**
 * Represents role changes in an audit log
 * @see {@link https://discord.com/developers/docs/resources/audit-log#audit-log-change-object-audit-log-change-exceptions}
 */
export const AuditLogRoleChangeEntity = z.object({
  /** Type of role change ($add or $remove) */
  key: z.enum(["$add", "$remove"]),

  /** Array of role objects */
  new_value: z.array(
    z.object({
      /** Role ID */
      id: z.string(),

      /** Role name */
      name: z.string(),
    }),
  ),
});

export type AuditLogRoleChangeEntity = z.infer<typeof AuditLogRoleChangeEntity>;

/**
 * Represents optional additional info for an audit log entry
 * @see {@link https://discord.com/developers/docs/resources/audit-log#audit-log-entry-object-optional-audit-entry-info}
 */
export const AuditLogEntryInfoEntity = z.object({
  /** ID of the app whose permissions were targeted */
  application_id: Snowflake.optional(),

  /** Name of the Auto Moderation rule that was triggered */
  auto_moderation_rule_name: z.string().optional(),

  /** Trigger type of the Auto Moderation rule that was triggered */
  auto_moderation_rule_trigger_type: z.string().optional(),

  /** Channel in which the entities were targeted */
  channel_id: Snowflake.optional(),

  /** Number of entities that were targeted */
  count: z.string().optional(),

  /** Number of days after which inactive members were kicked */
  delete_member_days: z.string().optional(),

  /** ID of the overwritten entity */
  id: Snowflake.optional(),

  /** Number of members removed by the prune */
  members_removed: z.string().optional(),

  /** ID of the message that was targeted */
  message_id: Snowflake.optional(),

  /** Name of the role if type is "0" (role), or name of the invite if type is "1" (invite) */
  role_name: z.string().optional(),

  /** Type of overwritten entity - role ("0") or member ("1") */
  type: z.enum(["0", "1"]).optional(),

  /** Type of integration which performed the action */
  integration_type: z.string().optional(),
});

export type AuditLogEntryInfoEntity = z.infer<typeof AuditLogEntryInfoEntity>;

/**
 * Represents an entry in the audit log
 * @see {@link https://discord.com/developers/docs/resources/audit-log#audit-log-entry-object}
 */
export const AuditLogEntryEntity = z.object({
  /** ID of the affected entity (webhook, user, role, etc.) */
  target_id: z.string().nullable(),

  /** Changes made to the target_id */
  changes: z
    .union([
      z.array(AuditLogChangeEntity),
      z.array(AuditLogCommandPermissionChangeEntity),
      z.array(AuditLogRoleChangeEntity),
    ])
    .optional(),

  /** User or app that made the changes */
  user_id: Snowflake.nullable(),

  /** ID of the entry */
  id: Snowflake,

  /** Type of action that occurred */
  action_type: z.nativeEnum(AuditLogEvent),

  /** Additional info for certain event types */
  options: AuditLogEntryInfoEntity.optional(),

  /** Reason for the change (0-512 characters) */
  reason: z.string().optional(),
});

export type AuditLogEntryEntity = z.infer<typeof AuditLogEntryEntity>;

/**
 * Represents a guild's audit log
 * @see {@link https://discord.com/developers/docs/resources/audit-log#audit-log-object}
 */
export const AuditLogEntity = z.object({
  /** List of application commands referenced in the audit log */
  application_commands: z.array(ApplicationCommandEntity),

  /** List of audit log entries, sorted from most to least recent */
  audit_log_entries: z.array(AuditLogEntryEntity),

  /** List of auto moderation rules referenced in the audit log */
  auto_moderation_rules: z.array(AutoModerationRuleEntity),

  /** List of scheduled events referenced in the audit log */
  guild_scheduled_events: z.array(GuildScheduledEventEntity),

  /** List of partial integration objects */
  integrations: z.array(IntegrationEntity.partial()),

  /** List of threads referenced in the audit log */
  threads: z.array(AnyThreadChannelEntity),

  /** List of users referenced in the audit log */
  users: z.array(UserEntity),

  /** List of webhooks referenced in the audit log */
  webhooks: z.array(WebhookEntity),
});

export type AuditLogEntity = z.infer<typeof AuditLogEntity>;
