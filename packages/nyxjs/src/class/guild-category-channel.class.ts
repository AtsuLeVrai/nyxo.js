import { GuildCategoryChannelEntity } from "@nyxjs/core";
import { z } from "zod";

export class GuildCategoryChannel {
  readonly #data: GuildCategoryChannelEntity;

  constructor(data: GuildCategoryChannelEntity) {
    this.#data = GuildCategoryChannelEntity.parse(data);
  }

  get id(): unknown {
    return this.#data.id;
  }

  get type(): unknown {
    return this.#data.type;
  }

  get guildId(): unknown {
    return this.#data.guild_id;
  }

  get position(): number | null {
    return this.#data.position ?? null;
  }

  get permissionOverwrites(): object[] | null {
    return this.#data.permission_overwrites ?? null;
  }

  get name(): string | null {
    return this.#data.name ?? null;
  }

  get nsfw(): boolean | null {
    return this.#data.nsfw ?? null;
  }

  get permissions(): string | null {
    return this.#data.permissions ?? null;
  }

  get flags(): unknown {
    return this.#data.flags;
  }

  get totalMessageSent(): number | null {
    return this.#data.total_message_sent ?? null;
  }

  get appliedTags(): unknown[] | null {
    return this.#data.applied_tags ?? null;
  }

  get defaultReactionEmoji(): object | null {
    return this.#data.default_reaction_emoji ?? null;
  }

  get defaultThreadRateLimitPerUser(): number | null {
    return this.#data.default_thread_rate_limit_per_user ?? null;
  }

  get defaultSortOrder(): unknown | null {
    return this.#data.default_sort_order ?? null;
  }

  get defaultForumLayout(): unknown | null {
    return this.#data.default_forum_layout ?? null;
  }

  static fromJson(json: GuildCategoryChannelEntity): GuildCategoryChannel {
    return new GuildCategoryChannel(json);
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
