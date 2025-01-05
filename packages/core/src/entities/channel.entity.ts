import { z } from "zod";
import { BitwisePermissionFlags } from "../enums/index.js";
import { BitFieldManager, SnowflakeSchema } from "../managers/index.js";
import { GuildMemberSchema } from "./guild.entity.js";
import { UserSchema } from "./user.entity.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#forum-tag-object-forum-tag-structure}
 */
export const ForumTagSchema = z
  .object({
    id: SnowflakeSchema,
    name: z.string(),
    moderated: z.boolean(),
    emoji_id: SnowflakeSchema.nullable(),
    emoji_name: z.string().nullable(),
  })
  .strict();

export type ForumTagEntity = z.infer<typeof ForumTagSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#default-reaction-object}
 */
export const DefaultReactionSchema = z
  .object({
    emoji_id: SnowflakeSchema.nullable(),
    emoji_name: z.string().nullable(),
  })
  .strict();

export type DefaultReactionEntity = z.infer<typeof DefaultReactionSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#thread-member-object}
 */
export const ThreadMemberSchema = z
  .object({
    id: SnowflakeSchema.optional(),
    user_id: SnowflakeSchema.optional(),
    join_timestamp: z.string().datetime(),
    flags: z.number().int(),
    member: z.lazy(() => GuildMemberSchema.optional()),
  })
  .strict();

export type ThreadMemberEntity = z.infer<typeof ThreadMemberSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#thread-metadata-object}
 */
export const ThreadMetadataSchema = z
  .object({
    archived: z.boolean(),
    auto_archive_duration: z.union([
      z.literal(60),
      z.literal(1440),
      z.literal(4320),
      z.literal(10080),
    ]),
    archive_timestamp: z.string().datetime(),
    locked: z.boolean(),
    invitable: z.boolean().optional(),
    create_timestamp: z.string().datetime().nullish(),
  })
  .strict();

export type ThreadMetadataEntity = z.infer<typeof ThreadMetadataSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#overwrite-object-overwrite-structure}
 */
export const OverwriteType = {
  role: 0,
  member: 1,
} as const;

export type OverwriteType = (typeof OverwriteType)[keyof typeof OverwriteType];

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#overwrite-object}
 */
export const OverwriteSchema = z
  .object({
    id: SnowflakeSchema,
    type: z.nativeEnum(OverwriteType),
    allow: z
      .array(z.nativeEnum(BitwisePermissionFlags))
      .transform((flags) => BitFieldManager.combine(flags)),
    deny: z
      .array(z.nativeEnum(BitwisePermissionFlags))
      .transform((flags) => BitFieldManager.combine(flags)),
  })
  .strict();

export type OverwriteEntity = z.infer<typeof OverwriteSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#followed-channel-object}
 */
export const FollowedChannelSchema = z
  .object({
    channel_id: SnowflakeSchema,
    webhook_id: SnowflakeSchema,
  })
  .strict();

export type FollowedChannelEntity = z.infer<typeof FollowedChannelSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-forum-layout-types}
 */
export const ForumLayoutType = {
  notSet: 0,
  listView: 1,
  galleryView: 2,
} as const;

export type ForumLayoutType =
  (typeof ForumLayoutType)[keyof typeof ForumLayoutType];

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-sort-order-types}
 */
export const SortOrderType = {
  latestActivity: 0,
  creationDate: 1,
} as const;

export type SortOrderType = (typeof SortOrderType)[keyof typeof SortOrderType];

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-flags}
 */
export const ChannelFlags = {
  pinned: 1 << 1,
  requireTag: 1 << 4,
  hideMediaDownloadOptions: 1 << 15,
} as const;

export type ChannelFlags = (typeof ChannelFlags)[keyof typeof ChannelFlags];

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-video-quality-modes}
 */
export const VideoQualityMode = {
  auto: 1,
  full: 2,
} as const;

export type VideoQualityMode =
  (typeof VideoQualityMode)[keyof typeof VideoQualityMode];

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-types}
 */
