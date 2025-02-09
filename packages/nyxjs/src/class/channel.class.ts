import { ChannelEntity } from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";

export class Channel {
  readonly #data: ChannelEntity;

  constructor(data: Partial<z.input<typeof ChannelEntity>> = {}) {
    try {
      this.#data = ChannelEntity.parse(data);
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

  get guildId(): unknown | null {
    return this.#data.guild_id ?? null;
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

  get lastMessageId(): unknown | null {
    return this.#data.last_message_id ?? null;
  }

  get bitrate(): number | null {
    return this.#data.bitrate ?? null;
  }

  get userLimit(): number | null {
    return this.#data.user_limit ?? null;
  }

  get rateLimitPerUser(): number | null {
    return this.#data.rate_limit_per_user ?? null;
  }

  get recipients(): unknown[] | null {
    return this.#data.recipients ?? null;
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

  get parentId(): unknown | null {
    return this.#data.parent_id ?? null;
  }

  get lastPinTimestamp(): string | null {
    return this.#data.last_pin_timestamp ?? null;
  }

  get rtcRegion(): string | null {
    return this.#data.rtc_region ?? null;
  }

  get videoQualityMode(): unknown | null {
    return this.#data.video_quality_mode ?? null;
  }

  get messageCount(): number | null {
    return this.#data.message_count ?? null;
  }

  get memberCount(): number | null {
    return this.#data.member_count ?? null;
  }

  get threadMetadata(): object | null {
    return this.#data.thread_metadata ?? null;
  }

  get member(): object | null {
    return this.#data.member ?? null;
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

  get defaultForumLayout(): unknown | null {
    return this.#data.default_forum_layout ?? null;
  }

  static fromJson(json: ChannelEntity): Channel {
    return new Channel(json);
  }

  toJson(): ChannelEntity {
    return { ...this.#data };
  }

  clone(): Channel {
    return new Channel(this.toJson());
  }

  validate(): boolean {
    try {
      ChannelSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<ChannelEntity>): Channel {
    return new Channel({ ...this.toJson(), ...other });
  }

  equals(other: Channel): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const ChannelSchema = z.instanceof(Channel);
