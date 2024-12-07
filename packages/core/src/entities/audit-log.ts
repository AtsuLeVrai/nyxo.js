import type { Snowflake } from "../utils/index.js";
import type { ApplicationCommandEntity } from "./application-commands.js";
import type { AutoModerationRuleEntity } from "./auto-moderation.js";
import type { ChannelEntity } from "./channel.js";
import type { IntegrationEntity } from "./guild.js";
import type { GuildScheduledEventEntity } from "./scheduled-event.js";
import type { UserEntity } from "./user.js";
import type { WebhookEntity } from "./webhook.js";

/**
 * Constants for channel overwrite types in audit logs
 *
 * @see {@link https://discord.com/developers/docs/resources/audit-log#audit-log-entry-object-optional-audit-entry-info}
 */
export enum AuditLogOverwriteType {
  /** Overwrite applies to a role */
  Role = "0",
  /** Overwrite applies to a member */
  Member = "1",
}

/**
 * Represents a change in an audit log entry.
 *
 * @remarks
 * When new_value is not present but old_value is, it means the property was reset or set to null.
 * When old_value is not present, it means the property was previously null.
 *
 * @example
 * ```typescript
 * const change: AuditLogChangeEntity = {
 *   key: "name",
 *   old_value: "Old Channel Name",
 *   new_value: "New Channel Name"
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/audit-log#audit-log-change-object}
 */
export interface AuditLogChangeEntity {
  /** Key name of the property that was changed */
  key: string;
  /** New value of the property */
  new_value?: unknown;
  /** Previous value of the property */
  old_value?: unknown;
}

/**
 * Represents a command permission change in the audit log.
 *
 * @remarks
 * This is a special case of AuditLogChangeEntity used specifically for command permission updates.
 *
 * @see {@link https://discord.com/developers/docs/resources/audit-log#audit-log-change-object-audit-log-change-exceptions}
 */
export interface AuditLogCommandPermissionChangeEntity
  extends AuditLogChangeEntity {
  /** ID of the role/user/channel the command permissions were changed for */
  key: Snowflake;
  /** Previous permissions object */
  old_value: Record<string, unknown>;
  /** Updated permissions object */
  new_value: Record<string, unknown>;
}

/**
 * Represents a role change in the audit log.
 *
 * @remarks
 * This is a special case of AuditLogChangeEntity used specifically for role changes.
 *
 * @see {@link https://discord.com/developers/docs/resources/audit-log#audit-log-change-object-audit-log-change-exceptions}
 */
export interface AuditLogRoleChangeEntity extends AuditLogChangeEntity {
  /** Type of role change */
  key: "$add" | "$remove";
  /** Array of role objects containing id and name */
  new_value: Array<{
    /** Role ID */
    id: Snowflake;
    /** Role name */
    name: string;
  }>;
}

/**
 * Additional information for certain audit log entry types.
 *
 * @remarks
 * This object contains contextual information about the action taken.
 * Not all fields will be present for all entry types.
 *
 * @see {@link https://discord.com/developers/docs/resources/audit-log#audit-log-entry-object-optional-audit-entry-info}
 */
export interface AuditLogEntryInfoEntity {
  /** ID of the app whose permissions were targeted */
  application_id?: Snowflake;
  /** Name of the Auto Moderation rule that was triggered */
  auto_moderation_rule_name?: string;
  /** Trigger type of the Auto Moderation rule that was triggered */
  auto_moderation_rule_trigger_type?: string;
  /** Channel in which the entities were targeted */
  channel_id?: Snowflake;
  /** Number of entities that were targeted */
  count?: string;
  /** Number of days after which inactive members were kicked */
  delete_member_days?: string;
  /** ID of the overwritten entity */
  id?: Snowflake;
  /** Number of members removed by the prune */
  members_removed?: string;
  /** ID of the message that was targeted */
  message_id?: Snowflake;
  /** Name of the role if type is "0" (not present if type is "1") */
  role_name?: string;
  /** Type of overwritten entity - role ("0") or member ("1") */
  type?: AuditLogOverwriteType;
  /** The type of integration which performed the action */
  integration_type?: string;
}

/**
 * Types of events that can appear in audit logs.
 *
 * @remarks
 * Each event type corresponds to a specific administrative action taken in a guild.
 * Events are grouped by category (Guild, Channel, Member, etc.).
 *
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
 * Represents a single entry in the audit log.
 *
 * @remarks
 * Each entry represents a single administrative action with associated changes.
 * Apps can specify why an action was taken using the X-Audit-Log-Reason header.
 *
 * @see {@link https://discord.com/developers/docs/resources/audit-log#audit-log-entry-object}
 */
export interface AuditLogEntryEntity {
  /** ID of the affected entity (webhook, user, role, etc.) */
  target_id: string | null;
  /** Changes made to the target_id */
  changes?:
    | AuditLogChangeEntity[]
    | AuditLogCommandPermissionChangeEntity[]
    | AuditLogRoleChangeEntity[];
  /** User or app that made the changes */
  user_id: Snowflake | null;
  /** Unique identifier for this entry */
  id: Snowflake;
  /** Type of action that occurred */
  action_type: AuditLogEvent;
  /** Additional info for certain action types */
  options?: AuditLogEntryInfoEntity;
  /** Reason for the change (1-512 characters) */
  reason?: string;
}

/**
 * Represents a complete audit log for a guild.
 *
 * @remarks
 * Audit logs keep track of administrative actions performed in a guild.
 * Entries are stored for 45 days and require the VIEW_AUDIT_LOG permission to view.
 *
 * @example
 * ```typescript
 * const auditLog: AuditLogEntity = {
 *   audit_log_entries: [...],
 *   users: [...],
 *   webhooks: [...],
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/audit-log#audit-log-object}
 */
export interface AuditLogEntity {
  /** List of application commands referenced in the audit log */
  application_commands: ApplicationCommandEntity[];
  /** List of audit log entries */
  audit_log_entries: AuditLogEntryEntity[];
  /** List of auto moderation rules referenced */
  auto_moderation_rules: AutoModerationRuleEntity[];
  /** List of scheduled events referenced */
  guild_scheduled_events: GuildScheduledEventEntity[];
  /** List of partial integration objects */
  integrations: Partial<IntegrationEntity>[];
  /** List of threads referenced */
  threads: ChannelEntity[];
  /** List of users referenced */
  users: UserEntity[];
  /** List of webhooks referenced */
  webhooks: WebhookEntity[];
}
