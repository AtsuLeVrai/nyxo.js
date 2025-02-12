import {
  BitFieldManager,
  type ChannelFlags,
  type ChannelType,
  type ForumLayoutType,
  GuildTextChannelEntity,
  type OverwriteEntity,
  type Snowflake,
  type SortOrderType,
  type VideoQualityMode,
} from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { DefaultReaction } from "./default-reaction.class.js";

export class GuildTextChannel extends BaseClass<GuildTextChannelEntity> {
  readonly #flags: BitFieldManager<ChannelFlags>;

  constructor(
    client: Client,
    entity: Partial<z.input<typeof GuildTextChannelEntity>> = {},
  ) {
    super(client, GuildTextChannelEntity, entity);
    this.#flags = new BitFieldManager(this.entity.flags);
  }

  get id(): Snowflake {
    return this.entity.id;
  }

  get type(): ChannelType.GuildText {
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

  get rateLimitPerUser(): number | null {
    return this.entity.rate_limit_per_user ?? null;
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

  toJson(): GuildTextChannelEntity {
    return { ...this.entity };
  }
}

export const GuildTextChannelSchema = z.instanceof(GuildTextChannel);
