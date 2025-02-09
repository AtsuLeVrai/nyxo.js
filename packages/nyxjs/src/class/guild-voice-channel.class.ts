import { GuildVoiceChannelEntity } from "@nyxjs/core";
import { z } from "zod";

export class GuildVoiceChannel {
  readonly #data: GuildVoiceChannelEntity;

  constructor(data: GuildVoiceChannelEntity) {
    this.#data = GuildVoiceChannelEntity.parse(data);
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

  get bitrate(): number {
    return this.#data.bitrate;
  }

  get userLimit(): number {
    return this.#data.user_limit;
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

  static fromJson(json: GuildVoiceChannelEntity): GuildVoiceChannel {
    return new GuildVoiceChannel(json);
  }

  toJson(): GuildVoiceChannelEntity {
    return { ...this.#data };
  }

  clone(): GuildVoiceChannel {
    return new GuildVoiceChannel(this.toJson());
  }

  validate(): boolean {
    try {
      GuildVoiceChannelSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<GuildVoiceChannelEntity>): GuildVoiceChannel {
    return new GuildVoiceChannel({ ...this.toJson(), ...other });
  }

  equals(other: GuildVoiceChannel): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const GuildVoiceChannelSchema = z.instanceof(GuildVoiceChannel);
