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
} from "@nyxjs/core";
import type { ReactionTypeFlag } from "@nyxjs/rest";
import { GatewayOpcodes } from "./index.js";

/**
 * Auto Moderation Action Execution Event
 * Sent when a rule is triggered and an action is executed (e.g. when a message is blocked).
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#auto-moderation-action-execution-auto-moderation-action-execution-event-fields}
 */
export interface AutoModerationActionExecutionEntity {
  /** ID of the guild in which action was executed */
  guild_id: Snowflake;

  /** Action which was executed */
  action: AutoModerationActionEntity;

  /** ID of the rule which action belongs to */
  rule_id: Snowflake;

  /** Trigger type of rule which was triggered */
  rule_trigger_type: AutoModerationRuleTriggerType;

  /** ID of the user which generated the content which triggered the rule */
  user_id: Snowflake;

  /** ID of the channel in which user content was posted */
  channel_id?: Snowflake;

  /** ID of any user message which content belongs to */
  message_id?: Snowflake;

  /** ID of any system auto moderation messages posted as a result of this action */
  alert_system_message_id?: Snowflake;

  /** User-generated text content (requires MESSAGE_CONTENT intent) */
  content?: string;

  /** Word or phrase configured in the rule that triggered the rule */
  matched_keyword: string | null;

  /** Substring in content that triggered the rule (requires MESSAGE_CONTENT intent) */
  matched_content: string | null;
}

/**
 * Channel Pins Update Event
 * Sent when a message is pinned or unpinned in a text channel.
 * This is not sent when a pinned message is deleted.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#channel-pins-update-channel-pins-update-event-fields}
 */
export interface ChannelPinsUpdateEntity {
  /** ID of the guild */
  guild_id?: Snowflake | null;

  /** ID of the channel */
  channel_id: Snowflake;

  /** Time at which the most recent pinned message was pinned */
  last_pin_timestamp: string | null;
}

/**
 * Thread Members Update Event
 * Sent when anyone is added to or removed from a thread.
 * If the current user does not have the GUILD_MEMBERS Gateway Intent, then this event
 * will only be sent if the current user was added to or removed from the thread.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#thread-members-update-thread-members-update-event-fields}
 */
export interface ThreadMembersUpdateEntity {
  /** ID of the thread */
  id: Snowflake;

  /** ID of the guild */
  guild_id: Snowflake;

  /** Approximate number of members in the thread, capped at 50 */
  member_count: number;

  /** Users who were added to the thread */
  added_members?: ThreadMemberEntity[];

  /** ID of the users who were removed from the thread */
  removed_member_ids?: string[];
}

/**
 * Thread Member Update Event
 * Sent when the thread member object for the current user is updated.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#thread-member-update-thread-member-update-event-extra-fields}
 */
export interface ThreadMemberUpdateEntity extends ThreadMemberEntity {
  /** ID of the guild */
  guild_id: Snowflake;
}

/**
 * Thread List Sync Event
 * Sent when the current user gains access to a channel.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#thread-list-sync-thread-list-sync-event-fields}
 */
export interface ThreadListSyncEntity {
  /** ID of the guild */
  guild_id: Snowflake;

  /** Parent channel IDs whose threads are being synced */
  channel_ids?: Snowflake[];

  /** All active threads in the given channels that the current user can access */
  threads: AnyThreadChannelEntity[];

  /** All thread member objects from the synced threads for the current user */
  members: ThreadMemberEntity[];
}

/**
 * Soundboard Sounds Event
 * Includes a guild's list of soundboard sounds.
 * Sent in response to Request Soundboard Sounds.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#soundboard-sounds-soundboard-sounds-event-fields}
 */
export interface SoundboardSoundsEntity {
  /** The guild's soundboard sounds */
  soundboard_sounds: SoundboardSoundEntity[];

  /** ID of the guild */
  guild_id: Snowflake;
}

/**
 * Guild Soundboard Sounds Update Event
 * Sent when multiple guild soundboard sounds are updated.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-soundboard-sounds-update-guild-soundboard-sounds-update-event-fields}
 */
export type GuildSoundboardSoundsUpdateEntity = SoundboardSoundsEntity;

/**
 * Guild Soundboard Sound Delete Event
 * Sent when a guild soundboard sound is deleted.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-soundboard-sound-delete-guild-soundboard-sound-delete-event-fields}
 */
export interface GuildSoundboardSoundDeleteEntity {
  /** ID of the sound that was deleted */
  sound_id: Snowflake;

  /** ID of the guild the sound was in */
  guild_id: Snowflake;
}

/**
 * Guild Scheduled Event User Remove Event
 * Sent when a user has unsubscribed from a guild scheduled event.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-scheduled-event-user-remove-guild-scheduled-event-user-remove-event-fields}
 */
export interface GuildScheduledEventUserRemoveEntity {
  /** ID of the guild scheduled event */
  guild_scheduled_event_id: Snowflake;

  /** ID of the user */
  user_id: Snowflake;

  /** ID of the guild */
  guild_id: Snowflake;
}

/**
 * Guild Scheduled Event User Add Event
 * Sent when a user has subscribed to a guild scheduled event.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-scheduled-event-user-add-guild-scheduled-event-user-add-event-fields}
 */
