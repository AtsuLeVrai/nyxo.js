import {
  BitFieldManager,
  type ChannelFlags,
  type ChannelType,
  GuildMediaChannelEntity,
  type OverwriteEntity,
  type Snowflake,
  type SortOrderType,
} from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { DefaultReaction } from "./default-reaction.class.js";
import { ForumTag } from "./forum-tag.class.js";

export class GuildMediaChannel extends BaseClass<GuildMediaChannelEntity> {
  readonly #flags: BitFieldManager<ChannelFlags>;

  constructor(
    client: Client,
    data: Partial<z.input<typeof GuildMediaChannelEntity>> = {},
  ) {
    super(client, GuildMediaChannelEntity, data);
    this.#flags = new BitFieldManager(this.data.flags);
  }

  get id(): Snowflake {
    return this.data.id;
  }

  get type(): ChannelType.GuildMedia {
    return this.data.type;
  }

  get guildId(): Snowflake | null {
    return this.data.guild_id ?? null;
  }

  get position(): number | null {
    return this.data.position ?? null;
  }

  get permissionOverwrites(): OverwriteEntity[] | null {
    return this.data.permission_overwrites ?? null;
  }

  get name(): string | null {
    return this.data.name ?? null;
  }

  get topic(): string | null {
    return this.data.topic ?? null;
  }

  get nsfw(): boolean {
    return Boolean(this.data.nsfw);
  }

  get rateLimitPerUser(): number | null {
    return this.data.rate_limit_per_user ?? null;
  }

  get parentId(): Snowflake | null {
    return this.data.parent_id ?? null;
  }

  get lastPinTimestamp(): string | null {
    return this.data.last_pin_timestamp ?? null;
  }

  get defaultAutoArchiveDuration(): 60 | 1440 | 4320 | 10080 | null {
    return this.data.default_auto_archive_duration ?? null;
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

  get availableTags(): ForumTag[] {
    return Array.isArray(this.data.available_tags)
      ? this.data.available_tags.map((tag) => new ForumTag(this.client, tag))
      : [];
  }

  get appliedTags(): Snowflake[] | null {
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

  toJson(): GuildMediaChannelEntity {
    return { ...this.data };
  }
}

export const GuildMediaChannelSchema = z.instanceof(GuildMediaChannel);
