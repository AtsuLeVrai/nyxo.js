import type {
  AnyChannelEntity,
  AnyInteractionEntity,
  AnyThreadChannelEntity,
  ApiVersion,
  ApplicationEntity,
  AuditLogEntryEntity,
  AutoModerationActionEntity,
  AutoModerationRuleEntity,
  AutoModerationRuleTriggerType,
  AvatarDecorationDataEntity,
  EmojiEntity,
  EntitlementEntity,
  GuildApplicationCommandPermissionEntity,
  GuildEntity,
  GuildMemberEntity,
  GuildScheduledEventEntity,
  IntegrationEntity,
  InviteTargetType,
  MessageEntity,
  RoleEntity,
  Snowflake,
  SoundboardSoundEntity,
  StageInstanceEntity,
  StickerEntity,
  SubscriptionEntity,
  ThreadMemberEntity,
  UnavailableGuildEntity,
  UserEntity,
  VoiceStateEntity,
} from "@nyxojs/core";
import type { ReactionType } from "@nyxojs/rest";
import { GatewayOpcodes } from "./gateway.types.js";

/**
 * Auto Moderation Action Execution
 *
 * Represents an event sent when an auto moderation rule is triggered and an action is executed.
 * This occurs when a user sends content that violates a defined rule, causing Discord to take
 * an automated action such as blocking a message, sending an alert, or timing out a user.
 *
 * Auto Moderation Action Execution events are critical for monitoring rule enforcement
 * and understanding which rules are being triggered most frequently.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#auto-moderation-action-execution-auto-moderation-action-execution-event-fields}
 */
export interface AutoModerationActionExecutionEntity {
  /**
   * ID of the guild in which the action was executed.
   * Used for context and permissions verification.
   */
  guild_id: Snowflake;

  /**
   * The action which was executed on the triggering content.
   * This may include blocking a message, sending an alert, or timing out a user.
   */
  action: AutoModerationActionEntity;

  /**
   * ID of the rule which action belongs to.
   * Can be used to look up the full rule details.
   */
  rule_id: Snowflake;

  /**
   * The trigger type of the rule which was triggered.
   * Indicates what kind of content filter was activated (keyword, spam, etc.).
   */
  rule_trigger_type: AutoModerationRuleTriggerType;

  /**
   * ID of the user who generated the content which triggered the rule.
   * Identifies which user's message or action activated the auto moderation.
   */
  user_id: Snowflake;

  /**
   * ID of the channel in which the user content was posted.
   * May be undefined for actions not associated with a specific channel.
   */
  channel_id?: Snowflake;

  /**
   * ID of any user message which content belongs to.
   * May be undefined if the action was not triggered by a specific message.
   */
  message_id?: Snowflake;

  /**
   * ID of any system auto moderation messages posted as a result of this action.
   * Only present when the action type includes sending an alert message.
   */
  alert_system_message_id?: Snowflake;

  /**
   * The user-generated text content that triggered the rule.
   * Requires MESSAGE_CONTENT intent to access.
   */
  content?: string;

  /**
   * The specific word or phrase configured in the rule that triggered the rule.
   * Null if the rule was not triggered by a specific keyword.
   */
  matched_keyword: string | null;

  /**
   * The substring in the content that triggered the rule.
   * Requires MESSAGE_CONTENT intent to access.
   * Null if the rule was not triggered by specific content or if content is unavailable.
   */
  matched_content: string | null;
}

/**
 * Channel Pins Update
 *
 * Event dispatched when a message is pinned or unpinned in a text channel.
 * This event provides information about pin changes without including the pinned message itself.
 * Note that this event is NOT sent when a pinned message is deleted.
 *
 * Channel Pins Updates are useful for applications that track or display pinned messages,
 * allowing them to refresh their cache when pin status changes occur.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#channel-pins-update-channel-pins-update-event-fields}
 */
export interface ChannelPinsUpdateEntity {
  /**
   * ID of the guild where the pin update occurred.
   * May be undefined for DM channels which exist outside of guilds.
   */
  guild_id?: Snowflake;

  /**
   * ID of the channel where the pin update occurred.
   * Used to identify which channel needs refreshing of pinned messages.
   */
  channel_id: Snowflake;

  /**
   * ISO8601 timestamp of when the most recent pinned message was pinned.
   * Null if there are no pins in the channel or the last pin was removed.
   */
  last_pin_timestamp: string | null;
}

/**
 * Thread List Sync
 *
 * Event sent when the current user gains access to a channel, containing a list of
 * all active threads in that channel. This event enables clients to build an initial
 * state of active threads without making additional API calls.
 *
 * Thread List Sync events provide an efficient way to synchronize the client's thread
 * list with the server's state, especially after connecting or regaining access to a channel.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#thread-list-sync-thread-list-sync-event-fields}
 */
export interface ThreadListSyncEntity {
  /**
   * ID of the guild containing the threads being synchronized.
   * Used for context and permissions verification.
   */
  guild_id: Snowflake;

  /**
   * Optional array of parent channel IDs whose threads are being synced.
   * If not provided, threads from all accessible channels in the guild are included.
   */
  channel_ids?: Snowflake[];

  /**
   * Array of all active threads in the specified channels that are visible to the current user.
   * Contains complete thread channel objects.
   */
  threads: AnyThreadChannelEntity[];

  /**
   * Array of thread member objects for the current user.
   * Represents the current user's participation status in each of the returned threads.
   */
  members: ThreadMemberEntity[];
}

/**
 * Thread Member Update
 *
 * Event dispatched when the thread member object for the current user is updated.
 * This typically occurs when the current user joins or leaves a thread, or when
 * thread metadata for the current user changes (such as notification settings).
 *
 * Thread Member Updates allow clients to track the current user's thread participation
 * status without needing to poll thread information.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#thread-member-update-thread-member-update-event-extra-fields}
 */
export interface ThreadMemberUpdateEntity extends ThreadMemberEntity {
  /**
   * ID of the guild containing the thread.
   * Provides context for the thread membership update.
   */
  guild_id: Snowflake;
}

/**
 * Thread Members Update
 *
 * Event dispatched when members are added to or removed from a thread.
 * This event is crucial for tracking thread participation and keeping member lists synchronized.
 *
 * Note: Without the GUILD_MEMBERS Gateway Intent, this event will only be sent if the
 * current user was added to or removed from the thread. With the intent enabled,
 * all member additions/removals will trigger this event.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#thread-members-update-thread-members-update-event-fields}
 */
export interface ThreadMembersUpdateEntity {
  /**
   * ID of the thread that had members added or removed.
   * Used to identify which thread was affected.
   */
  id: Snowflake;

  /**
   * ID of the guild containing the thread.
   * Provides context for the thread membership changes.
   */
  guild_id: Snowflake;

  /**
   * Approximate number of members in the thread.
   * This value is capped at 50 for performance reasons even if there are more members.
   */
  member_count: number;

  /**
   * Array of thread member objects for users who were added to the thread.
   * Contains detailed information about each added member.
   */
  added_members?: ThreadMemberEntity[];

  /**
   * Array of user IDs who were removed from the thread.
   * Contains only the IDs, not full member objects, to reduce payload size.
   */
  removed_member_ids?: Snowflake[];
}

/**
 * Soundboard Sounds
 *
 * Represents a container of all soundboard sounds available in a guild.
 * This event is sent in response to a Request Soundboard Sounds gateway command,
 * providing the client with a complete list of available soundboard audio clips.
 *
 * Soundboard Sounds events allow clients to populate their UI with available sounds
 * without making separate REST API calls.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#soundboard-sounds-soundboard-sounds-event-fields}
 */
export interface SoundboardSoundsEntity {
  /**
   * Array of soundboard sound objects available in the guild.
   * Contains complete information about each sound including IDs, names, and metadata.
   */
  soundboard_sounds: SoundboardSoundEntity[];

  /**
   * ID of the guild these soundboard sounds belong to.
   * Used to associate the sounds with the correct guild context.
   */
  guild_id: Snowflake;
}

/**
 * Guild Soundboard Sound Delete
 *
 * Event sent when a soundboard sound is deleted from a guild.
 * This allows clients to keep their cached soundboard sounds list in sync with the server.
 *
 * Guild Soundboard Sound Delete events are important for maintaining UI consistency
 * by removing sounds that are no longer available.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-soundboard-sound-delete-guild-soundboard-sound-delete-event-fields}
 */
export interface GuildSoundboardSoundDeleteEntity {
  /**
   * ID of the sound that was deleted.
   * Used to identify which sound should be removed from client-side caches.
   */
  sound_id: Snowflake;

  /**
   * ID of the guild from which the sound was deleted.
   * Provides context for which guild's soundboard was modified.
   */
  guild_id: Snowflake;
}

/**
 * Guild Scheduled Event User
 *
 * Base type for events dispatched when a user subscribes to or unsubscribes from a guild scheduled event.
 * This is extended by both the GUILD_SCHEDULED_EVENT_USER_ADD and GUILD_SCHEDULED_EVENT_USER_REMOVE events.
 *
 * These events allow tracking attendance and interest in scheduled events without polling.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-scheduled-event-user-remove-guild-scheduled-event-user-remove-event-fields}
 */
export interface GuildScheduledEventUserAddRemoveEntity {
  /**
   * ID of the guild scheduled event that the user subscribed to or unsubscribed from.
   * Identifies which event's attendee list changed.
   */
  guild_scheduled_event_id: Snowflake;

