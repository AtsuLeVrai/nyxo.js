import { GroupDmChannelEntity } from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";

export class GroupDmChannel {
  readonly #data: GroupDmChannelEntity;

  constructor(data: Partial<z.input<typeof GroupDmChannelEntity>> = {}) {
    try {
      this.#data = GroupDmChannelEntity.parse(data);
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

  get name(): string | null {
    return this.#data.name ?? null;
  }

  get topic(): string | null {
    return this.#data.topic ?? null;
  }

  get lastMessageId(): unknown | null {
    return this.#data.last_message_id ?? null;
  }

  get recipients(): unknown[] {
    return Array.isArray(this.#data.recipients)
      ? [...this.#data.recipients]
      : [];
  }

  get icon(): string | null {
    return this.#data.icon ?? null;
  }

  get ownerId(): unknown {
    return this.#data.owner_id;
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

  static fromJson(json: GroupDmChannelEntity): GroupDmChannel {
    return new GroupDmChannel(json);
  }

  toJson(): GroupDmChannelEntity {
    return { ...this.#data };
  }

  clone(): GroupDmChannel {
    return new GroupDmChannel(this.toJson());
  }

  validate(): boolean {
    try {
      GroupDmChannelSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<GroupDmChannelEntity>): GroupDmChannel {
    return new GroupDmChannel({ ...this.toJson(), ...other });
  }

  equals(other: GroupDmChannel): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const GroupDmChannelSchema = z.instanceof(GroupDmChannel);