export type GuildScheduledEventUserAddEntity =
  GuildScheduledEventUserRemoveEntity;

/**
 * Activity Buttons Entity
 * Custom buttons shown in the Rich Presence
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#activity-object-activity-buttons}
 */
export interface ActivityButtonsEntity {
  /** Text shown on the button (1-32 characters) */
  label: string;

  /** URL opened when clicking the button (1-512 characters) */
  url: string;
}

/**
 * Activity Flags
 * Describes what the payload includes
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#activity-object-activity-flags}
 */
export enum ActivityFlags {
  Instance = 1 << 0,
  Join = 1 << 1,
  Spectate = 1 << 2,
  JoinRequest = 1 << 3,
  Sync = 1 << 4,
  Play = 1 << 5,
  PartyPrivacyFriends = 1 << 6,
  PartyPrivacyVoiceChannel = 1 << 7,
  Embedded = 1 << 8,
}

/**
 * Activity Secrets
 * Secrets for Rich Presence joining and spectating
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#activity-object-activity-secrets}
 */
export interface ActivitySecretsEntity {
  /** Secret for joining a party */
  join?: string;

  /** Secret for spectating a game */
  spectate?: string;

  /** Secret for a specific instanced match */
  match?: string;
}

/**
 * Activity Asset Image
 * Images for the presence and their hover texts
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#activity-object-activity-asset-image}
 */
export interface ActivityAssetImageEntity {
  /** Text displayed when hovering over the large image of the activity */
  large_text?: string;

  /** Large image asset */
  large_image?: string;

  /** Text displayed when hovering over the small image of the activity */
  small_text?: string;

  /** Small image asset */
  small_image?: string;
}

/**
 * Activity Party
 * Information for the current party of the player
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#activity-object-activity-party}
 */
export interface ActivityPartyEntity {
  /** ID of the party */
  id?: string;

  /** Used to show the party's current and maximum size */
  size?: [number, number];
}

/**
 * Activity Emoji
 * Emoji used for a custom status
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#activity-object-activity-emoji}
 */
export interface ActivityEmojiEntity {
  /** Name of the emoji */
  name: string;

  /** ID of the emoji */
  id?: Snowflake;

  /** Whether the emoji is animated */
  animated?: boolean;
}

/**
 * Activity Timestamps
 * Unix timestamps for start and/or end of the game
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#activity-object-activity-timestamps}
 */
export interface ActivityTimestampsEntity {
  /** Unix time (in milliseconds) of when the activity started */
  start?: number;

  /** Unix time (in milliseconds) of when the activity ends */
  end?: number;
}

/**
 * Activity Types
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#activity-object-activity-types}
 */
export enum ActivityType {
  /** Playing {name} */
  Game = 0,
  /** Streaming {details} */
  Streaming = 1,
  /** Listening to {name} */
  Listening = 2,
  /** Watching {name} */
  Watching = 3,
  /** {emoji} {state} */
  Custom = 4,
  /** Competing in {name} */
  Competing = 5,
}

/**
 * Activity Structure
 * Information about the user's current activity
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#activity-object-activity-structure}
 */
export interface ActivityEntity {
  /** Activity's name */
  name: string;

  /** Activity type */
  type: ActivityType;

  /** Stream URL, is validated when type is 1 */
  url?: string | null;

  /** Unix timestamp (in milliseconds) of when the activity was added to the user's session */
  created_at: number | string;

  /** Unix timestamps for start and/or end of the game */
  timestamps?: ActivityTimestampsEntity;

  /** Application ID for the game */
  application_id?: Snowflake;

  /** What the player is currently doing */
  details?: string | null;

  /** User's current party status, or text used for a custom status */
  state?: string | null;

  /** Emoji used for a custom status */
  emoji?: ActivityEmojiEntity | null;

  /** Information for the current party of the player */
  party?: ActivityPartyEntity;

  /** Images for the presence and their hover texts */
  assets?: ActivityAssetImageEntity;

  /** Secrets for Rich Presence joining and spectating */
  secrets?: ActivitySecretsEntity;

  /** Whether or not the activity is an instanced game session */
  instance?: boolean;

  /** Activity flags ORed together, describes what the payload includes */
  flags?: ActivityFlags;

  /** Custom buttons shown in the Rich Presence (max 2) */
  buttons?: ActivityButtonsEntity[];
}

/**
 * Client Status Object
 * User's platform-dependent status
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#client-status-object}
 */
export interface ClientStatusEntity {
  /** User's status set for an active desktop (Windows, Linux, Mac) application session */
  desktop?: string;

  /** User's status set for an active mobile (iOS, Android) application session */
  mobile?: string;

  /** User's status set for an active web (browser, bot user) application session */
  web?: string;
}

/**
 * Presence Update
 * A user's presence is their current state on a guild.
 * Sent when a user's presence or info, such as name or avatar, is updated.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#presence-update-presence-update-event-fields}
 */
export interface PresenceEntity {
  /** User whose presence is being updated */
  user: UserEntity;

  /** ID of the guild */
  guild_id: Snowflake;