  /**
   * ID of the user who subscribed to or unsubscribed from the event.
   * Identifies which user's attendance status changed.
   */
  user_id: Snowflake;

  /**
   * ID of the guild containing the scheduled event.
   * Provides context for which guild's event was affected.
   */
  guild_id: Snowflake;
}

/**
 * Guild Create
 *
 * This complex event can be dispatched in three distinct scenarios:
 * 1. When a user is initially connecting, to lazily load and backfill information for all unavailable guilds sent in the Ready event.
 * 2. When a Guild becomes available again to the client after an outage.
 * 3. When the current user joins a new Guild.
 *
 * The Guild Create event contains comprehensive data about a guild, including members, channels,
 * threads, voice states, and other important properties. It's one of the largest gateway payloads.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-create-guild-create-extra-fields}
 */
export interface GuildCreateEntity extends GuildEntity {
  /**
   * ISO8601 timestamp of when the current user joined this guild.
   * Used to display join dates and sort guilds by recency.
   */
  joined_at: string;

  /**
   * Boolean indicating whether this guild is considered "large".
   * Large guilds may have member data omitted to reduce payload size.
   */
  large: boolean;

  /**
   * Boolean indicating whether this guild is unavailable due to an outage.
   * If true, many guild properties may be incomplete or missing.
   */
  unavailable?: boolean;

  /**
   * Total number of members in this guild.
   * May be greater than the number of members included in the members array.
   */
  member_count: number;

  /**
   * Array of voice states for members currently in voice channels.
   * These objects lack the guild_id key since it's redundant in this context.
   */
  voice_states: Partial<VoiceStateEntity>[];

  /**
   * Array of guild member objects for members in the guild.
   * For large guilds, this may not contain all members due to bandwidth constraints.
   */
  members: GuildMemberEntity[];

  /**
   * Array of channel objects for all channels in the guild.
   * Provides initial state of the guild's channel structure.
   */
  channels: AnyChannelEntity[];

  /**
   * Array of thread channel objects for all active threads in the guild that the current user can access.
   * Supplies initial state of accessible threads without additional API calls.
   */
  threads: AnyThreadChannelEntity[];

  /**
   * Array of partial presence updates for members in the guild.
   * Requires the GUILD_PRESENCES intent to receive meaningful data.
   */
  presences: Partial<PresenceEntity>[];

  /**
   * Array of stage instance objects for active stages in the guild.
   * Provides initial state of current stage channels without additional API calls.
   */
  stage_instances: StageInstanceEntity[];

  /**
   * Array of scheduled event objects for upcoming events in the guild.
   * Provides initial state of scheduled events without additional API calls.
   */
  guild_scheduled_events: GuildScheduledEventEntity[];

  /**
   * Array of soundboard sound objects available in the guild.
   * Provides initial state of available soundboard sounds.
   */
  soundboard_sounds: SoundboardSoundEntity[];
}

/**
 * Guild Audit Log Entry Create
 *
 * Event sent when a guild audit log entry is created.
 * This event is only dispatched to bots with the VIEW_AUDIT_LOG permission in the guild.
 *
 * Guild Audit Log Entry Create events allow for real-time monitoring of administrative
 * actions in a guild, such as member bans, channel creations, or permission changes.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-audit-log-entry-create-guild-audit-log-entry-create-event-extra-fields}
 */
export interface GuildAuditLogEntryCreateEntity extends AuditLogEntryEntity {
  /**
   * ID of the guild where the audit log entry was created.
   * Provides context for which guild's audit logs were modified.
   */
  guild_id: Snowflake;
}

/**
 * Guild Ban
 *
 * Common structure used for both guild ban add and remove events.
 * Dispatched when a user is banned from or unbanned from a guild.
 *
 * Guild Ban events provide real-time notifications of moderation actions,
 * allowing bots to take appropriate follow-up actions or maintain logs.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-ban-add-guild-ban-add-event-fields}
 */
export interface GuildBanEntity {
  /**
   * ID of the guild where the ban action occurred.
   * Identifies which guild's ban list was modified.
   */
  guild_id: Snowflake;

  /**
   * User object for the user who was banned or unbanned.
   * Contains information about the affected user.
   */
  user: UserEntity;
}

/**
 * Guild Emojis Update
 *
 * Event dispatched when a guild's custom emojis have been updated.
 * Contains the complete new list of emojis for the guild.
 *
 * Guild Emojis Update events allow clients to keep their cached emoji lists
 * synchronized with the server's state without polling.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-emojis-update-guild-emojis-update-event-fields}
 */
export interface GuildEmojisUpdateEntity {
  /**
   * ID of the guild whose emojis were updated.
   * Identifies which guild's emoji list was modified.
   */
  guild_id: Snowflake;

  /**
   * Array of emoji objects for all emojis now available in the guild.
   * Represents the complete new state of the guild's custom emojis.
   */
  emojis: EmojiEntity[];
}

/**
 * Guild Stickers Update
 *
 * Event dispatched when a guild's custom stickers have been updated.
 * Contains the complete new list of stickers for the guild.
 *
 * Guild Stickers Update events allow clients to keep their cached sticker lists
 * synchronized with the server's state without polling.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-stickers-update-guild-stickers-update-event-fields}
 */
export interface GuildStickersUpdateEntity {
  /**
   * ID of the guild whose stickers were updated.
   * Identifies which guild's sticker list was modified.
   */
  guild_id: Snowflake;

  /**
   * Array of sticker objects for all stickers now available in the guild.
   * Represents the complete new state of the guild's custom stickers.
   */
  stickers: StickerEntity[];
}

/**
 * Guild Integrations Update
 *
 * Event dispatched when a guild integration is updated.
 * Unlike most update events, this contains only the guild ID, not the updated integrations.
 * Clients should use the REST API to fetch current integration data when receiving this event.
 *
 * Guild Integrations Update serves as a notification that integration data has changed,
 * requiring a refresh of cached integration information.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-integrations-update-guild-integrations-update-event-fields}
 */
export interface GuildIntegrationsUpdateEntity {
  /**
   * ID of the guild whose integrations were updated.
   * Indicates which guild's integrations need to be re-fetched.
   */
  guild_id: Snowflake;
}

/**
 * Guild Member Add
 *
 * Event dispatched when a new user joins a guild.
 * Contains a complete guild member object with user information.
 *
 * Guild Member Add events allow for real-time tracking of membership changes,
 * enabling welcome messages, role assignments, and membership analytics.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-member-add-guild-member-add-extra-fields}
 */
export interface GuildMemberAddEntity extends GuildMemberEntity {
  /**
   * ID of the guild that the user joined.
   * Provides context for which guild received a new member.
   */
  guild_id: Snowflake;
}

/**
 * Guild Member Remove
 *
 * Event dispatched when a user is removed from a guild (leave/kick/ban).
 * Only contains basic user information, not the full member object.
 *
 * This event is fired in multiple scenarios: when a user voluntarily leaves,
 * when they are kicked by an administrator, or when they are banned.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-member-remove-guild-member-remove-event-fields}
 */
export interface GuildMemberRemoveEntity {
  /**
   * ID of the guild the user was removed from.
   * Indicates which guild lost a member.
   */
  guild_id: Snowflake;

  /**
   * User object for the user who was removed.
   * Contains basic information about the removed user.
   */
  user: UserEntity;
}

/**
 * Guild Member Update
 *
 * Event dispatched when a guild member is updated.
 * This includes role changes, nickname updates, and other member-specific properties.
 * This event also fires when the user object of a guild member changes (e.g., username or avatar).
 *
 * Guild Member Update events allow for tracking changes to member properties,
 * which is useful for role management, logging, and ensuring UI consistency.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-member-update-guild-member-update-event-fields}
 */
export interface GuildMemberUpdateEntity {
  /**
   * ID of the guild containing the updated member.
   * Identifies which guild's member was modified.
   */
  guild_id: Snowflake;

  /**
   * Array of role IDs that the member now has.
   * Represents the complete new set of roles, not just added/removed roles.
   */
  roles: Snowflake[];

  /**
   * User object for the member being updated.
   * Contains the user's account information (id, username, etc.).
   */
  user: UserEntity;

  /**
   * Current nickname of the user in the guild.
   * Null if the user has no nickname set.
   */
  nick?: string | null;

  /**
   * Member's guild avatar hash.
   * Null if the member has no guild-specific avatar set.
   */
  avatar: string | null;

  /**
   * Member's guild banner hash.
   * Null if the member has no guild-specific banner set.
   */
  banner: string | null;

  /**
   * ISO8601 timestamp of when the user joined the guild.
   * Null in rare edge cases where the data is not available.
   */
  joined_at: string | null;

  /**
   * ISO8601 timestamp of when the user started boosting the guild.
   * Null if the user is not currently boosting the guild.
   */
  premium_since?: string | null;

  /**
   * Boolean indicating whether the user is deafened in voice channels.
   * Only included when the user is connected to a voice channel.
   */
  deaf?: boolean;

  /**
   * Boolean indicating whether the user is muted in voice channels.
   * Only included when the user is connected to a voice channel.
   */
  mute?: boolean;

  /**
   * Boolean indicating whether the user has not yet passed the guild's Membership Screening requirements.
   * True if the member still needs to complete screening.
   */
  pending?: boolean;

  /**
   * ISO8601 timestamp of when the user's timeout will expire.
   * Null if the user is not timed out.
   */
  communication_disabled_until?: string | null;

  /**
   * Bitwise value representing the member's flags.
   * Defaults to 0 if no flags are set.
   */
  flags?: number;

