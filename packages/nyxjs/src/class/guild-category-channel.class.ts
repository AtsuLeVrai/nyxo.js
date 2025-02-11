import {
  BitFieldManager,
  type ChannelFlags,
  type ChannelType,
  type ForumLayoutType,
  GuildCategoryChannelEntity,
  type OverwriteEntity,
  type Snowflake,
  type SortOrderType,
} from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { DefaultReaction } from "./default-reaction.class.js";

export class GuildCategoryChannel extends BaseClass<GuildCategoryChannelEntity> {
  readonly #flags: BitFieldManager<ChannelFlags>;

  constructor(
    client: Client,
    data: Partial<z.input<typeof GuildCategoryChannelEntity>> = {},
  ) {
    super(client, GuildCategoryChannelEntity, data);
    this.#flags = new BitFieldManager(this.data.flags);
  }

  get id(): Snowflake {
    return this.data.id;
  }

  get type(): ChannelType.GuildCategory {
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

  get nsfw(): boolean {
    return Boolean(this.data.nsfw);
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

  get defaultForumLayout(): ForumLayoutType | null {
    return this.data.default_forum_layout ?? null;
  }

  toJson(): GuildCategoryChannelEntity {
    return { ...this.data };
  }
}

export const GuildCategoryChannelSchema = z.instanceof(GuildCategoryChannel);
