import type {
  AutoArchiveDuration,
  BitwisePermissionFlags,
  ChannelEntity,
  ChannelFlags,
  ChannelType,
  DefaultReactionEntity,
  ForumTagEntity,
  InviteTargetType,
  OverwriteEntity,
  Snowflake,
  ThreadMemberEntity,
} from "@nyxjs/core";
import type { CreateMessageSchema } from "./message.schema.js";
import type { CreateGroupDmSchema } from "./user.schema.js";

/**
 * Interface for modifying a Group DM channel.
 * Reuses field definitions from GroupDmChannelEntity for consistency.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#modify-channel-json-params-group-dm}
 */
export interface ModifyChannelGroupDmSchema {
  /**
   * 1-100 character channel name
   *
   * @minLength 1
   * @maxLength 100
   */
  name: string;

  /** Base64 encoded icon */
  icon: string;
}

/**
 * Interface for modifying a guild channel.
 * Reuses field definitions from ChannelEntity where possible.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#modify-channel-json-params-guild-channel}
 */
export interface ModifyChannelGuildChannelSchema {
  /**
   * 1-100 character channel name
   *
   * @minLength 1
   * @maxLength 100
   * @optional
   */
  name?: string;

  /**
   * Type of channel (only conversion between text and announcement is supported)
   *
   * @optional
   */
  type?:
    | ChannelType.GuildText
    | ChannelType.AnnouncementThread
    | ChannelType.GuildAnnouncement;

  /** Position in the channel list */
  position?: number;

  /**
   * 0-1024 character channel topic (0-4096 for forum channels)
   *
   * @maxLength 4096
   * @optional
   */
  topic?: string | null;

  /**
   * Whether the channel is NSFW
   *
   * @optional
   */
  nsfw?: boolean;

  /**
   * Slowmode rate limit in seconds (0-21600)
   *
   * @minimum 0
   * @maximum 21600
   * @integer
   * @optional
   */
  rate_limit_per_user?: number;

  /**
   * Bitrate for voice channels (min 8000)
   *
   * @minimum 8000
   * @integer
   * @optional
   */
  bitrate?: number;

  /**
   * User limit for voice channels (0-99)
   *
   * @minimum 0
   * @maximum 99
   * @integer
   * @optional
   */
  user_limit?: number;

  /**
   * Permission overwrites for the channel
   *
   * @optional
   */
  permission_overwrites?: Partial<OverwriteEntity>[];

  /**
   * ID of the parent category
   *
   * @nullable
   * @optional
   */
  parent_id?: Snowflake | null;

  /**
   * Voice region ID for the channel
   *
   * @nullable
   * @optional
   */
  rtc_region?: string | null;

  /**
   * Video quality mode of the voice channel
   *
   * @optional
   */
  video_quality_mode?: number;

  /**
   * Default auto-archive duration for threads
   *
   * @optional
   */
  default_auto_archive_duration?: AutoArchiveDuration;

  /**
   * Channel flags combined as a bitfield
   */
  flags?: ChannelFlags;

  /**
   * Set of tags that can be used in a forum channel
   *
   * @optional
   */
  available_tags?: ForumTagEntity[];

  /**
   * Default emoji for forum thread reactions
   *
   * @nullable
   * @optional
   */
  default_reaction_emoji?: DefaultReactionEntity | null;

  /**
   * Default slowmode for new threads
   *
   * @integer
   * @optional
   */
  default_thread_rate_limit_per_user?: number;

  /**
   * Default sort order for forum posts
   *
   * @nullable
   * @optional
   */
  default_sort_order?: number | null;

  /**
   * Default forum layout view
   *
   * @optional
   */
  default_forum_layout?: number;
}

/**
 * Interface for modifying a thread.
 * Reuses fields from ThreadMetadataEntity for consistency.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#modify-channel-json-params-thread}
 */
export interface ModifyChannelThreadSchema {
  /**
   * 1-100 character thread name
   *
   * @minLength 1
   * @maxLength 100
   * @optional
   */
  name?: string;

  /**
   * Whether the thread is archived
   *
   * @optional
   */
  archived?: boolean;

  /**
   * Auto-archive duration in minutes
   *
   * @optional
   */
  auto_archive_duration?: AutoArchiveDuration;

  /**
   * Whether the thread is locked
   *
   * @optional
   */
  locked?: boolean;

  /**
   * Whether non-moderators can add other non-moderators
   *
   * @optional
   */
  invitable?: boolean;

  /**
   * Slowmode rate limit in seconds (0-21600)
   *
   * @maximum 21600
   * @integer
   * @optional
   */
  rate_limit_per_user?: number;

  /**
   * Thread flags combined as a bitfield
   *
   * @optional
   */
  flags?: ChannelFlags;

  /**
   * IDs of tags applied to a forum thread
   *
   * @optional
   */
  applied_tags?: Snowflake[];
}

/**
 * Interface for editing channel permissions.
 * Reuses fields from OverwriteEntity for consistency.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#edit-channel-permissions-json-params}
 */
export interface EditChannelPermissionsSchema {
  /**
   * Bitwise value of all allowed permissions
   *
   * @nullable
   * @optional
   */
  allow?: BitwisePermissionFlags | null;

  /**
   * Bitwise value of all disallowed permissions
   *
   * @nullable
   * @optional
   */
  deny?: BitwisePermissionFlags | null;

