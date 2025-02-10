import {
  type ChannelType,
  DmChannelEntity,
  type ForumLayoutType,
  type Snowflake,
  type SortOrderType,
} from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { DefaultReaction } from "./default-reaction.class.js";
import { ThreadMember } from "./thread-member.class.js";
import { User } from "./user.class.js";

export class DmChannel {
  readonly #data: DmChannelEntity;

  constructor(data: Partial<z.input<typeof DmChannelEntity>> = {}) {
    try {
      this.#data = DmChannelEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get id(): Snowflake {
    return this.#data.id;
  }

  get type(): ChannelType.Dm {
    return this.#data.type;
  }

  get lastMessageId(): Snowflake | null {
    return this.#data.last_message_id ?? null;
  }

  get rateLimitPerUser(): number | null {
    return this.#data.rate_limit_per_user ?? null;
  }

  get recipients(): User[] {
    return Array.isArray(this.#data.recipients)
      ? this.#data.recipients.map((recipient) => new User(recipient))
      : [];
  }

  get icon(): string | null {
    return this.#data.icon ?? null;
  }

  get ownerId(): Snowflake | null {
    return this.#data.owner_id ?? null;
  }

  get applicationId(): Snowflake | null {
    return this.#data.application_id ?? null;
  }

  get managed(): boolean {
    return Boolean(this.#data.managed);
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

  get member(): ThreadMember | null {
    return this.#data.member ? new ThreadMember(this.#data.member) : null;
  }

  get permissions(): string | null {
    return this.#data.permissions ?? null;
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
