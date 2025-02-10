import {
  BitFieldManager,
  type ChannelFlags,
  type ChannelType,
  type ForumLayoutType,
  GuildForumChannelEntity,
  type OverwriteEntity,
  type Snowflake,
  type SortOrderType,
} from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { DefaultReaction } from "./default-reaction.class.js";
import { ForumTag } from "./forum-tag.class.js";

export class GuildForumChannel {
  readonly #data: GuildForumChannelEntity;
  readonly #flags: BitFieldManager<ChannelFlags>;

  constructor(data: Partial<z.input<typeof GuildForumChannelEntity>> = {}) {
    try {
      this.#data = GuildForumChannelEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }

    this.#flags = new BitFieldManager(this.#data.flags);
  }

  get id(): Snowflake {
    return this.#data.id;
  }

  get type(): ChannelType.GuildForum {
    return this.#data.type;
  }

  get guildId(): Snowflake {
    return this.#data.guild_id;
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

  get rateLimitPerUser(): number | null {
    return this.#data.rate_limit_per_user ?? null;
  }

  get parentId(): Snowflake | null {
    return this.#data.parent_id ?? null;
  }

  get lastPinTimestamp(): string | null {
    return this.#data.last_pin_timestamp ?? null;
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

  get availableTags(): ForumTag[] {
    return Array.isArray(this.#data.available_tags)
      ? this.#data.available_tags.map((tag) => new ForumTag(tag))
      : [];
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

  toJson(): GuildForumChannelEntity {
    return { ...this.#data };
  }

  clone(): GuildForumChannel {
    return new GuildForumChannel(this.toJson());
  }

  validate(): boolean {
    try {
      GuildForumChannelSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<GuildForumChannelEntity>): GuildForumChannel {
    return new GuildForumChannel({ ...this.toJson(), ...other });
  }

  equals(other: GuildForumChannel): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const GuildForumChannelSchema = z.instanceof(GuildForumChannel);