export const ChannelType = {
  guildText: 0,
  dm: 1,
  guildVoice: 2,
  groupDm: 3,
  guildCategory: 4,
  guildAnnouncement: 5,
  announcementThread: 10,
  publicThread: 11,
  privateThread: 12,
  guildStageVoice: 13,
  guildDirectory: 14,
  guildForum: 15,
  guildMedia: 16,
} as const;

export type ChannelType = (typeof ChannelType)[keyof typeof ChannelType];

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-structure}
 */
export const ChannelSchema = z
  .object({
    id: SnowflakeSchema,
    type: z.nativeEnum(ChannelType),
    guild_id: SnowflakeSchema.optional(),
    position: z.number().int().optional(),
    permission_overwrites: z.array(OverwriteSchema).optional(),
    name: z.string().nullish(),
    topic: z.string().nullish(),
    nsfw: z.boolean().optional(),
    last_message_id: SnowflakeSchema.nullish(),
    bitrate: z.number().int().optional(),
    user_limit: z.number().int().optional(),
    rate_limit_per_user: z.number().int().optional(),
    recipients: z.array(z.lazy(() => UserSchema)).optional(),
    icon: z.string().nullish(),
    owner_id: SnowflakeSchema.optional(),
    application_id: SnowflakeSchema.optional(),
    managed: z.boolean().optional(),
    parent_id: SnowflakeSchema.nullish(),
    last_pin_timestamp: z.string().datetime().nullish(),
    rtc_region: z.string().nullish(),
    video_quality_mode: z.nativeEnum(VideoQualityMode).optional(),
    message_count: z.number().int().optional(),
    member_count: z.number().int().optional(),
    thread_metadata: ThreadMetadataSchema.optional(),
    member: ThreadMemberSchema.optional(),
    default_auto_archive_duration: z
      .union([
        z.literal(60),
        z.literal(1440),
        z.literal(4320),
        z.literal(10080),
      ])
      .optional(),
    permissions: z.string().optional(),
    flags: z
      .nativeEnum(ChannelFlags)
      .transform((value) => new BitFieldManager<ChannelFlags>(value)),
    total_message_sent: z.number().int().optional(),
    available_tags: z.array(ForumTagSchema).optional(),
    applied_tags: z.array(SnowflakeSchema).optional(),
    default_reaction_emoji: DefaultReactionSchema.nullish(),
    default_thread_rate_limit_per_user: z.number().int().optional(),
    default_sort_order: z.nativeEnum(SortOrderType).nullish(),
    default_forum_layout: z.nativeEnum(ForumLayoutType).optional(),
  })
  .strict();

export type ChannelEntity = z.infer<typeof ChannelSchema>;

/**
 * Guild Text Channel - {@link ChannelType.guildText}
 */
export const GuildTextChannelSchema = ChannelSchema.extend({
  type: z.literal(ChannelType.guildText),
  guild_id: SnowflakeSchema,
})
  .strict()
  .omit({
    bitrate: true,
    user_limit: true,
    recipients: true,
    icon: true,
    owner_id: true,
    application_id: true,
    managed: true,
    thread_metadata: true,
    member: true,
    available_tags: true,
  });

export type GuildTextChannelEntity = z.infer<typeof GuildTextChannelSchema>;

/**
 * DM Channel - {@link ChannelType.dm}
 */
export const DmChannelSchema = ChannelSchema.extend({
  type: z.literal(ChannelType.dm),
  recipients: z.array(z.lazy(() => UserSchema)),
})
  .strict()
  .omit({
    guild_id: true,
    position: true,
    permission_overwrites: true,
    name: true,
    topic: true,
    nsfw: true,
    bitrate: true,
    user_limit: true,
    parent_id: true,
    rtc_region: true,
    video_quality_mode: true,
    thread_metadata: true,
    default_auto_archive_duration: true,
    flags: true,
    available_tags: true,
  });

export type DmChannelEntity = z.infer<typeof DmChannelSchema>;

/**
 * Guild Voice Channel - {@link ChannelType.guildVoice}
 */
