import {
  AutoArchiveDuration,
  BitFieldManager,
  BitwisePermissionFlags,
  ChannelEntity,
  type ChannelFlags,
  ChannelType,
  GroupDmChannelEntity,
  InviteTargetType,
  OverwriteEntity,
  Snowflake,
  type ThreadMemberEntity,
  ThreadMetadataEntity,
} from "@nyxjs/core";
import { z } from "zod";
import { CreateMessageSchema } from "./message.schema.js";
import { CreateGroupDmSchema } from "./user.schema.js";

/**
 * Schema for modifying a Group DM channel.
 * Reuses field definitions from GroupDmChannelEntity for consistency.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#modify-channel-json-params-group-dm}
 */
export const ModifyChannelGroupDmSchema = z.object({
  /** 1-100 character channel name */
  name: GroupDmChannelEntity.shape.name,

  /** Base64 encoded icon */
  icon: z.string(),
});

export type ModifyChannelGroupDmSchema = z.input<
  typeof ModifyChannelGroupDmSchema
>;

/**
 * Schema for modifying a guild channel.
 * Reuses field definitions from ChannelEntity where possible.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#modify-channel-json-params-guild-channel}
 */
export const ModifyChannelGuildChannelSchema = z.object({
  /** 1-100 character channel name */
  name: ChannelEntity.shape.name.optional(),

  /** Type of channel (only conversion between text and announcement is supported) */
  type: z
    .union([
      z.literal(ChannelType.GuildText),
      z.literal(ChannelType.AnnouncementThread),
      z.literal(ChannelType.GuildAnnouncement),
    ])
    .optional(),

  /** Position in the channel list */
  position: ChannelEntity.shape.position,

  /** 0-1024 character channel topic (0-4096 for forum channels) */
  topic: ChannelEntity.shape.topic,

  /** Whether the channel is NSFW */
  nsfw: ChannelEntity.shape.nsfw,

  /** Slowmode rate limit in seconds (0-21600) */
  rate_limit_per_user: z.number().int().min(0).max(21600).optional(),

  /** Bitrate for voice channels (min 8000) */
  bitrate: z.number().int().min(8000).optional(),

  /** User limit for voice channels (0-99) */
  user_limit: z.number().int().min(0).max(99).optional(),

  /** Permission overwrites for the channel */
  permission_overwrites: OverwriteEntity.partial().array().optional(),

  /** ID of the parent category */
  parent_id: ChannelEntity.shape.parent_id,

  /** Voice region ID for the channel */
  rtc_region: ChannelEntity.shape.rtc_region,

  /** Video quality mode of the voice channel */
  video_quality_mode: ChannelEntity.shape.video_quality_mode,

  /** Default auto-archive duration for threads */
  default_auto_archive_duration: AutoArchiveDuration.optional(),

  /** Channel flags combined as a bitfield */
  flags: z.custom<ChannelFlags>(BitFieldManager.isValidBitField),

  /** Set of tags that can be used in a forum channel */
  available_tags: ChannelEntity.shape.available_tags,

  /** Default emoji for forum thread reactions */
  default_reaction_emoji: ChannelEntity.shape.default_reaction_emoji,

  /** Default slowmode for new threads */
  default_thread_rate_limit_per_user: z.number().int().optional(),

  /** Default sort order for forum posts */
  default_sort_order: ChannelEntity.shape.default_sort_order,

  /** Default forum layout view */
  default_forum_layout: ChannelEntity.shape.default_forum_layout,
});

export type ModifyChannelGuildChannelSchema = z.input<
  typeof ModifyChannelGuildChannelSchema
>;

/**
 * Schema for modifying a thread.
 * Reuses fields from ThreadMetadataEntity for consistency.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#modify-channel-json-params-thread}
 */
export const ModifyChannelThreadSchema = z.object({
  /** 1-100 character thread name */
  name: ChannelEntity.shape.name.optional(),

  /** Whether the thread is archived */
  archived: ThreadMetadataEntity.shape.archived.optional(),

  /** Auto-archive duration in minutes */
  auto_archive_duration:
    ThreadMetadataEntity.shape.auto_archive_duration.optional(),

  /** Whether the thread is locked */
  locked: ThreadMetadataEntity.shape.locked.optional(),

  /** Whether non-moderators can add other non-moderators */
  invitable: ThreadMetadataEntity.shape.invitable.optional(),

  /** Slowmode rate limit in seconds (0-21600) */
  rate_limit_per_user: z.number().int().max(21600).optional(),

  /** Thread flags combined as a bitfield */
  flags: z.custom<ChannelFlags>(BitFieldManager.isValidBitField).optional(),

  /** IDs of tags applied to a forum thread */
  applied_tags: Snowflake.array().optional(),
});

export type ModifyChannelThreadSchema = z.input<
  typeof ModifyChannelThreadSchema
>;

/**
 * Schema for editing channel permissions.
 * Reuses fields from OverwriteEntity for consistency.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#edit-channel-permissions-json-params}
 */
export const EditChannelPermissionsSchema = z.object({
  /** Bitwise value of all allowed permissions */
  allow: z.nativeEnum(BitwisePermissionFlags).nullish(),

  /** Bitwise value of all disallowed permissions */
  deny: z.nativeEnum(BitwisePermissionFlags).nullish(),

  /** Type of overwrite: role (0) or member (1) */
  type: OverwriteEntity.shape.type,
});

