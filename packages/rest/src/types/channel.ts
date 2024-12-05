import type {
  ChannelEntity,
  Integer,
  InviteTargetType,
  OverwriteEntity,
  Snowflake,
  ThreadMemberEntity,
  ThreadMetadataEntity,
} from "@nyxjs/core";

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-from-message-json-params}
 */
export type StartThreadFromMessageOptionsEntity = Pick<
  ChannelEntity & ThreadMetadataEntity,
  "auto_archive_duration" | "rate_limit_per_user" | "name"
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#start-thread-without-message-json-params}
 */
export type StartThreadWithoutMessageOptionsEntity = Pick<
  ChannelEntity & ThreadMetadataEntity,
  | "auto_archive_duration"
  | "rate_limit_per_user"
  | "name"
  | "type"
  | "invitable"
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#edit-channel-permissions-json-params}
 */
export type EditChannelPermissionsOptionsEntity = Pick<
  OverwriteEntity,
  "type" | "allow" | "deny"
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#modify-channel-json-params-group-dm}
 * @see {@link https://discord.com/developers/docs/resources/channel#modify-channel-json-params-guild-channel}
 * @see {@link https://discord.com/developers/docs/resources/channel#modify-channel-json-params-thread}
 */
export type ModifyChannelOptionsEntity = Pick<
  ChannelEntity & ThreadMetadataEntity,
  | "name"
  | "icon"
  | "type"
  | "position"
  | "topic"
  | "nsfw"
  | "rate_limit_per_user"
  | "bitrate"
  | "user_limit"
  | "permission_overwrites"
  | "parent_id"
  | "rtc_region"
  | "video_quality_mode"
  | "default_auto_archive_duration"
  | "flags"
  | "available_tags"
  | "default_reaction_emoji"
  | "default_thread_rate_limit_per_user"
  | "default_sort_order"
  | "default_forum_layout"
  | "applied_tags"
  | "archived"
  | "auto_archive_duration"
  | "locked"
  | "invitable"
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#create-channel-invite-json-params}
 */
export interface CreateChannelInviteOptionsEntity {
  max_age?: Integer;
  max_uses?: Integer;
  temporary?: boolean;
  unique?: boolean;
  target_type?: InviteTargetType;
  target_user_id?: Snowflake;
  target_application_id?: Snowflake;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/channel#list-public-archived-threads-response-body}
 */
export interface GetArchivedThreadsResponseEntity {
  threads: ChannelEntity[];
  members: ThreadMemberEntity[];
  has_more: boolean;
}
