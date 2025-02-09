import { PrivateThreadChannelEntity } from "@nyxjs/core";
import { z } from "zod";

export class PrivateThreadChannel {
  readonly #data: PrivateThreadChannelEntity;

  constructor(data: PrivateThreadChannelEntity) {
    this.#data = PrivateThreadChannelEntity.parse(data);
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

  get name(): string | null {
    return this.#data.name ?? null;
  }

  get nsfw(): boolean | null {
    return this.#data.nsfw ?? null;
  }

  get lastMessageId(): unknown | null {
    return this.#data.last_message_id ?? null;
  }

  get rateLimitPerUser(): number | null {
    return this.#data.rate_limit_per_user ?? null;
  }

  get ownerId(): unknown | null {
    return this.#data.owner_id ?? null;
  }

  get parentId(): unknown {
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

  get threadMetadata(): object | null {
    return this.#data.thread_metadata
      ? { ...this.#data.thread_metadata }
      : null;
  }

  get member(): object | null {
    return this.#data.member ?? null;
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

  get availableTags(): object[] | null {
    return this.#data.available_tags ?? null;
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

  static fromJson(json: PrivateThreadChannelEntity): PrivateThreadChannel {
    return new PrivateThreadChannel(json);
  }

  toJson(): PrivateThreadChannelEntity {
    return { ...this.#data };
  }

  clone(): PrivateThreadChannel {
    return new PrivateThreadChannel(this.toJson());
  }

  validate(): boolean {
    try {
      PrivateThreadChannelSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<PrivateThreadChannelEntity>): PrivateThreadChannel {
    return new PrivateThreadChannel({ ...this.toJson(), ...other });
  }

  equals(other: PrivateThreadChannel): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const PrivateThreadChannelSchema = z.instanceof(PrivateThreadChannel);