  /**
   * Data for the member's guild avatar decoration.
   * Null if the member has no guild-specific avatar decoration.
   */
  avatar_decoration_data?: AvatarDecorationDataEntity | null;
}

/**
 * Guild Members Chunk
 *
 * Event sent in response to a Guild Request Members gateway command.
 * Contains a subset of guild members, typically used for efficiently fetching
 * members in large guilds where sending all members at once would be impractical.
 *
 * The chunk_index and chunk_count properties can be used to track progress
 * and determine when all requested members have been received.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-members-chunk-guild-members-chunk-event-fields}
 */
export interface GuildMembersChunkEntity {
  /**
   * ID of the guild these members belong to.
   * Identifies which guild's members are being sent.
   */
  guild_id: Snowflake;

  /**
   * Array of guild member objects for this chunk.
   * Contains a subset of the guild's total membership.
   */
  members: GuildMemberEntity[];

  /**
   * Index of the current chunk (0-based).
   * Always less than chunk_count.
   */
  chunk_index: number;

  /**
   * Total number of chunks expected for this response.
   * Used to track progress of member loading.
   */
  chunk_count: number;

  /**
   * Array of user IDs that were included in the request but not found in the guild.
   * Only present when specific users were requested and some weren't found.
   */
  not_found?: Snowflake[];

  /**
   * Array of presence objects for the members in this chunk.
   * Only included when presences were requested in the Guild Request Members command.
   */
  presences?: PresenceEntity[];

  /**
   * The nonce used in the Guild Request Members command, if provided.
   * Used to correlate requests with responses.
   */
  nonce?: string;
}

/**
 * Guild Role Update
 *
 * Common structure for guild role create and update events.
 * Contains a complete role object with its new or current state.
 *
 * Guild Role Update events allow clients to maintain accurate role permissions
 * and presentation without polling for changes.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-role-update-guild-role-update-event-fields}
 */
export interface GuildRoleUpdateEntity {
  /**
   * ID of the guild containing the role.
   * Identifies which guild's role list was modified.
   */
  guild_id: Snowflake;

  /**
   * Role object representing the created or updated role.
   * Contains complete information about the role's current state.
   */
  role: RoleEntity;
}

/**
 * Guild Role Delete
 *
 * Event dispatched when a guild role is deleted.
 * Unlike role create/update events, this contains only IDs, not the full role object.
 *
 * Guild Role Delete events are important for maintaining accurate role caches
 * and ensuring UIs don't display roles that no longer exist.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-role-delete-guild-role-delete-event-fields}
 */
export interface GuildRoleDeleteEntity {
  /**
   * ID of the role that was deleted.
   * Used to identify which role should be removed from client-side caches.
   */
  role_id: Snowflake;

  /**
   * ID of the guild from which the role was deleted.
   * Identifies which guild's role list was modified.
   */
  guild_id: Snowflake;
}

/**
 * Integration Delete
 *
 * Event dispatched when a guild integration is deleted.
 * Contains only basic identification information, not the full integration object.
 *
 * Integration Delete events allow clients to remove deleted integrations from their
 * caches and update UI elements accordingly.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#integration-delete-integration-delete-event-fields}
 */
export interface IntegrationDeleteEntity {
  /**
   * ID of the integration that was deleted.
   * Used to identify which integration should be removed from client-side caches.
   */
  id: Snowflake;

  /**
   * ID of the guild from which the integration was deleted.
   * Identifies which guild's integration list was modified.
   */
  guild_id: Snowflake;

  /**
   * ID of the bot/OAuth2 application associated with this integration.
   * Only present for application-based integrations.
   */
  application_id?: Snowflake;
}

/**
 * Integration Update
 *
 * Common structure for integration create and update events.
 * Contains a complete integration object with its new or current state,
 * but omits the user field from the standard integration entity.
 *
 * Integration Update events allow clients to maintain accurate integration
 * information without polling for changes.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#integration-update-integration-update-event-additional-fields}
 */
export interface IntegrationUpdateEntity
  extends Omit<IntegrationEntity, "user"> {
  /**
   * ID of the guild containing the integration.
   * Identifies which guild's integration list was modified.
   */
  guild_id: Snowflake;
}

/**
 * Invite Delete
 *
 * Event dispatched when an invite to a channel is deleted.
 * Unlike most deletion events, this contains several identifying fields
 * instead of just IDs to help clients locate the correct invite.
 *
 * Invite Delete events allow clients to maintain accurate invite caches
 * and update UI elements accordingly.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#invite-delete-invite-delete-event-fields}
 */
export interface InviteDeleteEntity {
  /**
   * ID of the channel the invite was for.
   * Helps identify the context of the deleted invite.
   */
  channel_id: Snowflake;

  /**
   * ID of the guild the invite was for.
   * May be undefined for invites to DM channels.
   */
  guild_id?: Snowflake;

  /**
   * Unique invite code that was deleted.
   * The primary identifier for the specific invite that was removed.
   */
  code: string;
}

/**
 * Invite Create
 *
 * Event dispatched when a new invite to a channel is created.
 * Contains detailed information about the invite, including expiration and usage limits.
 *
 * Invite Create events are useful for tracking invite creation and maintaining
 * a current list of active invites without polling.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#invite-create-invite-create-event-fields}
 */
export interface InviteCreateEntity {
  /**
   * ID of the channel the invite is for.
   * Identifies which channel can be accessed with this invite.
   */
  channel_id: Snowflake;

  /**
   * Unique invite code.
   * This is the code that appears in invite URLs (discord.gg/{code}).
   */
  code: string;

  /**
   * ISO8601 timestamp for when the invite was created.
   * Useful for tracking invite age and sorting by creation time.
   */
  created_at: string;

  /**
   * ID of the guild the invite is for.
   * May be undefined for invites to DM channels.
   */
  guild_id?: Snowflake;

  /**
   * User object for the user who created the invite.
   * May be undefined for invites created by system processes.
   */
  inviter?: UserEntity;

  /**
   * Duration in seconds until the invite expires.
   * A value of 0 indicates a permanent invite that never expires.
   */
  max_age: number;

  /**
   * Maximum number of times the invite can be used.
   * A value of 0 indicates unlimited uses.
   */
  max_uses: number;

  /**
   * Type of target for voice channel invites.
   * Indicates what type of entity the invite is targeting within a voice channel.
   */
  target_type?: InviteTargetType;

  /**
   * User object for the target user, if inviting to a stream.
   * Present when target_type is STREAM, indicating which user's stream to join.
   */
  target_user?: UserEntity;

  /**
   * Application object for the embedded application, if inviting to an application.
   * Present when target_type is EMBEDDED_APPLICATION.
   */
  target_application?: ApplicationEntity;

  /**
   * Whether this invite grants temporary membership.
   * If true, members who join through this invite will be removed when they disconnect unless assigned a role.
   */
  temporary: boolean;

  /**
   * Number of times this invite has been used.
   * For INVITE_CREATE events, this will always be 0 as the invite is new.
   */
  uses: number;
}

/**
 * Message Reaction Remove Emoji
 *
 * Event dispatched when a bot removes all instances of a given emoji from the reactions of a message.
 * This occurs when the "Remove all reactions for this emoji" action is performed.
 *
 * Message Reaction Remove Emoji events allow clients to accurately update UI
 * when an entire emoji reaction type is cleared from a message.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-reaction-remove-emoji-message-reaction-remove-emoji-event-fields}
 */
export interface MessageReactionRemoveEmojiEntity {
  /**
   * ID of the channel containing the message.
   * Identifies which channel's message had reactions removed.
   */
  channel_id: Snowflake;

  /**
   * ID of the guild containing the message.
   * May be undefined for messages in DM channels.
   */
  guild_id?: Snowflake;

  /**
   * ID of the message that had reactions removed.
   * Identifies which message had its reactions modified.
   */
  message_id: Snowflake;

  /**
   * Partial emoji object for the removed emoji.
   * Contains only the essential information needed to identify the emoji.
   */
  emoji: Partial<EmojiEntity>;
}

/**
 * Message Reaction Remove All
 *
 * Event dispatched when a user explicitly removes all reactions from a message.
 * This occurs when the "Remove all reactions" action is performed.
 *
 * Message Reaction Remove All events allow clients to efficiently update UI
 * when all reactions are cleared from a message at once.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-reaction-remove-all-message-reaction-remove-all-event-fields}
 */
export interface MessageReactionRemoveAllEntity {
  /**
   * ID of the channel containing the message.
   * Identifies which channel's message had reactions removed.
   */
  channel_id: Snowflake;

  /**
   * ID of the message that had all reactions removed.
   * Identifies which message had its reactions cleared.
   */
  message_id: Snowflake;

  /**
   * ID of the guild containing the message.
   * May be undefined for messages in DM channels.
   */
  guild_id?: Snowflake;
}

/**
 * Message Reaction Remove
 *
 * Event dispatched when a user removes a reaction from a message.
 * This allows for real-time tracking of reaction removals.
 *
 * Message Reaction Remove events enable applications to maintain accurate reaction
 * counts and user lists without polling or making additional API requests.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-reaction-remove-message-reaction-remove-event-fields}
 */
export interface MessageReactionRemoveEntity {
  /**
   * ID of the user who removed their reaction.
   * Identifies which user's reaction was removed.
   */
  user_id: Snowflake;

  /**
   * ID of the channel containing the message.
   * Identifies which channel's message had a reaction removed.
   */
  channel_id: Snowflake;

  /**
   * ID of the message that had a reaction removed.
   * Identifies which message had its reactions modified.
   */
  message_id: Snowflake;