  /** Either "idle", "dnd", "online", or "offline" */
  status: string;

  /** User's current activities */
  activities: ActivityEntity[];

  /** User's platform-dependent status */
  client_status: ClientStatusEntity;
}

/**
 * Update Presence Status Type
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#update-presence-status-types}
 */
export type UpdatePresenceStatusType =
  | "online"
  | "dnd"
  | "idle"
  | "invisible"
  | "offline";

/**
 * Guild Role Delete
 * Sent when a guild role is deleted.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-role-delete-guild-role-delete-event-fields}
 */
export interface GuildRoleDeleteEntity {
  /** ID of the role */
  role_id: Snowflake;

  /** ID of the guild */
  guild_id: Snowflake;
}

/**
 * Guild Role Update
 * Sent when a guild role is updated.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-role-update-guild-role-update-event-fields}
 */
export interface GuildRoleUpdateEntity {
  /** ID of the guild */
  guild_id: Snowflake;

  /** Role that was updated */
  role: RoleEntity;
}

/**
 * Guild Role Create
 * Sent when a guild role is created.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-role-create-guild-role-create-event-fields}
 */
export type GuildRoleCreateEntity = GuildRoleUpdateEntity;

/**
 * Guild Members Chunk
 * Sent in response to Guild Request Members.
 * You can use the chunk_index and chunk_count to calculate how many chunks are left for your request.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-members-chunk-guild-members-chunk-event-fields}
 */
export interface GuildMembersChunkEntity {
  /** ID of the guild */
  guild_id: Snowflake;

  /** Set of guild members */
  members: GuildMemberEntity[];

  /** Chunk index in the expected chunks for this response (0 <= chunk_index < chunk_count) */
  chunk_index: number;

  /** Total number of expected chunks for this response */
  chunk_count: number;

  /** When passing an invalid ID to REQUEST_GUILD_MEMBERS, it will be returned here */
  not_found?: Snowflake[];

  /** When passing true to REQUEST_GUILD_MEMBERS, presences of the returned members will be here */
  presences?: PresenceEntity[];

  /** Nonce used in the Guild Members Request */
  nonce?: string;
}

/**
 * Guild Member Update
 * Sent when a guild member is updated. This will also fire when the user object of a guild member changes.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-member-update-guild-member-update-event-fields}
 */
export interface GuildMemberUpdateEntity {
  /** ID of the guild */
  guild_id: Snowflake;

  /** User role ids */
  roles: Snowflake[];

  /** User */
  user: UserEntity;

  /** Nickname of the user in the guild */
  nick?: string | null;

  /** Member's guild avatar hash */
  avatar: string | null;

  /** Member's guild banner hash */
  banner: string | null;

  /** When the user joined the guild */
  joined_at: string | null;

  /** When the user starting boosting the guild */
  premium_since?: string | null;

  /** Whether the user is deafened in voice channels */
  deaf?: boolean;

  /** Whether the user is muted in voice channels */
  mute?: boolean;

  /** Whether the user has not yet passed the guild's Membership Screening requirements */
  pending?: boolean;

  /** When the user's timeout will expire and the user will be able to communicate in the guild again */
  communication_disabled_until?: string | null;

  /** Guild member flags represented as a bit set, defaults to 0 */
  flags?: number;

  /** Data for the member's guild avatar decoration */
  avatar_decoration_data?: AvatarDecorationDataEntity | null;
}

/**
 * Guild Member Remove
 * Sent when a user is removed from a guild (leave/kick/ban).
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-member-remove-guild-member-remove-event-fields}
 */
export interface GuildMemberRemoveEntity {
  /** ID of the guild */
  guild_id: Snowflake;

  /** User who was removed */
  user: UserEntity;
}

/**
 * Guild Member Add
 * Sent when a new user joins a guild.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-member-add-guild-member-add-extra-fields}
 */
export interface GuildMemberAddEntity extends GuildMemberEntity {
  /** ID of the guild */
  guild_id: Snowflake;
}

/**
 * Guild Integrations Update
 * Sent when a guild integration is updated.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-integrations-update-guild-integrations-update-event-fields}
 */
export interface GuildIntegrationsUpdateEntity {
  /** ID of the guild whose integrations were updated */
  guild_id: Snowflake;
}

/**
 * Guild Stickers Update
 * Sent when a guild's stickers have been updated.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-stickers-update-guild-stickers-update-event-fields}
 */
export interface GuildStickersUpdateEntity {
  /** ID of the guild */
  guild_id: Snowflake;

  /** Array of stickers */
  stickers: StickerEntity[];
}

/**
 * Guild Emojis Update
 * Sent when a guild's emojis have been updated.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-emojis-update-guild-emojis-update-event-fields}
 */
export interface GuildEmojisUpdateEntity {
  /** ID of the guild */
  guild_id: Snowflake;

  /** Array of emojis */
  emojis: EmojiEntity[];
}

/**
 * Guild Ban Remove
 * Sent when a user is unbanned from a guild.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-ban-remove-guild-ban-remove-event-fields}
 */
export interface GuildBanRemoveEntity {
  /** ID of the guild */
  guild_id: Snowflake;

  /** User who was unbanned */
  user: UserEntity;
}

