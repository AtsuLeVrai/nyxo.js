import {
  BitwisePermissionFlags,
  type ChannelEntity,
  ChannelFlags,
  ChannelType,
  DefaultReactionEntity,
  ForumLayoutType,
  ForumTagEntity,
  InviteTargetType,
  OverwriteEntity,
  OverwriteType,
  Snowflake,
  SortOrderType,
  type ThreadMemberEntity,
  VideoQualityMode,
} from "@nyxjs/core";
import { z } from "zod";
import { CreateMessageEntity } from "./message.schema.js";
import { CreateGroupDmEntity } from "./user.schema.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#modify-channel-json-params-group-dm}
 */
export const ModifyChannelGroupDmEntity = z.object({
  name: z.string().min(1).max(100),
  icon: z.string(),
});

export type ModifyChannelGroupDmEntity = z.infer<
  typeof ModifyChannelGroupDmEntity
>;

/** @see {@link https://discord.com/developers/docs/resources/channel#modify-channel-json-params-guild-channel} */
export const ModifyChannelGuildChannelEntity = z.object({
  name: z.string().min(1).max(100),
  type: z.union([
    z.literal(ChannelType.GuildText),
    z.literal(ChannelType.GuildAnnouncement),
    z.literal(ChannelType.AnnouncementThread),
  ]),
  position: z.number().int().nullable(),
  topic: z.string().max(1024).max(4096).nullable(),
  nsfw: z.boolean().nullable(),
  rate_limit_per_user: z.number().int().max(21600).nullable(),
  bitrate: z.number().int().min(8000).nullable(),
  user_limit: z.number().int().min(0).max(99).max(10000).nullable(),
  permission_overwrites: z.array(OverwriteEntity).nullable(),
  parent_id: Snowflake.nullable(),
  rtc_region: z.string().nullable(),
  video_quality_mode: z.nativeEnum(VideoQualityMode).nullable(),
  default_auto_archive_duration: z.number().int().nullable(),
  flags: z
    .union([
      z.literal(ChannelFlags.RequireTag),
      z.literal(ChannelFlags.HideMediaDownloadOptions),
    ])
    .optional(),
  available_tags: z.array(ForumTagEntity).max(20).optional(),
  default_reaction_emoji: DefaultReactionEntity.nullish(),
  default_thread_rate_limit_per_user: z.number().int().optional(),
  default_sort_order: z.nativeEnum(SortOrderType).nullish(),
  default_forum_layout: z.nativeEnum(ForumLayoutType).optional(),
});

export type ModifyChannelGuildChannelEntity = z.infer<
  typeof ModifyChannelGuildChannelEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#modify-channel-json-params-thread}
 */
export const ModifyChannelThreadEntity = z.object({
  name: z.string().min(1).max(100),
  archived: z.boolean(),
  auto_archive_duration: z.union([
    z.literal(60),
    z.literal(1440),
    z.literal(4320),
    z.literal(10080),
  ]),
  locked: z.boolean(),
  invitable: z.boolean(),
  rate_limit_per_user: z.number().int().max(21600).nullable(),
  flags: z.literal(ChannelFlags.Pinned),
  applied_tags: z.array(Snowflake).max(5).optional(),
});

export type ModifyChannelThreadEntity = z.infer<
  typeof ModifyChannelThreadEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#edit-channel-permissions-json-params}
 */
export const EditChannelPermissionsEntity = z.object({
  allow: z.nativeEnum(BitwisePermissionFlags).nullish(),
  deny: z.nativeEnum(BitwisePermissionFlags).nullish(),
  type: z.nativeEnum(OverwriteType),
});

export type EditChannelPermissionsEntity = z.infer<
  typeof EditChannelPermissionsEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#create-channel-invite-json-params}
 */
