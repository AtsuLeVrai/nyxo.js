import type { Integer, ISO8601, Snowflake } from "@lunajs/core";
import type {
	AutoModerationActionStructure,
	AutoModerationRuleTriggerTypes,
	ChannelStructure,
	ThreadMemberStructure,
} from "@lunajs/rest";

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#channel-pins-update-channel-pins-update-event-fields}
 */
export type ChannelPinsUpdateEventFields = {
	/**
	 * ID of the channel
	 */
	channel_id: Snowflake;
	/**
	 * ID of the guild
	 */
	guild_id?: Snowflake;
	/**
	 * Time at which the most recent pinned message was pinned
	 */
	last_pin_timestamp?: ISO8601 | null;
};

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#thread-members-update-thread-members-update-event-fields}
 */
export type ThreadMembersUpdateEventFields = {
	/**
	 * Users who were added to the thread
	 */
	added_members?: ThreadMemberStructure[];
	/**
	 * ID of the guild
	 */
	guild_id: Snowflake;
	/**
	 * ID of the thread
	 */
	id: Snowflake;
	/**
	 * Approximate number of members in the thread, capped at 50
	 */
	member_count: Integer;
	/**
	 * ID of the users who were removed from the thread
	 */
	removed_member_ids?: Snowflake[];
};

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#thread-member-update-thread-member-update-event-extra-fields}
 */
export type ThreadMemberUpdateEventExtraFields = {
	/**
	 * ID of the guild
	 */
	guild_id: Snowflake;
};

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#thread-list-sync-thread-list-sync-event-fields}
 */
export type ThreadListSyncEventFields = {
	/**
	 * Parent channel IDs whose threads are being synced. If omitted, then threads were synced for the entire guild. This array may contain channel_ids that have no active threads as well, so you know to clear that data.
	 */
	channel_ids?: Snowflake[];
	/**
	 * ID of the guild
	 */
	guild_id: Snowflake;
	/**
	 * All thread member objects from the synced threads for the current user, indicating which threads the current user has been added to
	 */
	members: ThreadMemberStructure[];
	/**
	 * All active threads in the given channels that the current user can access
	 */
	threads: ChannelStructure[];
};

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#auto-moderation-action-execution-auto-moderation-action-execution-event-fields}
 */
export type AutoModerationActionExecutionEventFields = {
	/**
	 * Action which was executed
	 */
	action: AutoModerationActionStructure;
	/**
	 * ID of any system auto moderation messages posted as a result of this action
	 */
	alert_system_message_id?: Snowflake;
	/**
	 * ID of the channel in which user content was posted
	 */
	channel_id?: Snowflake;
	/**
	 * User-generated text content
	 */
	content: string;
	/**
	 * ID of the guild in which action was executed
	 */
	guild_id: Snowflake;
	/**
	 * Substring in content that triggered the rule
	 */
	matched_content: string | null;
	/**
	 * Word or phrase configured in the rule that triggered the rule
	 */
	matched_keyword: string | null;
	/**
	 * ID of any user message which content belongs to
	 */
	message_id?: Snowflake;
	/**
	 * ID of the rule which action belongs to
	 */
	rule_id: Snowflake;
	/**
	 * Trigger type of rule which was triggered
	 */
	rule_trigger_type: AutoModerationRuleTriggerTypes;
	/**
     * ID of the user which generated the content which triggered the rule
     */
	user_id: Snowflake;
};