  /**
   * ID of the guild containing the message.
   * May be undefined for messages in DM channels.
   */
  guild_id?: Snowflake;

  /**
   * Partial emoji object for the removed reaction.
   * Contains only id, name, and animated properties to identify the emoji.
   */
  emoji: Pick<EmojiEntity, "id" | "name" | "animated">;

  /**
   * Boolean indicating whether this was a super-reaction.
   * Super-reactions are a special type of reaction with animations and visual effects.
   */
  burst: boolean;

  /**
   * The type of reaction that was removed.
   * Identifies the reaction's category (standard, super, etc.).
   */
  type: ReactionType;
}

/**
 * Message Reaction Add
 *
 * Event dispatched when a user adds a reaction to a message.
 * Contains information about the user, message, and the specific emoji used.
 *
 * Message Reaction Add events enable applications to maintain accurate reaction
 * counts and user lists without polling or making additional API requests.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-reaction-add-message-reaction-add-event-fields}
 */
export interface MessageReactionAddEntity {
  /**
   * ID of the user who added the reaction.
   * Identifies which user performed the reaction.
   */
  user_id: Snowflake;

  /**
   * ID of the channel containing the message.
   * Identifies which channel's message received a reaction.
   */
  channel_id: Snowflake;

  /**
   * ID of the message that received the reaction.
   * Identifies which message had its reactions modified.
   */
  message_id: Snowflake;

  /**
   * ID of the guild containing the message.
   * May be undefined for messages in DM channels.
   */
  guild_id?: Snowflake;

  /**
   * Guild member object for the user who added the reaction.
   * Only present for reactions in guild channels.
   */
  member?: GuildMemberEntity;

  /**
   * Partial emoji object for the added reaction.
   * Contains only id, name, and animated properties to identify the emoji.
   */
  emoji: Pick<EmojiEntity, "id" | "name" | "animated">;

  /**
   * ID of the user who authored the message which was reacted to.
   * Useful for tracking reactions to specific users' messages.
   */
  message_author_id?: Snowflake;

  /**
   * Boolean indicating whether this is a super-reaction.
   * Super-reactions are a special type of reaction with animations and visual effects.
   */
  burst: boolean;

  /**
   * Array of hexadecimal color codes used for super-reaction animation.
   * Each color is in "#rrggbb" format. Only present for super-reactions.
   */
  burst_colors?: string[];

  /**
   * The type of reaction that was added.
   * Identifies the reaction's category (standard, super, etc.).
   */
  type: ReactionType;
}

/**
 * Message Delete Bulk
 *
 * Event dispatched when multiple messages are deleted at once.
 * This typically occurs when a moderator uses the "Bulk Delete" feature or a bot
 * performs a mass deletion operation.
 *
 * Message Delete Bulk events allow clients to efficiently update UI when
 * multiple messages are removed simultaneously.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-delete-bulk-message-delete-bulk-event-fields}
 */
export interface MessageDeleteBulkEntity {
  /**
   * Array of message IDs that were deleted.
   * Used to identify which messages should be removed from client-side caches.
   */
  ids: Snowflake[];

  /**
   * ID of the channel containing the deleted messages.
   * Identifies which channel had messages removed.
   */
  channel_id: Snowflake;

  /**
   * ID of the guild containing the channel.
   * May be undefined for messages in DM channels.
   */
  guild_id?: Snowflake;
}

/**
 * Message Delete
 *
 * Event dispatched when a message is deleted.
 * Contains only identifying information, not the content of the deleted message.
 *
 * Message Delete events allow clients to remove deleted messages from UI
 * without having to poll for changes.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-delete-message-delete-event-fields}
 */
export interface MessageDeleteEntity {
  /**
   * ID of the message that was deleted.
   * Used to identify which message should be removed from client-side caches.
   */
  id: Snowflake;

  /**
   * ID of the channel containing the deleted message.
   * Identifies which channel had a message removed.
   */
  channel_id: Snowflake;

  /**
   * ID of the guild containing the channel.
   * May be undefined for messages in DM channels.
   */
  guild_id?: Snowflake;
}

/**
 * Message Create
 *
 * Event dispatched when a message is created (sent) in a channel.
 * Contains a complete message object with all its properties.
 *
 * Message Create is one of the most common gateway events and forms
 * the foundation of most chat-based bot functionality.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-create-message-create-extra-fields}
 */
export interface MessageCreateEntity extends Omit<MessageEntity, "mentions"> {
  /**
   * Array of user objects, with an additional partial member field when in a guild.
   * Represents users who were mentioned in the message.
   */
  mentions?: (UserEntity | Partial<GuildMemberEntity>)[];

  /**
   * ID of the guild the message was sent in.
   * Undefined for ephemeral messages and messages in DM channels.
   */
  guild_id?: Snowflake;

  /**
   * Partial guild member object for the message's author.
   * Only present when the message is sent in a guild channel.
   */
  member?: Partial<GuildMemberEntity>;
}

/**
 * Message Poll Vote
 *
 * Common structure for poll vote events (add and remove).
 * Sent when a user votes on or removes their vote from a message poll.
 *
 * Message Poll Vote events enable applications to track poll participation
 * in real-time without polling or making additional API requests.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-poll-vote-add-message-poll-vote-add-fields}
 */
export interface MessagePollVoteEntity {
  /**
   * ID of the user who voted or removed their vote.
   * Identifies which user's poll participation changed.
   */
  user_id: Snowflake;

  /**
   * ID of the channel containing the poll message.
   * Identifies which channel's poll was affected.
   */
  channel_id: Snowflake;

  /**
   * ID of the message containing the poll.
   * Identifies which poll message had a vote change.
   */
  message_id: Snowflake;

  /**
   * ID of the guild containing the message.
   * May be undefined for polls in DM channels.
   */
  guild_id?: Snowflake;

  /**
   * ID of the poll answer that was selected or deselected.
   * Corresponds to the position of the answer in the poll options array.
   */
  answer_id: number;
}

/**
 * Ready
 *
 * The most important gateway event, dispatched when a client has completed
 * the initial handshake with the gateway (for new sessions).
 *
 * The Ready event contains all the state needed for a client to begin
 * interacting with the Discord platform, including user information,
 * guilds, and session details. It's typically the largest event.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#ready-ready-event-fields}
 */
export interface ReadyEntity {
  /**
   * API version currently being used.
   * Useful for checking compatibility in API version transitions.
   */
  v: ApiVersion;

  /**
   * User object for the authenticated user, including email if authorized.
   * Contains the client's own user account information.
   */
  user: UserEntity;

  /**
   * Array of unavailable guild objects for the guilds the authenticated user is in.
   * These will become available through subsequent Guild Create events.
   */
  guilds: UnavailableGuildEntity[];

  /**
   * Session ID for this connection.
   * Required for resuming disconnected sessions.
   */
  session_id: string;

  /**
   * Gateway URL to use for resuming connections.
   * This may differ from the initial gateway URL.
   */
  resume_gateway_url: string;

  /**
   * Shard information for this session as a [shard_id, num_shards] array.
   * Only present if the client identified with sharding information.
   */
  shard?: [number, number];

  /**
   * Partial application object containing id and flags.
   * Provides basic information about the associated application.
   */
  application: Pick<ApplicationEntity, "id" | "flags">;
}

/**
 * Voice Server Update
 *
 * Event sent when a guild's voice server is updated.
 * This event is sent when initially connecting to voice and when the current
 * voice instance fails over to a new server.
 *
 * Voice Server Update events are essential for establishing and maintaining
 * voice connections, as they provide the necessary token and endpoint information.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#voice-server-update-voice-server-update-event-fields}
 */
export interface VoiceServerUpdateEntity {
  /**
   * Voice connection token to use when establishing a voice WebSocket connection.
   * This is a sensitive token that should not be shared.
   */
  token: string;

  /**
   * ID of the guild this voice server update is for.
   * Identifies which guild's voice server was updated.
   */
  guild_id: Snowflake;

  /**
   * Voice server host to connect to.
   * Null can indicate that the voice server is unavailable or being reallocated.
   */
  endpoint: string | null;
}

/**
 * Voice Channel Effect Send Animation Types
 *
 * Enumeration of the different types of animations for voice channel effects.
 * These determine the visual style of effects when they're sent in voice channels.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#voice-channel-effect-send-animation-types}
 */
export enum VoiceChannelEffectSendAnimationType {
  /**
   * A premium animation only available to Nitro subscribers.
   * Features enhanced visual effects and animations.
   */
  Premium = 0,

  /**
   * The standard animation available to all users.
   * Has simpler visual effects compared to premium animations.
   */
  Basic = 1,
}

/**
 * Voice Channel Effect Send
 *
 * Event dispatched when someone sends an effect in a voice channel the current user is connected to.
 * This includes emoji reactions and soundboard sounds.
 *
 * Voice Channel Effect Send events allow clients to display visual effects and
 * play sound effects in real-time during voice channel interactions.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#voice-channel-effect-send-voice-channel-effect-send-event-fields}
 */
export interface VoiceChannelEffectSendEntity {
  /**
   * ID of the channel the effect was sent in.
   * Identifies which voice channel received the effect.
   */
  channel_id: Snowflake;

  /**
   * ID of the guild the effect was sent in.
   * Provides guild context for the voice channel effect.
   */
  guild_id: Snowflake;

  /**
   * ID of the user who sent the effect.
   * Identifies which user triggered the effect.
   */
  user_id: Snowflake;