export const CreateChannelInviteEntity = z.object({
  max_age: z.number().int().min(0).max(604800).optional().default(86400),
  max_uses: z.number().int().min(0).max(100).optional().default(0),
  temporary: z.boolean().optional().default(false),
  unique: z.boolean().optional().default(false),
  target_type: z.nativeEnum(InviteTargetType).optional(),
  target_user_id: Snowflake.optional(),
  target_application_id: Snowflake.optional(),
});

export type CreateChannelInviteEntity = z.infer<
  typeof CreateChannelInviteEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#group-dm-add-recipient-json-params}
 */
export const AddGroupDmRecipientEntity = CreateGroupDmEntity;

export type AddGroupDmRecipientEntity = z.infer<
  typeof AddGroupDmRecipientEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-from-message-json-params}
 */
export const StartThreadFromMessageEntity = z.object({
  name: z.string().min(1).max(100),
  auto_archive_duration: z
    .union([z.literal(60), z.literal(1440), z.literal(4320), z.literal(10080)])
    .optional(),
  rate_limit_per_user: z.number().int().max(21600).nullish(),
});

export type StartThreadFromMessageEntity = z.infer<
  typeof StartThreadFromMessageEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-without-message-json-params}
 */
export const StartThreadWithoutMessageEntity =
  StartThreadFromMessageEntity.merge(
    z.object({
      type: z
        .union([
          z.literal(ChannelType.AnnouncementThread),
          z.literal(ChannelType.PrivateThread),
          z.literal(ChannelType.PublicThread),
        ])
        .optional()
        .default(ChannelType.PrivateThread),
      invitable: z.boolean().optional(),
    }),
  );

export type StartThreadWithoutMessageEntity = z.infer<
  typeof StartThreadWithoutMessageEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-in-forum-or-media-channel-jsonform-params}
 * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-in-forum-or-media-channel-forum-and-media-thread-message-params-object}
 */
export const StartThreadInForumOrMediaChannelForumAndMediaThreadMessageEntity =
  CreateMessageEntity.pick({
    content: true,
    embeds: true,
    allowed_mentions: true,
    components: true,
    sticker_ids: true,
    attachments: true,
    flags: true,
  });

export type StartThreadInForumOrMediaChannelForumAndMediaThreadMessageEntity =
  z.infer<
    typeof StartThreadInForumOrMediaChannelForumAndMediaThreadMessageEntity
  >;

export const StartThreadInForumOrMediaChannelEntity = CreateMessageEntity.pick({
  files: true,
  payload_json: true,
}).merge(
  z.object({
    name: z.string().min(1).max(100),
    auto_archive_duration: z
      .union([
        z.literal(60),
        z.literal(1440),
        z.literal(4320),
        z.literal(10080),
      ])
      .optional(),
    rate_limit_per_user: z.number().int().max(21600).nullish(),
    message: StartThreadInForumOrMediaChannelForumAndMediaThreadMessageEntity,
    applied_tags: z.array(Snowflake).optional(),
  }),
);

export type StartThreadInForumOrMediaChannelEntity = z.infer<
  typeof StartThreadInForumOrMediaChannelEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#list-thread-members-query-string-params}
 */
export const ListThreadMembersQueryEntity = z.object({
  with_member: z.boolean().optional(),
  after: Snowflake.optional(),
  limit: z.number().int().min(1).max(100).optional().default(100),
});

export type ListThreadMembersQueryEntity = z.infer<
  typeof ListThreadMembersQueryEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#list-public-archived-threads-query-string-params}
 */
export const ListPublicArchivedThreadsQueryEntity = z.object({
  before: z.string().datetime().optional(),
  limit: z.number().int().optional(),
});

export type ListPublicArchivedThreadsQueryEntity = z.infer<
  typeof ListPublicArchivedThreadsQueryEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#list-public-archived-threads-response-body}
 */
export interface ListPublicArchivedThreadsResponseEntity {
  threads: ChannelEntity[];
  members: ThreadMemberEntity[];
  has_more: boolean;
}
