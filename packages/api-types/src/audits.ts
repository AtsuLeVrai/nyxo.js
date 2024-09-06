import type { Snowflake } from "@nyxjs/core";
import type { IntegrationTypes } from "./applications";
import type { ChannelStructure } from "./channels";
import type { GuildScheduledEventStructure, IntegrationStructure } from "./guilds";
import type { ApplicationCommandStructure } from "./interactions";
import type { AutoModerationRuleStructure } from "./moderations";
import type { UserStructure } from "./users";
import type { WebhookStructure } from "./webhooks";

/**
 * @see {@link https://discord.com/developers/docs/resources/audit-log#audit-log-change-object-audit-log-change-structure}
 */
export type AuditLogChangeStructure = {
    /**
     * Name of the changed entity, with a few exceptions
     */
    key: string;
    /**
     * New value of the key
     */
    new_value?: any;
    /**
     * Old value of the key
     */
    old_value?: any;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/audit-log#audit-log-entry-object-optional-audit-entry-info}
 */
export type OptionalAuditEntryInfoStructure = {
    /**
     * ID of the app whose permissions were targeted
     */
    application_id?: Snowflake;
    /**
     * Name of the Auto Moderation rule that was triggered
     */
    auto_moderation_rule_name?: string;
    /**
     * Trigger type of the Auto Moderation rule that was triggered
     */
    auto_moderation_rule_trigger_type?: string;
    /**
     * Channel in which the entities were targeted
     */
    channel_id?: Snowflake;
    /**
     * Number of entities that were targeted
     */
    count?: string;
    /**
     * Number of days after which inactive members were kicked
     */
    delete_member_days?: string;
    /**
     * ID of the overwritten entity
     */
    id?: Snowflake;
    /**
     * The type of integration which performed the action
     */
    integration_type?: IntegrationTypes;
    /**
     * Number of members removed by the prune
     */
    members_removed?: string;
    /**
     * ID of the message that was targeted
     */
    message_id?: Snowflake;
    /**
     * Name of the role if type is "0" (not present if type is "1")
     */
    role_name?: string;
    /**
     * Type of overwritten entity - role ("0") or member ("1")
     */
    type?: string;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/audit-log#audit-log-entry-object-audit-log-events}
 */
export enum AuditLogEvents {
    /**
     * Server settings were updated
     */
    GuildUpdate = 1,
    /**
     * Channel was created
     */
    ChannelCreate = 10,
    /**
     * Channel settings were updated
     */
    ChannelUpdate = 11,
    /**
     * Channel was deleted
     */
    ChannelDelete = 12,
    /**
     * Permission overwrite was added to a channel
     */
    ChannelOverwriteCreate = 13,
    /**
     * Permission overwrite was updated for a channel
     */
    ChannelOverwriteUpdate = 14,
    /**
     * Permission overwrite was deleted from a channel
     */
    ChannelOverwriteDelete = 15,
    /**
     * Member was removed from server
     */
    MemberKick = 20,
    /**
     * Members were pruned from server
     */
    MemberPrune = 21,
    /**
     * Member was banned from server
     */
    MemberBanAdd = 22,
    /**
     * Server ban was lifted for a member
     */
    MemberBanRemove = 23,
    /**
     * Member was updated in server
     */
    MemberUpdate = 24,
    /**
     * Member was added or removed from a role
     */
    MemberRoleUpdate = 25,
    /**
     * Member was moved to a different voice channel
     */
    MemberMove = 26,
    /**
     * Member was disconnected from a voice channel
     */
    MemberDisconnect = 27,
    /**
     * Bot user was added to server
     */
    BotAdd = 28,
    /**
     * Role was created
     */
    RoleCreate = 30,
    /**
     * Role was edited
     */
    RoleUpdate = 31,
    /**
     * Role was deleted
     */
    RoleDelete = 32,
    /**
     * Server invite was created
     */
    InviteCreate = 40,
    /**
     * Server invite was updated
     */
    InviteUpdate = 41,
    /**
     * Server invite was deleted
     */
    InviteDelete = 42,
    /**
     * Webhook was created
     */
    WebhookCreate = 50,
    /**
     * Webhook properties or channel were updated
     */
    WebhookUpdate = 51,
    /**
     * Webhook was deleted
     */
    WebhookDelete = 52,
    /**
     * Emoji was created
     */
    EmojiCreate = 60,
    /**
     * Emoji name was updated
     */
    EmojiUpdate = 61,
    /**
     * Emoji was deleted
     */
    EmojiDelete = 62,
    /**
     * Single message was deleted
     */
    MessageDelete = 72,
    /**
     * Multiple messages were deleted
     */
    MessageBulkDelete = 73,
    /**
     * Message was pinned to a channel
     */
    MessagePin = 74,
    /**
     * Message was unpinned from a channel
     */
    MessageUnpin = 75,
    /**
     * App was added to server
     */
    IntegrationCreate = 80,
    /**
     * App was updated (as an example, its scopes were updated)
     */
    IntegrationUpdate = 81,
    /**
     * App was removed from server
     */
    IntegrationDelete = 82,
    /**
     * Stage instance was created (stage channel becomes live)
     */
    StageInstanceCreate = 83,
    /**
     * Stage instance details were updated
     */
    StageInstanceUpdate = 84,
    /**
     * Stage instance was deleted (stage channel no longer live)
     */
    StageInstanceDelete = 85,
    /**
     * Sticker was created
     */
    StickerCreate = 90,
    /**
     * Sticker details were updated
     */
    StickerUpdate = 91,
    /**
     * Sticker was deleted
     */
    StickerDelete = 92,
    /**
     * Event was created
     */
    GuildScheduledEventCreate = 100,
    /**
     * Event was updated
     */
    GuildScheduledEventUpdate = 101,
    /**
     * Event was cancelled
     */
    GuildScheduledEventDelete = 102,
    /**
     * Thread was created in a channel
     */
    ThreadCreate = 110,
    /**
     * Thread was updated
     */
    ThreadUpdate = 111,
    /**
     * Thread was deleted
     */
    ThreadDelete = 112,
    /**
     * Permissions were updated for a command
     */
    ApplicationCommandPermissionUpdate = 121,
    /**
     * Auto Moderation rule was created
     */
    AutoModerationRuleCreate = 140,
    /**
     * Auto Moderation rule was updated
     */
    AutoModerationRuleUpdate = 141,
    /**
     * Auto Moderation rule was deleted
     */
    AutoModerationRuleDelete = 142,
    /**
     * Message was blocked by Auto Moderation
     */
    AutoModerationBlockMessage = 143,
    /**
     * Message was flagged by Auto Moderation
     */
    AutoModerationFlagToChannel = 144,
    /**
     * Member was timed out by Auto Moderation
     */
    AutoModerationUserCommunicationDisabled = 145,
    /**
     * Creator monetization request was created
     */
    CreatorMonetizationRequestCreated = 150,
    /**
     * Creator monetization terms were accepted
     */
    CreatorMonetizationTermsAccepted = 151,
    /**
     * Guild Onboarding Question was created
     */
    OnboardingPromptCreate = 163,
    /**
     * Guild Onboarding Question was updated
     */
    OnboardingPromptUpdate = 164,
    /**
     * Guild Onboarding Question was deleted
     */
    OnboardingPromptDelete = 165,
    /**
     * Guild Onboarding was created
     */
    OnboardingCreate = 166,
    /**
     * Guild Onboarding was updated
     */
    OnboardingUpdate = 167,
    /**
     * Guild Server Guide was created
     */
    HomeSettingsCreate = 190,
    /**
     * Guild Server Guide was updated
     */
    HomeSettingsUpdate = 191,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/audit-log#audit-log-entry-object-audit-log-entry-structure}
 */
export type AuditLogEntryStructure = {
    /**
     * Type of action that occurred
     */
    action_type: AuditLogEvents;
    /**
     * Changes made to the target_id
     */
    changes?: AuditLogChangeStructure[];
    /**
     * ID of the entry
     */
    id: Snowflake;
    /**
     * Additional info for certain event types
     */
    options?: OptionalAuditEntryInfoStructure;
    /**
     * Reason for the change (1-512 characters)
     */
    reason?: string;
    /**
     * ID of the affected entity (webhook, user, role, etc.)
     */
    target_id: Snowflake | null;
    /**
     * User or app that made the changes
     */
    user_id: Snowflake | null;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/audit-log#audit-log-object-audit-log-structure}
 */
export type AuditLogStructure = {
    /**
     * List of application commands referenced in the audit log
     */
    application_commands?: ApplicationCommandStructure[];
    /**
     * List of audit log entries, sorted from most to least recent
     */
    audit_log_entries: AuditLogEntryStructure[];
    /**
     * List of auto moderation rules referenced in the audit log
     */
    auto_moderation_rules?: AutoModerationRuleStructure[];
    /**
     * List of guild scheduled events referenced in the audit log
     */
    guild_scheduled_events?: GuildScheduledEventStructure[];
    /**
     * List of partial integration objects
     */
    integrations?: IntegrationStructure[];
    /**
     * List of threads referenced in the audit log
     */
    threads?: ChannelStructure[];
    /**
     * List of users referenced in the audit log
     */
    users?: UserStructure[];
    /**
     * List of webhooks referenced in the audit log
     */
    webhooks?: WebhookStructure[];
};