  /**
   * Emoji object for the emoji that was sent, if applicable.
   * Present for emoji reaction effects and some soundboard effects.
   */
  emoji?: EmojiEntity | null;

  /**
   * The type of emoji animation used.
   * Determines visual style based on the user's subscription status.
   */
  animation_type?: VoiceChannelEffectSendAnimationType;

  /**
   * The ID of the specific emoji animation used.
   * Corresponds to a particular animation style or effect.
   */
  animation_id?: number;

  /**
   * The ID of the soundboard sound, for soundboard effects.
   * Either a Snowflake for custom sounds or a number for standard sounds.
   */
  sound_id?: Snowflake | number;

  /**
   * The volume of the soundboard sound, ranging from 0 to 1.
   * Only present for soundboard effects.
   */
  sound_volume?: number;
}

/**
 * Webhooks Update
 *
 * Event dispatched when a guild channel's webhook is created, updated, or deleted.
 * Contains only identifying information, not details about the specific change.
 *
 * Webhooks Update events serve as a notification to refresh cached webhook data,
 * as they don't provide information about what specifically changed.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#webhooks-update-webhooks-update-event-fields}
 */
export interface WebhooksUpdateEntity {
  /**
   * ID of the guild containing the updated webhook.
   * Identifies which guild's webhook configuration changed.
   */
  guild_id: Snowflake;

  /**
   * ID of the channel containing the updated webhook.
   * Identifies which channel's webhook configuration changed.
   */
  channel_id: Snowflake;
}

/**
 * Typing Start
 *
 * Event dispatched when a user starts typing in a channel.
 * Includes timestamps and, for guild channels, member information.
 *
 * Typing Start events allow clients to show typing indicators in the UI,
 * enhancing the real-time feeling of conversations.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#typing-start-typing-start-event-fields}
 */
export interface TypingStartEntity {
  /**
   * ID of the channel the user started typing in.
   * Identifies where the typing activity is occurring.
   */
  channel_id: Snowflake;

  /**
   * ID of the guild containing the channel.
   * May be undefined for typing in DM channels.
   */
  guild_id?: Snowflake;

  /**
   * ID of the user who started typing.
   * Identifies which user is typing.
   */
  user_id: Snowflake;

  /**
   * Unix timestamp (in seconds) of when the user started typing.
   * Used to calculate how long the user has been typing.
   */
  timestamp: number;

  /**
   * Guild member object for the typing user.
   * Only present when the typing occurs in a guild channel.
   */
  member?: GuildMemberEntity;
}

/**
 * Activity Buttons
 *
 * Represents custom buttons that can be shown in a Rich Presence display.
 * These buttons can be used to direct users to external resources related to the activity.
 *
 * Discord limits Rich Presence to a maximum of two buttons per activity.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#activity-object-activity-buttons}
 */
export interface ActivityButtonEntity {
  /**
   * Text shown on the button, limited to 1-32 characters.
   * This is the visible label that users will see and click on.
   */
  label: string;

  /**
   * URL opened when clicking the button, limited to 1-512 characters.
   * Must be a properly formatted URL that adheres to Discord's URL restrictions.
   */
  url: string;
}

/**
 * Activity Flags
 *
 * Bitwise enumeration that describes various properties and capabilities of an activity.
 * These flags indicate what features the activity supports and how it should be displayed.
 *
 * Multiple flags can be combined using bitwise OR operations to represent
 * activities with multiple properties.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#activity-object-activity-flags}
 */
export enum ActivityFlags {
  /**
   * Activity is an instanced game session.
   * Indicates the activity represents a specific playable instance.
   */
  Instance = 1 << 0,

  /**
   * Activity can be joined by other users.
   * Enables the "Join" functionality in Rich Presence.
   */
  Join = 1 << 1,

  /**
   * Activity can be spectated by other users.
   * Enables the "Spectate" functionality in Rich Presence.
   */
  Spectate = 1 << 2,

  /**
   * Users can request to join this activity.
   * Enables the "Ask to Join" functionality in Rich Presence.
   */
  JoinRequest = 1 << 3,

  /**
   * Activity supports synchronization.
   * Used for coordinating activity states across clients.
   */
  Sync = 1 << 4,

  /**
   * Activity is actively being played.
   * Distinguishes active gameplay from idle game-related activities.
   */
  Play = 1 << 5,

  /**
   * Activity party is restricted to friends.
   * Indicates that only friends can join the activity.
   */
  PartyPrivacyFriends = 1 << 6,

  /**
   * Activity party is restricted to voice channel members.
   * Indicates that only users in the same voice channel can join.
   */
  PartyPrivacyVoiceChannel = 1 << 7,

  /**
   * Activity is embedded.
   * Used for activities directly integrated into Discord.
   */
  Embedded = 1 << 8,
}

/**
 * Activity Secrets
 *
 * Contains secret tokens used for Rich Presence joining and spectating functionality.
 * These secrets are used to securely connect users to the same activity instance.
 *
 * Secrets should be treated as sensitive information and not exposed to users.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#activity-object-activity-secrets}
 */
export interface ActivitySecretsEntity {
  /**
   * Secret for joining a party.
   * Used to generate secure join tokens for the Rich Presence "Join" feature.
   */
  join?: string;

  /**
   * Secret for spectating a game.
   * Used to generate secure spectate tokens for the Rich Presence "Spectate" feature.
   */
  spectate?: string;

  /**
   * Secret for a specific instanced match.
   * Used to validate connections to a specific activity instance.
   */
  match?: string;
}

/**
 * Activity Asset Image
 *
 * Represents the images displayed in a Rich Presence and their associated hover text.
 * These assets include both the large main image and the smaller corner image.
 *
 * Images are referenced by keys that correspond to assets uploaded to Discord's servers.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#activity-object-activity-asset-image}
 */
export interface ActivityAssetImageEntity {
  /**
   * Text displayed when hovering over the large image of the activity.
   * Used to provide additional context or information about the large image.
   */
  large_text?: string;

  /**
   * Asset key for the large image.
   * References an image that has been uploaded to Discord's asset system.
   */
  large_image?: string;

  /**
   * Text displayed when hovering over the small image of the activity.
   * Used to provide additional context or information about the small image.
   */
  small_text?: string;

  /**
   * Asset key for the small image.
   * References an image that has been uploaded to Discord's asset system.
   */
  small_image?: string;
}

/**
 * Activity Party
 *
 * Contains information about the party or group associated with an activity.
 * This includes identifiers and size information for multiplayer activities.
 *
 * Party information is used to display group status and enable join functionality.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#activity-object-activity-party}
 */
export interface ActivityPartyEntity {
  /**
   * Unique identifier for the party.
   * Used to associate multiple users with the same group activity.
   */
  id?: string;

  /**
   * Array of two integers representing the party's current size and maximum size.
   * Displayed as "x of y" in the Discord client (e.g., "3 of 5").
   */
  size?: [number, number];
}

/**
 * Activity Emoji
 *
 * Represents an emoji used in a custom status activity.
 * This can be either a standard Unicode emoji or a custom Discord emoji.
 *
 * Custom status emojis are displayed alongside the status text in the Discord client.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#activity-object-activity-emoji}
 */
export interface ActivityEmojiEntity {
  /**
   * Name of the emoji.
   * For custom emojis, this is the emoji name; for standard emojis, this is the Unicode character.
   */
  name: string;

  /**
   * ID of the emoji.
   * Only present for custom emojis from Discord servers, not for standard Unicode emojis.
   */
  id?: Snowflake;

  /**
   * Whether the emoji is animated.
   * Only applicable to custom emojis, indicates if the emoji has animation frames.
   */
  animated?: boolean;
}

/**
 * Activity Timestamps
 *
 * Contains Unix timestamps representing the start and/or end times of an activity.
 * These are used to calculate and display elapsed time or remaining time.
 *
 * Timestamps enable the Discord client to show dynamic "elapsed" or "remaining" time displays.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#activity-object-activity-timestamps}
 */
export interface ActivityTimestampsEntity {
  /**
   * Unix timestamp (in milliseconds) of when the activity started.
   * Used to calculate and display elapsed time (e.g., "30:45 elapsed").
   */
  start?: number;

  /**
   * Unix timestamp (in milliseconds) of when the activity will end.
   * Used to calculate and display remaining time (e.g., "05:15 remaining").
   */
  end?: number;
}

/**
 * Activity Types
 *
 * Enumeration of the different types of activities that can be displayed.
 * Each type has different display formats and behaviors in the Discord client.
 *
 * The activity type determines how the activity's name and details are formatted in the UI.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#activity-object-activity-types}
 */
export enum ActivityType {
  /**
   * Playing {name}
   * Standard game activity, displayed as "Playing Chess", "Playing Minecraft", etc.
   */
  Game = 0,

  /**
   * Streaming {details}
   * Streaming activity, typically linked to Twitch or YouTube, displayed as "Streaming Apex Legends".
   */
  Streaming = 1,

  /**
   * Listening to {name}
   * Music or audio activity, displayed as "Listening to Spotify".
   */
  Listening = 2,

  /**
   * Watching {name}
   * Watching activity, displayed as "Watching YouTube", "Watching a movie", etc.
   */
  Watching = 3,

  /**
   * {emoji} {state}
   * Custom status with optional emoji, displayed as the raw status text with emoji.
   */
  Custom = 4,

  /**
   * Competing in {name}
   * Competition activity, displayed as "Competing in Chess Tournament", etc.
   */
  Competing = 5,
}