/**
 * Guild Ban Add
 * Sent when a user is banned from a guild.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-ban-add-guild-ban-add-event-fields}
 */
export interface GuildBanAddEntity {
  /** ID of the guild */
  guild_id: Snowflake;

  /** User who was banned */
  user: UserEntity;
}

/**
 * Guild Audit Log Entry Create
 * Sent when a guild audit log entry is created.
 * This event is only sent to bots with the VIEW_AUDIT_LOG permission.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-audit-log-entry-create-guild-audit-log-entry-create-event-extra-fields}
 */
export interface GuildAuditLogEntryCreateEntity extends AuditLogEntryEntity {
  /** ID of the guild */
  guild_id: Snowflake;
}

/**
 * Guild Create
 * This event can be sent in three different scenarios:
 * 1. When a user is initially connecting, to lazily load and backfill information for all unavailable guilds sent in the Ready event.
 * 2. When a Guild becomes available again to the client.
 * 3. When the current user joins a new Guild.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#guild-create-guild-create-extra-fields}
 */
export interface GuildCreateEntity extends GuildEntity {
  /** When this guild was joined at */
  joined_at: string;

  /** true if this is considered a large guild */
  large: boolean;

  /** true if this guild is unavailable due to an outage */
  unavailable?: boolean;

  /** Total number of members in this guild */
  member_count: number;

  /** States of members currently in voice channels; lacks the guild_id key */
  voice_states: Partial<VoiceStateEntity>[];

  /** Users in the guild */
  members: GuildMemberEntity[];

  /** Channels in the guild */
  channels: AnyChannelEntity[];

  /** All active threads in the guild that current user has permission to view */
  threads: AnyThreadChannelEntity[];

  /** Presences of the members in the guild */
  presences: Partial<PresenceEntity>[];

  /** Stage instances in the guild */
  stage_instances: StageInstanceEntity[];

  /** Scheduled events in the guild */
  guild_scheduled_events: GuildScheduledEventEntity[];

  /** Soundboard sounds in the guild */
  soundboard_sounds: SoundboardSoundEntity[];
}

/**
 * Hello
 * Sent on connection to the websocket.
 * Defines the heartbeat interval that an app should heartbeat to.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#hello-hello-structure}
 */
export interface HelloEntity {
  /** Interval (in milliseconds) an app should heartbeat with */
  heartbeat_interval: number;
}

/**
 * Identify Connection Properties
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#identify-identify-connection-properties}
 */
export interface IdentifyConnectionPropertiesEntity {
  /** Your operating system */
  os: string;

  /** Your library name */
  browser: string;

  /** Your library name */
  device: string;
}

/**
 * Integration Delete
 * Sent when an integration is deleted.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#integration-delete-integration-delete-event-fields}
 */
export interface IntegrationDeleteEntity {
  /** Integration ID */
  id: Snowflake;

  /** ID of the guild */
  guild_id: Snowflake;

  /** ID of the bot/OAuth2 application for this discord integration */
  application_id?: Snowflake;
}

/**
 * Integration Update
 * Sent when an integration is updated.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#integration-update-integration-update-event-additional-fields}
 */
export interface IntegrationUpdateEntity extends IntegrationEntity {
  /** ID of the guild */
  guild_id: Snowflake;
}

/**
 * Integration Create
 * Sent when an integration is created.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#integration-create-integration-create-event-additional-fields}
 */
export type IntegrationCreateEntity = IntegrationUpdateEntity;

/**
 * Invite Delete
 * Sent when an invite is deleted.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#invite-delete-invite-delete-event-fields}
 */
export interface InviteDeleteEntity {
  /** Channel of the invite */
  channel_id: Snowflake;

  /** Guild of the invite */
  guild_id?: Snowflake;

  /** Unique invite code */
  code: string;
}

/**
 * Invite Create
 * Sent when a new invite to a channel is created.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#invite-create-invite-create-event-fields}
 */
export interface InviteCreateEntity {
  /** Channel the invite is for */
  channel_id: Snowflake;

  /** Unique invite code */
  code: string;

  /** Time at which the invite was created */
  created_at: string;

  /** Guild of the invite */
  guild_id?: Snowflake;

  /** User that created the invite */
  inviter?: UserEntity;

  /** How long the invite is valid for (in seconds) */
  max_age: number;

  /** Maximum number of times the invite can be used */
  max_uses: number;

  /** Type of target for this voice channel invite */
  target_type?: InviteTargetType;

  /** User whose stream to display for this voice channel stream invite */
  target_user?: UserEntity;

  /** Embedded application to open for this voice channel embedded application invite */
  target_application?: ApplicationEntity;

  /** Whether or not the invite is temporary (invited users will be kicked on disconnect) */
  temporary: boolean;

  /** How many times the invite has been used (always will be 0) */
  uses: number;
}

/**
 * Message Reaction Remove Emoji
 * Sent when a bot removes all instances of a given emoji from the reactions of a message.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-reaction-remove-emoji-message-reaction-remove-emoji-event-fields}
 */
export interface MessageReactionRemoveEmojiEntity {
  /** ID of the channel */
  channel_id: Snowflake;

