import {
  BitFieldManager,
  type ChannelFlags,
  type ChannelType,
  PublicThreadChannelEntity,
  type Snowflake,
  type SortOrderType,
} from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { DefaultReaction } from "./default-reaction.class.js";
import { ForumTag } from "./forum-tag.class.js";
import { ThreadMember } from "./thread-member.class.js";
import { ThreadMetadata } from "./thread-metadata.class.js";

export class PublicThreadChannel {
  readonly #data: PublicThreadChannelEntity;
  readonly #flags: BitFieldManager<ChannelFlags>;

  constructor(data: Partial<z.input<typeof PublicThreadChannelEntity>> = {}) {
    try {
      this.#data = PublicThreadChannelEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }

    this.#flags = new BitFieldManager(this.#data.flags);
  }

  get id(): Snowflake {
    return this.#data.id;
  }

  get type(): ChannelType.PublicThread {
    return this.#data.type;
  }

  get guildId(): Snowflake {
    return this.#data.guild_id;
  }

  get position(): number | null {
    return this.#data.position ?? null;
  }

  get name(): string | null {
    return this.#data.name ?? null;
  }

  get nsfw(): boolean {
    return Boolean(this.#data.nsfw);
  }

  get lastMessageId(): Snowflake | null {
    return this.#data.last_message_id ?? null;
  }

  get rateLimitPerUser(): number | null {
    return this.#data.rate_limit_per_user ?? null;
  }

  get ownerId(): Snowflake | null {
    return this.#data.owner_id ?? null;
  }

  get parentId(): Snowflake {
    return this.#data.parent_id;
  }

  get lastPinTimestamp(): string | null {
    return this.#data.last_pin_timestamp ?? null;
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

  get appliedTags(): string[] | null {
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

  toJson(): PublicThreadChannelEntity {
    return { ...this.#data };
  }

  clone(): PublicThreadChannel {
    return new PublicThreadChannel(this.toJson());
  }

  validate(): boolean {
    try {
      PublicThreadChannelSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<PublicThreadChannelEntity>): PublicThreadChannel {
    return new PublicThreadChannel({ ...this.toJson(), ...other });
  }

  equals(other: PublicThreadChannel): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const PublicThreadChannelSchema = z.instanceof(PublicThreadChannel);