/**
 * Activity
 *
 * Central interface representing a user's current activity.
 * This is a comprehensive structure that can represent games, streams, music listening,
 * and other activities that users can display on their Discord profile.
 *
 * Activities are a key component of Rich Presence, allowing applications to display
 * detailed, customized activity information in the Discord client.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#activity-object-activity-structure}
 */
export interface ActivityEntity {
  /**
   * Name of the activity, displayed prominently in the user's presence.
   * For games, this is typically the game name; for music, it might be the song title.
   */
  name: string;

  /**
   * Type of activity, determining how it's formatted in the UI.
   * Controls whether it appears as "Playing", "Streaming", "Listening to", etc.
   */
  type: ActivityType;

  /**
   * URL of the stream, if this activity is of streaming type.
   * Only validated and used when type is ActivityType.Streaming (1).
   */
  url?: string | null;

  /**
   * Unix timestamp (in milliseconds) when the activity was added to the user's session.
   * Used for sorting and determining the most recent activity.
   */
  created_at: number | string;

  /**
   * Timestamps for the start and/or end of the activity.
   * Used to display elapsed or remaining time.
   */
  timestamps?: ActivityTimestampsEntity;

  /**
   * Application ID associated with this activity.
   * Links the activity to a specific Discord application.
   */
  application_id?: Snowflake;

  /**
   * What the user is currently doing within the activity.
   * Provides more specific context than the activity name.
   */
  details?: string | null;

  /**
   * User's current party status or the text for a custom status.
   * For games, might show the specific game mode or area.
   */
  state?: string | null;

  /**
   * Emoji used for a custom status.
   * Displayed alongside the custom status text.
   */
  emoji?: ActivityEmojiEntity | null;

  /**
   * Information about the party or group the user is in.
   * Shows party size and whether others can join.
   */
  party?: ActivityPartyEntity;

  /**
   * Images and their hover texts for the Rich Presence display.
   * Includes both the large main image and small corner image.
   */
  assets?: ActivityAssetImageEntity;

  /**
   * Secrets used for joining and spectating functionality.
   * Enables secure connections to game sessions.
   */
  secrets?: ActivitySecretsEntity;

  /**
   * Whether this activity represents an instanced game session.
   * Used for distinguishing between game launcher vs. active gameplay.
   */
  instance?: boolean;

  /**
   * Flags describing what the payload includes and what features are supported.
   * Enables or disables join, spectate, and other Rich Presence features.
   */
  flags?: ActivityFlags;

  /**
   * Custom buttons shown in the Rich Presence (maximum of 2).
   * Provides clickable links to external resources.
   */
  buttons?: ActivityButtonEntity[];
}

/**
 * Update Presence Status Type
 *
 * String literal type defining the valid status values that can be set
 * when updating a user's presence.
 *
 * These statuses determine how the user appears to others in the Discord client.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#update-presence-status-types}
 */
export type UpdatePresenceStatusType =
  /** User is online and active */
  | "online"
  /** User is in Do Not Disturb mode (shows red status indicator) */
  | "dnd"
  /** User is AFK or inactive (shows yellow status indicator) */
  | "idle"
  /** User appears offline to others but still receives notifications */
  | "invisible"
  /** User is offline and not receiving notifications */
  | "offline";

/**
 * Client Status
 *
 * Represents a user's platform-dependent status across different Discord clients.
 * Users can have different statuses (online, idle, dnd, etc.) on each platform.
 *
 * Client Status objects allow applications to track which platforms a user is active on
 * and what their status is on each platform.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#client-status-object}
 */
export interface ClientStatusEntity {
  /**
   * User's status on desktop client (Windows, Linux, Mac).
   * Can be "online", "idle", "dnd", or "offline".
   */
  desktop?: Omit<UpdatePresenceStatusType, "invisible">;

  /**
   * User's status on mobile client (iOS, Android).
   * Can be "online", "idle", "dnd", or "offline".
   */
  mobile?: Omit<UpdatePresenceStatusType, "invisible">;

  /**
   * User's status on web client (browser) or bot user.
   * Can be "online", "idle", "dnd", or "offline".
   */
  web?: Omit<UpdatePresenceStatusType, "invisible">;
}

/**
 * Presence
 *
 * Represents a user's current state on a guild, including their status,
 * activities, and platform-specific information.
 *
 * Presence updates are sent when a user's presence or info changes,
 * allowing clients to display real-time user state without polling.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#presence-update-presence-update-event-fields}
 */
export interface PresenceEntity {
  /**
   * User object whose presence is being updated.
   * Contains basic user information and may include partial updates.
   */
  user: UserEntity;

  /**
   * ID of the guild this presence update is for.
   * Presence updates are always specific to a guild context.
   */
  guild_id: Snowflake;

  /**
   * User's current overall status.
   * Can be "online", "idle", "dnd", or "offline".
   */
  status: Omit<UpdatePresenceStatusType, "invisible">;

  /**
   * Array of activity objects representing the user's current activities.
   * Users can have multiple concurrent activities displayed.
   */
  activities: ActivityEntity[];

  /**
   * Object showing the user's status per client platform.
   * Provides detailed status information across desktop, mobile, and web clients.
   */
  client_status: ClientStatusEntity;
}

/**
 * Hello
 *
 * Event sent immediately when connecting to the gateway WebSocket.
 * Defines the heartbeat interval that a client should use to maintain the connection.
 *
 * The Hello event initiates the gateway session and provides crucial timing information
 * for keeping the connection alive.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#hello-hello-structure}
 */
export interface HelloEntity {
  /**
   * Interval in milliseconds at which clients should send heartbeats.
   * Clients must adhere to this interval to prevent disconnection.
   */
  heartbeat_interval: number;
}

/**
 * Gateway Receive Events
 *
 * Comprehensive mapping of event names to their corresponding data interfaces.
 * These are the events that clients can receive from Discord through a Gateway connection.
 *
 * This interface serves as a type-safe registry of all possible gateway events
 * and their expected data structures.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#receive-events}
 */
export interface GatewayReceiveEvents {
  /**
   * Contains the initial state information when connecting to the gateway.
   * Sent once when establishing a new session.
   */
  READY: ReadyEntity;

  /**
   * Response to Resume - sent when successfully resuming a connection.
   * Indicates that the session has been resumed without requiring full reinitialization.
   */
  RESUMED: boolean;

  /**
   * Sent when application command permissions are updated.
   * Contains the new permission state for commands in a guild.
   */
  APPLICATION_COMMAND_PERMISSIONS_UPDATE: GuildApplicationCommandPermissionEntity;

  /**
   * Sent when an Auto Moderation rule is created.
   * Contains the complete new rule object.
   */
  AUTO_MODERATION_RULE_CREATE: AutoModerationRuleEntity;

  /**
   * Sent when an Auto Moderation rule is updated.
   * Contains the updated rule object.
   */
  AUTO_MODERATION_RULE_UPDATE: AutoModerationRuleEntity;

  /**
   * Sent when an Auto Moderation rule is deleted.
   * Contains the deleted rule object for reference.
   */
  AUTO_MODERATION_RULE_DELETE: AutoModerationRuleEntity;

  /**
   * Sent when an Auto Moderation rule is triggered and an action is executed.
   * Contains details about the rule, trigger, and executed action.
   */
  AUTO_MODERATION_ACTION_EXECUTION: AutoModerationActionExecutionEntity;

  /**
   * Sent when a new channel is created in a guild.
   * Contains the complete new channel object.
   */
  CHANNEL_CREATE: AnyChannelEntity;

  /**
   * Sent when a channel is updated.
   * Contains the updated channel object with new properties.
   */
  CHANNEL_UPDATE: AnyChannelEntity;

  /**
   * Sent when a channel is deleted.
   * Contains the deleted channel object for reference.
   */
  CHANNEL_DELETE: AnyChannelEntity;

  /**
   * Sent when a message is pinned or unpinned in a text channel.
   * Contains channel ID and timestamp information, but not the message itself.
   */
  CHANNEL_PINS_UPDATE: ChannelPinsUpdateEntity;

  /**
   * Sent when a thread is created or when a user is added to a private thread.
   * Contains either a newly_created flag or ThreadMember information.
   */
  THREAD_CREATE:
    | (AnyThreadChannelEntity & { newly_created: boolean })
    | (AnyThreadChannelEntity & ThreadMemberEntity);

  /**
   * Sent when a thread is updated.
   * Contains the updated thread object without the last_message_id field.
   */
  THREAD_UPDATE: Omit<AnyThreadChannelEntity, "last_message_id">;

  /**
   * Sent when a thread is deleted.
   * Contains only essential identifying fields of the deleted thread.
   */
  THREAD_DELETE: Pick<
    AnyThreadChannelEntity,
    "id" | "guild_id" | "parent_id" | "type"
  >;

  /**
   * Sent when gaining access to a channel, containing all active threads.
   * Provides a complete synchronization of accessible threads.
   */
  THREAD_LIST_SYNC: ThreadListSyncEntity;

  /**
   * Sent when the thread member object for the current user is updated.
   * Indicates changes in the current user's thread participation.
   */
  THREAD_MEMBER_UPDATE: ThreadMemberUpdateEntity;

  /**
   * Sent when users are added to or removed from a thread.
   * Tracks changes in thread participation for any users.
   */
  THREAD_MEMBERS_UPDATE: ThreadMembersUpdateEntity;

  /**
   * Sent when an entitlement is created.
   * Contains the complete new entitlement object.
   */
  ENTITLEMENT_CREATE: EntitlementEntity;