  /** ID of the guild */
  guild_id?: Snowflake;

  /** ID of the message */
  message_id: Snowflake;

  /** Emoji that was removed */
  emoji: Partial<EmojiEntity>;
}

/**
 * Message Reaction Remove All
 * Sent when a user explicitly removes all reactions from a message.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-reaction-remove-all-message-reaction-remove-all-event-fields}
 */
export interface MessageReactionRemoveAllEntity {
  /** ID of the channel */
  channel_id: Snowflake;

  /** ID of the message */
  message_id: Snowflake;

  /** ID of the guild */
  guild_id?: Snowflake;
}

/**
 * Message Reaction Remove
 * Sent when a user removes a reaction from a message.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-reaction-remove-message-reaction-remove-event-fields}
 */
export interface MessageReactionRemoveEntity {
  /** ID of the user */
  user_id: Snowflake;

  /** ID of the channel */
  channel_id: Snowflake;

  /** ID of the message */
  message_id: Snowflake;

  /** ID of the guild */
  guild_id?: Snowflake;

  /** Emoji used to react */
  emoji: Pick<EmojiEntity, "id" | "name" | "animated">;

  /** true if this was a super-reaction */
  burst: boolean;

  /** The type of reaction */
  type: ReactionTypeFlag;
}

/**
 * Message Reaction Add
 * Sent when a user adds a reaction to a message.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-reaction-add-message-reaction-add-event-fields}
 */
export interface MessageReactionAddEntity {
  /** ID of the user */
  user_id: Snowflake;

  /** ID of the channel */
  channel_id: Snowflake;

  /** ID of the message */
  message_id: Snowflake;

  /** ID of the guild */
  guild_id?: Snowflake;

  /** Member who reacted if this happened in a guild */
  member?: GuildMemberEntity;

  /** Emoji used to react */
  emoji: Pick<EmojiEntity, "id" | "name" | "animated">;

  /** ID of the user who authored the message which was reacted to */
  message_author_id?: Snowflake;

  /** true if this is a super-reaction */
  burst: boolean;

  /** Colors used for super-reaction animation in "#rrggbb" format */
  burst_colors?: string[];

  /** The type of reaction */
  type: ReactionTypeFlag;
}

/**
 * Message Delete Bulk
 * Sent when multiple messages are deleted at once.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-delete-bulk-message-delete-bulk-event-fields}
 */
export interface MessageDeleteBulkEntity {
  /** IDs of the messages */
  ids: Snowflake[];

  /** ID of the channel */
  channel_id: Snowflake;

  /** ID of the guild */
  guild_id?: Snowflake;
}

/**
 * Message Delete
 * Sent when a message is deleted.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-delete-message-delete-event-fields}
 */
export interface MessageDeleteEntity {
  /** ID of the message */
  id: Snowflake;

  /** ID of the channel */
  channel_id: Snowflake;

  /** ID of the guild */
  guild_id?: Snowflake;
}

/**
 * Message Create
 * Sent when a message is created.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-create-message-create-extra-fields}
 */
export interface MessageCreateEntity extends Omit<MessageEntity, "mentions"> {
  /** Users specifically mentioned in the message */
  mentions?: (UserEntity | Partial<GuildMemberEntity>)[];

  /** ID of the guild the message was sent in - unless it is an ephemeral message */
  guild_id?: Snowflake;

  /** Member properties for this message's author */
  member?: Partial<GuildMemberEntity>;
}

/**
 * Message Poll Vote Remove
 * Sent when a user removes their vote on a poll.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-poll-vote-remove-message-poll-vote-remove-fields}
 */
export interface MessagePollVoteRemoveEntity {
  /** ID of the user */
  user_id: Snowflake;

  /** ID of the channel */
  channel_id: Snowflake;

  /** ID of the message */
  message_id: Snowflake;

  /** ID of the guild */
  guild_id?: Snowflake;

  /** ID of the answer */
  answer_id: number;
}

/**
 * Message Poll Vote Add
 * Sent when a user votes on a poll.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#message-poll-vote-add-message-poll-vote-add-fields}
 */
export type MessagePollVoteAddEntity = MessagePollVoteRemoveEntity;

/**
 * Ready
 * The ready event is dispatched when a client has completed the initial handshake with the gateway (for new sessions).
 * The ready event can be the largest and most complex event the gateway will send, as it contains all the state required
 * for a client to begin interacting with the rest of the platform.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#ready-ready-event-fields}
 */
export interface ReadyEntity {
  /** API version */
  v: ApiVersion;

  /** Information about the user including email */
  user: UserEntity;

  /** Guilds the user is in */
  guilds: UnavailableGuildEntity[];

  /** Used for resuming connections */
  session_id: string;

  /** Gateway URL for resuming connections */
  resume_gateway_url: string;

  /** Shard information associated with this session, if sent when identifying */
  shard?: [number, number];

  /** Contains id and flags */
  application: Pick<ApplicationEntity, "id" | "flags">;
}

/**
 * Typing Start
 * Sent when a user starts typing in a channel.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#typing-start-typing-start-event-fields}
 */
export interface TypingEntity {
  /** ID of the channel */
  channel_id: Snowflake;