export type EditChannelPermissionsSchema = z.input<
  typeof EditChannelPermissionsSchema
>;

/**
 * Schema for creating a channel invite.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#create-channel-invite-json-params}
 */
export const CreateChannelInviteSchema = z.object({
  /** Duration of invite in seconds before expiry (0-604800) */
  max_age: z.number().int().min(0).max(604800).default(86400),

  /** Maximum number of uses (0-100) */
  max_uses: z.number().int().min(0).max(100).default(0),

  /** Whether this invite only grants temporary membership */
  temporary: z.boolean().default(false),

  /** Whether to create a unique one-time use invite */
  unique: z.boolean().default(false),

  /** The type of target for this voice channel invite */
  target_type: z.nativeEnum(InviteTargetType).optional(),

  /** The ID of the user whose stream to display */
  target_user_id: Snowflake.optional(),

  /** The ID of the embedded application to open */
  target_application_id: Snowflake.optional(),
});

export type CreateChannelInviteSchema = z.input<
  typeof CreateChannelInviteSchema
>;

/**
 * Schema for adding a recipient to a Group DM.
 * Reuses CreateGroupDmSchema for consistency.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#group-dm-add-recipient-json-params}
 */
export const AddGroupDmRecipientSchema = CreateGroupDmSchema;

export type AddGroupDmRecipientSchema = z.input<
  typeof AddGroupDmRecipientSchema
>;

/**
 * Schema for starting a thread from a message.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-from-message-json-params}
 */
export const StartThreadFromMessageSchema = z.object({
  /** 1-100 character thread name */
  name: ChannelEntity.shape.name,

  /** Auto-archive duration in minutes */
  auto_archive_duration: AutoArchiveDuration.optional(),

  /** Slowmode rate limit in seconds (0-21600) */
  rate_limit_per_user: z.number().int().max(21600).nullish(),
});

export type StartThreadFromMessageSchema = z.input<
  typeof StartThreadFromMessageSchema
>;

/**
 * Schema for starting a thread without a message.
 * Extends StartThreadFromMessageSchema for consistency.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-without-message-json-params}
 */
export const StartThreadWithoutMessageSchema =
  StartThreadFromMessageSchema.extend({
    /** Type of thread to create */
    type: z
      .union([
        z.literal(ChannelType.AnnouncementThread),
        z.literal(ChannelType.PrivateThread),
        z.literal(ChannelType.PublicThread),
      ])
      .optional()
      .default(ChannelType.PrivateThread),

    /** Whether non-moderators can add other non-moderators */
    invitable: z.boolean().optional(),
  });

export type StartThreadWithoutMessageSchema = z.input<
  typeof StartThreadWithoutMessageSchema
>;

/**
 * Schema for the message portion of starting a thread in a forum or media channel.
 * Reuses fields from CreateMessageSchema for consistency.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-in-forum-or-media-channel-forum-and-media-thread-message-params-object}
 */
export const StartThreadInForumOrMediaChannelForumAndMediaThreadMessageSchema =
  CreateMessageSchema.pick({
    content: true,
    embeds: true,
    allowed_mentions: true,
    components: true,
    sticker_ids: true,
    attachments: true,
    flags: true,
  });

export type StartThreadInForumOrMediaChannelForumAndMediaThreadMessageSchema =
  z.input<
    typeof StartThreadInForumOrMediaChannelForumAndMediaThreadMessageSchema
  >;

/**
 * Schema for starting a thread in a forum or media channel.
 * Reuses fields from CreateMessageSchema and extends with thread-specific fields.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-in-forum-or-media-channel-jsonform-params}
 */
export const StartThreadInForumOrMediaChannelSchema = CreateMessageSchema.pick({
  files: true,
  payload_json: true,
}).extend({
  /** 1-100 character thread name */
  name: ChannelEntity.shape.name,

  /** Auto-archive duration in minutes */
  auto_archive_duration: AutoArchiveDuration.optional(),

  /** Slowmode rate limit in seconds (0-21600) */
  rate_limit_per_user: z.number().int().max(21600).nullish(),

  /** Contents of the first message in the thread */
  message: StartThreadInForumOrMediaChannelForumAndMediaThreadMessageSchema,

  /** IDs of tags applied to the thread */
  applied_tags: Snowflake.array().optional(),
});

export type StartThreadInForumOrMediaChannelSchema = z.input<
  typeof StartThreadInForumOrMediaChannelSchema
>;

/**
 * Schema for query parameters when listing thread members.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#list-thread-members-query-string-params}
 */
export const ListThreadMembersQuerySchema = z.object({
  /** Whether to include a guild member object for each thread member */
  with_member: z.boolean().optional(),

  /** Get thread members after this user ID */
  after: Snowflake.optional(),

  /** Maximum number of members to return (1-100) */
  limit: z.number().int().min(1).max(100).default(100),
});

export type ListThreadMembersQuerySchema = z.input<
  typeof ListThreadMembersQuerySchema
>;

/**
 * Schema for query parameters when listing public archived threads.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#list-public-archived-threads-query-string-params}
 */
export const ListPublicArchivedThreadsQuerySchema = z.object({
  /** Returns threads archived before this timestamp */
  before: z.string().datetime().optional(),

  /** Maximum number of threads to return */
  limit: z.number().int().optional(),
});

export type ListPublicArchivedThreadsQuerySchema = z.input<
  typeof ListPublicArchivedThreadsQuerySchema
>;

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
