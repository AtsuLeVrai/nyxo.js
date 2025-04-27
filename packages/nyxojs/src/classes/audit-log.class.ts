import type {
  AuditLogChangeEntity,
  AuditLogCommandPermissionChangeEntity,
  AuditLogEntryInfoEntity,
  AuditLogEvent,
  AuditLogRoleChangeEntity,
  Snowflake,
} from "@nyxojs/core";
import type { GuildAuditLogEntryCreateEntity } from "@nyxojs/gateway";
import type { CamelCasedProperties, CamelCasedPropertiesDeep } from "type-fest";
import { BaseClass } from "../bases/index.js";
import type { Enforce } from "../types/index.js";
import {
  toCamelCasedProperties,
  toCamelCasedPropertiesDeep,
} from "../utils/index.js";
import type { User } from "./user.class.js";

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
   */
  get createdAt(): Date {
    return new Date(Number(BigInt(this.id) >> 22n) + 1420070400000);
  }

  /**
   * Gets the Unix timestamp (in milliseconds) of when this entry was created.
   *
   * @returns The creation timestamp in milliseconds
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
   */
  get camelCaseChanges():
    | CamelCasedPropertiesDeep<AuditLogChangeEntity>[]
    | CamelCasedPropertiesDeep<AuditLogCommandPermissionChangeEntity>[]
    | CamelCasedPropertiesDeep<AuditLogRoleChangeEntity>[]
    | undefined {
    if (!this.changes) {
      return undefined;
    }

    return this.changes.map(toCamelCasedPropertiesDeep) as
      | CamelCasedPropertiesDeep<AuditLogChangeEntity>[]
      | CamelCasedPropertiesDeep<AuditLogCommandPermissionChangeEntity>[]
      | CamelCasedPropertiesDeep<AuditLogRoleChangeEntity>[];
  }

  /**
   * Gets the options in a more accessible camelCase format.
   *
   * This transforms the options object into a more JavaScript-friendly format
   * with camelCase property names.
   *
   * @returns The options object in camelCase format, or undefined if no options
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
   */
  get executor(): User | null {
    if (!this.userId) {
      return null;
    }

    return this.client.cache.users.get(this.userId) || null;
  }
}