  /** ID of the guild */
  guild_id?: Snowflake;

  /** ID of the user */
  user_id: Snowflake;

  /** Unix time (in seconds) of when the user started typing */
  timestamp: number;

  /** Member who started typing if this happened in a guild */
  member?: GuildMemberEntity;
}

/**
 * Voice Server Update
 * Sent when a guild's voice server is updated.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#voice-server-update-voice-server-update-event-fields}
 */
export interface VoiceServerUpdateEntity {
  /** Voice connection token */
  token: string;

  /** Guild this voice server update is for */
  guild_id: Snowflake;

  /** Voice server host */
  endpoint: string | null;
}

/**
 * Voice Channel Effect Send Animation Types
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#voice-channel-effect-send-animation-types}
 */
export enum VoiceChannelEffectSendAnimationType {
  /** A fun animation, sent by a Nitro subscriber */
  Premium = 0,
  /** The standard animation */
  Basic = 1,
}

/**
 * Voice Channel Effect Send
 * Sent when someone sends an effect, such as an emoji reaction or a soundboard sound,
 * in a voice channel the current user is connected to.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#voice-channel-effect-send-voice-channel-effect-send-event-fields}
 */
export interface VoiceChannelEffectSendEntity {
  /** ID of the channel the effect was sent in */
  channel_id: Snowflake;

  /** ID of the guild the effect was sent in */
  guild_id: Snowflake;

  /** ID of the user who sent the effect */
  user_id: Snowflake;

  /** The emoji sent, for emoji reaction and soundboard effects */
  emoji?: EmojiEntity | null;

  /** The type of emoji animation, for emoji reaction and soundboard effects */
  animation_type?: VoiceChannelEffectSendAnimationType;

  /** The ID of the emoji animation, for emoji reaction and soundboard effects */
  animation_id?: number;

  /** The ID of the soundboard sound, for soundboard effects */
  sound_id?: Snowflake | number;

  /** The volume of the soundboard sound, from 0 to 1, for soundboard effects */
  sound_volume?: number;
}

/**
 * Webhooks Update
 * Sent when a guild channel's webhook is created, updated, or deleted.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#webhooks-update-webhooks-update-event-fields}
 */
export interface WebhookUpdateEntity {
  /** ID of the guild */
  guild_id: Snowflake;

  /** ID of the channel */
  channel_id: Snowflake;
}

/**
 * Gateway Receive Events
 * Events that are sent by Discord to an app through a Gateway connection.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#receive-events}
 */
