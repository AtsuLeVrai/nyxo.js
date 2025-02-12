import {
  BitFieldManager,
  ChannelEntity,
  type ChannelFlags,
  type ChannelType,
  type ForumLayoutType,
  type OverwriteEntity,
  type Snowflake,
  type SortOrderType,
  type VideoQualityMode,
} from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { DefaultReaction } from "./default-reaction.class.js";
import { ForumTag } from "./forum-tag.class.js";
import { ThreadMember } from "./thread-member.class.js";
import { ThreadMetadata } from "./thread-metadata.class.js";
import { User } from "./user.class.js";

export class Channel extends BaseClass<ChannelEntity> {
  readonly #flags: BitFieldManager<ChannelFlags>;

  constructor(
    client: Client,
    entity: Partial<z.input<typeof ChannelEntity>> = {},
  ) {
    super(client, ChannelEntity, entity);
    this.#flags = new BitFieldManager(this.entity.flags);
  }

  get id(): Snowflake {
    return this.entity.id;
  }

  get type(): ChannelType {
    return this.entity.type;
  }

  get guildId(): Snowflake | null {
    return this.entity.guild_id ?? null;
  }

  get position(): number | null {
    return this.entity.position ?? null;
  }

  get permissionOverwrites(): OverwriteEntity[] | null {
    return this.entity.permission_overwrites ?? null;
  }

  get name(): string | null {
    return this.entity.name ?? null;
  }

  get topic(): string | null {
    return this.entity.topic ?? null;
  }

  get nsfw(): boolean {
    return Boolean(this.entity.nsfw);
  }

  get lastMessageId(): Snowflake | null {
    return this.entity.last_message_id ?? null;
  }

  get bitrate(): number | null {
    return this.entity.bitrate ?? null;
  }

  get userLimit(): number | null {
    return this.entity.user_limit ?? null;
  }

  get rateLimitPerUser(): number | null {
    return this.entity.rate_limit_per_user ?? null;
  }

  get recipients(): User[] {
    return this.entity.recipients
      ? this.entity.recipients.map((user) => new User(this.client, user))
      : [];
  }

  get icon(): string | null {
    return this.entity.icon ?? null;
  }

  get ownerId(): Snowflake | null {
    return this.entity.owner_id ?? null;
  }

  get applicationId(): Snowflake | null {
    return this.entity.application_id ?? null;
  }

  get managed(): boolean {
    return Boolean(this.entity.managed);
  }

  get parentId(): Snowflake | null {
    return this.entity.parent_id ?? null;
  }

  get lastPinTimestamp(): string | null {
    return this.entity.last_pin_timestamp ?? null;
  }

  get rtcRegion(): string | null {
    return this.entity.rtc_region ?? null;
  }

  get videoQualityMode(): VideoQualityMode | null {
    return this.entity.video_quality_mode ?? null;
  }

  get messageCount(): number | null {
    return this.entity.message_count ?? null;
  }

  get memberCount(): number | null {
    return this.entity.member_count ?? null;
  }

  get threadMetadata(): ThreadMetadata | null {
    return this.entity.thread_metadata
      ? new ThreadMetadata(this.client, this.entity.thread_metadata)
      : null;
  }

  get member(): ThreadMember | null {
    return this.entity.member
      ? new ThreadMember(this.client, this.entity.member)
      : null;
  }

  get defaultAutoArchiveDuration(): 60 | 1440 | 4320 | 10080 | null {
    return this.entity.default_auto_archive_duration ?? null;
  }

  get permissions(): string | null {
    return this.entity.permissions ?? null;
  }

  get flags(): BitFieldManager<ChannelFlags> {
    return this.#flags;
  }

  get totalMessageSent(): number | null {
    return this.entity.total_message_sent ?? null;
  }

  get availableTags(): ForumTag[] | null {
    return this.entity.available_tags
      ? this.entity.available_tags.map((tag) => new ForumTag(this.client, tag))
      : null;
  }

  get appliedTags(): Snowflake[] | null {
    return this.entity.applied_tags ?? null;
  }

  get defaultReactionEmoji(): DefaultReaction | null {
    return this.entity.default_reaction_emoji
      ? new DefaultReaction(this.client, this.entity.default_reaction_emoji)
      : null;
  }

  get defaultThreadRateLimitPerUser(): number | null {
    return this.entity.default_thread_rate_limit_per_user ?? null;
  }

  get defaultSortOrder(): SortOrderType | null {
    return this.entity.default_sort_order ?? null;
  }

  get defaultForumLayout(): ForumLayoutType | null {
    return this.entity.default_forum_layout ?? null;
  }

  toJson(): ChannelEntity {
    return { ...this.entity };
  }
}

export const ChannelSchema = z.instanceof(Channel);
