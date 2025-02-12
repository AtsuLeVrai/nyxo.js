import { type Snowflake, VoiceStateEntity } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { GuildMember } from "./guild-member.class.js";

export class VoiceState extends BaseClass<VoiceStateEntity> {
  constructor(
    client: Client,
    entity: Partial<z.input<typeof VoiceStateEntity>> = {},
  ) {
    super(client, VoiceStateEntity, entity);
  }

  get guildId(): Snowflake | null {
    return this.entity.guild_id ?? null;
  }

  get channelId(): Snowflake | null {
    return this.entity.channel_id ?? null;
  }

  get userId(): Snowflake {
    return this.entity.user_id;
  }

  get member(): GuildMember | null {
    return this.entity.member
      ? new GuildMember(this.client, this.entity.member)
      : null;
  }

  get sessionId(): Snowflake {
    return this.entity.session_id;
  }

  get deaf(): boolean {
    return Boolean(this.entity.deaf);
  }

  get mute(): boolean {
    return Boolean(this.entity.mute);
  }

  get selfDeaf(): boolean {
    return Boolean(this.entity.self_deaf);
  }

  get selfMute(): boolean {
    return Boolean(this.entity.self_mute);
  }

  get selfStream(): boolean {
    return Boolean(this.entity.self_stream);
  }

  get selfVideo(): boolean {
    return Boolean(this.entity.self_video);
  }

  get suppress(): boolean {
    return Boolean(this.entity.suppress);
  }

  get requestToSpeakTimestamp(): string | null {
    return this.entity.request_to_speak_timestamp ?? null;
  }

  toJson(): VoiceStateEntity {
    return { ...this.entity };
  }
}

export const VoiceStateSchema = z.instanceof(VoiceState);
