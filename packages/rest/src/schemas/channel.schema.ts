import {
  AnnouncementThreadChannelEntity,
  AnyThreadChannelEntity,
  BitwisePermissionFlags,
  type ChannelEntity,
  ChannelType,
  GuildAnnouncementChannelEntity,
  GuildTextChannelEntity,
  InviteTargetType,
  OverwriteType,
  Snowflake,
  type ThreadMemberEntity,
} from "@nyxjs/core";
import { z } from "zod";
import { CreateMessageSchema } from "./message.schema.js";
import { CreateGroupDmSchema } from "./user.schema.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#modify-channel-json-params-group-dm}
 */
export const ModifyChannelGroupDmSchema = z.object({
  name: z.string().min(1).max(100),
  icon: z.string(),
});

export type ModifyChannelGroupDmSchema = z.input<
  typeof ModifyChannelGroupDmSchema
>;

/** @see {@link https://discord.com/developers/docs/resources/channel#modify-channel-json-params-guild-channel} */
export const ModifyChannelGuildChannelSchema = z.discriminatedUnion("type", [
  GuildTextChannelEntity,
  GuildAnnouncementChannelEntity,
  AnnouncementThreadChannelEntity,
]);

export type ModifyChannelGuildChannelSchema = z.input<
  typeof ModifyChannelGuildChannelSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#modify-channel-json-params-thread}
 */
export const ModifyChannelThreadSchema = AnyThreadChannelEntity;

export type ModifyChannelThreadSchema = z.input<
  typeof ModifyChannelThreadSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#edit-channel-permissions-json-params}
 */
export const EditChannelPermissionsSchema = z.object({
  allow: z.nativeEnum(BitwisePermissionFlags).nullish(),
  deny: z.nativeEnum(BitwisePermissionFlags).nullish(),
  type: z.nativeEnum(OverwriteType),
});

export type EditChannelPermissionsSchema = z.input<
  typeof EditChannelPermissionsSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#create-channel-invite-json-params}
 */
export const CreateChannelInviteSchema = z.object({
  max_age: z.number().int().min(0).max(604800).default(86400),
  max_uses: z.number().int().min(0).max(100).default(0),
  temporary: z.boolean().default(false),
  unique: z.boolean().default(false),
  target_type: z.nativeEnum(InviteTargetType).optional(),
  target_user_id: Snowflake.optional(),
  target_application_id: Snowflake.optional(),
});

export type CreateChannelInviteSchema = z.input<
  typeof CreateChannelInviteSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#group-dm-add-recipient-json-params}
 */
export const AddGroupDmRecipientSchema = CreateGroupDmSchema;

export type AddGroupDmRecipientSchema = z.input<
  typeof AddGroupDmRecipientSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-from-message-json-params}
 */
export const StartThreadFromMessageSchema = z.object({
  name: z.string().min(1).max(100),
  auto_archive_duration: z
    .union([z.literal(60), z.literal(1440), z.literal(4320), z.literal(10080)])
    .optional(),
  rate_limit_per_user: z.number().int().max(21600).nullish(),
});

export type StartThreadFromMessageSchema = z.input<
  typeof StartThreadFromMessageSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-without-message-json-params}
 */
export const StartThreadWithoutMessageSchema =
  StartThreadFromMessageSchema.extend({
    type: z
      .union([
        z.literal(ChannelType.AnnouncementThread),
        z.literal(ChannelType.PrivateThread),
        z.literal(ChannelType.PublicThread),
      ])
      .optional()
      .default(ChannelType.PrivateThread),
    invitable: z.boolean().optional(),
  });

export type StartThreadWithoutMessageSchema = z.input<
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

export type StartThreadInForumOrMediaChannelForumAndMediaThreadMessageSchema =
  z.input<
    typeof StartThreadInForumOrMediaChannelForumAndMediaThreadMessageSchema
  >;

export const StartThreadInForumOrMediaChannelSchema = CreateMessageSchema.pick({
  files: true,
  payload_json: true,
}).extend({
  name: z.string().min(1).max(100),
  auto_archive_duration: z
    .union([z.literal(60), z.literal(1440), z.literal(4320), z.literal(10080)])
    .optional(),
  rate_limit_per_user: z.number().int().max(21600).nullish(),
  message: StartThreadInForumOrMediaChannelForumAndMediaThreadMessageSchema,
  applied_tags: z.array(Snowflake).optional(),
});

export type StartThreadInForumOrMediaChannelSchema = z.input<
  typeof StartThreadInForumOrMediaChannelSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#list-thread-members-query-string-params}
 */
export const ListThreadMembersQuerySchema = z.object({
  with_member: z.boolean().optional(),
  after: Snowflake.optional(),
  limit: z.number().int().min(1).max(100).default(100),
});

export type ListThreadMembersQuerySchema = z.input<
  typeof ListThreadMembersQuerySchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#list-public-archived-threads-query-string-params}
 */
export const ListPublicArchivedThreadsQuerySchema = z.object({
  before: z.string().datetime().optional(),
  limit: z.number().int().optional(),
});

export type ListPublicArchivedThreadsQuerySchema = z.input<
  typeof ListPublicArchivedThreadsQuerySchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#list-public-archived-threads-response-body}
 */
export interface ListPublicArchivedThreadsResponseEntity {
  threads: ChannelEntity[];
  members: ThreadMemberEntity[];
  has_more: boolean;
}
