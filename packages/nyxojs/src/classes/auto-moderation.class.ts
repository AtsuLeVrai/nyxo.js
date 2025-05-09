import {
  type AutoModerationActionEntity,
  AutoModerationActionType,
  type AutoModerationEventType,
  type AutoModerationKeywordMatchType,
  type AutoModerationKeywordPresetType,
  type AutoModerationRuleEntity,
  type AutoModerationRuleTriggerMetadataEntity,
  AutoModerationRuleTriggerType,
  type Snowflake,
} from "@nyxojs/core";
import type { AutoModerationActionExecutionEntity } from "@nyxojs/gateway";
import type { AutoModerationRuleUpdateOptions } from "@nyxojs/rest";
import { BaseClass, Cacheable } from "../bases/index.js";
import type { Enforce, Promisable, PropsToCamel } from "../types/index.js";
import { Message } from "./message.class.js";
import { User } from "./user.class.js";

/**
 * Represents a Discord Auto Moderation Action Execution, providing access to information about triggered rules.
 *
 * The AutoModerationActionExecution class encapsulates data for events sent when an auto moderation rule
 * is triggered and an action is executed. This occurs when a user sends content that violates a defined rule,
 * causing Discord to take an automated action such as blocking a message, sending an alert, or timing out a user.
 *
 * This class provides:
 * - Information about which rule was triggered
 * - Access to the triggering content and matched patterns
 * - Details about the executed action
 * - Context about where and by whom the rule was triggered
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#auto-moderation-action-execution}
 */
