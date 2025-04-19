import type {
  AuditLogChangeEntity,
  AuditLogCommandPermissionChangeEntity,
  AuditLogEntryInfoEntity,
  AuditLogEvent,
  AuditLogRoleChangeEntity,
  Snowflake,
} from "@nyxjs/core";
import type { GuildAuditLogEntryCreateEntity } from "@nyxjs/gateway";
import type { CamelCasedProperties } from "type-fest";
import { BaseClass } from "../bases/index.js";
import type { Enforce } from "../types/index.js";

export class GuildAuditLogEntry
  extends BaseClass<GuildAuditLogEntryCreateEntity>
  implements Enforce<CamelCasedProperties<GuildAuditLogEntryCreateEntity>>
{
  get guildId(): Snowflake {
    return this.data.guild_id;
  }

  get targetId(): string | null {
    return this.data.target_id;
  }

  get changes():
    | AuditLogChangeEntity[]
    | AuditLogCommandPermissionChangeEntity[]
    | AuditLogRoleChangeEntity[]
    | undefined {
    return this.data.changes;
  }

  get userId(): Snowflake | null {
    return this.data.user_id;
  }

  get id(): Snowflake {
    return this.data.id;
  }

  get actionType(): AuditLogEvent {
    return this.data.action_type;
  }

  get options(): AuditLogEntryInfoEntity | undefined {
    return this.data.options;
  }

  get reason(): string | undefined {
    return this.data.reason;
  }
}
