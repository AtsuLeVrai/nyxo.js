// channel.class.ts
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
import { fromError } from "zod-validation-error";
import { DefaultReaction } from "./default-reaction.class.js";
import { ForumTag } from "./forum-tag.class.js";
import { ThreadMember } from "./thread-member.class.js";
import { ThreadMetadata } from "./thread-metadata.class.js";
import { User } from "./user.class.js";

export class Channel {
  readonly #data: ChannelEntity;
  readonly #flags: BitFieldManager<ChannelFlags>;

  constructor(data: Partial<z.input<typeof ChannelEntity>> = {}) {
    try {
      this.#data = ChannelEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }

    this.#flags = new BitFieldManager(this.#data.flags);
  }

  get id(): Snowflake {
    return this.#data.id;
  }

  get type(): ChannelType {
    return this.#data.type;
  }

  get guildId(): Snowflake | null {
    return this.#data.guild_id ?? null;
  }

  get position(): number | null {
    return this.#data.position ?? null;
  }

  get permissionOverwrites(): OverwriteEntity[] | null {
    return this.#data.permission_overwrites ?? null;
  }

  get name(): string | null {
    return this.#data.name ?? null;
  }

  get topic(): string | null {
    return this.#data.topic ?? null;
  }

  get nsfw(): boolean {
    return Boolean(this.#data.nsfw);
  }

  get lastMessageId(): Snowflake | null {
    return this.#data.last_message_id ?? null;
  }

  get bitrate(): number | null {
    return this.#data.bitrate ?? null;
  }

  get userLimit(): number | null {
    return this.#data.user_limit ?? null;
  }

  get rateLimitPerUser(): number | null {
    return this.#data.rate_limit_per_user ?? null;
  }

  get recipients(): User[] {
    return this.#data.recipients
      ? this.#data.recipients.map((user) => new User(user))
      : [];
  }

  get icon(): string | null {
    return this.#data.icon ?? null;
  }

  get ownerId(): Snowflake | null {
    return this.#data.owner_id ?? null;
  }

  get applicationId(): Snowflake | null {
    return this.#data.application_id ?? null;
  }

  get managed(): boolean {
    return Boolean(this.#data.managed);
  }

  get parentId(): Snowflake | null {
    return this.#data.parent_id ?? null;
  }

  get lastPinTimestamp(): string | null {
    return this.#data.last_pin_timestamp ?? null;
  }

  get rtcRegion(): string | null {
    return this.#data.rtc_region ?? null;
  }

  get videoQualityMode(): VideoQualityMode | null {
    return this.#data.video_quality_mode ?? null;
  }

  get messageCount(): number | null {
    return this.#data.message_count ?? null;
  }

  get memberCount(): number | null {
    return this.#data.member_count ?? null;
  }

  get threadMetadata(): ThreadMetadata | null {
    return this.#data.thread_metadata
      ? new ThreadMetadata(this.#data.thread_metadata)
      : null;
  }

  get member(): ThreadMember | null {
    return this.#data.member ? new ThreadMember(this.#data.member) : null;
  }

  get defaultAutoArchiveDuration(): 60 | 1440 | 4320 | 10080 | null {
    return this.#data.default_auto_archive_duration ?? null;
  }

  get permissions(): string | null {
    return this.#data.permissions ?? null;
  }

  get flags(): BitFieldManager<ChannelFlags> {
    return this.#flags;
  }

  get totalMessageSent(): number | null {
    return this.#data.total_message_sent ?? null;
  }

  get availableTags(): ForumTag[] | null {
    return this.#data.available_tags
      ? this.#data.available_tags.map((tag) => new ForumTag(tag))
      : null;
  }

  get appliedTags(): Snowflake[] | null {
    return this.#data.applied_tags ?? null;
  }

  get defaultReactionEmoji(): DefaultReaction | null {
    return this.#data.default_reaction_emoji
      ? new DefaultReaction(this.#data.default_reaction_emoji)
      : null;
  }

  get defaultThreadRateLimitPerUser(): number | null {
    return this.#data.default_thread_rate_limit_per_user ?? null;
  }

  get defaultSortOrder(): SortOrderType | null {
    return this.#data.default_sort_order ?? null;
  }

  get defaultForumLayout(): ForumLayoutType | null {
    return this.#data.default_forum_layout ?? null;
  }

  toJson(): ChannelEntity {
    return { ...this.#data };
  }

  clone(): Channel {
    return new Channel(this.toJson());
  }

  validate(): boolean {
    try {
      ChannelSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<ChannelEntity>): Channel {
    return new Channel({ ...this.toJson(), ...other });
  }

  equals(other: Channel): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const ChannelSchema = z.instanceof(Channel);
