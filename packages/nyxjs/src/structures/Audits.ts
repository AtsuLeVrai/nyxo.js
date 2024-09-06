import type {
    AuditLogChangeStructure,
    AuditLogEntryStructure,
    AuditLogEvents,
    AuditLogStructure,
    IntegrationTypes,
    OptionalAuditEntryInfoStructure,
} from "@nyxjs/api-types";
import type { Snowflake } from "@nyxjs/core";
import { ApplicationCommand } from "./ApplicationCommands";
import { Base } from "./Base";
import { ThreadChannel } from "./Channels";
import { GuildScheduledEvent } from "./GuildScheduledEvent";
import { Integration } from "./Integrations";
import { AutoModerationRule } from "./Moderations";
import { User } from "./Users";
import { Webhook } from "./Webhooks";

export class AuditLogChange extends Base<AuditLogChangeStructure> {
    public key!: string;

    public newValue?: any;

    public oldValue?: any;

    public constructor(data: Readonly<Partial<AuditLogChangeStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<AuditLogChangeStructure>>): void {
        if (data.key !== undefined) {
            this.key = data.key;
        }

        if ("new_value" in data) {
            if (data.new_value === null) {
                this.newValue = undefined;
            } else if (data.new_value !== undefined) {
                this.newValue = data.new_value;
            }
        }

        if ("old_value" in data) {
            if (data.old_value === null) {
                this.oldValue = undefined;
            } else if (data.old_value !== undefined) {
                this.oldValue = data.old_value;
            }
        }
    }
}

export class OptionalAuditEntryInfo extends Base<OptionalAuditEntryInfoStructure> {
    public applicationId?: Snowflake;

    public autoModerationRuleName?: string;

    public autoModerationRuleTriggerType?: string;

    public channelId?: Snowflake;

    public count?: string;

    public deleteMemberDays?: string;

    public id?: Snowflake;

    public integrationType?: IntegrationTypes;

    public membersRemoved?: string;

    public messageId?: Snowflake;

    public roleName?: string;

    public type?: string;

    public constructor(data: Readonly<Partial<OptionalAuditEntryInfoStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<OptionalAuditEntryInfoStructure>>): void {
        if ("application_id" in data) {
            if (data.application_id === null) {
                this.applicationId = undefined;
            } else if (data.application_id !== undefined) {
                this.applicationId = data.application_id;
            }
        }

        if ("auto_moderation_rule_name" in data) {
            if (data.auto_moderation_rule_name === null) {
                this.autoModerationRuleName = undefined;
            } else if (data.auto_moderation_rule_name !== undefined) {
                this.autoModerationRuleName = data.auto_moderation_rule_name;
            }
        }

        if ("auto_moderation_rule_trigger_type" in data) {
            if (data.auto_moderation_rule_trigger_type === null) {
                this.autoModerationRuleTriggerType = undefined;
            } else if (data.auto_moderation_rule_trigger_type !== undefined) {
                this.autoModerationRuleTriggerType = data.auto_moderation_rule_trigger_type;
            }
        }

        if ("channel_id" in data) {
            if (data.channel_id === null) {
                this.channelId = undefined;
            } else if (data.channel_id !== undefined) {
                this.channelId = data.channel_id;
            }
        }

        if ("count" in data) {
            if (data.count === null) {
                this.count = undefined;
            } else if (data.count !== undefined) {
                this.count = data.count;
            }
        }

        if ("delete_member_days" in data) {
            if (data.delete_member_days === null) {
                this.deleteMemberDays = undefined;
            } else if (data.delete_member_days !== undefined) {
                this.deleteMemberDays = data.delete_member_days;
            }
        }

        if ("id" in data) {
            if (data.id === null) {
                this.id = undefined;
            } else if (data.id !== undefined) {
                this.id = data.id;
            }
        }

        if ("integration_type" in data) {
            if (data.integration_type === null) {
                this.integrationType = undefined;
            } else if (data.integration_type !== undefined) {
                this.integrationType = data.integration_type;
            }
        }

        if ("members_removed" in data) {
            if (data.members_removed === null) {
                this.membersRemoved = undefined;
            } else if (data.members_removed !== undefined) {
                this.membersRemoved = data.members_removed;
            }
        }

        if ("message_id" in data) {
            if (data.message_id === null) {
                this.messageId = undefined;
            } else if (data.message_id !== undefined) {
                this.messageId = data.message_id;
            }
        }

        if ("role_name" in data) {
            if (data.role_name === null) {
                this.roleName = undefined;
            } else if (data.role_name !== undefined) {
                this.roleName = data.role_name;
            }
        }

        if ("type" in data) {
            if (data.type === null) {
                this.type = undefined;
            } else if (data.type !== undefined) {
                this.type = data.type;
            }
        }
    }
}