  /** Type of overwrite: role (0) or member (1) */
  type: number;
}

/**
 * Interface for creating a channel invite.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#create-channel-invite-json-params}
 */
export interface CreateChannelInviteSchema {
  /**
   * Duration of invite in seconds before expiry (0-604800)
   *
   * @minimum 0
   * @maximum 604800
   * @default 86400
   * @integer
   */
  max_age: number;

  /**
   * Maximum number of uses (0-100)
   *
   * @minimum 0
   * @maximum 100
   * @default 0
   * @integer
   */
  max_uses: number;

  /**
   * Whether this invite only grants temporary membership
   *
   * @default false
   */
  temporary: boolean;

  /**
   * Whether to create a unique one-time use invite
   *
   * @default false
   */
  unique: boolean;

  /**
   * The type of target for this voice channel invite
   *
   * @optional
   */
  target_type?: InviteTargetType;

  /**
   * The ID of the user whose stream to display
   *
   * @optional
   */
  target_user_id?: Snowflake;

  /**
   * The ID of the embedded application to open
   *
   * @optional
   */
  target_application_id?: Snowflake;
}

/**
 * Interface for adding a recipient to a Group DM.
 * Reuses CreateGroupDmSchema for consistency.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#group-dm-add-recipient-json-params}
 */
export type AddGroupDmRecipientSchema = CreateGroupDmSchema;

/**
 * Interface for starting a thread from a message.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-from-message-json-params}
 */
export interface StartThreadFromMessageSchema {
  /**
   * 1-100 character thread name
   *
   * @minLength 1
   * @maxLength 100
   */
  name: string;

  /**
   * Auto-archive duration in minutes
   *
   * @optional
   */
  auto_archive_duration?: AutoArchiveDuration;

  /**
   * Slowmode rate limit in seconds (0-21600)
   *
   * @maximum 21600
   * @integer
   * @nullable
   * @optional
   */
  rate_limit_per_user?: number | null;
}

/**
 * Interface for starting a thread without a message.
 * Extends StartThreadFromMessageSchema for consistency.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-without-message-json-params}
 */
export interface StartThreadWithoutMessageSchema
  extends StartThreadFromMessageSchema {
  /**
   * Type of thread to create
   *
   * @default ChannelType.PrivateThread
   * @optional
   */
  type?:
    | ChannelType.AnnouncementThread
    | ChannelType.PrivateThread
    | ChannelType.PublicThread;

  /**
   * Whether non-moderators can add other non-moderators
   *
   * @optional
   */
  invitable?: boolean;
}

/**
 * Interface for the message portion of starting a thread in a forum or media channel.
 * Reuses fields from CreateMessageSchema for consistency.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-in-forum-or-media-channel-forum-and-media-thread-message-params-object}
 */
export type StartThreadInForumOrMediaChannelForumAndMediaThreadMessageSchema =
  Pick<
    CreateMessageSchema,
    | "content"
    | "embeds"
    | "allowed_mentions"
    | "components"
    | "sticker_ids"
    | "attachments"
    | "flags"
  >;

/**
 * Interface for starting a thread in a forum or media channel.
 * Reuses fields from CreateMessageSchema and extends with thread-specific fields.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-in-forum-or-media-channel-jsonform-params}
 */
export interface StartThreadInForumOrMediaChannelSchema
  extends Pick<CreateMessageSchema, "files" | "payload_json"> {
  /**
   * 1-100 character thread name
   *
   * @minLength 1
   * @maxLength 100
   */
  name: string;

  /**
   * Auto-archive duration in minutes
   *
   * @optional
   */
  auto_archive_duration?: AutoArchiveDuration;

  /**
   * Slowmode rate limit in seconds (0-21600)
   *
   * @maximum 21600
   * @integer
   * @nullable
   * @optional
   */
  rate_limit_per_user?: number | null;

  /** Contents of the first message in the thread */
  message: StartThreadInForumOrMediaChannelForumAndMediaThreadMessageSchema;

  /**
   * IDs of tags applied to the thread
   *
   * @optional
   */
  applied_tags?: Snowflake[];
}

/**
 * Interface for query parameters when listing thread members.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#list-thread-members-query-string-params}
 */
export interface ListThreadMembersQuerySchema {
  /**
   * Whether to include a guild member object for each thread member
   *
   * @optional
   */
  with_member?: boolean;

  /**
   * Get thread members after this user ID
   *
   * @optional
   */
  after?: Snowflake;

  /**
   * Maximum number of members to return (1-100)
   *
   * @minimum 1
   * @maximum 100
   * @default 100
   * @integer
   */
  limit?: number;
}

/**
 * Interface for query parameters when listing public archived threads.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#list-public-archived-threads-query-string-params}
 */
export interface ListPublicArchivedThreadsQuerySchema {
  /**
   * Returns threads archived before this timestamp
   *
   * @format datetime
   * @optional
   */
  before?: string;

  /**
   * Maximum number of threads to return
   *
   * @integer
   * @optional
   */
  limit?: number;
}

/**
 * Response interface for listing public archived threads.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#list-public-archived-threads-response-body}
 */
export interface ListPublicArchivedThreadsResponseEntity {
  /** Array of thread channel objects */
  threads: ChannelEntity[];

  /** Array of thread member objects for threads the current user has joined */
  members: ThreadMemberEntity[];

  /** Whether there are potentially more threads that could be returned */
  has_more: boolean;
}
