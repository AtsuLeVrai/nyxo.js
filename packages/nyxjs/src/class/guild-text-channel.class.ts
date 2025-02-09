import { GuildTextChannelEntity } from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";

export class GuildTextChannel {
  readonly #data: GuildTextChannelEntity;

  constructor(data: Partial<z.input<typeof GuildTextChannelEntity>> = {}) {
    try {
      this.#data = GuildTextChannelEntity.parse(data);
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

  get lastMessageId(): unknown | null {
    return this.#data.last_message_id ?? null;
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

  static fromJson(json: GuildTextChannelEntity): GuildTextChannel {
    return new GuildTextChannel(json);
  }

  toJson(): GuildTextChannelEntity {
    return { ...this.#data };
  }

  clone(): GuildTextChannel {
    return new GuildTextChannel(this.toJson());
  }

  validate(): boolean {
    try {
      GuildTextChannelSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<GuildTextChannelEntity>): GuildTextChannel {
    return new GuildTextChannel({ ...this.toJson(), ...other });
  }

  equals(other: GuildTextChannel): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const GuildTextChannelSchema = z.instanceof(GuildTextChannel);
