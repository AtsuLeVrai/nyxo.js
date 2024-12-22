import {
  BitwisePermissionFlags,
  ChannelFlags,
  ChannelType,
  type DefaultReactionEntity,
  ForumLayoutType,
  type ForumTagEntity,
  type OverwriteEntity,
  OverwriteType,
  SnowflakeManager,
  SortOrderType,
  VideoQualityMode,
} from "@nyxjs/core";
import { z } from "zod";

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

// @todo: Add the rest of the schemas
