import {
  BitFieldManager,
  type ChannelFlags,
  type ChannelType,
  PublicThreadChannelEntity,
  type Snowflake,
  type SortOrderType,
} from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { DefaultReaction } from "./default-reaction.class.js";
import { ForumTag } from "./forum-tag.class.js";
import { ThreadMember } from "./thread-member.class.js";
import { ThreadMetadata } from "./thread-metadata.class.js";

export class PublicThreadChannel extends BaseClass<PublicThreadChannelEntity> {
  readonly #flags: BitFieldManager<ChannelFlags>;

  constructor(
    client: Client,
    entity: Partial<z.input<typeof PublicThreadChannelEntity>> = {},
  ) {
    super(client, PublicThreadChannelEntity, entity);
    this.#flags = new BitFieldManager(this.entity.flags);
  }

  get id(): Snowflake {
    return this.entity.id;
  }

  get type(): ChannelType.PublicThread {
    return this.entity.type;
  }

  get guildId(): Snowflake | null {
    return this.entity.guild_id ?? null;
  }

  get position(): number | null {
    return this.entity.position ?? null;
  }

  get name(): string | null {
    return this.entity.name ?? null;
  }

  get nsfw(): boolean {
    return Boolean(this.entity.nsfw);
  }

  get lastMessageId(): Snowflake | null {
    return this.entity.last_message_id ?? null;
  }

  get rateLimitPerUser(): number | null {
    return this.entity.rate_limit_per_user ?? null;
  }

  get ownerId(): Snowflake | null {
    return this.entity.owner_id ?? null;
  }

  get parentId(): Snowflake {
    return this.entity.parent_id;
  }

  get lastPinTimestamp(): string | null {
    return this.entity.last_pin_timestamp ?? null;
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

  get appliedTags(): string[] | null {
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

  toJson(): PublicThreadChannelEntity {
    return { ...this.entity };
  }
}

export const PublicThreadChannelSchema = z.instanceof(PublicThreadChannel);