export interface GatewayReceiveEvents {
  /** Defines the initial state information */
  READY: ReadyEntity;
  /** Response to Resume */
  RESUMED: boolean;
  /** Application command permission was updated */
  APPLICATION_COMMAND_PERMISSIONS_UPDATE: GuildApplicationCommandPermissionEntity;
  /** Auto Moderation rule was created */
  AUTO_MODERATION_RULE_CREATE: AutoModerationRuleEntity;
  /** Auto Moderation rule was updated */
  AUTO_MODERATION_RULE_UPDATE: AutoModerationRuleEntity;
  /** Auto Moderation rule was deleted */
  AUTO_MODERATION_RULE_DELETE: AutoModerationRuleEntity;
  /** Auto Moderation rule was triggered and an action was executed */
  AUTO_MODERATION_ACTION_EXECUTION: AutoModerationActionExecutionEntity;
  /** New guild channel created */
  CHANNEL_CREATE: AnyChannelEntity;
  /** Channel was updated */
  CHANNEL_UPDATE: AnyChannelEntity;
  /** Channel was deleted */
  CHANNEL_DELETE: AnyChannelEntity;
  /** Message was pinned or unpinned */
  CHANNEL_PINS_UPDATE: ChannelPinsUpdateEntity;
  /** Thread created, also sent when being added to a private thread */
  THREAD_CREATE:
    | (AnyThreadChannelEntity & { newly_created: boolean })
    | (AnyThreadChannelEntity & ThreadMemberEntity);
  /** Thread was updated */
  THREAD_UPDATE: Omit<AnyThreadChannelEntity, "last_message_id">;
  /** Thread was deleted */
  THREAD_DELETE: Pick<
    AnyThreadChannelEntity,
    "id" | "guild_id" | "parent_id" | "type"
  >;
  /** Sent when gaining access to a channel, contains all active threads in that channel */
  THREAD_LIST_SYNC: ThreadListSyncEntity;
  /** Thread member for the current user was updated */
  THREAD_MEMBER_UPDATE: ThreadMemberUpdateEntity;
  /** Some user(s) were added to or removed from a thread */
  THREAD_MEMBERS_UPDATE: ThreadMembersUpdateEntity;
  /** Entitlement was created */
  ENTITLEMENT_CREATE: EntitlementEntity;
  /** Entitlement was updated */
  ENTITLEMENT_UPDATE: EntitlementEntity;
  /** Entitlement was deleted */
  ENTITLEMENT_DELETE: EntitlementEntity;
  /** Lazy-load for unavailable guild, guild became available, or user joined a new guild */
  GUILD_CREATE: GuildCreateEntity | UnavailableGuildEntity;
  /** Guild was updated */
  GUILD_UPDATE: GuildEntity;
  /** Guild became unavailable, or user left/was removed from a guild */
  GUILD_DELETE: UnavailableGuildEntity;
  /** A guild audit log entry was created */
  GUILD_AUDIT_LOG_ENTRY_CREATE: GuildAuditLogEntryCreateEntity;
  /** User was banned from a guild */
  GUILD_BAN_ADD: GuildBanAddEntity;
  /** User was unbanned from a guild */
  GUILD_BAN_REMOVE: GuildBanRemoveEntity;
  /** Guild emojis were updated */
  GUILD_EMOJIS_UPDATE: GuildEmojisUpdateEntity;
  /** Guild stickers were updated */
  GUILD_STICKERS_UPDATE: GuildStickersUpdateEntity;
  /** Guild integration was updated */
  GUILD_INTEGRATIONS_UPDATE: GuildIntegrationsUpdateEntity;
  /** New user joined a guild */
  GUILD_MEMBER_ADD: GuildMemberAddEntity;
  /** User was removed from a guild */
  GUILD_MEMBER_REMOVE: GuildMemberRemoveEntity;
  /** Guild member was updated */
  GUILD_MEMBER_UPDATE: GuildMemberUpdateEntity;
  /** Response to Request Guild Members */
  GUILD_MEMBERS_CHUNK: GuildMembersChunkEntity;
  /** Guild role was created */
  GUILD_ROLE_CREATE: GuildRoleCreateEntity;
  /** Guild role was updated */
  GUILD_ROLE_UPDATE: GuildRoleUpdateEntity;
  /** Guild role was deleted */
  GUILD_ROLE_DELETE: GuildRoleDeleteEntity;
  /** Guild scheduled event was created */
  GUILD_SCHEDULED_EVENT_CREATE: GuildScheduledEventEntity;
  /** Guild scheduled event was updated */
  GUILD_SCHEDULED_EVENT_UPDATE: GuildScheduledEventEntity;
  /** Guild scheduled event was deleted */
  GUILD_SCHEDULED_EVENT_DELETE: GuildScheduledEventEntity;
  /** User subscribed to a guild scheduled event */
  GUILD_SCHEDULED_EVENT_USER_ADD: GuildScheduledEventUserAddEntity;
  /** User unsubscribed from a guild scheduled event */
  GUILD_SCHEDULED_EVENT_USER_REMOVE: GuildScheduledEventUserRemoveEntity;
  /** Guild soundboard sound was created */
  GUILD_SOUNDBOARD_SOUND_CREATE: SoundboardSoundEntity;
  /** Guild soundboard sound was updated */
  GUILD_SOUNDBOARD_SOUND_UPDATE: SoundboardSoundEntity;
  /** Guild soundboard sound was deleted */
  GUILD_SOUNDBOARD_SOUND_DELETE: GuildSoundboardSoundDeleteEntity;
  /** Guild soundboard sounds were updated */
  GUILD_SOUNDBOARD_SOUNDS_UPDATE: GuildSoundboardSoundsUpdateEntity;
  /** Response to Request Soundboard Sounds */
  SOUNDBOARD_SOUNDS: SoundboardSoundsEntity;
  /** Guild integration was created */
  INTEGRATION_CREATE: IntegrationCreateEntity;
  /** Guild integration was updated */
  INTEGRATION_UPDATE: IntegrationUpdateEntity;
  /** Guild integration was deleted */
  INTEGRATION_DELETE: IntegrationDeleteEntity;
  /** Invite to a channel was created */
  INVITE_CREATE: InviteCreateEntity;
  /** Invite to a channel was deleted */
  INVITE_DELETE: InviteDeleteEntity;
  /** Message was created */
  MESSAGE_CREATE: MessageCreateEntity;
  /** Message was edited */
  MESSAGE_UPDATE: MessageCreateEntity;
  /** Message was deleted */
  MESSAGE_DELETE: MessageDeleteEntity;
  /** Multiple messages were deleted at once */
  MESSAGE_DELETE_BULK: MessageDeleteBulkEntity;
  /** User reacted to a message */
  MESSAGE_REACTION_ADD: MessageReactionAddEntity;
  /** User removed a reaction from a message */
  MESSAGE_REACTION_REMOVE: MessageReactionRemoveEntity;
  /** All reactions were explicitly removed from a message */
  MESSAGE_REACTION_REMOVE_ALL: MessageReactionRemoveAllEntity;
  /** All reactions for a given emoji were explicitly removed from a message */
  MESSAGE_REACTION_REMOVE_EMOJI: MessageReactionRemoveEmojiEntity;
  /** User's presence or info was updated */
  PRESENCE_UPDATE: PresenceEntity;
  /** User started typing in a channel */
  TYPING_START: TypingEntity;
  /** Properties about the user changed */
  USER_UPDATE: UserEntity;
  /** Someone sent an effect in a voice channel the current user is connected to */
  VOICE_CHANNEL_EFFECT_SEND: VoiceChannelEffectSendEntity;
  /** Someone joined, left, or moved a voice channel */
  VOICE_STATE_UPDATE: VoiceStateEntity;
  /** Guild's voice server was updated */
  VOICE_SERVER_UPDATE: VoiceServerUpdateEntity;
  /** Guild channel webhook was created, updated, or deleted */
  WEBHOOKS_UPDATE: WebhookUpdateEntity;
  /** User used an interaction, such as an Application Command */
  INTERACTION_CREATE: AnyInteractionEntity;
  /** Stage instance was created */
  STAGE_INSTANCE_CREATE: StageInstanceEntity;
  /** Stage instance was updated */
  STAGE_INSTANCE_UPDATE: StageInstanceEntity;
  /** Stage instance was deleted or closed */
  STAGE_INSTANCE_DELETE: StageInstanceEntity;
  /** Premium App Subscription was created */
  SUBSCRIPTION_CREATE: SubscriptionEntity;
  /** Premium App Subscription was updated */
  SUBSCRIPTION_UPDATE: SubscriptionEntity;
  /** Premium App Subscription was deleted */
  SUBSCRIPTION_DELETE: SubscriptionEntity;
  /** User voted on a poll */
  MESSAGE_POLL_VOTE_ADD: MessagePollVoteAddEntity;
  /** User removed a vote on a poll */
  MESSAGE_POLL_VOTE_REMOVE: MessagePollVoteRemoveEntity;
}