export const GuildVoiceChannelSchema = ChannelSchema.extend({
  type: z.literal(ChannelType.guildVoice),
  guild_id: SnowflakeSchema,
  bitrate: z.number().int(),
  user_limit: z.number().int(),
})
  .strict()
  .omit({
    recipients: true,
    icon: true,
    owner_id: true,
    application_id: true,
    managed: true,
    thread_metadata: true,
    member: true,
    message_count: true,
    available_tags: true,
    applied_tags: true,
    default_reaction_emoji: true,
    default_thread_rate_limit_per_user: true,
    default_sort_order: true,
    default_forum_layout: true,
  });

export type GuildVoiceChannelEntity = z.infer<typeof GuildVoiceChannelSchema>;

/**
 * Group DM Channel - {@link ChannelType.groupDm}
 */
export const GroupDmChannelSchema = ChannelSchema.extend({
  type: z.literal(ChannelType.groupDm),
  recipients: z.array(z.lazy(() => UserSchema)),
  owner_id: SnowflakeSchema,
})
  .strict()
  .omit({
    guild_id: true,
    position: true,
    permission_overwrites: true,
    nsfw: true,
    bitrate: true,
    user_limit: true,
    parent_id: true,
    rate_limit_per_user: true,
    rtc_region: true,
    video_quality_mode: true,
    thread_metadata: true,
    default_auto_archive_duration: true,
    flags: true,
    available_tags: true,
  });

export type GroupDmChannelEntity = z.infer<typeof GroupDmChannelSchema>;

/**
 * Guild Category Channel - {@link ChannelType.guildCategory}
 */
export const GuildCategoryChannelSchema = ChannelSchema.extend({
  type: z.literal(ChannelType.guildCategory),
  guild_id: SnowflakeSchema,
})
  .strict()
  .omit({
    topic: true,
    last_message_id: true,
    bitrate: true,
    user_limit: true,
    rate_limit_per_user: true,
    recipients: true,
    icon: true,
    owner_id: true,
    application_id: true,
    managed: true,
    parent_id: true,
    last_pin_timestamp: true,
    rtc_region: true,
    video_quality_mode: true,
    message_count: true,
    member_count: true,
    thread_metadata: true,
    member: true,
    default_auto_archive_duration: true,
    available_tags: true,
  });

export type GuildCategoryChannelEntity = z.infer<
  typeof GuildCategoryChannelSchema
>;

/**
 * Guild Announcement Channel - {@link ChannelType.guildAnnouncement}
 */
export const GuildAnnouncementChannelSchema = ChannelSchema.extend({
  type: z.literal(ChannelType.guildAnnouncement),
  guild_id: SnowflakeSchema,
})
  .strict()
  .omit({
    bitrate: true,
    user_limit: true,
    rate_limit_per_user: true,
    recipients: true,
    icon: true,
    owner_id: true,
    application_id: true,
    managed: true,
    rtc_region: true,
    video_quality_mode: true,
    message_count: true,
    member_count: true,
    thread_metadata: true,
    member: true,
    available_tags: true,
    applied_tags: true,
    default_reaction_emoji: true,
    default_thread_rate_limit_per_user: true,
    default_sort_order: true,
    default_forum_layout: true,
  });

export type GuildAnnouncementChannelEntity = z.infer<
  typeof GuildAnnouncementChannelSchema
>;

/**
 * Thread Channel Base - {@link ChannelType.publicThread}
 */
export const PublicThreadChannelSchema = ChannelSchema.extend({
  type: z.literal(ChannelType.publicThread),
  guild_id: SnowflakeSchema,
  thread_metadata: ThreadMetadataSchema,
  parent_id: SnowflakeSchema,
})
  .strict()
  .omit({
    permission_overwrites: true,
    topic: true,
    bitrate: true,
    user_limit: true,
    recipients: true,
    icon: true,
    application_id: true,
    managed: true,
    rtc_region: true,
    video_quality_mode: true,
    default_auto_archive_duration: true,
    default_forum_layout: true,
  });

export type PublicThreadChannelEntity = z.infer<
  typeof PublicThreadChannelSchema
>;

