import {
  type AuditLogChangeEntity,
  type AuditLogCommandPermissionChangeEntity,
  type AuditLogEntryInfoEntity,
  AuditLogEvent,
  type AuditLogRoleChangeEntity,
  type Snowflake,
} from "@nyxojs/core";
import type { GuildAuditLogEntryCreateEntity } from "@nyxojs/gateway";
import type { CamelCasedProperties, CamelCasedPropertiesDeep } from "type-fest";
import { BaseClass } from "../bases/index.js";
import type { Enforce } from "../types/index.js";
import {
  toCamelCasedProperties,
  toCamelCasedPropertiesDeep,
} from "../utils/index.js";
import type { Application } from "./application.class.js";
import type { AnyChannel, AnyThreadChannel } from "./channel.class.js";
import type { Guild, GuildMember } from "./guild.class.js";
import type { User } from "./user.class.js";
import type { Webhook } from "./webhook.class.js";

/**
 * Represents an entry in a guild's audit log.
 *
 * The GuildAuditLogEntry class serves as a comprehensive wrapper around Discord's audit log API, offering:
 * - Access to audit log entry metadata and details
 * - Methods to retrieve related entities (users, targets, etc.)
 * - Utilities for parsing changes and options
 * - Helper methods for common audit log operations
 *
 * Audit logs record administrative actions taken within a guild, such as channel creations,
 * role modifications, member bans, and more. Each entry provides detailed information about
 * who performed the action, what changed, and when it occurred.
 *
 * This class transforms snake_case API responses into camelCase properties for
 * a more JavaScript-friendly interface while maintaining type safety.
 *
 * @remarks
 * Audit log entries are stored by Discord for 45 days, after which they are automatically purged.
 * Viewing audit logs requires the VIEW_AUDIT_LOG permission in the guild.
 *
 * @example
 * ```typescript
 * // Fetching recent audit log entries
 * const auditLogs = await guild.fetchAuditLogs();
 *
 * // Examine the first entry
 * const entry = auditLogs.entries[0];
 * console.log(`Action: ${entry.actionType}`);
 * console.log(`Performed by: ${entry.executor?.tag}`);
 * console.log(`Target: ${entry.targetId}`);
 * ```
 *
 * @see {@link https://discord.com/developers/docs/resources/audit-log}
 */
