import type {
    AuditLogChangeStructure,
    AuditLogEntryStructure,
    AuditLogEvents,
    AuditLogStructure,
    IntegrationTypes,
    OptionalAuditEntryInfoStructure,
} from "@nyxjs/api-types";
import type { Snowflake } from "@nyxjs/core";
import { Base } from "./Base";
import { ThreadChannel } from "./Channels";
import { GuildScheduledEvent, Integration } from "./Guilds";
import { ApplicationCommand } from "./Interactions";
import { AutoModerationRule } from "./Moderations";
import { User } from "./Users";
import { Webhook } from "./Webhooks";

export class AuditLogChange extends Base<AuditLogChangeStructure> {
    public key!: string;

    public newValue?: any;

    public oldValue?: any;

    public constructor(data: Partial<AuditLogChangeStructure>) {
        super(data);
    }

    protected patch(data: Partial<AuditLogChangeStructure>): void {
        this.key = data.key ?? this.key;

        if ("new_value" in data) {
            this.newValue = data.new_value;
        }

        if ("old_value" in data) {
            this.oldValue = data.old_value;
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

    public constructor(data: Partial<OptionalAuditEntryInfoStructure>) {
        super(data);
    }

    protected patch(data: Partial<OptionalAuditEntryInfoStructure>): void {
        if ("application_id" in data) {
            this.applicationId = data.application_id;
        }

        if ("auto_moderation_rule_name" in data) {
            this.autoModerationRuleName = data.auto_moderation_rule_name;
        }

        if ("auto_moderation_rule_trigger_type" in data) {
            this.autoModerationRuleTriggerType = data.auto_moderation_rule_trigger_type;
        }

        if ("channel_id" in data) {
            this.channelId = data.channel_id;
        }

        if ("count" in data) {
            this.count = data.count;
        }

        if ("delete_member_days" in data) {
            this.deleteMemberDays = data.delete_member_days;
        }

        if ("id" in data) {
            this.id = data.id;
        }

        if ("integration_type" in data) {
            this.integrationType = data.integration_type;
        }

        if ("members_removed" in data) {
            this.membersRemoved = data.members_removed;
        }

        if ("message_id" in data) {
            this.messageId = data.message_id;
        }

        if ("role_name" in data) {
            this.roleName = data.role_name;
        }

        if ("type" in data) {
            this.type = data.type;
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

    public constructor(data: Partial<AuditLogEntryStructure>) {
        super(data);
    }

    protected patch(data: Partial<AuditLogEntryStructure>): void {
        this.actionType = data.action_type ?? this.actionType;

        if ("changes" in data && data.changes) {
            this.changes = data.changes.map((change) => AuditLogChange.from(change));
        }

        this.id = data.id ?? this.id;

        if ("options" in data && data.options) {
            this.options = OptionalAuditEntryInfo.from(data.options);
        }

        if ("reason" in data) {
            this.reason = data.reason;
        }

        this.targetId = data.target_id ?? this.targetId;
        this.userId = data.user_id ?? this.userId;
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

    public constructor(data: Partial<AuditLogStructure>) {
        super(data);
    }

    protected patch(data: Partial<AuditLogStructure>): void {
        if ("application_commands" in data && data.application_commands) {
            this.applicationCommands = data.application_commands.map((command) => ApplicationCommand.from(command));
        }

        this.auditLogEntries = data.audit_log_entries
            ? data.audit_log_entries.map((entry) => AuditLogEntry.from(entry))
            : this.auditLogEntries;

        if ("auto_moderation_rules" in data && data.auto_moderation_rules) {
            this.autoModerationRules = data.auto_moderation_rules.map((rule) => AutoModerationRule.from(rule));
        }

        if ("guild_scheduled_events" in data && data.guild_scheduled_events) {
            this.guildScheduledEvents = data.guild_scheduled_events.map((event) => GuildScheduledEvent.from(event));
        }

        if ("integrations" in data && data.integrations) {
            this.integrations = data.integrations.map((integration) => Integration.from(integration));
        }

        if ("threads" in data && data.threads) {
            this.threads = data.threads.map((thread) => ThreadChannel.from(thread));
        }

        if ("users" in data && data.users) {
            this.users = data.users.map((user) => User.from(user));
        }

        if ("webhooks" in data && data.webhooks) {
            this.webhooks = data.webhooks.map((webhook) => Webhook.from(webhook));
        }
    }
}

export { AuditLogEvents } from "@nyxjs/api-types";
