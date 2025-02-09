import { GuildStageVoiceChannelEntity } from "@nyxjs/core";
import { z } from "zod";

export class GuildStageVoiceChannel {
  readonly #data: GuildStageVoiceChannelEntity;

  constructor(data: GuildStageVoiceChannelEntity) {
    this.#data = GuildStageVoiceChannelEntity.parse(data);
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

  get permissions(): string | null {
    return this.#data.permissions ?? null;
  }

  get flags(): unknown {
    return this.#data.flags;
  }

  get totalMessageSent(): number | null {
    return this.#data.total_message_sent ?? null;
  }

  static fromJson(json: GuildStageVoiceChannelEntity): GuildStageVoiceChannel {
    return new GuildStageVoiceChannel(json);
  }

  toJson(): GuildStageVoiceChannelEntity {
    return { ...this.#data };
  }

  clone(): GuildStageVoiceChannel {
    return new GuildStageVoiceChannel(this.toJson());
  }

  validate(): boolean {
    try {
      GuildStageVoiceChannelSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<GuildStageVoiceChannelEntity>): GuildStageVoiceChannel {
    return new GuildStageVoiceChannel({ ...this.toJson(), ...other });
  }

  equals(other: GuildStageVoiceChannel): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const GuildStageVoiceChannelSchema = z.instanceof(
  GuildStageVoiceChannel,
);