export class AutoModerationActionExecution
  extends BaseClass<AutoModerationActionExecutionEntity>
  implements Enforce<PropsToCamel<AutoModerationActionExecutionEntity>>
{
  /**
   * Gets the ID of the guild in which the action was executed.
   *
   * This identifies which server the rule was triggered in.
   *
   * @returns The guild's ID as a Snowflake string
   */
  get guildId(): Snowflake {
    return this.rawData.guild_id;
  }

  /**
   * Gets the action which was executed on the triggering content.
   *
   * This may include blocking a message, sending an alert, or timing out a user.
   *
   * @returns The action object
   * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-action-object}
   */
  get action(): AutoModerationActionEntity {
    return this.rawData.action;
  }

  /**
   * Gets the ID of the rule which the action belongs to.
   *
   * This can be used to look up the full rule details.
   *
   * @returns The rule's ID as a Snowflake string
   */
  get ruleId(): Snowflake {
    return this.rawData.rule_id;
  }

  /**
   * Gets the trigger type of the rule which was triggered.
   *
   * This indicates what kind of content filter was activated (keyword, spam, etc.).
   *
   * @returns The trigger type enum value
   * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-trigger-types}
   */
  get ruleTriggerType(): AutoModerationRuleTriggerType {
    return this.rawData.rule_trigger_type;
  }

  /**
   * Gets the ID of the user who generated the content which triggered the rule.
   *
   * Identifies which user's message or action activated the auto moderation.
   *
   * @returns The user's ID as a Snowflake string
   */
  get userId(): Snowflake {
    return this.rawData.user_id;
  }

  /**
   * Gets the ID of the channel in which the user content was posted.
   *
   * May be undefined for actions not associated with a specific channel.
   *
   * @returns The channel's ID as a Snowflake string, or undefined if not applicable
   */
  get channelId(): Snowflake | undefined {
    return this.rawData.channel_id;
  }

  /**
   * Gets the ID of any user message which content belongs to.
   *
   * May be undefined if the action was not triggered by a specific message.
   *
   * @returns The message's ID as a Snowflake string, or undefined if not applicable
   */
  get messageId(): Snowflake | undefined {
    return this.rawData.message_id;
  }

  /**
   * Gets the ID of any system auto moderation messages posted as a result of this action.
   *
   * Only present when the action type includes sending an alert message.
   *
   * @returns The alert message's ID as a Snowflake string, or undefined if not applicable
   */
  get alertSystemMessageId(): Snowflake | undefined {
    return this.rawData.alert_system_message_id;
  }

  /**
   * Gets the user-generated text content that triggered the rule.
   *
   * Requires MESSAGE_CONTENT intent to access.
   *
   * @returns The triggering content as a string, or undefined if not available
   */
  get content(): string | undefined {
    return this.rawData.content;
  }

  /**
   * Gets the specific word or phrase configured in the rule that triggered the rule.
   *
   * Null if the rule was not triggered by a specific keyword.
   *
   * @returns The matched keyword as a string, or null if not applicable
   */
  get matchedKeyword(): string | null {
    return this.rawData.matched_keyword;
  }

  /**
   * Gets the substring in the content that triggered the rule.
   *
   * Requires MESSAGE_CONTENT intent to access.
   *
   * @returns The matched content substring, or null if not available
   */
  get matchedContent(): string | null {
    return this.rawData.matched_content;
  }

  /**
   * Fetches the user who generated the content that triggered the rule.
   *
   * @returns A promise resolving to the User object
   * @throws Error if the user couldn't be fetched
   */
  async getUser(): Promise<User> {
    const user = await this.client.rest.users.fetchUser(this.userId);
    return new User(this.client, user);
  }

  /**
   * Fetches the message that triggered the rule, if applicable.
   *
   * Only works if the action was triggered by a specific message and
   * that message is still available.
   *
   * @returns A promise resolving to the Message object, or null if not available
   */
  async getMessage(): Promise<Message | null> {
    if (!(this.messageId && this.channelId)) {
      return null;
    }

    try {
      const messageData = await this.client.rest.messages.fetchMessage(
        this.channelId,
        this.messageId,
      );
      return new Message(this.client, messageData);
    } catch {
      return null;
    }
  }

  /**
   * Fetches the alert system message that was posted as a result of this action, if applicable.
   *
   * Only works if the action type included sending an alert message and
   * that message is still available.
   *
   * @returns A promise resolving to the Message object, or null if not available
   */
  async getAlertMessage(): Promise<Message | null> {
    if (!(this.alertSystemMessageId && this.channelId)) {
      return null;
    }

    try {
      const messageData = await this.client.rest.messages.fetchMessage(
        this.channelId,
        this.alertSystemMessageId,
      );
      return new Message(this.client, messageData);
    } catch {
      return null;
    }
  }

  /**
   * Fetches the rule that was triggered.
   *
   * @returns A promise resolving to the AutoModeration object
   * @throws Error if the rule couldn't be fetched
   */
  async getRule(): Promise<AutoModeration> {
    const rule = await this.client.rest.autoModeration.fetchRule(
      this.guildId,
      this.ruleId,
    );
    return new AutoModeration(this.client, rule);
  }

  /**
   * Gets a string representation of this action execution.
   *
   * @returns A formatted string with basic information about the triggered rule
   */
  override toString(): string {
    const triggerType =
      AutoModerationRuleTriggerType[this.ruleTriggerType] ||
      this.ruleTriggerType;
    return `AutoMod: ${triggerType} rule triggered by user ${this.userId}`;
  }

  /**
   * Checks if this action execution blocked a message.
   *
   * @returns True if the action included blocking a message, false otherwise
   */
  hasBlockMessageAction(): boolean {
    return this.action.type === 1; // BlockMessage type
  }

  /**
   * Checks if this action execution sent an alert message.
   *
   * @returns True if the action included sending an alert, false otherwise
   */
  hasSendAlertAction(): boolean {
    return this.action.type === 2; // SendAlertMessage type
  }

  /**
   * Checks if this action execution timed out a user.
   *
   * @returns True if the action included timing out a user, false otherwise
   */
  hasTimeoutAction(): boolean {
    return this.action.type === 3; // Timeout type
  }
}

/**
 * Represents a Discord Auto Moderation Rule, providing methods to interact with and manage content filtering rules.
 *
 * The AutoModeration class serves as a comprehensive wrapper around Discord's Auto Moderation API, offering:
 * - Access to rule configurations (triggers, actions, exemptions, etc.)
 * - Methods to update or delete rules
 * - Utilities for managing keyword filters and settings
 * - Role and channel exemption management
 *
 * This class transforms snake_case API responses into camelCase properties for
 * a more JavaScript-friendly interface while maintaining type safety.
 *
 * @see {@link https://discord.com/developers/docs/resources/auto-moderation}
 */