export class AuditLogEntry extends Base<AuditLogEntryStructure> {
    public actionType!: AuditLogEvents;

    public changes?: AuditLogChange[];

    public id!: Snowflake;

    public options?: OptionalAuditEntryInfo;

    public reason?: string;

    public targetId!: Snowflake | null;

    public userId!: Snowflake | null;

    public constructor(data: Readonly<Partial<AuditLogEntryStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<AuditLogEntryStructure>>): void {
        if (data.action_type !== undefined) {
            this.actionType = data.action_type;
        }

        if ("changes" in data) {
            if (data.changes === null) {
                this.changes = undefined;
            } else if (data.changes !== undefined) {
                this.changes = data.changes.map((change) => AuditLogChange.from(change));
            }
        }

        if (data.id !== undefined) {
            this.id = data.id;
        }

        if ("options" in data) {
            if (data.options === null) {
                this.options = undefined;
            } else if (data.options !== undefined) {
                this.options = OptionalAuditEntryInfo.from(data.options);
            }
        }

        if ("reason" in data) {
            if (data.reason === null) {
                this.reason = undefined;
            } else if (data.reason !== undefined) {
                this.reason = data.reason;
            }
        }

        if (data.target_id !== undefined) {
            this.targetId = data.target_id;
        }

        if (data.user_id !== undefined) {
            this.userId = data.user_id;
        }
    }
}

export class AuditLog extends Base<AuditLogStructure> {
    public applicationCommands?: ApplicationCommand[];

    public auditLogEntries!: AuditLogEntry[];

    public autoModerationRules?: AutoModerationRule[];

    public guildScheduledEvents?: GuildScheduledEvent[];

    public integrations?: Integration[];

    public threads?: ThreadChannel[];

    public users?: User[];

    public webhooks?: Webhook[];

    public constructor(data: Readonly<Partial<AuditLogStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<AuditLogStructure>>): void {
        if ("application_commands" in data) {
            if (data.application_commands === null) {
                this.applicationCommands = undefined;
            } else if (data.application_commands !== undefined) {
                this.applicationCommands = data.application_commands.map((command) => ApplicationCommand.from(command));
            }
        }

        if (data.audit_log_entries !== undefined) {
            this.auditLogEntries = data.audit_log_entries.map((entry) => AuditLogEntry.from(entry));
        }

        if ("auto_moderation_rules" in data) {
            if (data.auto_moderation_rules === null) {
                this.autoModerationRules = undefined;
            } else if (data.auto_moderation_rules !== undefined) {
                this.autoModerationRules = data.auto_moderation_rules.map((rule) => AutoModerationRule.from(rule));
            }
        }

        if ("guild_scheduled_events" in data) {
            if (data.guild_scheduled_events === null) {
                this.guildScheduledEvents = undefined;
            } else if (data.guild_scheduled_events !== undefined) {
                this.guildScheduledEvents = data.guild_scheduled_events.map((event) => GuildScheduledEvent.from(event));
            }
        }

        if ("integrations" in data) {
            if (data.integrations === null) {
                this.integrations = undefined;
            } else if (data.integrations !== undefined) {
                this.integrations = data.integrations.map((integration) => Integration.from(integration));
            }
        }

        if ("threads" in data) {
            if (data.threads === null) {
                this.threads = undefined;
            } else if (data.threads !== undefined) {
                this.threads = data.threads.map((thread) => ThreadChannel.from(thread));
            }
        }

        if ("users" in data) {
            if (data.users === null) {
                this.users = undefined;
            } else if (data.users !== undefined) {
                this.users = data.users.map((user) => User.from(user));
            }
        }

        if ("webhooks" in data) {
            if (data.webhooks === null) {
                this.webhooks = undefined;
            } else if (data.webhooks !== undefined) {
                this.webhooks = data.webhooks.map((webhook) => Webhook.from(webhook));
            }
        }
    }
}

export { AuditLogEvents } from "@nyxjs/api-types";
