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
import { fromError } from "zod-validation-error";
import { DefaultReaction } from "./default-reaction.class.js";

export class GuildCategoryChannel {
  readonly #data: GuildCategoryChannelEntity;
  readonly #flags: BitFieldManager<ChannelFlags>;

  constructor(data: Partial<z.input<typeof GuildCategoryChannelEntity>> = {}) {
    try {
      this.#data = GuildCategoryChannelEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }

    this.#flags = new BitFieldManager(this.#data.flags);
  }

  get id(): Snowflake {
    return this.#data.id;
  }

  get type(): ChannelType.GuildCategory {
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

  get nsfw(): boolean {
    return Boolean(this.#data.nsfw);
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

  toJson(): GuildCategoryChannelEntity {
    return { ...this.#data };
  }

  clone(): GuildCategoryChannel {
    return new GuildCategoryChannel(this.toJson());
  }

  validate(): boolean {
    try {
      GuildCategoryChannelSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<GuildCategoryChannelEntity>): GuildCategoryChannel {
    return new GuildCategoryChannel({ ...this.toJson(), ...other });
  }

  equals(other: GuildCategoryChannel): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const GuildCategoryChannelSchema = z.instanceof(GuildCategoryChannel);