  /**
   * Sent when an entitlement is updated.
   * Contains the updated entitlement object.
   */
  ENTITLEMENT_UPDATE: EntitlementEntity;

  /**
   * Sent when an entitlement is deleted.
   * Contains the deleted entitlement object for reference.
   */
  ENTITLEMENT_DELETE: EntitlementEntity;

  /**
   * Sent when a guild becomes available or when the user joins a new guild.
   * Contains complete guild information or unavailability status.
   */
  GUILD_CREATE: GuildCreateEntity | UnavailableGuildEntity;

  /**
   * Sent when a guild is updated.
   * Contains the updated guild object with new properties.
   */
  GUILD_UPDATE: GuildEntity;

  /**
   * Sent when a guild becomes unavailable or when the user leaves/is removed from a guild.
   * Contains the guild ID and unavailability flag.
   */
  GUILD_DELETE: UnavailableGuildEntity;

  /**
   * Sent when a guild audit log entry is created.
   * Requires the VIEW_AUDIT_LOG permission to receive.
   */
  GUILD_AUDIT_LOG_ENTRY_CREATE: GuildAuditLogEntryCreateEntity;

  /**
   * Sent when a user is banned from a guild.
   * Contains user information and guild context.
   */
  GUILD_BAN_ADD: GuildBanEntity;

  /**
   * Sent when a user is unbanned from a guild.
   * Contains user information and guild context.
   */
  GUILD_BAN_REMOVE: GuildBanEntity;

  /**
   * Sent when a guild's custom emojis are updated.
   * Contains the complete new list of emojis for the guild.
   */
  GUILD_EMOJIS_UPDATE: GuildEmojisUpdateEntity;

  /**
   * Sent when a guild's custom stickers are updated.
   * Contains the complete new list of stickers for the guild.
   */
  GUILD_STICKERS_UPDATE: GuildStickersUpdateEntity;

  /**
   * Sent when a guild integration is updated.
   * Contains only the guild ID, not detailed integration information.
   */
  GUILD_INTEGRATIONS_UPDATE: GuildIntegrationsUpdateEntity;

  /**
   * Sent when a new user joins a guild.
   * Contains complete member information for the new guild member.
   */
  GUILD_MEMBER_ADD: GuildMemberAddEntity;

  /**
   * Sent when a user is removed from a guild (leave/kick/ban).
   * Contains basic user information, not the full member object.
   */
  GUILD_MEMBER_REMOVE: GuildMemberRemoveEntity;

  /**
   * Sent when a guild member is updated or their user object changes.
   * Contains the updated properties of the guild member.
   */
  GUILD_MEMBER_UPDATE: GuildMemberUpdateEntity;

  /**
   * Sent in response to Guild Request Members gateway command.
   * Contains requested member information in chunks.
   */
  GUILD_MEMBERS_CHUNK: GuildMembersChunkEntity;

  /**
   * Sent when a guild role is created.
   * Contains the complete new role object.
   */
  GUILD_ROLE_CREATE: GuildRoleUpdateEntity;

  /**
   * Sent when a guild role is updated.
   * Contains the updated role object with new properties.
   */
  GUILD_ROLE_UPDATE: GuildRoleUpdateEntity;

  /**
   * Sent when a guild role is deleted.
   * Contains only the role ID and guild ID, not the full role object.
   */
  GUILD_ROLE_DELETE: GuildRoleDeleteEntity;

  /**
   * Sent when a guild scheduled event is created.
   * Contains the complete new scheduled event object.
   */
  GUILD_SCHEDULED_EVENT_CREATE: GuildScheduledEventEntity;

  /**
   * Sent when a guild scheduled event is updated.
   * Contains the updated scheduled event object.
   */
  GUILD_SCHEDULED_EVENT_UPDATE: GuildScheduledEventEntity;

  /**
   * Sent when a guild scheduled event is deleted.
   * Contains the deleted scheduled event object for reference.
   */
  GUILD_SCHEDULED_EVENT_DELETE: GuildScheduledEventEntity;

  /**
   * Sent when a user subscribes to a guild scheduled event.
   * Contains user ID, event ID, and guild context.
   */
  GUILD_SCHEDULED_EVENT_USER_ADD: GuildScheduledEventUserAddRemoveEntity;

  /**
   * Sent when a user unsubscribes from a guild scheduled event.
   * Contains user ID, event ID, and guild context.
   */
  GUILD_SCHEDULED_EVENT_USER_REMOVE: GuildScheduledEventUserAddRemoveEntity;

  /**
   * Sent when a guild soundboard sound is created.
   * Contains the complete new soundboard sound object.
   */
  GUILD_SOUNDBOARD_SOUND_CREATE: SoundboardSoundEntity;

  /**
   * Sent when a guild soundboard sound is updated.
   * Contains the updated soundboard sound object.
   */
  GUILD_SOUNDBOARD_SOUND_UPDATE: SoundboardSoundEntity;

  /**
   * Sent when a guild soundboard sound is deleted.
   * Contains only sound ID and guild ID, not the full sound object.
   */
  GUILD_SOUNDBOARD_SOUND_DELETE: GuildSoundboardSoundDeleteEntity;

  /**
   * Sent when a guild's soundboard sounds are updated.
   * Contains the complete new list of soundboard sounds.
   */
  GUILD_SOUNDBOARD_SOUNDS_UPDATE: SoundboardSoundsEntity;

  /**
   * Sent in response to Request Soundboard Sounds gateway command.
   * Contains the requested soundboard sounds information.
   */
  SOUNDBOARD_SOUNDS: SoundboardSoundsEntity;

  /**
   * Sent when a guild integration is created.
   * Contains the new integration object with guild context.
   */
  INTEGRATION_CREATE: IntegrationUpdateEntity;

  /**
   * Sent when a guild integration is updated.
   * Contains the updated integration object with guild context.
   */
  INTEGRATION_UPDATE: IntegrationUpdateEntity;

  /**
   * Sent when a guild integration is deleted.
   * Contains only basic identification information, not the full object.
   */
  INTEGRATION_DELETE: IntegrationDeleteEntity;

  /**
   * Sent when an invite to a channel is created.
   * Contains complete information about the new invite.
   */
  INVITE_CREATE: InviteCreateEntity;

  /**
   * Sent when an invite to a channel is deleted.
   * Contains only essential identifying information about the deleted invite.
   */
  INVITE_DELETE: InviteDeleteEntity;

  /**
   * Sent when a message is created (sent) in a channel.
   * Contains the complete new message object with additional context.
   */
  MESSAGE_CREATE: MessageCreateEntity;

  /**
   * Sent when a message is edited.
   * Contains the updated message object with changed properties.
   */
  MESSAGE_UPDATE: MessageCreateEntity;

  /**
   * Sent when a message is deleted.
   * Contains only message ID and channel context, not content.
   */
  MESSAGE_DELETE: MessageDeleteEntity;

  /**
   * Sent when multiple messages are deleted at once.
   * Contains array of message IDs and channel context.
   */
  MESSAGE_DELETE_BULK: MessageDeleteBulkEntity;

  /**
   * Sent when a user adds a reaction to a message.
   * Contains reaction information and user context.
   */
  MESSAGE_REACTION_ADD: MessageReactionAddEntity;

  /**
   * Sent when a user removes a reaction from a message.
   * Contains reaction information and user context.
   */
  MESSAGE_REACTION_REMOVE: MessageReactionRemoveEntity;

  /**
   * Sent when all reactions are explicitly removed from a message.
   * Contains only message and channel context.
   */
  MESSAGE_REACTION_REMOVE_ALL: MessageReactionRemoveAllEntity;

  /**
   * Sent when all reactions for a given emoji are removed from a message.
   * Contains emoji information and message context.
   */
  MESSAGE_REACTION_REMOVE_EMOJI: MessageReactionRemoveEmojiEntity;

  /**
   * Sent when a user's presence or info is updated.
   * Contains complete presence information for the updated user.
   */
  PRESENCE_UPDATE: PresenceEntity;

  /**
   * Sent when a user starts typing in a channel.
   * Contains user, channel, and timestamp information.
   */
  TYPING_START: TypingStartEntity;

  /**
   * Sent when properties about the current user change.
   * Contains the updated user object with new properties.
   */
  USER_UPDATE: UserEntity;

  /**
   * Sent when someone sends an effect in a voice channel the current user is connected to.
   * Contains information about the effect, sender, and channel.
   */
  VOICE_CHANNEL_EFFECT_SEND: VoiceChannelEffectSendEntity;

  /**
   * Sent when someone joins, leaves, or moves voice channels.
   * Contains complete voice state information for the affected user.
   */
  VOICE_STATE_UPDATE: VoiceStateEntity;

  /**
   * Sent when a guild's voice server is updated.
   * Contains token and endpoint information for voice connections.
   */
  VOICE_SERVER_UPDATE: VoiceServerUpdateEntity;

  /**
   * Sent when a guild channel webhook is created, updated, or deleted.
   * Contains only guild and channel context, not webhook details.
   */
  WEBHOOKS_UPDATE: WebhooksUpdateEntity;

  /**
   * Sent when a user uses an interaction, such as an Application Command.
   * Contains complete interaction information with context.
   */
  INTERACTION_CREATE: AnyInteractionEntity;

  /**
   * Sent when a stage instance is created.
   * Contains the complete new stage instance object.
   */
  STAGE_INSTANCE_CREATE: StageInstanceEntity;

