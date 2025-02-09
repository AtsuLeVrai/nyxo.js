import { GuildMediaChannelEntity } from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";

export class GuildMediaChannel {
  readonly #data: GuildMediaChannelEntity;

  constructor(data: Partial<z.input<typeof GuildMediaChannelEntity>> = {}) {
    try {
      this.#data = GuildMediaChannelEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
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

  get topic(): string | null {
    return this.#data.topic ?? null;
  }

  get nsfw(): boolean | null {
    return this.#data.nsfw ?? null;
  }

  get rateLimitPerUser(): number | null {
    return this.#data.rate_limit_per_user ?? null;
  }

  get parentId(): unknown | null {
    return this.#data.parent_id ?? null;
  }

  get lastPinTimestamp(): string | null {
    return this.#data.last_pin_timestamp ?? null;
  }

  get defaultAutoArchiveDuration(): unknown | null {
    return this.#data.default_auto_archive_duration ?? null;
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

  get availableTags(): object[] {
    return Array.isArray(this.#data.available_tags)
      ? [...this.#data.available_tags]
      : [];
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

  static fromJson(json: GuildMediaChannelEntity): GuildMediaChannel {
    return new GuildMediaChannel(json);
  }

  toJson(): GuildMediaChannelEntity {
    return { ...this.#data };
  }

  clone(): GuildMediaChannel {
    return new GuildMediaChannel(this.toJson());
  }

  validate(): boolean {
    try {
      GuildMediaChannelSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<GuildMediaChannelEntity>): GuildMediaChannel {
    return new GuildMediaChannel({ ...this.toJson(), ...other });
  }

  equals(other: GuildMediaChannel): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const GuildMediaChannelSchema = z.instanceof(GuildMediaChannel);
