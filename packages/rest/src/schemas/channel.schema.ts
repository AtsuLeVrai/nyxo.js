import {
  BitwisePermissionFlags,
  type ChannelEntity,
  ChannelFlags,
  ChannelType,
  DefaultReactionSchema,
  ForumLayoutType,
  ForumTagSchema,
  InviteTargetType,
  OverwriteSchema,
  OverwriteType,
  SnowflakeSchema,
  SortOrderType,
  type ThreadMemberEntity,
  VideoQualityMode,
} from "@nyxjs/core";
import { z } from "zod";
import { CreateMessageSchema } from "./message.schema.js";
import { CreateGroupDmSchema } from "./user.schema.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#modify-channel-json-params-group-dm}
 */
export const ModifyChannelGroupDmSchema = z
  .object({
    name: z.string().min(1).max(100),
    icon: z.string(),
  })
  .strict();

export type ModifyChannelGroupDmEntity = z.infer<
  typeof ModifyChannelGroupDmSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#modify-channel-json-params-guild-channel}
 */
export const ModifyChannelGuildChannelSchema = z
  .object({
    name: z.string().min(1).max(100),
    type: z.union([
      z.literal(ChannelType.guildText),
      z.literal(ChannelType.guildAnnouncement),
      z.literal(ChannelType.announcementThread),
    ]),
    position: z.number().int().nullable(),
    topic: z.string().max(1024).max(4096).nullable(),
    nsfw: z.boolean().nullable(),
    rate_limit_per_user: z.number().int().max(21600).nullable(),
    bitrate: z.number().int().min(8000).nullable(),
    user_limit: z.number().int().min(0).max(99).max(10000).nullable(),
    permission_overwrites: z.array(OverwriteSchema).nullable(),
    parent_id: SnowflakeSchema.nullable(),
    rtc_region: z.string().nullable(),
    video_quality_mode: z.nativeEnum(VideoQualityMode).nullable(),
    default_auto_archive_duration: z.number().int().nullable(),
    flags: z
      .union([
        z.literal(ChannelFlags.requireTag),
        z.literal(ChannelFlags.hideMediaDownloadOptions),
      ])
      .optional(),
    available_tags: z.array(ForumTagSchema).max(20).optional(),
    default_reaction_emoji: DefaultReactionSchema.nullish(),
    default_thread_rate_limit_per_user: z.number().int().optional(),
    default_sort_order: z.nativeEnum(SortOrderType).nullish(),
    default_forum_layout: z.nativeEnum(ForumLayoutType).optional(),
  })
  .strict();

export type ModifyChannelGuildChannelEntity = z.infer<
  typeof ModifyChannelGuildChannelSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#modify-channel-json-params-thread}
 */
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
    flags: z.literal(ChannelFlags.pinned),
    applied_tags: z.array(SnowflakeSchema).max(5).optional(),
  })
  .strict();

export type ModifyChannelThreadEntity = z.infer<
  typeof ModifyChannelThreadSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#edit-channel-permissions-json-params}
 */
export const EditChannelPermissionsSchema = z
  .object({
    allow: z.nativeEnum(BitwisePermissionFlags).nullish(),
    deny: z.nativeEnum(BitwisePermissionFlags).nullish(),
    type: z.nativeEnum(OverwriteType),
  })
  .strict();

export type EditChannelPermissionsEntity = z.infer<
  typeof EditChannelPermissionsSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#create-channel-invite-json-params}
 */
export const CreateChannelInviteSchema = z
  .object({
    max_age: z.number().int().min(0).max(604800).default(86400).optional(),
    max_uses: z.number().int().min(0).max(100).default(0).optional(),
    temporary: z.boolean().default(false).optional(),
    unique: z.boolean().default(false).optional(),
    target_type: z.nativeEnum(InviteTargetType).optional(),
    target_user_id: SnowflakeSchema.optional(),
    target_application_id: SnowflakeSchema.optional(),
  })
  .strict();

export type CreateChannelInviteEntity = z.infer<
  typeof CreateChannelInviteSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#group-dm-add-recipient-json-params}
 */
export const AddGroupDmRecipientSchema = CreateGroupDmSchema;

export type AddGroupDmRecipientEntity = z.infer<
  typeof AddGroupDmRecipientSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-from-message-json-params}
 */
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
    rate_limit_per_user: z.number().int().max(21600).nullish(),
  })
  .strict();

export type StartThreadFromMessageEntity = z.infer<
  typeof StartThreadFromMessageSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-without-message-json-params}
 */
export const StartThreadWithoutMessageSchema =
  StartThreadFromMessageSchema.merge(
    z
      .object({
        type: z
          .union([
            z.literal(ChannelType.announcementThread),
            z.literal(ChannelType.privateThread),
            z.literal(ChannelType.publicThread),
          ])
          .default(ChannelType.privateThread)
          .optional(),
        invitable: z.boolean().optional(),
      })
      .strict(),
  );

export type StartThreadWithoutMessageEntity = z.infer<
  typeof StartThreadWithoutMessageSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-in-forum-or-media-channel-jsonform-params}
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
      rate_limit_per_user: z.number().int().max(21600).nullish(),
      message: StartThreadInForumOrMediaChannelForumAndMediaThreadMessageSchema,
      applied_tags: z.array(SnowflakeSchema).optional(),
    }),
  )
  .strict();

export type StartThreadInForumOrMediaChannelEntity = z.infer<
  typeof StartThreadInForumOrMediaChannelSchema
>;

export type StartThreadInForumOrMediaChannelForumAndMediaThreadMessageEntity =
  z.infer<
    typeof StartThreadInForumOrMediaChannelForumAndMediaThreadMessageSchema
  >;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#list-thread-members-query-string-params}
 */
export const ListThreadMembersQuerySchema = z
  .object({
    with_member: z.boolean().optional(),
    after: SnowflakeSchema.optional(),
    limit: z.number().int().min(1).max(100).default(100).optional(),
  })
  .strict();

export type ListThreadMembersQueryEntity = z.infer<
  typeof ListThreadMembersQuerySchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#list-public-archived-threads-query-string-params}
 */
export const ListPublicArchivedThreadsQuerySchema = z
  .object({
    before: z.string().datetime().optional(),
    limit: z.number().int().optional(),
  })
  .strict();

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
