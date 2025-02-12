import {
  BitFieldManager,
  type ChannelFlags,
  type ChannelType,
  GuildVoiceChannelEntity,
  type OverwriteEntity,
  type Snowflake,
  type VideoQualityMode,
} from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";

export class GuildVoiceChannel extends BaseClass<GuildVoiceChannelEntity> {
  readonly #flags: BitFieldManager<ChannelFlags>;

  constructor(
    client: Client,
    entity: Partial<z.input<typeof GuildVoiceChannelEntity>> = {},
  ) {
    super(client, GuildVoiceChannelEntity, entity);
    this.#flags = new BitFieldManager(this.entity.flags);
  }

  get id(): Snowflake {
    return this.entity.id;
  }

  get type(): ChannelType.GuildVoice {
    return this.entity.type;
  }

  get guildId(): Snowflake | null {
    return this.entity.guild_id ?? null;
  }

  get position(): number | null {
    return this.entity.position ?? null;
  }

  get permissionOverwrites(): OverwriteEntity[] | null {
    return this.entity.permission_overwrites ?? null;
  }

  get name(): string | null {
    return this.entity.name ?? null;
  }

  get topic(): string | null {
    return this.entity.topic ?? null;
  }

  get nsfw(): boolean {
    return Boolean(this.entity.nsfw);
  }

  get lastMessageId(): Snowflake | null {
    return this.entity.last_message_id ?? null;
  }

  get bitrate(): number {
    return this.entity.bitrate;
  }

  get userLimit(): number {
    return this.entity.user_limit;
  }

  get rateLimitPerUser(): number | null {
    return this.entity.rate_limit_per_user ?? null;
  }

  get parentId(): Snowflake | null {
    return this.entity.parent_id ?? null;
  }

  get lastPinTimestamp(): string | null {
    return this.entity.last_pin_timestamp ?? null;
  }

  get rtcRegion(): string | null {
    return this.entity.rtc_region ?? null;
  }

  get videoQualityMode(): VideoQualityMode | null {
    return this.entity.video_quality_mode ?? null;
  }

  get memberCount(): number | null {
    return this.entity.member_count ?? null;
  }

  get defaultAutoArchiveDuration(): 60 | 1440 | 4320 | 10080 | null {
    return this.entity.default_auto_archive_duration ?? null;
  }

  get permissions(): string | null {
    return this.entity.permissions ?? null;
  }

  get flags(): BitFieldManager<ChannelFlags> {
    return this.#flags;
  }

  get totalMessageSent(): number | null {
    return this.entity.total_message_sent ?? null;
  }

  toJson(): GuildVoiceChannelEntity {
    return { ...this.entity };
  }
}

export const GuildVoiceChannelSchema = z.instanceof(GuildVoiceChannel);
