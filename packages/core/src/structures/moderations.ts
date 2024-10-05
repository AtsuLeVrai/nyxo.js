import type { Integer, Snowflake } from "../markdown";

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-action-object-action-metadata|Auto-Moderation Action Metadata}
 */
export type AutoModerationActionMetadataStructure = {
    /**
     * Channel to which user content should be logged.
     */
    channel_id: Snowflake;
    /**
     * Additional explanation that will be shown to members whenever their message is blocked.
     */
    custom_message?: string;
    /**
     * Timeout duration in seconds.
     */
    duration_seconds: Integer;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-action-object-action-types|Auto-Moderation Action Types}
 */
export enum AutoModerationActionTypes {
    /**
     * Blocks a member's message and prevents it from being posted.
     */
    BlockMessage = 1,
    /**
     * Logs user content to a specified channel.
     */
    SendAlertMessage = 2,
    /**
     * Timeout user for a specified duration.
     */
    Timeout = 3,
    /**
     * Prevents a member from using text, voice, or other interactions.
     */
    BlockMemberInteraction = 4,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-action-object-auto-moderation-action-structure|Auto-Moderation Action Structure}
 */
export type AutoModerationActionStructure = {
    /**
     * Additional metadata needed during execution for this specific action type.
     */
    metadata?: AutoModerationActionMetadataStructure;
    /**
     * The type of action.
     */
    type: AutoModerationActionTypes;
};

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-event-types|Auto-Moderation Rule Event Types}
 */
export enum AutoModerationRuleEventTypes {
    /**
     * When a member sends or edits a message in the guild.
     */
    MessageSend = 1,
    /**
     * When a member edits their profile.
     */
    MemberUpdate = 2,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-keyword-preset-types|Auto-Moderation Rule Keyword Preset Types}
 */
export enum AutoModerationRuleKeywordPresetTypes {
    /**
     * Words that may be considered forms of swearing or cursing.
     */
    Profanity = 1,
    /**
     * Words that refer to sexually explicit behavior or activity.
     */
    SexualContent = 2,
    /**
     * Personal insults or words that may be considered hate speech.
     */
    Slurs = 3,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-trigger-metadata|Auto-Moderation Rule Trigger Metadata}
 */
export type AutoModerationRuleTriggerMetadata = {
    /**
     * Substrings which should not trigger the rule (Maximum of 100 or 1000)
     */
    allow_list?: string[];
    /**
     * Substrings which will be searched for in content (Maximum of 1000)
     */
    keyword_filter?: string[];
    /**
     * Whether to automatically detect mention raids
     */
    mention_raid_protection_enabled?: boolean;
    /**
     * Total number of unique role and user mentions allowed per message (Maximum of 50)
     */
    mention_total_limit?: Integer;
    /**
     * The internally pre-defined wordsets which will be searched for in content
     */
    presets?: AutoModerationRuleKeywordPresetTypes[];
    /**
     * Regular expression patterns which will be matched against content (Maximum of 10)
     */
    regex_patterns?: string[];
};

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-trigger-types|Auto-Moderation Rule Trigger Types}
 */
export enum AutoModerationRuleTriggerTypes {
    /**
     * Check if content contains words from a user defined list of keywords.
     */
    Keyword = 1,
    /**
     * Check if content represents generic spam.
     */
    Spam = 3,
    /**
     * Check if content contains words from internal pre-defined wordsets.
     */
    KeywordPreset = 4,
    /**
     * Check if content contains more unique mentions than allowed.
     */
    MentionSpam = 5,
    /**
     * Check if member profile contains words from a user defined list of keywords.
     */
    MemberProfile = 6,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-auto-moderation-rule-structure|Auto-Moderation Rule Structure}
 */
export type AutoModerationRuleStructure = {
    /**
     * The actions which will execute when the rule is triggered.
     */
    actions: AutoModerationActionStructure[];
    /**
     * The user which first created this rule.
     */
    creator_id: Snowflake;
    /**
     * Whether the rule is enabled.
     */
    enabled: boolean;
    /**
     * The rule event type.
     */
    event_type: AutoModerationRuleEventTypes;
    /**
     * The channel ids that should not be affected by the rule.
     */
    exempt_channels: Snowflake[];
    /**
     * The role ids that should not be affected by the rule.
     */
    exempt_roles: Snowflake[];
    /**
     * The id of the guild which this rule belongs to.
     */
    guild_id: Snowflake;
    /**
     * The id of this rule.
     */
    id: Snowflake;
    /**
     * The rule name.
     */
    name: string;
    /**
     * The rule trigger metadata.
     */
    trigger_metadata: AutoModerationRuleTriggerMetadata;
    /**
     * The rule trigger type.
     */
    trigger_type: AutoModerationRuleTriggerTypes;
};
