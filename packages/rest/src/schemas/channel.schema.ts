import {
  BitwisePermissionFlags,
  type ChannelEntity,
  ChannelFlags,
  ChannelType,
  type DefaultReactionEntity,
  ForumLayoutType,
  type ForumTagEntity,
  InviteTargetType,
  type OverwriteEntity,
  OverwriteType,
  SnowflakeManager,
  SortOrderType,
  type ThreadMemberEntity,
  VideoQualityMode,
} from "@nyxjs/core";
import { z } from "zod";
import { CreateMessageSchema } from "./message.schema.js";
import { CreateGroupDmSchema } from "./user.schema.js";

export const ModifyChannelGroupDmSchema = z
  .object({
    name: z.string().min(1).max(100),
    icon: z.string(),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#modify-channel-json-params-group-dm}
 */
export type ModifyChannelGroupDmEntity = z.infer<
  typeof ModifyChannelGroupDmSchema
>;

const OverwriteSchema: z.ZodType<OverwriteEntity> = z
  .object({
    id: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX),
    type: z.nativeEnum(OverwriteType),
    allow: z.nativeEnum(BitwisePermissionFlags),
    deny: z.nativeEnum(BitwisePermissionFlags),
  })
  .strict();

const ForumTagSchema: z.ZodType<ForumTagEntity> = z
  .object({
    id: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX),
    name: z.string().max(20),
    moderated: z.boolean(),
    emoji_id: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX).nullable(),
    emoji_name: z.string().nullable(),
  })
  .strict();

const DefaultRactionEmojiSchema: z.ZodType<DefaultReactionEntity> = z
  .object({
    emoji_id: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX).nullable(),
    emoji_name: z.string().nullable(),
  })
  .strict();

export const ModifyChannelGuildChannelSchema = z
  .object({
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
    permission_overwrites: z.array(OverwriteSchema).nullable(),
    parent_id: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX).nullable(),
    rtc_region: z.string().nullable(),
    video_quality_mode: z.nativeEnum(VideoQualityMode).nullable(),
    default_auto_archive_duration: z.number().int().nullable(),
    flags: z
      .union([
        z.literal(ChannelFlags.RequireTag),
        z.literal(ChannelFlags.HideMediaDownloadOptions),
      ])
      .optional(),
    available_tags: z.array(ForumTagSchema).max(20).optional(),
    default_reaction_emoji: DefaultRactionEmojiSchema.optional().nullable(),
    default_thread_rate_limit_per_user: z.number().int().optional(),
    default_sort_order: z.nativeEnum(SortOrderType).optional().nullable(),
    default_forum_layout: z.nativeEnum(ForumLayoutType).optional(),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#modify-channel-json-params-guild-channel}
 */
export type ModifyChannelGuildChannelEntity = z.infer<
  typeof ModifyChannelGuildChannelSchema
>;

export const ModifyChannelThreadSchema = z
  .object({
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
    applied_tags: z
      .array(z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX))
      .max(5)
      .optional(),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#modify-channel-json-params-thread}
 */
export type ModifyChannelThreadEntity = z.infer<
  typeof ModifyChannelThreadSchema
>;

export const EditChannelPermissionsSchema = z
  .object({
    allow: z.nativeEnum(BitwisePermissionFlags).optional().nullable(),
    deny: z.nativeEnum(BitwisePermissionFlags).optional().nullable(),
    type: z.nativeEnum(OverwriteType),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#edit-channel-permissions-json-params}
 */
export type EditChannelPermissionsEntity = z.infer<
  typeof EditChannelPermissionsSchema
>;

export const CreateChannelInviteSchema = z
  .object({
    max_age: z.number().int().min(0).max(604800).default(86400).optional(),
    max_uses: z.number().int().min(0).max(100).default(0).optional(),
    temporary: z.boolean().default(false).optional(),
    unique: z.boolean().default(false).optional(),
    target_type: z.nativeEnum(InviteTargetType).optional(),
    target_user_id: z
      .string()
      .regex(SnowflakeManager.SNOWFLAKE_REGEX)
      .optional(),
    target_application_id: z
      .string()
      .regex(SnowflakeManager.SNOWFLAKE_REGEX)
      .optional(),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#create-channel-invite-json-params}
 */
export type CreateChannelInviteEntity = z.infer<
  typeof CreateChannelInviteSchema
>;

export const AddGroupDmRecipientSchema = CreateGroupDmSchema;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#group-dm-add-recipient-json-params}
 */
export type AddGroupDmRecipientEntity = z.infer<
  typeof AddGroupDmRecipientSchema
>;

export const StartThreadFromMessageSchema = z
  .object({
    name: z.string().min(1).max(100),
    auto_archive_duration: z
      .union([
        z.literal(60),
        z.literal(1440),
        z.literal(4320),
        z.literal(10080),
      ])
      .optional(),
    rate_limit_per_user: z.number().int().max(21600).optional().nullable(),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-from-message-json-params}
 */
export type StartThreadFromMessageEntity = z.infer<
  typeof StartThreadFromMessageSchema
>;

export const StartThreadWithoutMessageSchema =
  StartThreadFromMessageSchema.merge(
    z
      .object({
        type: z
          .union([
            z.literal(ChannelType.AnnouncementThread),
            z.literal(ChannelType.PrivateThread),
            z.literal(ChannelType.PublicThread),
          ])
          .default(ChannelType.PrivateThread)
          .optional(),
        invitable: z.boolean().optional(),
      })
      .strict(),
  );

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-without-message-json-params}
 */
export type StartThreadWithoutMessageEntity = z.infer<
  typeof StartThreadWithoutMessageSchema
>;

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

export const StartThreadInForumOrMediaChannelSchema = CreateMessageSchema.pick({
  files: true,
  payload_json: true,
})
  .merge(
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
      rate_limit_per_user: z.number().int().max(21600).optional().nullable(),
      message: StartThreadInForumOrMediaChannelForumAndMediaThreadMessageSchema,
      applied_tags: z
        .array(z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX))
        .optional(),
    }),
  )
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-in-forum-or-media-channel-jsonform-params}
 */
export type StartThreadInForumOrMediaChannelEntity = z.infer<
  typeof StartThreadInForumOrMediaChannelSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-in-forum-or-media-channel-forum-and-media-thread-message-params-object}
 */
export type StartThreadInForumOrMediaChannelForumAndMediaThreadMessageEntity =
  z.infer<
    typeof StartThreadInForumOrMediaChannelForumAndMediaThreadMessageSchema
  >;

export const ListThreadMembersQuerySchema = z
  .object({
    with_member: z.boolean().optional(),
    after: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX).optional(),
    limit: z.number().int().min(1).max(100).default(100).optional(),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#list-thread-members-query-string-params}
 */
export type ListThreadMembersQueryEntity = z.infer<
  typeof ListThreadMembersQuerySchema
>;

export const ListPublicArchivedThreadsQuerySchema = z
  .object({
    before: z.string().datetime().optional(),
    limit: z.number().int().optional(),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#list-public-archived-threads-query-string-params}
 */
export type ListPublicArchivedThreadsQueryEntity = z.infer<
  typeof ListPublicArchivedThreadsQuerySchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#list-public-archived-threads-response-body}
 */
export interface ListPublicArchivedThreadsResponse {
  threads: ChannelEntity[];
  members: ThreadMemberEntity[];
  has_more: boolean;
}
