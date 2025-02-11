import {
  BitFieldManager,
  type ChannelFlags,
  type ChannelType,
  PrivateThreadChannelEntity,
  type Snowflake,
  type SortOrderType,
} from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { DefaultReaction } from "./default-reaction.class.js";
import { ForumTag } from "./forum-tag.class.js";
import { GuildMember } from "./guild-member.class.js";
import { ThreadMetadata } from "./thread-metadata.class.js";

export class PrivateThreadChannel extends BaseClass<PrivateThreadChannelEntity> {
  readonly #flags: BitFieldManager<ChannelFlags>;

  constructor(
    client: Client,
    data: Partial<z.input<typeof PrivateThreadChannelEntity>> = {},
  ) {
    super(client, PrivateThreadChannelEntity, data);
    this.#flags = new BitFieldManager(this.data.flags);
  }

  get id(): Snowflake {
    return this.data.id;
  }

  get type(): ChannelType.PrivateThread {
    return this.data.type;
  }

  get guildId(): Snowflake | null {
    return this.data.guild_id ?? null;
  }

  get position(): number | null {
    return this.data.position ?? null;
  }

  get name(): string | null {
    return this.data.name ?? null;
  }

  get nsfw(): boolean {
    return Boolean(this.data.nsfw);
  }

  get lastMessageId(): Snowflake | null {
    return this.data.last_message_id ?? null;
  }

  get rateLimitPerUser(): number | null {
    return this.data.rate_limit_per_user ?? null;
  }

  get ownerId(): Snowflake | null {
    return this.data.owner_id ?? null;
  }

  get parentId(): Snowflake {
    return this.data.parent_id;
  }

  get lastPinTimestamp(): string | null {
    return this.data.last_pin_timestamp ?? null;
  }

  get messageCount(): number | null {
    return this.data.message_count ?? null;
  }

  get memberCount(): number | null {
    return this.data.member_count ?? null;
  }

  get threadMetadata(): ThreadMetadata | null {
    return this.data.thread_metadata
      ? new ThreadMetadata(this.client, this.data.thread_metadata)
      : null;
  }

  get member(): GuildMember | null {
    return this.data.member
      ? new GuildMember(this.client, this.data.member)
      : null;
  }

  get permissions(): string | null {
    return this.data.permissions ?? null;
  }

  get flags(): BitFieldManager<ChannelFlags> {
    return this.#flags;
  }

  get totalMessageSent(): number | null {
    return this.data.total_message_sent ?? null;
  }

  get availableTags(): ForumTag[] | null {
    return this.data.available_tags
      ? this.data.available_tags.map((tag) => new ForumTag(this.client, tag))
      : null;
  }

  get appliedTags(): string[] | null {
    return this.data.applied_tags ?? null;
  }

  get defaultReactionEmoji(): DefaultReaction | null {
    return this.data.default_reaction_emoji
      ? new DefaultReaction(this.client, this.data.default_reaction_emoji)
      : null;
  }

  get defaultThreadRateLimitPerUser(): number | null {
    return this.data.default_thread_rate_limit_per_user ?? null;
  }

  get defaultSortOrder(): SortOrderType | null {
    return this.data.default_sort_order ?? null;
  }

  toJson(): PrivateThreadChannelEntity {
    return { ...this.data };
  }
}

export const PrivateThreadChannelSchema = z.instanceof(PrivateThreadChannel);