@Cacheable("autoModerationRules")
export class AutoModeration
  extends BaseClass<AutoModerationRuleEntity>
  implements Enforce<PropsToCamel<AutoModerationRuleEntity>>
{
  /**
   * Gets the unique identifier (Snowflake) of this auto moderation rule.
   *
   * This ID is used for API operations and remains constant for the lifetime of the rule.
   *
   * @returns The rule's ID as a Snowflake string
   */
  get id(): Snowflake {
    return this.rawData.id;
  }

  /**
   * Gets the ID of the guild this auto moderation rule belongs to.
   *
   * This identifies which server the rule is active in.
   *
   * @returns The guild's ID as a Snowflake string
   */
  get guildId(): Snowflake {
    return this.rawData.guild_id;
  }

  /**
   * Gets the name of this auto moderation rule.
   *
   * This is the display name shown in the Discord UI (1-100 characters).
   *
   * @returns The rule name as a string
   */
  get name(): string {
    return this.rawData.name;
  }

  /**
   * Gets the ID of the user who created this auto moderation rule.
   *
   * This is the user who initially set up the rule.
   *
   * @returns The creator's user ID as a Snowflake string
   */
  get creatorId(): Snowflake {
    return this.rawData.creator_id;
  }

  /**
   * Gets the event type that triggers this rule.
   *
   * This determines when the rule should be checked (message sends, profile updates).
   *
   * @returns The event type enum value
   * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-event-types}
   */
  get eventType(): AutoModerationEventType {
    return this.rawData.event_type;
  }

  /**
   * Gets the trigger type of this rule.
   *
   * This determines what criteria will cause the rule to be applied
   * (keywords, spam, mention spam, etc.).
   *
   * @returns The trigger type enum value
   * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-trigger-types}
   */
  get triggerType(): AutoModerationRuleTriggerType {
    return this.rawData.trigger_type;
  }

  /**
   * Gets the trigger metadata for this rule.
   *
   * This contains additional data used to evaluate the rule, such as
   * keyword lists, regex patterns, and threshold settings.
   *
   * @returns The trigger metadata object
   * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-trigger-metadata}
   */
  get triggerMetadata(): AutoModerationRuleTriggerMetadataEntity {
    return this.rawData.trigger_metadata;
  }

  /**
   * Gets the actions to execute when the rule is triggered.
   *
   * These define what happens when content matches the rule criteria
   * (block message, send alert, timeout user, etc.).
   *
   * @returns Array of action objects
   * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-auto-moderation-action-object}
   */
  get actions(): AutoModerationActionEntity[] {
    return this.rawData.actions;
  }

  /**
   * Indicates whether this rule is enabled.
   *
   * When enabled, the rule actively moderates content in the guild.
   * When disabled, the rule exists but doesn't affect any content.
   *
   * @returns True if the rule is enabled, false otherwise
   */
  get enabled(): boolean {
    return this.rawData.enabled;
  }

  /**
   * Gets the role IDs that are exempt from this rule.
   *
   * Users with these roles will not have their content moderated by this rule.
   *
   * @returns Array of exempt role IDs
   */
  get exemptRoles(): Snowflake[] {
    return this.rawData.exempt_roles;
  }

  /**
   * Gets the channel IDs that are exempt from this rule.
   *
   * Content in these channels will not be moderated by this rule.
   *
   * @returns Array of exempt channel IDs
   */
  get exemptChannels(): Snowflake[] {
    return this.rawData.exempt_channels;
  }

  /**
   * Gets the keywords that trigger this rule, if the rule is a keyword rule.
   *
   * Only available for rules with triggerType KEYWORD or MEMBER_PROFILE.
   *
   * @returns Array of keyword strings, or undefined if not applicable
   */
  get keywords(): string[] | undefined {
    return this.triggerMetadata?.keyword_filter;
  }

  /**
   * Gets the regex patterns used by this rule, if applicable.
   *
   * Only available for rules with triggerType KEYWORD or MEMBER_PROFILE.
   *
   * @returns Array of regex pattern strings, or undefined if not applicable
   */
  get regexPatterns(): string[] | undefined {
    return this.triggerMetadata?.regex_patterns;
  }

  /**
   * Gets the keyword presets used by this rule, if applicable.
   *
   * Only available for rules with triggerType KEYWORD_PRESET.
   *
   * @returns Array of preset enum values, or undefined if not applicable
   */
  get presets(): AutoModerationKeywordPresetType[] | undefined {
    return this.triggerMetadata?.presets;
  }

  /**
   * Gets the keywords that are allowed and won't trigger this rule.
   *
   * This functions as an exception list to prevent false positives.
   *
   * @returns Array of allowed strings, or undefined if not applicable
   */
  get allowList(): string[] | undefined {
    return this.triggerMetadata?.allow_list;
  }

  /**
   * Gets the mention limit for this rule, if applicable.
   *
   * Only available for rules with triggerType MENTION_SPAM.
   *
   * @returns The mention limit as a number, or undefined if not applicable
   */
  get mentionLimit(): number | undefined {
    return this.triggerMetadata?.mention_total_limit;
  }

  /**
   * Indicates whether mention raid protection is enabled for this rule.
   *
   * Only available for rules with triggerType MENTION_SPAM.
   *
   * @returns True if mention raid protection is enabled, undefined if not applicable
   */
  get mentionRaidProtection(): boolean | undefined {
    return this.triggerMetadata?.mention_raid_protection_enabled;
  }

  /**
   * Gets the keyword match strategy for this rule, if applicable.
   *
   * Only available for rules with triggerType KEYWORD or MEMBER_PROFILE.
   *
   * @returns Array of match type enum values, or undefined if not applicable
   */
  get keywordMatchTypes(): AutoModerationKeywordMatchType[] | undefined {
    return this.triggerMetadata?.keyword_match_type;
  }

  /**
   * Checks if this rule has a block message action.
   *
   * @returns True if the rule has a block message action, false otherwise
   */
  get hasBlockMessageAction(): boolean {
    return this.actions.some(
      (action) => action.type === AutoModerationActionType.BlockMessage,
    );
  }

  /**
   * Checks if this rule has a send alert action.
   *
   * @returns True if the rule has a send alert action, false otherwise
   */
  get hasAlertAction(): boolean {
    return this.actions.some(
      (action) => action.type === AutoModerationActionType.SendAlertMessage,
    );
  }

  /**
   * Checks if this rule has a timeout action.
   *
   * @returns True if the rule has a timeout action, false otherwise
   */
  get hasTimeoutAction(): boolean {
    return this.actions.some(
      (action) => action.type === AutoModerationActionType.Timeout,
    );
  }

  /**
   * Gets the alert channel ID for this rule, if configured.
   *
   * This is the channel where alerts are sent when the rule is triggered.
   *
   * @returns The alert channel ID, or undefined if no alert action is configured
   */
  get alertChannelId(): Snowflake | undefined {
    const alertAction = this.actions.find(
      (action) => action.type === AutoModerationActionType.SendAlertMessage,
    );
    return alertAction?.metadata?.channel_id;
  }

  /**
   * Gets the timeout duration in seconds for this rule, if configured.
   *
   * @returns The timeout duration in seconds, or undefined if no timeout action is configured
   */
  get timeoutDuration(): number | undefined {
    const timeoutAction = this.actions.find(
      (action) => action.type === AutoModerationActionType.Timeout,
    );
    return timeoutAction?.metadata?.duration_seconds;
  }

  /**
   * Gets the custom message shown to users when their message is blocked, if configured.
   *
   * @returns The custom block message, or undefined if not configured
   */
  get blockCustomMessage(): string | undefined {
    const blockAction = this.actions.find(
      (action) => action.type === AutoModerationActionType.BlockMessage,
    );
    return blockAction?.metadata?.custom_message;
  }

  /**
   * Updates this auto moderation rule with new settings.
   *
   * This method allows modifying various aspects of the rule,
   * such as its name, actions, trigger metadata, and exemptions.
   *
   * @param options - Options for updating the rule
   * @param reason - Optional audit log reason for the update
   * @returns A promise resolving to the updated AutoModeration rule
   * @throws Error if the rule couldn't be updated
   * @see {@link https://discord.com/developers/docs/resources/auto-moderation#modify-auto-moderation-rule}
   */
  async update(
    options: AutoModerationRuleUpdateOptions,
    reason?: string,
  ): Promise<AutoModeration> {
    const updatedRule = await this.client.rest.autoModeration.updateRule(
      this.guildId,
      this.id,
      options,
      reason,
    );

    this.patch(updatedRule);
    return this;
  }

  /**
   * Deletes this auto moderation rule.
   *
   * This permanently removes the rule from the guild.
   *
   * @param reason - Optional audit log reason for the deletion
   * @returns A promise resolving when the deletion is complete
   * @throws Error if the rule couldn't be deleted
   * @see {@link https://discord.com/developers/docs/resources/auto-moderation#delete-auto-moderation-rule}
   */
  async delete(reason?: string): Promise<void> {
    await this.client.rest.autoModeration.deleteRule(
      this.guildId,
      this.id,
      reason,
    );

    this.uncache();
  }

  /**
   * Enables this auto moderation rule.
   *
   * When enabled, the rule will actively moderate content.
   *
   * @param reason - Optional audit log reason for the change
   * @returns A promise resolving to the updated AutoModeration rule
   * @throws Error if the rule couldn't be enabled
   */
  enable(reason?: string): Promisable<AutoModeration> {
    if (this.enabled) {
      return this;
    }

    return this.update({ enabled: true }, reason);
  }

  /**
   * Disables this auto moderation rule.
   *
   * When disabled, the rule won't moderate any content but still exists.
   *
   * @param reason - Optional audit log reason for the change
   * @returns A promise resolving to the updated AutoModeration rule
   * @throws Error if the rule couldn't be disabled
   */
  disable(reason?: string): Promisable<AutoModeration> {
    if (!this.enabled) {
      return this;
    }

    return this.update({ enabled: false }, reason);
  }

  /**
   * Sets a new name for this auto moderation rule.
   *
   * @param name - The new name for the rule (1-100 characters)
   * @param reason - Optional audit log reason for the change
   * @returns A promise resolving to the updated AutoModeration rule
   * @throws Error if the name couldn't be updated
   */
  setName(name: string, reason?: string): Promise<AutoModeration> {
    return this.update({ name }, reason);
  }

  /**
   * Sets the event type for this auto moderation rule.
   *
   * This controls when the rule is checked (message sends, profile updates).
   *
   * @param eventType - The new event type
   * @param reason - Optional audit log reason for the change
   * @returns A promise resolving to the updated AutoModeration rule
   * @throws Error if the event type couldn't be updated
   */
  setEventType(
    eventType: AutoModerationEventType,
    reason?: string,
  ): Promise<AutoModeration> {
    return this.update({ event_type: eventType }, reason);
  }

  /**
   * Sets the actions for this auto moderation rule.
   *
   * This defines what happens when content matches the rule criteria.
   *
   * @param actions - Array of action objects (1-3 actions required)
   * @param reason - Optional audit log reason for the change
   * @returns A promise resolving to the updated AutoModeration rule
   * @throws Error if the actions couldn't be updated
   */
  setActions(
    actions: AutoModerationActionEntity[],
    reason?: string,
  ): Promise<AutoModeration> {
    return this.update({ actions }, reason);
  }

  /**
   * Sets the exempt roles for this auto moderation rule.
   *
   * Users with these roles will not have their content moderated by this rule.
   *
   * @param roleIds - Array of role IDs to exempt
   * @param reason - Optional audit log reason for the change
   * @returns A promise resolving to the updated AutoModeration rule
   * @throws Error if the exempt roles couldn't be updated
   */
  setExemptRoles(
    roleIds: Snowflake[],
    reason?: string,
  ): Promise<AutoModeration> {
    return this.update({ exempt_roles: roleIds }, reason);
  }

  /**
   * Sets the exempt channels for this auto moderation rule.
   *
   * Content in these channels will not be moderated by this rule.
   *
   * @param channelIds - Array of channel IDs to exempt
   * @param reason - Optional audit log reason for the change
   * @returns A promise resolving to the updated AutoModeration rule
   * @throws Error if the exempt channels couldn't be updated
   */
  setExemptChannels(
    channelIds: Snowflake[],
    reason?: string,
  ): Promise<AutoModeration> {
    return this.update({ exempt_channels: channelIds }, reason);
  }

  /**
   * Sets or updates the keywords for a keyword-based rule.
   *
   * Only applicable for rules with triggerType KEYWORD or MEMBER_PROFILE.
   *
   * @param keywords - Array of keywords to filter
   * @param reason - Optional audit log reason for the change
   * @returns A promise resolving to the updated AutoModeration rule
   * @throws Error if the keywords couldn't be updated or the rule type is incompatible
   */
  setKeywords(keywords: string[], reason?: string): Promise<AutoModeration> {
    if (
      this.triggerType !== AutoModerationRuleTriggerType.Keyword &&
      this.triggerType !== AutoModerationRuleTriggerType.MemberProfile
    ) {
      throw new Error("Cannot set keywords for this rule type");
    }

    const triggerMetadata: AutoModerationRuleTriggerMetadataEntity = {
      ...this.triggerMetadata,
      keyword_filter: keywords,
    };

    return this.update({ trigger_metadata: triggerMetadata }, reason);
  }

  /**
   * Sets or updates the allow list (exempted terms) for this rule.
   *
   * Terms in the allow list won't trigger the rule, even if they match the criteria.
   *
   * @param allowList - Array of terms to allow
   * @param reason - Optional audit log reason for the change
   * @returns A promise resolving to the updated AutoModeration rule
   * @throws Error if the allow list couldn't be updated
   */
  setAllowList(allowList: string[], reason?: string): Promise<AutoModeration> {
    const triggerMetadata: AutoModerationRuleTriggerMetadataEntity = {
      ...this.triggerMetadata,
      allow_list: allowList,
    };

    return this.update({ trigger_metadata: triggerMetadata }, reason);
  }

  /**
   * Sets or updates the mention limit for a mention spam rule.
   *
   * Only applicable for rules with triggerType MENTION_SPAM.
   *
   * @param limit - Maximum number of unique mentions allowed per message
   * @param reason - Optional audit log reason for the change
   * @returns A promise resolving to the updated AutoModeration rule
   * @throws Error if the mention limit couldn't be updated or the rule type is incompatible
   */
  setMentionLimit(limit: number, reason?: string): Promise<AutoModeration> {
    if (this.triggerType !== AutoModerationRuleTriggerType.MentionSpam) {
      throw new Error("Cannot set mention limit for this rule type");
    }

    const triggerMetadata: AutoModerationRuleTriggerMetadataEntity = {
      ...this.triggerMetadata,
      mention_total_limit: limit,
    };

    return this.update({ trigger_metadata: triggerMetadata }, reason);
  }

  /**
   * Enables or disables mention raid protection for a mention spam rule.
   *
   * Only applicable for rules with triggerType MENTION_SPAM.
   *
   * @param enabled - Whether to enable mention raid protection
   * @param reason - Optional audit log reason for the change
   * @returns A promise resolving to the updated AutoModeration rule
   * @throws Error if the setting couldn't be updated or the rule type is incompatible
   */
  setMentionRaidProtection(
    enabled: boolean,
    reason?: string,
  ): Promise<AutoModeration> {
    if (this.triggerType !== AutoModerationRuleTriggerType.MentionSpam) {
      throw new Error("Cannot set mention raid protection for this rule type");
    }

    const triggerMetadata: AutoModerationRuleTriggerMetadataEntity = {
      ...this.triggerMetadata,
      mention_raid_protection_enabled: enabled,
    };

    return this.update({ trigger_metadata: triggerMetadata }, reason);
  }

  /**
   * Sets or updates the regex patterns for a keyword-based rule.
   *
   * Only applicable for rules with triggerType KEYWORD or MEMBER_PROFILE.
   *
   * @param patterns - Array of regex patterns (max 10)
   * @param reason - Optional audit log reason for the change
   * @returns A promise resolving to the updated AutoModeration rule
   * @throws Error if the patterns couldn't be updated or the rule type is incompatible
   */
  setRegexPatterns(
    patterns: string[],
    reason?: string,
  ): Promise<AutoModeration> {
    if (
      this.triggerType !== AutoModerationRuleTriggerType.Keyword &&
      this.triggerType !== AutoModerationRuleTriggerType.MemberProfile
    ) {
      throw new Error("Cannot set regex patterns for this rule type");
    }

    if (patterns.length > 10) {
      throw new Error("Maximum of 10 regex patterns allowed");
    }

    const triggerMetadata: AutoModerationRuleTriggerMetadataEntity = {
      ...this.triggerMetadata,
      regex_patterns: patterns,
    };

    return this.update({ trigger_metadata: triggerMetadata }, reason);
  }

  /**
   * Sets or updates the keyword match types for a keyword-based rule.
   *
   * Only applicable for rules with triggerType KEYWORD or MEMBER_PROFILE.
   *
   * @param matchTypes - Array of keyword match types (prefix, suffix, whole_word, etc.)
   * @param reason - Optional audit log reason for the change
   * @returns A promise resolving to the updated AutoModeration rule
   * @throws Error if the match types couldn't be updated or the rule type is incompatible
   */
  setKeywordMatchTypes(
    matchTypes: AutoModerationKeywordMatchType[],
    reason?: string,
  ): Promise<AutoModeration> {
    if (
      this.triggerType !== AutoModerationRuleTriggerType.Keyword &&
      this.triggerType !== AutoModerationRuleTriggerType.MemberProfile
    ) {
      throw new Error("Cannot set keyword match types for this rule type");
    }

    const triggerMetadata: AutoModerationRuleTriggerMetadataEntity = {
      ...this.triggerMetadata,
      keyword_match_type: matchTypes,
    };

    return this.update({ trigger_metadata: triggerMetadata }, reason);
  }

  /**
   * Sets or updates the presets for a keyword preset rule.
   *
   * Only applicable for rules with triggerType KEYWORD_PRESET.
   *
   * @param presets - Array of preset types (profanity, sexual_content, slurs)
   * @param reason - Optional audit log reason for the change
   * @returns A promise resolving to the updated AutoModeration rule
   * @throws Error if the presets couldn't be updated or the rule type is incompatible
   */
  setPresets(
    presets: AutoModerationKeywordPresetType[],
    reason?: string,
  ): Promise<AutoModeration> {
    if (this.triggerType !== AutoModerationRuleTriggerType.KeywordPreset) {
      throw new Error("Cannot set presets for this rule type");
    }

    const triggerMetadata: AutoModerationRuleTriggerMetadataEntity = {
      ...this.triggerMetadata,
      presets,
    };

    return this.update({ trigger_metadata: triggerMetadata }, reason);
  }

  /**
   * Refreshes this auto moderation rule's data from the API.
   *
   * @returns A promise resolving to the updated AutoModeration rule
   * @throws Error if the rule couldn't be fetched
   */
  async refresh(): Promise<AutoModeration> {
    const ruleData = await this.client.rest.autoModeration.fetchRule(
      this.guildId,
      this.id,
    );

    this.patch(ruleData);
    return this;
  }

  /**
   * Adds roles to the exempt roles list for this rule.
   *
   * Users with these roles will not have their content moderated by this rule.
   *
   * @param roleIds - Role IDs to add to the exemption list
   * @param reason - Optional audit log reason for the change
   * @returns A promise resolving to the updated AutoModeration rule
   * @throws Error if the exempt roles couldn't be updated
   */
  addExemptRoles(
    roleIds: Snowflake[],
    reason?: string,
  ): Promise<AutoModeration> {
    const newExemptRoles = [...new Set([...this.exemptRoles, ...roleIds])];
    return this.setExemptRoles(newExemptRoles, reason);
  }

  /**
   * Removes roles from the exempt roles list for this rule.
   *
   * @param roleIds - Role IDs to remove from the exemption list
   * @param reason - Optional audit log reason for the change
   * @returns A promise resolving to the updated AutoModeration rule
   * @throws Error if the exempt roles couldn't be updated
   */
  async removeExemptRoles(
    roleIds: Snowflake[],
    reason?: string,
  ): Promise<AutoModeration> {
    const newExemptRoles = this.exemptRoles.filter(
      (id) => !roleIds.includes(id),
    );
    return this.setExemptRoles(newExemptRoles, reason);
  }

  /**
   * Adds channels to the exempt channels list for this rule.
   *
   * Content in these channels will not be moderated by this rule.
   *
   * @param channelIds - Channel IDs to add to the exemption list
   * @param reason - Optional audit log reason for the change
   * @returns A promise resolving to the updated AutoModeration rule
   * @throws Error if the exempt channels couldn't be updated
   */
  addExemptChannels(
    channelIds: Snowflake[],
    reason?: string,
  ): Promise<AutoModeration> {
    const newExemptChannels = [
      ...new Set([...this.exemptChannels, ...channelIds]),
    ];
    return this.setExemptChannels(newExemptChannels, reason);
  }

  /**
   * Removes channels from the exempt channels list for this rule.
   *
   * @param channelIds - Channel IDs to remove from the exemption list
   * @param reason - Optional audit log reason for the change
   * @returns A promise resolving to the updated AutoModeration rule
   * @throws Error if the exempt channels couldn't be updated
   */
  async removeExemptChannels(
    channelIds: Snowflake[],
    reason?: string,
  ): Promise<AutoModeration> {
    const newExemptChannels = this.exemptChannels.filter(
      (id) => !channelIds.includes(id),
    );
    return this.setExemptChannels(newExemptChannels, reason);
  }

  /**
   * Adds keywords to the filter list for a keyword-based rule.
   *
   * Only applicable for rules with triggerType KEYWORD or MEMBER_PROFILE.
   *
   * @param keywords - Keywords to add to the filter
   * @param reason - Optional audit log reason for the change
   * @returns A promise resolving to the updated AutoModeration rule
   * @throws Error if the keywords couldn't be updated or the rule type is incompatible
   */
  addKeywords(keywords: string[], reason?: string): Promise<AutoModeration> {
    if (!this.keywords) {
      return this.setKeywords(keywords, reason);
    }

    const newKeywords = [...new Set([...this.keywords, ...keywords])];
    return this.setKeywords(newKeywords, reason);
  }

  /**
   * Removes keywords from the filter list for a keyword-based rule.
   *
   * Only applicable for rules with triggerType KEYWORD or MEMBER_PROFILE.
   *
   * @param keywords - Keywords to remove from the filter
   * @param reason - Optional audit log reason for the change
   * @returns A promise resolving to the updated AutoModeration rule
   * @throws Error if the keywords couldn't be updated or the rule type is incompatible
   */
  async removeKeywords(
    keywords: string[],
    reason?: string,
  ): Promise<AutoModeration> {
    if (!this.keywords) {
      throw new Error("No keywords to remove");
    }

    const newKeywords = this.keywords.filter(
      (keyword) => !keywords.includes(keyword),
    );
    return this.setKeywords(newKeywords, reason);
  }

  /**
   * Adds terms to the allow list for this rule.
   *
   * Terms in the allow list won't trigger the rule, even if they match the criteria.
   *
   * @param terms - Terms to add to the allow list
   * @param reason - Optional audit log reason for the change
   * @returns A promise resolving to the updated AutoModeration rule
   * @throws Error if the allow list couldn't be updated
   */
  addAllowListTerms(terms: string[], reason?: string): Promise<AutoModeration> {
    if (!this.allowList) {
      return this.setAllowList(terms, reason);
    }

    const newAllowList = [...new Set([...this.allowList, ...terms])];
    return this.setAllowList(newAllowList, reason);
  }

  /**
   * Removes terms from the allow list for this rule.
   *
   * @param terms - Terms to remove from the allow list
   * @param reason - Optional audit log reason for the change
   * @returns A promise resolving to the updated AutoModeration rule
   * @throws Error if the allow list couldn't be updated
   */
  async removeAllowListTerms(
    terms: string[],
    reason?: string,
  ): Promise<AutoModeration> {
    if (!this.allowList) {
      throw new Error("No allow list terms to remove");
    }

    const newAllowList = this.allowList.filter((term) => !terms.includes(term));
    return this.setAllowList(newAllowList, reason);
  }
}