export class GuildAuditLogEntry
  extends BaseClass<GuildAuditLogEntryCreateEntity>
  implements Enforce<CamelCasedProperties<GuildAuditLogEntryCreateEntity>>
{
  /**
   * Gets the ID of the guild (server) this audit log entry belongs to.
   *
   * This uniquely identifies the guild where the audited action took place.
   *
   * @returns The guild's ID as a Snowflake string
   *
   * @example
   * ```typescript
   * console.log(`Guild ID: ${entry.guildId}`);
   * ```
   */
  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  /**
   * Gets the ID of the affected entity (webhook, user, role, etc.).
   *
   * This identifies the entity that was the target of the action. The type of entity
   * depends on the action type. For example, in a CHANNEL_CREATE action, this would be
   * the ID of the created channel.
   *
   * For APPLICATION_COMMAND_PERMISSION_UPDATE events, this will be the command ID or
   * application ID since the changes array represents the entire permissions property.
   *
   * @returns The target entity's ID as a string, or null if no target
   *
   * @example
   * ```typescript
   * const targetId = entry.targetId;
   * if (targetId) {
   *   console.log(`Target entity ID: ${targetId}`);
   * } else {
   *   console.log('This action does not have a specific target entity');
   * }
   * ```
   */
  get targetId(): string | null {
    return this.data.target_id;
  }

  /**
   * Gets the array of changes made to the target entity.
   *
   * Changes represent what was modified during the action. The structure varies
   * depending on the action type. Some events have no changes array.
   *
   * Each change usually includes the property name (key), old value, and new value.
   * Special action types like MEMBER_ROLE_UPDATE use a different structure with
   * "$add" and "$remove" keys.
   *
   * @returns An array of changes, or undefined if the action does not record changes
   *
   * @example
   * ```typescript
   * const changes = entry.changes;
   * if (changes && changes.length > 0) {
   *   console.log(`This action made ${changes.length} changes:`);
   *
   *   changes.forEach(change => {
   *     if ('key' in change) {
   *       console.log(`- Changed ${change.key}`);
   *       if (change.old_value !== undefined) console.log(`  From: ${JSON.stringify(change.old_value)}`);
   *       if (change.new_value !== undefined) console.log(`  To: ${JSON.stringify(change.new_value)}`);
   *     }
   *   });
   * }
   * ```
   */
  get changes():
    | AuditLogChangeEntity[]
    | AuditLogCommandPermissionChangeEntity[]
    | AuditLogRoleChangeEntity[]
    | undefined {
    return this.data.changes;
  }

  /**
   * Gets the ID of the user or application that performed the action.
   *
   * This identifies who triggered the action that was recorded in the audit log.
   * It may be null for system-generated events.
   *
   * @returns The user's ID as a Snowflake string, or null if system-generated
   *
   * @example
   * ```typescript
   * const userId = entry.userId;
   * if (userId) {
   *   console.log(`Action performed by user ID: ${userId}`);
   * } else {
   *   console.log('This action was performed by the system or an unknown user');
   * }
   * ```
   */
  get userId(): Snowflake | null {
    return this.data.user_id;
  }

  /**
   * Gets the unique identifier (Snowflake) of this audit log entry.
   *
   * This ID is permanent and will not change for the lifetime of the entry.
   * It can be used for API operations and persistent references.
   *
   * @returns The entry's ID as a Snowflake string
   *
   * @example
   * ```typescript
   * const entryId = entry.id;
   * console.log(`Audit log entry ID: ${entryId}`);
   * ```
   */
  get id(): Snowflake {
    return this.data.id;
  }

  /**
   * Gets the type of action that occurred.
   *
   * The action type indicates what kind of administrative action was performed
   * and how to interpret the changes and options data.
   *
   * @returns The action type as an AuditLogEvent enum value
   *
   * @example
   * ```typescript
   * import { AuditLogEvent } from '@nyxojs/core';
   *
   * if (entry.actionType === AuditLogEvent.ChannelCreate) {
   *   console.log('A channel was created');
   * } else if (entry.actionType === AuditLogEvent.MemberBanAdd) {
   *   console.log('A member was banned');
   * }
   * ```
   *
   * @see {@link https://discord.com/developers/docs/resources/audit-log#audit-log-entry-object-audit-log-events}
   */
  get actionType(): AuditLogEvent {
    return this.data.action_type;
  }

  /**
   * Gets additional context-specific information about the action.
   *
   * The options object provides extra details that vary depending on the action_type.
   * For example, in message deletion events, it includes the channel ID and the number
   * of messages deleted.
   *
   * @returns The options object, or undefined if no additional info is available
   *
   * @example
   * ```typescript
   * const options = entry.options;
   *
   * if (options?.channel_id) {
   *   console.log(`This action occurred in channel ID: ${options.channel_id}`);
   * }
   *
   * if (options?.count) {
   *   console.log(`This action affected ${options.count} items`);
   * }
   * ```
   *
   * @see {@link https://discord.com/developers/docs/resources/audit-log#audit-log-entry-object-optional-audit-entry-info}
   */
  get options(): AuditLogEntryInfoEntity | undefined {
    return this.data.options;
  }

  /**
   * Gets the reason provided for the action, if any.
   *
   * Reasons can be set by users or applications when performing administrative
   * actions, using the X-Audit-Log-Reason header in API requests.
   *
   * @returns The reason string, or undefined if no reason was provided
   *
   * @example
   * ```typescript
   * const reason = entry.reason;
   * if (reason) {
   *   console.log(`Reason for action: ${reason}`);
   * } else {
   *   console.log('No reason was provided for this action');
   * }
   * ```
   */
  get reason(): string | undefined {
    return this.data.reason;
  }

  /**
   * Gets the Date object representing when this audit log entry was created.
   *
   * This is calculated from the entry's ID, which contains a timestamp.
   *
   * @returns The Date when this entry was created
   *
   * @example
   * ```typescript
   * const createdAt = entry.createdAt;
   * console.log(`Action performed on: ${createdAt.toLocaleDateString()}`);
   * console.log(`Time: ${createdAt.toLocaleTimeString()}`);
   * ```
   */
  get createdAt(): Date {
    return new Date(Number(BigInt(this.id) >> 22n) + 1420070400000);
  }

  /**
   * Gets the Unix timestamp (in milliseconds) of when this entry was created.
   *
   * @returns The creation timestamp in milliseconds
   *
   * @example
   * ```typescript
   * const timestamp = entry.createdTimestamp;
   * console.log(`Entry created at timestamp: ${timestamp}`);
   *
   * // Calculate how long ago this action occurred
   * const timeSince = Date.now() - timestamp;
   * const minutesAgo = Math.floor(timeSince / 60000);
   * console.log(`This action occurred ${minutesAgo} minutes ago`);
   * ```
   */
  get createdTimestamp(): number {
    return this.createdAt.getTime();
  }

  /**
   * Gets the changes in a more accessible camelCase format.
   *
   * This transforms the array of changes into a more JavaScript-friendly format
   * with camelCase property names.
   *
   * @returns An array of changes in camelCase format, or undefined if no changes
   *
   * @example
   * ```typescript
   * const camelCaseChanges = entry.camelCaseChanges;
   * if (camelCaseChanges) {
   *   for (const change of camelCaseChanges) {
   *     console.log(`Property: ${change.key}`);
   *     console.log(`New value: ${change.newValue}`);
   *   }
   * }
   * ```
   */
  get camelCaseChanges():
    | CamelCasedPropertiesDeep<AuditLogChangeEntity>[]
    | CamelCasedPropertiesDeep<AuditLogCommandPermissionChangeEntity>[]
    | CamelCasedPropertiesDeep<AuditLogRoleChangeEntity>[]
    | undefined {
    if (!this.changes) {
      return undefined;
    }

    return this.changes.map(toCamelCasedPropertiesDeep);
  }

  /**
   * Gets the options in a more accessible camelCase format.
   *
   * This transforms the options object into a more JavaScript-friendly format
   * with camelCase property names.
   *
   * @returns The options object in camelCase format, or undefined if no options
   *
   * @example
   * ```typescript
   * const options = entry.camelCaseOptions;
   * if (options) {
   *   if (options.channelId) {
   *     console.log(`Channel ID: ${options.channelId}`);
   *   }
   *   if (options.count) {
   *     console.log(`Count: ${options.count}`);
   *   }
   * }
   * ```
   */
  get camelCaseOptions():
    | CamelCasedProperties<AuditLogEntryInfoEntity>
    | undefined {
    if (!this.options) {
      return undefined;
    }

    return toCamelCasedProperties(this.options);
  }

  /**
   * Gets the executor (user who performed the action) if available in the cache.
   *
   * Unlike fetchExecutor(), this does not make an API request if the user is not
   * already in the client's cache.
   *
   * @returns The User object from cache, or null if not found or system-generated
   *
   * @example
   * ```typescript
   * const executor = entry.executor;
   * if (executor) {
   *   console.log(`Action performed by: ${executor.tag}`);
   * } else {
   *   console.log('Executor not found in cache or action was system-generated');
   *   // You might want to use fetchExecutor() to make an API request
   * }
   * ```
   */
  get executor(): User | null {
    if (!this.userId) {
      return null;
    }

    return this.client.cache.users.get(this.userId) || null;
  }

  /**
   * Gets the guild from cache, if available.
   *
   * @returns The Guild object from cache, or undefined if not found
   *
   * @example
   * ```typescript
   * const guild = entry.guild;
   * if (guild) {
   *   console.log(`Guild name: ${guild.name}`);
   * } else {
   *   console.log('Guild not found in cache');
   *   // You might want to use fetchGuild() to make an API request
   * }
   * ```
   */
  get guild(): Guild | undefined {
    return this.client.cache.guilds.get(this.guildId);
  }

  /**
   * Gets the age of this audit log entry in milliseconds.
   *
   * This calculates how much time has passed since this audit log entry was created.
   *
   * @returns The age in milliseconds
   *
   * @example
   * ```typescript
   * const ageMs = entry.age;
   * const ageSec = Math.floor(ageMs / 1000);
   * const ageMin = Math.floor(ageSec / 60);
   * const ageHours = Math.floor(ageMin / 60);
   * const ageDays = Math.floor(ageHours / 24);
   *
   * if (ageDays > 0) {
   *   console.log(`This action occurred ${ageDays} days ago`);
   * } else if (ageHours > 0) {
   *   console.log(`This action occurred ${ageHours} hours ago`);
   * } else if (ageMin > 0) {
   *   console.log(`This action occurred ${ageMin} minutes ago`);
   * } else {
   *   console.log(`This action occurred ${ageSec} seconds ago`);
   * }
   * ```
   */
  get age(): number {
    return Date.now() - this.createdTimestamp;
  }

  /**
   * Gets the channel from cache, if available.
   *
   * @returns The Channel object from cache, or null if not found or not applicable
   *
   * @example
   * ```typescript
   * const channel = entry.channel;
   * if (channel) {
   *   console.log(`Action occurred in channel: ${channel.name}`);
   * } else {
   *   console.log('Channel not found in cache or not applicable');
   * }
   * ```
   */
  get channel(): AnyChannel | null {
    if (this.options?.channel_id) {
      return this.client.cache.channels.get(this.options.channel_id) || null;
    }

    if (this.isChannelAction && this.targetId) {
      return this.client.cache.channels.get(this.targetId) || null;
    }

    return null;
  }

  /**
   * Indicates whether this audit log entry includes changes data.
   *
   * Some audit log actions don't include changes, especially for actions
   * like bans or kicks where the action itself is the significant event.
   *
   * @returns True if this entry has changes, false otherwise
   *
   * @example
   * ```typescript
   * if (entry.hasChanges) {
   *   console.log('This entry includes changes to entity properties');
   *
   *   // You can safely iterate through changes
   *   entry.changes?.forEach(change => {
   *     // Process each change
   *   });
   * } else {
   *   console.log('This entry does not include property changes');
   * }
   * ```
   */
  get hasChanges(): boolean {
    return Boolean(this.changes && this.changes.length > 0);
  }

  /**
   * Checks if this audit log entry has a reason specified.
   *
   * @returns True if a reason was provided, false otherwise
   *
   * @example
   * ```typescript
   * if (entry.hasReason) {
   *   console.log(`Reason: ${entry.reason}`);
   * } else {
   *   console.log('No reason was provided for this action');
   * }
   * ```
   */
  get hasReason(): boolean {
    return Boolean(this.reason);
  }

  /**
   * Checks if this is a channel-related audit log entry.
   *
   * @returns True if this entry relates to channel actions
   *
   * @example
   * ```typescript
   * if (entry.isChannelAction) {
   *   console.log('This entry involves channel modification');
   *
   *   // Channel-related entries usually have the target as the channel
   *   console.log(`Channel ID: ${entry.targetId}`);
   * }
   * ```
   */
  get isChannelAction(): boolean {
    return this.actionType >= 10 && this.actionType <= 15;
  }

  /**
   * Checks if this is a member-related audit log entry.
   *
   * @returns True if this entry relates to member actions
   *
   * @example
   * ```typescript
   * if (entry.isMemberAction) {
   *   console.log('This entry involves member modification');
   *
   *   // Member-related entries usually have the target as the user
   *   console.log(`User ID: ${entry.targetId}`);
   * }
   * ```
   */
  get isMemberAction(): boolean {
    return this.actionType >= 20 && this.actionType <= 28;
  }

  /**
   * Checks if this is a message-related audit log entry.
   *
   * @returns True if this entry relates to message actions
   *
   * @example
   * ```typescript
   * if (entry.isMessageAction) {
   *   console.log('This entry involves message operations');
   *
   *   if (entry.options?.count) {
   *     console.log(`Number of messages affected: ${entry.options.count}`);
   *   }
   * }
   * ```
   */
  get isMessageAction(): boolean {
    return this.actionType >= 72 && this.actionType <= 75;
  }

  /**
   * Checks if this is a role-related audit log entry.
   *
   * @returns True if this entry relates to role actions
   *
   * @example
   * ```typescript
   * if (entry.isRoleAction) {
   *   console.log('This entry involves role modification');
   *
   *   // Role-related entries usually have the target as the role
   *   console.log(`Role ID: ${entry.targetId}`);
   * }
   * ```
   */
  get isRoleAction(): boolean {
    return this.actionType >= 30 && this.actionType <= 32;
  }

  /**
   * Checks if this is an auto moderation-related audit log entry.
   *
   * @returns True if this entry relates to auto moderation actions
   *
   * @example
   * ```typescript
   * if (entry.isAutoModAction) {
   *   console.log('This entry involves auto moderation');
   *
   *   if (entry.options?.auto_moderation_rule_name) {
   *     console.log(`Rule name: ${entry.options.auto_moderation_rule_name}`);
   *   }
   * }
   * ```
   */
  get isAutoModAction(): boolean {
    return this.actionType >= 140 && this.actionType <= 145;
  }

  /**
   * Checks if this is a webhook-related audit log entry.
   *
   * @returns True if this entry relates to webhook actions
   *
   * @example
   * ```typescript
   * if (entry.isWebhookAction) {
   *   console.log('This entry involves webhook modification');
   *
   *   // Webhook-related entries usually have the target as the webhook
   *   console.log(`Webhook ID: ${entry.targetId}`);
   * }
   * ```
   */
  get isWebhookAction(): boolean {
    return this.actionType >= 50 && this.actionType <= 52;
  }

  /**
   * Checks if this is an integration-related audit log entry.
   *
   * @returns True if this entry relates to integration actions
   *
   * @example
   * ```typescript
   * if (entry.isIntegrationAction) {
   *   console.log('This entry involves integration modification');
   *
   *   // Integration-related entries usually have the target as the integration
   *   console.log(`Integration ID: ${entry.targetId}`);
   * }
   * ```
   */
  get isIntegrationAction(): boolean {
    return this.actionType >= 80 && this.actionType <= 82;
  }

  /**
   * Checks if this is a thread-related audit log entry.
   *
   * @returns True if this entry relates to thread actions
   *
   * @example
   * ```typescript
   * if (entry.isThreadAction) {
   *   console.log('This entry involves thread modification');
   *
   *   // Thread-related entries usually have the target as the thread
   *   console.log(`Thread ID: ${entry.targetId}`);
   * }
   * ```
   */
  get isThreadAction(): boolean {
    return this.actionType >= 110 && this.actionType <= 112;
  }

  /**
   * Checks if this audit log entry is related to a creation action.
   *
   * @returns True if this entry represents a creation operation, false otherwise
   *
   * @example
   * ```typescript
   * if (entry.isCreateAction) {
   *   console.log('This entry represents a creation operation');
   *   console.log(`Created ${entry.getActionString().split(' ')[0].toLowerCase()}`);
   * }
   * ```
   */
  get isCreateAction(): boolean {
    const createActions = [
      AuditLogEvent.ChannelCreate,
      AuditLogEvent.RoleCreate,
      AuditLogEvent.InviteCreate,
      AuditLogEvent.WebhookCreate,
      AuditLogEvent.EmojiCreate,
      AuditLogEvent.IntegrationCreate,
      AuditLogEvent.StageInstanceCreate,
      AuditLogEvent.StickerCreate,
      AuditLogEvent.GuildScheduledEventCreate,
      AuditLogEvent.ThreadCreate,
      AuditLogEvent.AutoModerationRuleCreate,
      AuditLogEvent.SoundboardSoundCreate,
      AuditLogEvent.OnboardingPromptCreate,
      AuditLogEvent.OnboardingCreate,
      AuditLogEvent.HomeSettingsCreate,
    ];

    return createActions.includes(this.actionType);
  }

  /**
   * Checks if this audit log entry is related to an update/edit action.
   *
   * @returns True if this entry represents an update operation, false otherwise
   *
   * @example
   * ```typescript
   * if (entry.isUpdateAction) {
   *   console.log('This entry represents an update operation');
   *   console.log(`Updated ${entry.getActionString().split(' ')[0].toLowerCase()}`);
   * }
   * ```
   */
  get isUpdateAction(): boolean {
    const updateActions = [
      AuditLogEvent.GuildUpdate,
      AuditLogEvent.ChannelUpdate,
      AuditLogEvent.MemberUpdate,
      AuditLogEvent.MemberRoleUpdate,
      AuditLogEvent.RoleUpdate,
      AuditLogEvent.InviteUpdate,
      AuditLogEvent.WebhookUpdate,
      AuditLogEvent.EmojiUpdate,
      AuditLogEvent.IntegrationUpdate,
      AuditLogEvent.StageInstanceUpdate,
      AuditLogEvent.StickerUpdate,
      AuditLogEvent.GuildScheduledEventUpdate,
      AuditLogEvent.ThreadUpdate,
      AuditLogEvent.ApplicationCommandPermissionUpdate,
      AuditLogEvent.AutoModerationRuleUpdate,
      AuditLogEvent.SoundboardSoundUpdate,
      AuditLogEvent.OnboardingPromptUpdate,
      AuditLogEvent.OnboardingUpdate,
      AuditLogEvent.HomeSettingsUpdate,
    ];

    return updateActions.includes(this.actionType);
  }

  /**
   * Checks if this audit log entry is related to a deletion action.
   *
   * @returns True if this entry represents a deletion operation, false otherwise
   *
   * @example
   * ```typescript
   * if (entry.isDeleteAction) {
   *   console.log('This entry represents a deletion operation');
   *   console.log(`Deleted ${entry.getActionString().split(' ')[0].toLowerCase()}`);
   * }
   * ```
   */
  get isDeleteAction(): boolean {
    const deleteActions = [
      AuditLogEvent.ChannelDelete,
      AuditLogEvent.RoleDelete,
      AuditLogEvent.InviteDelete,
      AuditLogEvent.WebhookDelete,
      AuditLogEvent.EmojiDelete,
      AuditLogEvent.MessageDelete,
      AuditLogEvent.MessageBulkDelete,
      AuditLogEvent.IntegrationDelete,
      AuditLogEvent.StageInstanceDelete,
      AuditLogEvent.StickerDelete,
      AuditLogEvent.GuildScheduledEventDelete,
      AuditLogEvent.ThreadDelete,
      AuditLogEvent.AutoModerationRuleDelete,
      AuditLogEvent.SoundboardSoundDelete,
      AuditLogEvent.OnboardingPromptDelete,
    ];

    return deleteActions.includes(this.actionType);
  }

  /**
   * Gets the User object for the user who performed the action.
   *
   * This provides detailed information about the user responsible for this audit log entry,
   * including their username, avatar, and other properties.
   *
   * @returns A Promise resolving to the User object, or null if system-generated
   *
   * @example
   * ```typescript
   * try {
   *   const executor = await entry.fetchExecutor();
   *   if (executor) {
   *     console.log(`Action performed by: ${executor.tag}`);
   *     console.log(`Executor avatar: ${executor.getDisplayAvatarUrl()}`);
   *   } else {
   *     console.log('This action was performed by the system');
   *   }
   * } catch (error) {
   *   console.error('Failed to fetch executor:', error);
   * }
   * ```
   */
  async fetchExecutor(): Promise<User | null> {
    if (!this.userId) {
      return null;
    }

    try {
      return await this.client.cache.fetch(this.userId);
    } catch (_error) {
      return null;
    }
  }

  /**
   * Gets the guild this audit log entry belongs to.
   *
   * @returns A promise resolving to the Guild object
   * @throws Error if the guild couldn't be fetched
   *
   * @example
   * ```typescript
   * try {
   *   const guild = await entry.fetchGuild();
   *   console.log(`Guild name: ${guild.name}`);
   *   console.log(`Member count: ${guild.memberCount}`);
   * } catch (error) {
   *   console.error('Failed to fetch guild:', error);
   * }
   * ```
   */
  async fetchGuild(): Promise<Guild> {
    return this.client.cache.guilds.fetch(this.guildId);
  }

  /**
   * Fetches the target entity related to this audit log entry.
   *
   * The type of entity returned depends on the action type. For example, a channel
   * creation event would return a Channel object, while a member ban would return a User.
   *
   * @returns A Promise resolving to the target entity, or null if not available
   * @throws Error if the target entity couldn't be fetched
   *
   * @example
   * ```typescript
   * try {
   *   const target = await entry.fetchTarget();
   *
   *   if (target instanceof User) {
   *     console.log(`Target user: ${target.tag}`);
   *   } else if (target instanceof Channel) {
   *     console.log(`Target channel: ${target.name}`);
   *   } else if (target !== null) {
   *     console.log(`Target entity type: ${target.constructor.name}`);
   *   } else {
   *     console.log('No target entity for this action');
   *   }
   * } catch (error) {
   *   console.error('Failed to fetch target:', error);
   * }
   * ```
   */
  async fetchTarget(): Promise<
    | User
    | GuildMember
    | AnyChannel
    | Webhook
    | Application
    | AnyThreadChannel
    | unknown
    | null
  > {
    if (!this.targetId) {
      return null;
    }

    // Handle different target types based on the action type
    switch (this.actionType) {
      // User-related actions
      case AuditLogEvent.MemberKick:
      case AuditLogEvent.MemberBanAdd:
      case AuditLogEvent.MemberBanRemove:
      case AuditLogEvent.MemberUpdate:
      case AuditLogEvent.MemberRoleUpdate:
      case AuditLogEvent.MemberMove:
      case AuditLogEvent.MemberDisconnect:
      case AuditLogEvent.BotAdd:
        return this.client.users.fetch(this.targetId);

      // Channel-related actions
      case AuditLogEvent.ChannelCreate:
      case AuditLogEvent.ChannelUpdate:
      case AuditLogEvent.ChannelDelete:
      case AuditLogEvent.ChannelOverwriteCreate:
      case AuditLogEvent.ChannelOverwriteUpdate:
      case AuditLogEvent.ChannelOverwriteDelete:
        return this.client.channels.fetch(this.targetId);

      // Thread-related actions
      case AuditLogEvent.ThreadCreate:
      case AuditLogEvent.ThreadUpdate:
      case AuditLogEvent.ThreadDelete:
        return this.client.channels.fetch(this.targetId);

      // Webhook-related actions
      case AuditLogEvent.WebhookCreate:
      case AuditLogEvent.WebhookUpdate:
      case AuditLogEvent.WebhookDelete:
        return this.client.fetchWebhook(this.targetId);

      // Integration-related actions
      case AuditLogEvent.IntegrationCreate:
      case AuditLogEvent.IntegrationUpdate:
      case AuditLogEvent.IntegrationDelete: {
        // Fetch the guild to access its integrations
        const guild = await this.fetchGuild();
        const integrations = await guild.fetchIntegrations();
        return integrations.find((i) => i.id === this.targetId) || null;
      }

      // Role-related actions
      case AuditLogEvent.RoleCreate:
      case AuditLogEvent.RoleUpdate:
      case AuditLogEvent.RoleDelete: {
        const guild2 = await this.fetchGuild();
        return guild2.roles.fetch(this.targetId);
      }

      // Message-related actions (if applicable)
      case AuditLogEvent.MessageDelete:
      case AuditLogEvent.MessageBulkDelete:
      case AuditLogEvent.MessagePin:
      case AuditLogEvent.MessageUnpin: {
        if (this.options?.message_id && this.options?.channel_id) {
          try {
            const channel = await this.client.channels.fetch(
              this.options.channel_id,
            );
            if (channel?.isTextBased()) {
              return channel.messages.fetch(this.options.message_id);
            }
          } catch {
            // Message might have been deleted
            return null;
          }
        }
        return null;
      }

      // Application command related actions
      case AuditLogEvent.ApplicationCommandPermissionUpdate: {
        if (this.options?.application_id) {
          return this.client.application;
        }
        return null;
      }

      // For other action types, we might not be able to fetch the target directly
      default:
        return null;
    }
  }

  /**
   * Gets a human-readable string representing the action type.
   *
   * This converts the numeric action type to a descriptive string,
   * making it easier to understand the nature of the action in logs and displays.
   *
   * @returns A string description of the action type
   *
   * @example
   * ```typescript
   * console.log(`Action: ${entry.getActionString()}`);
   * // Example output: "Channel Create" or "Member Ban Add"
   * ```
   */
  getActionString(): string {
    const actionMap: Record<AuditLogEvent, string> = {
      [AuditLogEvent.GuildUpdate]: "Guild Update",
      [AuditLogEvent.ChannelCreate]: "Channel Create",
      [AuditLogEvent.ChannelUpdate]: "Channel Update",
      [AuditLogEvent.ChannelDelete]: "Channel Delete",
      [AuditLogEvent.ChannelOverwriteCreate]: "Channel Overwrite Create",
      [AuditLogEvent.ChannelOverwriteUpdate]: "Channel Overwrite Update",
      [AuditLogEvent.ChannelOverwriteDelete]: "Channel Overwrite Delete",
      [AuditLogEvent.MemberKick]: "Member Kick",
      [AuditLogEvent.MemberPrune]: "Member Prune",
      [AuditLogEvent.MemberBanAdd]: "Member Ban Add",
      [AuditLogEvent.MemberBanRemove]: "Member Ban Remove",
      [AuditLogEvent.MemberUpdate]: "Member Update",
      [AuditLogEvent.MemberRoleUpdate]: "Member Role Update",
      [AuditLogEvent.MemberMove]: "Member Move",
      [AuditLogEvent.MemberDisconnect]: "Member Disconnect",
      [AuditLogEvent.BotAdd]: "Bot Add",
      [AuditLogEvent.RoleCreate]: "Role Create",
      [AuditLogEvent.RoleUpdate]: "Role Update",
      [AuditLogEvent.RoleDelete]: "Role Delete",
      [AuditLogEvent.InviteCreate]: "Invite Create",
      [AuditLogEvent.InviteUpdate]: "Invite Update",
      [AuditLogEvent.InviteDelete]: "Invite Delete",
      [AuditLogEvent.WebhookCreate]: "Webhook Create",
      [AuditLogEvent.WebhookUpdate]: "Webhook Update",
      [AuditLogEvent.WebhookDelete]: "Webhook Delete",
      [AuditLogEvent.EmojiCreate]: "Emoji Create",
      [AuditLogEvent.EmojiUpdate]: "Emoji Update",
      [AuditLogEvent.EmojiDelete]: "Emoji Delete",
      [AuditLogEvent.MessageDelete]: "Message Delete",
      [AuditLogEvent.MessageBulkDelete]: "Message Bulk Delete",
      [AuditLogEvent.MessagePin]: "Message Pin",
      [AuditLogEvent.MessageUnpin]: "Message Unpin",
      [AuditLogEvent.IntegrationCreate]: "Integration Create",
      [AuditLogEvent.IntegrationUpdate]: "Integration Update",
      [AuditLogEvent.IntegrationDelete]: "Integration Delete",
      [AuditLogEvent.StageInstanceCreate]: "Stage Instance Create",
      [AuditLogEvent.StageInstanceUpdate]: "Stage Instance Update",
      [AuditLogEvent.StageInstanceDelete]: "Stage Instance Delete",
      [AuditLogEvent.StickerCreate]: "Sticker Create",
      [AuditLogEvent.StickerUpdate]: "Sticker Update",
      [AuditLogEvent.StickerDelete]: "Sticker Delete",
      [AuditLogEvent.GuildScheduledEventCreate]: "Guild Scheduled Event Create",
      [AuditLogEvent.GuildScheduledEventUpdate]: "Guild Scheduled Event Update",
      [AuditLogEvent.GuildScheduledEventDelete]: "Guild Scheduled Event Delete",
      [AuditLogEvent.ThreadCreate]: "Thread Create",
      [AuditLogEvent.ThreadUpdate]: "Thread Update",
      [AuditLogEvent.ThreadDelete]: "Thread Delete",
      [AuditLogEvent.ApplicationCommandPermissionUpdate]:
        "Application Command Permission Update",
      [AuditLogEvent.SoundboardSoundCreate]: "Soundboard Sound Create",
      [AuditLogEvent.SoundboardSoundUpdate]: "Soundboard Sound Update",
      [AuditLogEvent.SoundboardSoundDelete]: "Soundboard Sound Delete",
      [AuditLogEvent.AutoModerationRuleCreate]: "Auto Moderation Rule Create",
      [AuditLogEvent.AutoModerationRuleUpdate]: "Auto Moderation Rule Update",
      [AuditLogEvent.AutoModerationRuleDelete]: "Auto Moderation Rule Delete",
      [AuditLogEvent.AutoModerationBlockMessage]:
        "Auto Moderation Block Message",
      [AuditLogEvent.AutoModerationFlagToChannel]:
        "Auto Moderation Flag To Channel",
      [AuditLogEvent.AutoModerationUserCommunicationDisabled]:
        "Auto Moderation User Communication Disabled",
      [AuditLogEvent.CreatorMonetizationRequestCreated]:
        "Creator Monetization Request Created",
      [AuditLogEvent.CreatorMonetizationTermsAccepted]:
        "Creator Monetization Terms Accepted",
      [AuditLogEvent.OnboardingPromptCreate]: "Onboarding Prompt Create",
      [AuditLogEvent.OnboardingPromptUpdate]: "Onboarding Prompt Update",
      [AuditLogEvent.OnboardingPromptDelete]: "Onboarding Prompt Delete",
      [AuditLogEvent.OnboardingCreate]: "Onboarding Create",
      [AuditLogEvent.OnboardingUpdate]: "Onboarding Update",
      [AuditLogEvent.HomeSettingsCreate]: "Home Settings Create",
      [AuditLogEvent.HomeSettingsUpdate]: "Home Settings Update",
    };

    return actionMap[this.actionType] || `Unknown Action (${this.actionType})`;
  }

  /**
   * Parses the changes array into a more user-friendly format.
   *
   * This method transforms the raw changes data into a structured object
   * that's easier to work with, grouping related changes and providing
   * meaningful labels.
   *
   * @returns An object containing the parsed changes
   *
   * @example
   * ```typescript
   * const parsedChanges = entry.getParsedChanges();
   * console.log(JSON.stringify(parsedChanges, null, 2));
   *
   * // Example output for a channel update:
   * // {
   * //   "name": {
   * //     "old": "general",
   * //     "new": "announcements",
   * //     "type": "string"
   * //   },
   * //   "nsfw": {
   * //     "old": false,
   * //     "new": true,
   * //     "type": "boolean"
   * //   }
   * // }
   * ```
   */
  getParsedChanges(): Record<
    string,
    {
      old?: unknown;
      new?: unknown;
      type: string;
    }
  > {
    if (!this.changes) {
      return {};
    }

    const result: Record<
      string,
      { old?: unknown; new?: unknown; type: string }
    > = {};

    for (const change of this.changes) {
      if ("key" in change && typeof change.key === "string") {
        if (change.key === "$add" || change.key === "$remove") {
          // Handle role changes specially
          const roleAction = change.key === "$add" ? "added" : "removed";
          result[roleAction] = {
            new: change.new_value,
            type: "roles",
          };
        } else {
          // Regular changes
          const oldValue = "old_value" in change ? change.old_value : undefined;
          const newValue = "new_value" in change ? change.new_value : undefined;

          // Determine the type of the value for better display
          let type = "unknown";

          if (oldValue !== undefined) {
            type = typeof oldValue;
          } else if (newValue !== undefined) {
            type = typeof newValue;
          }

          // Special handling for known properties
          if (change.key.endsWith("_id")) {
            type = "id";
          } else if (
            change.key === "permissions" ||
            change.key === "permission_overwrites"
          ) {
            type = "permissions";
          } else if (change.key === "avatar" || change.key === "icon") {
            type = "image";
          }

          result[change.key] = {
            old: oldValue,
            new: newValue,
            type,
          };
        }
      }
    }

    return result;
  }

  /**
   * Gets the change for a specific property in this audit log entry.
   *
   * This is a convenience method to find a specific change by its key.
   *
   * @param key - The property name to look for
   * @returns The change object if found, otherwise undefined
   *
   * @example
   * ```typescript
   * // Find the change to the 'name' property
   * const nameChange = entry.getChangeByKey('name');
   *
   * if (nameChange) {
   *   console.log(`Name was changed from "${nameChange.old_value}" to "${nameChange.new_value}"`);
   * }
   * ```
   */
  getChangeByKey(key: string): AuditLogChangeEntity | undefined {
    if (!this.changes) {
      return undefined;
    }

    return this.changes.find(
      (change): change is AuditLogChangeEntity =>
        "key" in change && change.key === key,
    );
  }

  /**
   * Gets the channel related to this audit log entry, if applicable.
   *
   * For actions that occur in a specific channel (like message deletions),
   * this provides access to that channel object.
   *
   * @returns A promise resolving to the Channel object, or null if not applicable
   * @throws Error if the channel couldn't be fetched
   *
   * @example
   * ```typescript
   * try {
   *   const channel = await entry.fetchChannel();
   *   if (channel) {
   *     console.log(`Action occurred in channel: ${channel.name}`);
   *   } else {
   *     console.log('This action is not associated with a specific channel');
   *   }
   * } catch (error) {
   *   console.error('Failed to fetch channel:', error);
   * }
   * ```
   */
  async fetchChannel(): Promise<AnyChannel | null> {
    // Check for channel ID in options
    if (this.options?.channel_id) {
      return this.client.channels.fetch(this.options.channel_id);
    }

    // For channel-specific actions, the target is the channel
    if (this.isChannelAction) {
      return this.targetId ? this.client.channels.fetch(this.targetId) : null;
    }

    return null;
  }

  /**
   * Formats this audit log entry into a human-readable string.
   *
   * @param detailed - Whether to include detailed information
   * @returns A formatted string representation of this audit log entry
   *
   * @example
   * ```typescript
   * // Basic representation
   * console.log(entry.formatEntry());
   * // Example output: "[2023-04-15] Channel Create by Username#1234"
   *
   * // Detailed representation
   * console.log(entry.formatEntry(true));
   * // Example output: "[2023-04-15 12:34:56] Channel Create by Username#1234 (ID: 123456789012345678)
   * //                  Target: general (ID: 234567890123456789)
   * //                  Reason: Needed a new channel for announcements"
   * ```
   */
  formatEntry(detailed = false): string {
    const date = this.createdAt.toISOString().split("T")[0];
    const time = detailed
      ? this.createdAt.toISOString().split("T")[1].split(".")[0]
      : "";
    const dateStr = detailed ? `[${date} ${time}]` : `[${date}]`;

    const action = this.getActionString();
    const executorString = this.executor ? `by ${this.executor.tag}` : "";

    let result = `${dateStr} ${action} ${executorString}`.trim();

    if (detailed) {
      if (this.executor) {
        result += ` (ID: ${this.userId})`;
      }

      if (this.targetId) {
        result += `\nTarget: ${this.targetId}`;
      }

      if (this.reason) {
        result += `\nReason: ${this.reason}`;
      }

      if (this.options?.channel_id) {
        result += `\nChannel: ${this.options.channel_id}`;
      }

      if (this.options?.count) {
        result += `\nCount: ${this.options.count}`;
      }
    }

    return result;
  }
}
