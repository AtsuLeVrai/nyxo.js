import {
  BitFieldManager,
  type ChannelFlags,
  type ChannelType,
  GuildStageVoiceChannelEntity,
  type OverwriteEntity,
  type Snowflake,
  type VideoQualityMode,
} from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";

export class GuildStageVoiceChannel extends BaseClass<GuildStageVoiceChannelEntity> {
  readonly #flags: BitFieldManager<ChannelFlags>;

  constructor(
    client: Client,
    data: Partial<z.input<typeof GuildStageVoiceChannelEntity>> = {},
  ) {
    super(client, GuildStageVoiceChannelEntity, data);
    this.#flags = new BitFieldManager(this.data.flags);
  }

  get id(): Snowflake {
    return this.data.id;
  }

  get type(): ChannelType.GuildStageVoice {
    return this.data.type;
  }

  get guildId(): Snowflake | null {
    return this.data.guild_id ?? null;
  }

  get position(): number | null {
    return this.data.position ?? null;
  }

  get permissionOverwrites(): OverwriteEntity[] | null {
    return this.data.permission_overwrites ?? null;
  }

  get name(): string | null {
    return this.data.name ?? null;
  }

  get topic(): string | null {
    return this.data.topic ?? null;
  }

  get nsfw(): boolean {
    return Boolean(this.data.nsfw);
  }

  get bitrate(): number {
    return this.data.bitrate;
  }

  get userLimit(): number {
    return this.data.user_limit;
  }

  get rateLimitPerUser(): number | null {
    return this.data.rate_limit_per_user ?? null;
  }

  get parentId(): Snowflake | null {
    return this.data.parent_id ?? null;
  }

  get lastPinTimestamp(): string | null {
    return this.data.last_pin_timestamp ?? null;
  }

  get rtcRegion(): string | null {
    return this.data.rtc_region ?? null;
  }

  get videoQualityMode(): VideoQualityMode | null {
    return this.data.video_quality_mode ?? null;
  }

  get permissions(): string | null {
    return this.data.permissions ?? null;
  }

  get flags(): BitFieldManager<ChannelFlags> {
    return this.#flags;
  }

  get totalMessageSent(): number | null {
    return this.data.total_message_sent ?? null;
  }

  toJson(): GuildStageVoiceChannelEntity {
    return { ...this.data };
  }
}

export const GuildStageVoiceChannelSchema = z.instanceof(
  GuildStageVoiceChannel,
);