/**
 * Update Presence
 * Sent by the client to indicate a presence or status update.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#update-presence-gateway-presence-update-structure}
 */
export interface UpdatePresenceEntity {
  /** Unix time (in milliseconds) of when the client went idle, or null if the client is not idle */
  since: number | null;

  /** User's activities */
  activities: ActivityEntity[];

  /** User's new status */
  status: UpdatePresenceStatusType;

  /** Whether or not the client is afk */
  afk: boolean;
}

/**
 * Identify
 * Used to trigger the initial handshake with the gateway.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#identify-identify-structure}
 */
export interface IdentifyEntity {
  /** Authentication token */
  token: string;

  /** Connection properties */
  properties: IdentifyConnectionPropertiesEntity;

  /** Whether this connection supports compression of packets */
  compress?: boolean;

  /** Value between 50 and 250, total number of members where the gateway will stop sending offline members */
  large_threshold?: number;

  /** Used for Guild Sharding */
  shard?: [number, number];

  /** Presence structure for initial presence information */
  presence?: UpdatePresenceEntity;

  /** Gateway Intents you wish to receive */
  intents: number;
}

/**
 * Resume
 * Used to replay missed events when a disconnected client resumes.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#resume-resume-structure}
 */
export interface ResumeEntity {
  /** Session token */
  token: string;

  /** Session ID */
  session_id: string;

  /** Last sequence number received */
  seq: number;
}

/**
 * Request Guild Members
 * Used to request all members for a guild or a list of guilds.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#request-guild-members-request-guild-members-structure}
 */
export interface RequestGuildMembersEntity {
  /** ID of the guild to get members for */
  guild_id: Snowflake;

  /** String that username starts with, or an empty string to return all members */
  query?: string;

  /** Maximum number of members to send matching the query */
  limit: number;

  /** Used to specify if we want the presences of the matched members */
  presences?: boolean;

  /** Used to specify which users you wish to fetch */
  user_ids?: Snowflake | Snowflake[];

  /** Nonce to identify the Guild Members Chunk response */
  nonce?: string;
}

/**
 * Request Soundboard Sounds
 * Used to request soundboard sounds for a list of guilds.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#request-soundboard-sounds-request-soundboard-sounds-structure}
 */
export interface RequestSoundboardSoundsEntity {
  /** IDs of the guilds to get soundboard sounds for */
  guild_ids: Snowflake[];
}

/**
 * Update Voice State
 * Sent when a client wants to join, move, or disconnect from a voice channel.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#update-voice-state-gateway-voice-state-update-structure}
 */
export interface UpdateVoiceStateEntity {
  /** ID of the guild */
  guild_id: Snowflake;

  /** ID of the voice channel client wants to join (null if disconnecting) */
  channel_id: Snowflake | null;

  /** Whether the client is muted */
  self_mute: boolean;

  /** Whether the client deafened */
  self_deaf: boolean;
}

/**
 * Gateway Send Events
 * Events sent by an app to Discord through a Gateway connection.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway-events#send-events}
 */
export interface GatewaySendEvents {
  /** Triggers the initial handshake with the gateway */
  [GatewayOpcodes.Identify]: IdentifyEntity;
  /** Resumes a dropped gateway connection */
  [GatewayOpcodes.Resume]: ResumeEntity;
  /** Maintains an active gateway connection */
  [GatewayOpcodes.Heartbeat]: number | null;
  /** Requests members for a guild */
  [GatewayOpcodes.RequestGuildMembers]: RequestGuildMembersEntity;
  /** Requests soundboard sounds in a set of guilds */
  [GatewayOpcodes.RequestSoundboardSounds]: RequestSoundboardSoundsEntity;
  /** Joins, moves, or disconnects the app from a voice channel */
  [GatewayOpcodes.VoiceStateUpdate]: UpdateVoiceStateEntity;
  /** Updates an app's presence */
  [GatewayOpcodes.PresenceUpdate]: UpdatePresenceEntity;
}