/**
 * Thread Channel Base - {@link ChannelType.privateThread}
 */
export const PrivateThreadChannelSchema = PublicThreadChannelSchema.extend({
  type: z.literal(ChannelType.privateThread),
});

export type PrivateThreadChannelEntity = z.infer<
  typeof PrivateThreadChannelSchema
>;

/**
 * Thread Channel Base - {@link ChannelType.announcementThread}
 */
export const AnnouncementThreadChannelSchema = PublicThreadChannelSchema.extend(
  {
    type: z.literal(ChannelType.announcementThread),
  },
);

export type AnnouncementThreadChannelEntity = z.infer<
  typeof AnnouncementThreadChannelSchema
>;

// Export union type of all thread channel types
export const AnyThreadChannelSchema = z.union([
  PublicThreadChannelSchema,
  PrivateThreadChannelSchema,
  AnnouncementThreadChannelSchema,
]);

export type AnyThreadChannelEntity = z.infer<typeof AnyThreadChannelSchema>;

/**
 * Guild Stage Voice Channel - {@link ChannelType.guildStageVoice}
 */
export const GuildStageVoiceChannelSchema = ChannelSchema.extend({
  type: z.literal(ChannelType.guildStageVoice),
  guild_id: SnowflakeSchema,
  bitrate: z.number().int(),
  user_limit: z.number().int(),
})
  .strict()
  .omit({
    last_message_id: true,
    recipients: true,
    icon: true,
    owner_id: true,
    application_id: true,
    managed: true,
    thread_metadata: true,
    member: true,
    message_count: true,
    member_count: true,
    default_auto_archive_duration: true,
    available_tags: true,
    applied_tags: true,
    default_reaction_emoji: true,
    default_thread_rate_limit_per_user: true,
    default_sort_order: true,
    default_forum_layout: true,
  });

export type GuildStageVoiceChannelEntity = z.infer<
  typeof GuildStageVoiceChannelSchema
>;

/**
 * Guild Forum Channel - {@link ChannelType.guildForum}
 */
export const GuildForumChannelSchema = ChannelSchema.extend({
  type: z.literal(ChannelType.guildForum),
  guild_id: SnowflakeSchema,
  available_tags: z.array(ForumTagSchema),
})
  .strict()
  .omit({
    bitrate: true,
    user_limit: true,
    recipients: true,
    icon: true,
    owner_id: true,
    application_id: true,
    managed: true,
    rtc_region: true,
    video_quality_mode: true,
    message_count: true,
    member_count: true,
    thread_metadata: true,
    member: true,
    last_message_id: true,
  });

export type GuildForumChannelEntity = z.infer<typeof GuildForumChannelSchema>;

/**
 * Guild Media Channel - {@link ChannelType.guildMedia}
 */
export const GuildMediaChannelSchema = ChannelSchema.extend({
  type: z.literal(ChannelType.guildMedia),
  guild_id: SnowflakeSchema,
  available_tags: z.array(ForumTagSchema),
})
  .strict()
  .omit({
    bitrate: true,
    user_limit: true,
    recipients: true,
    icon: true,
    owner_id: true,
    application_id: true,
    managed: true,
    rtc_region: true,
    video_quality_mode: true,
    message_count: true,
    member_count: true,
    thread_metadata: true,
    member: true,
    last_message_id: true,
    default_forum_layout: true,
  });

export type GuildMediaChannelEntity = z.infer<typeof GuildMediaChannelSchema>;

// Export union type of all channel types
export const AnyChannelSchema = z.discriminatedUnion("type", [
  GuildTextChannelSchema,
  DmChannelSchema,
  GuildVoiceChannelSchema,
  GroupDmChannelSchema,
  GuildCategoryChannelSchema,
  GuildAnnouncementChannelSchema,
  PublicThreadChannelSchema,
  PrivateThreadChannelSchema,
  AnnouncementThreadChannelSchema,
  GuildStageVoiceChannelSchema,
  GuildForumChannelSchema,
  GuildMediaChannelSchema,
]);

export type AnyChannelEntity = z.infer<typeof AnyChannelSchema>;