  /**
   * Sent when a stage instance is updated.
   * Contains the updated stage instance object.
   */
  STAGE_INSTANCE_UPDATE: StageInstanceEntity;

  /**
   * Sent when a stage instance is deleted or closed.
   * Contains the deleted stage instance object for reference.
   */
  STAGE_INSTANCE_DELETE: StageInstanceEntity;

  /**
   * Sent when a Premium App Subscription is created.
   * Contains the complete new subscription object.
   */
  SUBSCRIPTION_CREATE: SubscriptionEntity;

  /**
   * Sent when a Premium App Subscription is updated.
   * Contains the updated subscription object.
   */
  SUBSCRIPTION_UPDATE: SubscriptionEntity;

  /**
   * Sent when a Premium App Subscription is deleted.
   * Contains the deleted subscription object for reference.
   */
  SUBSCRIPTION_DELETE: SubscriptionEntity;

  /**
   * Sent when a user votes on a message poll.
   * Contains information about the user, poll, and selected answer.
   */
  MESSAGE_POLL_VOTE_ADD: MessagePollVoteEntity;

  /**
   * Sent when a user removes a vote from a message poll.
   * Contains information about the user, poll, and deselected answer.
   */
  MESSAGE_POLL_VOTE_REMOVE: MessagePollVoteEntity;
}

/**
 * Identify Connection Properties
 *
 * Properties sent when establishing a connection with the gateway.
 * These properties provide context about the client environment.
 *
 * Connection properties help Discord track client platform distribution
 * and provide appropriate client-specific behavior.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#identify-identify-connection-properties}
 */
export interface IdentifyConnectionProperties {
  /**
   * Operating system the client is running on.
   * Examples: "windows", "linux", "darwin" (macOS)
   */
  os: string;

  /**
   * Browser or runtime the client is using.
   * This is a legacy field; for libraries, it's typically set to the library name.
   */
  browser: string;

  /**
   * Device the client is running on.
   * This is a legacy field; for libraries, it's typically set to the library name.
   */
  device: string;
}

/**
 * Identify
 *
 * Command sent to trigger the initial handshake with the gateway.
 * This is the first operation sent after connecting to the WebSocket.
 *
 * The Identify operation authenticates the connection and establishes session parameters
 * such as compression, sharding, and intents.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#identify-identify-structure}
 */
export interface IdentifyEntity {
  /**
   * Authentication token for the client.
   * For bots, this is the Bot token; for users, this is the user token.
   */
  token: string;

  /**
   * Connection properties providing context about the client.
   * Includes operating system, browser, and device information.
   */
  properties: IdentifyConnectionProperties;

  /**
   * Whether this connection supports compression of packets.
   * Enables zlib-stream compression for gateway messages when true.
   */
  compress?: boolean;

  /**
   * Value between 50 and 250 representing the threshold above which offline guild members will not be sent.
   * Controls member list optimization for large guilds.
   */
  large_threshold?: number;

  /**
   * Shard information as a two-element array: [shard_id, num_shards]
   * Used for Guild Sharding to distribute guild load across multiple connections.
   */
  shard?: [number, number];

  /**
   * Initial presence information to set for the connecting client.
   * Determines how the client appears to others immediately after connecting.
   */
  presence?: UpdatePresenceEntity;

  /**
   * Bitwise value of Gateway Intents the client requests.
   * Controls which events the client will receive from the gateway.
   */
  intents: number;
}

/**
 * Resume
 *
 * Command sent to replay missed events when a disconnected client resumes.
 * This operation allows clients to reconnect without losing event history.
 *
 * Resume is crucial for maintaining state consistency after temporary disconnections,
 * avoiding the need for full reinitialization.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#resume-resume-structure}
 */
export interface ResumeEntity {
  /**
   * Session token for authentication.
   * Must match the token used in the original Identify operation.
   */
  token: string;

  /**
   * Session ID received from the Ready event.
   * Identifies the specific session being resumed.
   */
  session_id: string;

  /**
   * Last sequence number received by the client.
   * Allows the gateway to determine which events need to be replayed.
   */
  seq: number;
}

/**
 * Request Guild Members
 *
 * Command sent to request all members for a guild or a list of guilds.
 * This is used to fetch members that weren't sent in the Guild Create event,
 * particularly for large guilds where not all members are sent initially.
 *
 * Request Guild Members enables efficient fetching of member information
 * through the gateway rather than REST API pagination.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#request-guild-members-request-guild-members-structure}
 */
export interface RequestGuildMembersEntity {
  /**
   * ID of the guild to get members for.
   * Identifies which guild's members are being requested.
   */
  guild_id: Snowflake;

  /**
   * String that username starts with, or an empty string to return all members.
   * Allows for partial username matching for filtering results.
   */
  query?: string;

  /**
   * Maximum number of members to send matching the query.
   * Caps the response size for performance and bandwidth reasons.
   */
  limit: number;

  /**
   * Whether to include presence data in the response.
   * Requires the GUILD_PRESENCES intent to receive meaningful data.
   */
  presences?: boolean;

  /**
   * Used to specify which specific users to fetch.
   * Can be a single ID or an array of IDs for targeted member requests.
   */
  user_ids?: Snowflake | Snowflake[];

  /**
   * Nonce to identify the Guild Members Chunk response.
   * Allows correlating responses with specific requests.
   */
  nonce?: string;
}

/**
 * Request Soundboard Sounds
 *
 * Command sent to request soundboard sounds for a list of guilds.
 * This operation fetches all available soundboard sounds that can be played
 * in voice channels for the specified guilds.
 *
 * Request Soundboard Sounds allows clients to populate their UI with available sounds
 * without making separate REST API calls for each guild.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#request-soundboard-sounds-request-soundboard-sounds-structure}
 */
export interface RequestSoundboardSoundsEntity {
  /**
   * Array of guild IDs to get soundboard sounds for.
   * Allows batch-requesting sounds from multiple guilds.
   */
  guild_ids: Snowflake[];
}

/**
 * Update Voice State
 *
 * Command sent when a client wants to join, move, or disconnect from a voice channel.
 * This operation changes the client's voice connection state within a guild.
 *
 * Update Voice State is the primary method for controlling voice channel connections,
 * including joining, leaving, and toggling mute/deafen states.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#update-voice-state-gateway-voice-state-update-structure}
 */
export interface UpdateVoiceStateEntity {
  /**
   * ID of the guild for the voice state change.
   * Identifies which guild's voice channels are being interacted with.
   */
  guild_id: Snowflake;

  /**
   * ID of the voice channel client wants to join (null if disconnecting).
   * Specifies the target channel or indicates a disconnect when null.
   */
  channel_id: Snowflake | null;

  /**
   * Whether the client is muted (cannot transmit audio).
   * Controls the client's ability to send voice data.
   */
  self_mute: boolean;

  /**
   * Whether the client is deafened (cannot receive audio).
   * Controls the client's ability to receive voice data.
   */
  self_deaf: boolean;
}

/**
 * Update Presence
 *
 * Command sent by the client to indicate a presence or status update.
 * This operation changes how the client appears to other users.
 *
 * Update Presence allows clients to control their visible status,
 * activities, and AFK state.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#update-presence-gateway-presence-update-structure}
 */
export interface UpdatePresenceEntity {
  /**
   * Unix time (in milliseconds) of when the client went idle, or null if not idle.
   * Used to display accurate "idle since" information.
   */
  since: number | null;

  /**
   * Array of activities for the client.
   * Can include games, streams, music listening, etc.
   */
  activities: ActivityEntity[];

  /**
   * User's current status.
   * Controls the color of the status indicator and availability.
   */
  status: UpdatePresenceStatusType;

  /**
   * Whether the client is marked as AFK.
   * Affects notification behavior and may impact status display.
   */
  afk: boolean;
}

/**
 * Gateway Send Events
 *
 * Mapping of gateway opcodes to their corresponding data interfaces for sending events.
 * These are the operations and data structures that clients can send to Discord
 * through a Gateway connection.
 *
 * This interface serves as a type-safe registry of all gateway operations
 * that can be sent by the client.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#send-events}
 */
export interface GatewaySendEvents {
  /**
   * Command to initiate the connection handshake with the gateway.
   * Must be the first operation sent after connecting to the WebSocket.
   */
  [GatewayOpcodes.Identify]: IdentifyEntity;

  /**
   * Command to resume a disconnected session and replay missed events.
   * Used to recover from temporary connection losses without full reinitialization.
   */
  [GatewayOpcodes.Resume]: ResumeEntity;

  /**
   * Periodic operation to maintain the connection and verify client connectivity.
   * Must be sent regularly at the interval specified in the Hello event.
   */
  [GatewayOpcodes.Heartbeat]: number | null;

  /**
   * Command to retrieve members from a guild, with optional filtering.
   * Efficient method for fetching member information through the gateway.
   */
  [GatewayOpcodes.RequestGuildMembers]: RequestGuildMembersEntity;

  /**
   * Command to retrieve available soundboard sounds from multiple guilds.
   * Batch-requests sound information without making separate REST API calls.
   */
  [GatewayOpcodes.RequestSoundboardSounds]: RequestSoundboardSoundsEntity;

  /**
   * Command to join, move, or disconnect from voice channels.
   * Controls the client's voice connection state within a guild.
   */
  [GatewayOpcodes.VoiceStateUpdate]: UpdateVoiceStateEntity;

  /**
   * Command to update the client's visible presence.
   * Controls how the client appears to other users (status, activities, etc.).
   */
  [GatewayOpcodes.PresenceUpdate]: UpdatePresenceEntity;
}
