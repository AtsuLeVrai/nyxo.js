import { DmChannelEntity } from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";

export class DmChannel {
  readonly #data: DmChannelEntity;

  constructor(data: Partial<z.input<typeof DmChannelEntity>> = {}) {
    try {
      this.#data = DmChannelEntity.parse(data);
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

  get lastMessageId(): unknown | null {
    return this.#data.last_message_id ?? null;
  }

  get rateLimitPerUser(): number | null {
    return this.#data.rate_limit_per_user ?? null;
  }

  get recipients(): unknown[] {
    return Array.isArray(this.#data.recipients)
      ? [...this.#data.recipients]
      : [];
  }

  get icon(): string | null {
    return this.#data.icon ?? null;
  }

  get ownerId(): unknown | null {
    return this.#data.owner_id ?? null;
  }

  get applicationId(): unknown | null {
    return this.#data.application_id ?? null;
  }

  get managed(): boolean | null {
    return this.#data.managed ?? null;
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

  get member(): object | null {
    return this.#data.member ?? null;
  }

  get permissions(): string | null {
    return this.#data.permissions ?? null;
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

  static fromJson(json: DmChannelEntity): DmChannel {
    return new DmChannel(json);
  }

  toJson(): DmChannelEntity {
    return { ...this.#data };
  }

  clone(): DmChannel {
    return new DmChannel(this.toJson());
  }

  validate(): boolean {
    try {
      DmChannelSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<DmChannelEntity>): DmChannel {
    return new DmChannel({ ...this.toJson(), ...other });
  }

  equals(other: DmChannel): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const DmChannelSchema = z.instanceof(DmChannel);
